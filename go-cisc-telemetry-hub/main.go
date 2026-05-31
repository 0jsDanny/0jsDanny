package main

import (
	"log"
	"net"
	"net/http"

	"github.com/0jsDanny/go-cisc-telemetry-hub/database"
	"github.com/0jsDanny/go-cisc-telemetry-hub/graphql"
	"github.com/0jsDanny/go-cisc-telemetry-hub/grpc"
	"github.com/0jsDanny/go-cisc-telemetry-hub/proto"
	g "google.golang.org/grpc"
)

func main() {
	log.Println("[CISC HUB] Inicializando Central de Informações em Saúde e Clima de Belém...")

	// 1. Inicializa o banco SQLite compartilhado
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Erro fatal ao iniciar banco SQLite: %v", err)
	}
	defer db.Conn.Close()
	log.Println("[CISC HUB] Banco SQLite conectado com sucesso em modo WAL.")

	// 2. Barramento de Eventos (Concorrência/Mensageria com canais Go)
	// Capacidade de bufferização para lidar com rajadas de dados dos sensores climáticos
	eventBus := make(chan *database.TelemetryRecord, 100)

	// 3. Inicializa e orquestra o Servidor gRPC na porta 50051 (Ingestão)
	grpcListener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Erro ao iniciar escuta gRPC na porta 50051: %v", err)
	}

	grpcServer := g.NewServer()
	telemetryService := &grpc.Server{
		DB:       db,
		EventBus: eventBus,
	}
	proto.RegisterTelemetryIngestionServer(grpcServer, telemetryService)

	go func() {
		log.Println("[CISC HUB] Servidor gRPC rodando na porta :50051 (Interface de Ingestão de Sensores)")
		if err := grpcServer.Serve(grpcListener); err != nil {
			log.Fatalf("Falha no servidor gRPC: %v", err)
		}
	}()

	// 4. Inicializa e orquestra o Servidor GraphQL na porta 8080 (Distribuição)
	gqlServer := graphql.NewServer(db, eventBus)
	
	mux := http.NewServeMux()
	mux.HandleFunc("/graphql", gqlServer.HandlerQueryMutation)
	mux.HandleFunc("/graphql/subscriptions", gqlServer.HandlerSubscription)

	log.Println("[CISC HUB] Servidor GraphQL rodando na porta :8080 (Interface de Consulta e Assinatura SSE)")
	log.Println("[CISC HUB] Rotas ativas: POST /graphql | GET /graphql/subscriptions")
	
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Erro no servidor HTTP/GraphQL: %v", err)
	}
}
