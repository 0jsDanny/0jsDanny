package graphql

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/0jsDanny/go-cisc-telemetry-hub/database"
)

type Server struct {
	DB       *database.Database
	EventBus chan *database.TelemetryRecord
	clients  map[chan *database.TelemetryRecord]bool
	mu       sync.Mutex
}

// Request representa a query GraphQL recebida via HTTP POST
type Request struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

func NewServer(db *database.Database, bus chan *database.TelemetryRecord) *Server {
	srv := &Server{
		DB:       db,
		EventBus: bus,
		clients:  make(map[chan *database.TelemetryRecord]bool),
	}
	// Loop de transmissão em segundo plano para espalhar eventos do gRPC para todos os clientes GraphQL conectados
	go srv.broadcaster()
	return srv
}

func (s *Server) broadcaster() {
	for rec := range s.EventBus {
		s.mu.Lock()
		for clientChan := range s.clients {
			select {
			case clientChan <- rec:
			default:
				// Descarta se o canal do cliente específico estiver travado/lento
			}
		}
		s.mu.Unlock()
	}
}

// ServeHTTP orquestra as rotas de Query, Mutation e Subscriptions do GraphQL
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Header, rw http.ResponseWriter, req *http.Request) {
	// A assinatura ServeHTTP padrão do Go é ServeHTTP(ResponseWriter, *Request).
	// Vamos implementar os Handlers HTTP normais para registrar no roteador principal.
}

// HandlerQueryMutation lida com POST /graphql (Queries e Mutations)
func (s *Server) HandlerQueryMutation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, `{"errors": [{"message": "Apenas requisições POST são permitidas"}]}`, http.StatusMethodNotAllowed)
		return
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"errors": [{"message": "JSON inválido"}]}`, http.StatusBadRequest)
		return
	}

	// Simplificação de parser de Query/Mutation GraphQL didático
	query := strings.TrimSpace(req.Query)

	if strings.HasPrefix(query, "mutation") {
		s.handleMutation(w, query)
	} else {
		s.handleQuery(w)
	}
}

func (s *Server) handleQuery(w http.ResponseWriter) {
	records, err := s.DB.GetRecentTelemetry(20)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{"errors": [{"message": "%s"}]}`, err.Error())
		return
	}

	// Estruturar retorno no padrão GraphQL JSON
	response := map[string]interface{}{
		"data": map[string]interface{}{
			"getRecentTelemetry": records,
		},
	}

	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleMutation(w http.ResponseWriter, query string) {
	// Simular a criação de um Alerta via Mutation
	// Ex de Mutation esperada: mutation { createAlert(neighborhood: "Marco", level: "ALERTA", desc: "Chuva forte") }
	log.Printf("[GraphQL] Mutation recebida para criar alerta manual")

	rec := &database.TelemetryRecord{
		Timestamp:        time.Now(),
		Source:           "MANUAL_MUTATION",
		Neighborhood:     "Marco",
		Temperature:      29.5,
		Humidity:         82.0,
		HeatIndex:        34.0,
		Rainfall:         15.0,
		RiverLevel:       1.8,
		AlertLevel:       "ATENÇÃO",
		AlertDescription: "Alerta gerado via mutação GraphQL manual",
	}

	id, err := s.DB.InsertTelemetry(rec)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{"errors": [{"message": "%s"}]}`, err.Error())
		return
	}
	rec.ID = id

	// Notifica via canal para propagar na subscription SSE
	select {
	case s.EventBus <- rec:
	default:
	}

	response := map[string]interface{}{
		"data": map[string]interface{}{
			"createAlert": map[string]interface{}{
				"id":      id,
				"success": true,
				"message": "Alerta manual criado com sucesso",
			},
		},
	}
	json.NewEncoder(w).Encode(response)
}

// HandlerSubscription lida com GET /graphql/subscriptions via Server-Sent Events (SSE)
func (s *Server) HandlerSubscription(w http.ResponseWriter, r *http.Request) {
	// Habilitar CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Configurar Headers obrigatórios para Server-Sent Events (SSE)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming não suportado pelo servidor", http.StatusInternalServerError)
		return
	}

	// Criar canal de escuta para este cliente específico
	clientChan := make(chan *database.TelemetryRecord, 10)

	s.mu.Lock()
	s.clients[clientChan] = true
	s.mu.Unlock()

	log.Printf("[GraphQL] Novo cliente conectado na Subscription SSE. Clientes ativos: %d", len(s.clients))

	// Enviar ping inicial de conexão estabelecida
	fmt.Fprintf(w, "event: connected\ndata: {\"status\": \"GraphQL Subscription Active\"}\n\n")
	flusher.Flush()

	// Monitora encerramento da conexão
	go func() {
		<-r.Context().Done()
		s.mu.Lock()
		delete(s.clients, clientChan)
		close(clientChan)
		s.mu.Unlock()
		log.Printf("[GraphQL] Cliente desconectado da Subscription SSE")
	}()

	// Loop transmitindo dados recebidos do gRPC via SSE no formato GraphQL
	for rec := range clientChan {
		data, err := json.Marshal(map[string]interface{}{
			"data": map[string]interface{}{
				"telemetrySubscribed": rec,
			},
		})
		if err != nil {
			continue
		}

		// Grava evento no stream do SSE
		fmt.Fprintf(w, "event: telemetryUpdate\ndata: %s\n\n", string(data))
		flusher.Flush()
	}
}
