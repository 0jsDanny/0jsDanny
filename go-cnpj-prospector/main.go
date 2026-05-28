package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

var (
	cacheInstance = NewCNPJCache()
)

type Provider struct {
	Name string
	Fn   func(ctx context.Context, cnpj string) (*CNPJNormalizedResponse, error)
}

var providersList = []Provider{
	{Name: "OpenCNPJ", Fn: queryOpenCNPJ},
	{Name: "CNPJ.ws", Fn: queryCNPJWS},
	{Name: "ReceitaWS", Fn: queryReceitaWS},
	{Name: "BrasilAPI", Fn: queryBrasilAPI},
}

func main() {
	mux := http.NewServeMux()

	// CORS Middleware
	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next(w, r)
		}
	}

	mux.HandleFunc("/health", corsHandler(handleHealth))
	mux.HandleFunc("/api/cnpj/", corsHandler(handleCNPJ))
	mux.HandleFunc("/api/cnpj/batch", corsHandler(handleCNPJBatch))
	mux.HandleFunc("/api/cnpj/cache/clear", corsHandler(handleClearCache))

	server := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Println("[CNPJ Prospector Proxy] Starting server on :8080...")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "UP", "time": time.Now().Format(time.RFC3339)})
}

func handleClearCache(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cacheInstance.Clear()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Cache cleared successfully"})
}

func handleCNPJ(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cnpj := strings.TrimPrefix(r.URL.Path, "/api/cnpj/")
	cnpj = strings.TrimSpace(cnpj)

	// Clean trailing slashes or subpaths
	if strings.Contains(cnpj, "/") {
		cnpj = strings.Split(cnpj, "/")[0]
	}

	if cnpj == "batch" || cnpj == "" {
		// Batch request handled by another handler, or empty
		http.NotFound(w, r)
		return
	}

	cleanedCNPJ := CleanCNPJ(cnpj)
	if !ValidateCNPJ(cleanedCNPJ) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CNPJQueryResult{
			Success: false,
			Error:   "CNPJ inválido",
		})
		return
	}

	// Cache parameters
	useCache := r.URL.Query().Get("bypass_cache") != "true"
	cacheTTL := 5 * time.Minute
	if ttlStr := r.URL.Query().Get("cache_ttl"); ttlStr != "" {
		if val, err := time.ParseDuration(ttlStr); err == nil {
			cacheTTL = val
		}
	}

	// Check Cache
	if useCache {
		if cached, ok := cacheInstance.Get(cleanedCNPJ, cacheTTL); ok {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(CNPJQueryResult{
				Success: true,
				Data: &CNPJNormalizedResponse{
					CNPJ:                    cached.CNPJ,
					CNPJFormatado:           cached.CNPJFormatado,
					RazaoSocial:             cached.RazaoSocial,
					NomeFantasia:            cached.NomeFantasia,
					SituacaoCadastral:       cached.SituacaoCadastral,
					DataSituacaoCadastral:   cached.DataSituacaoCadastral,
					MotivoSituacaoCadastral: cached.MotivoSituacaoCadastral,
					Tipo:                    cached.Tipo,
					Porte:                   cached.Porte,
					NaturezaJuridica:        cached.NaturezaJuridica,
					CapitalSocial:           cached.CapitalSocial,
					AtividadePrincipal:      cached.AtividadePrincipal,
					AtividadesSecundarias:   cached.AtividadesSecundarias,
					Endereco:                cached.Endereco,
					Telefone1:               cached.Telefone1,
					Telefone2:               cached.Telefone2,
					Email:                   cached.Email,
					DataAbertura:            cached.DataAbertura,
					DataAtualizacao:         cached.DataAtualizacao,
					SimplesNacional:         cached.SimplesNacional,
					MEI:                     cached.MEI,
					Socios:                  cached.Socios,
					Suframa:                 cached.Suframa,
					Meta: CNPJMetadata{
						Provider:     cached.Meta.Provider + " (cache)",
						ResponseTime: 0,
						Timestamp:    cached.Meta.Timestamp,
					},
				},
				Providers: ProvidersMeta{
					Attempted:  []string{"cache"},
					Successful: stringPtr("cache"),
				},
			})
			return
		}
	}

	// Timeout configuration
	timeout := 10 * time.Second
	if tStr := r.URL.Query().Get("timeout"); tStr != "" {
		if val, err := time.ParseDuration(tStr); err == nil {
			timeout = val
		}
	}

	// Execute Fallback Strategy
	result := executeQuery(r.Context(), cleanedCNPJ, timeout)

	w.Header().Set("Content-Type", "application/json")
	if !result.Success {
		w.WriteHeader(http.StatusBadGateway)
	} else {
		w.WriteHeader(http.StatusOK)
		// Store in cache
		if useCache && result.Data != nil {
			cacheInstance.Set(cleanedCNPJ, result.Data)
		}
	}
	json.NewEncoder(w).Encode(result)
}

type BatchRequest struct {
	CNPJs []string `json:"cnpjs"`
}

func handleCNPJBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req BatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	results := make([]CNPJQueryResult, 0, len(req.CNPJs))
	delay := 1200 * time.Millisecond

	// Check if custom delay is passed
	if dStr := r.URL.Query().Get("delay"); dStr != "" {
		if val, err := time.ParseDuration(dStr); err == nil {
			delay = val
		}
	}

	for i, cnpj := range req.CNPJs {
		cleaned := CleanCNPJ(cnpj)
		if !ValidateCNPJ(cleaned) {
			results = append(results, CNPJQueryResult{
				Success: false,
				Error:   "CNPJ inválido",
			})
			continue
		}

		// Check cache first to avoid hitting rate limits
		if cached, ok := cacheInstance.Get(cleaned, 5*time.Minute); ok {
			results = append(results, CNPJQueryResult{
				Success: true,
				Data:    cached,
				Providers: ProvidersMeta{
					Attempted:  []string{"cache"},
					Successful: stringPtr("cache"),
				},
			})
			continue
		}

		// Query
		res := executeQuery(r.Context(), cleaned, 10*time.Second)
		if res.Success && res.Data != nil {
			cacheInstance.Set(cleaned, res.Data)
		}
		results = append(results, res)

		// Throttling delay between non-cached external calls
		if i < len(req.CNPJs)-1 {
			time.Sleep(delay)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

func executeQuery(ctx context.Context, cnpj string, timeout time.Duration) CNPJQueryResult {
	attempted := make([]string, 0, len(providersList))
	failed := make([]FailedMeta, 0)

	for _, provider := range providersList {
		attempted = append(attempted, provider.Name)
		log.Printf("[CNPJ Prospector Proxy] Querying provider: %s for CNPJ %s", provider.Name, cnpj)

		start := time.Now()
		provCtx, cancel := context.WithTimeout(ctx, timeout)

		data, err := provider.Fn(provCtx, cnpj)
		cancel()

		if err == nil && data != nil {
			data.Meta = CNPJMetadata{
				Provider:     provider.Name,
				ResponseTime: time.Since(start).Milliseconds(),
				Timestamp:    time.Now().Format(time.RFC3339),
			}

			log.Printf("[CNPJ Prospector Proxy] Success with provider: %s in %dms", provider.Name, time.Since(start).Milliseconds())
			return CNPJQueryResult{
				Success: true,
				Data:    data,
				Providers: ProvidersMeta{
					Attempted:  attempted,
					Successful: stringPtr(provider.Name),
					Failed:     failed,
				},
			}
		}

		errStr := "Unknown error"
		if err != nil {
			errStr = err.Error()
		}
		log.Printf("[CNPJ Prospector Proxy] Failed with provider %s: %s", provider.Name, errStr)
		failed = append(failed, FailedMeta{
			Provider: provider.Name,
			Error:    errStr,
		})
	}

	return CNPJQueryResult{
		Success: false,
		Error:   "Todas as APIs falharam. Tente novamente em alguns segundos.",
		Providers: ProvidersMeta{
			Attempted:  attempted,
			Successful: nil,
			Failed:     failed,
		},
	}
}

func stringPtr(s string) *string {
	return &s
}
