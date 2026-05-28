package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message, errType, name string) {
	respondJSON(w, status, ErrorMessage{
		Message: message,
		Type:    errType,
		Name:    name,
	})
}

func main() {
	cptecURL := os.Getenv("CPTEC_API_URL")
	if cptecURL == "" {
		cptecURL = "http://servicos.cptec.inpe.br"
	}
	brasilapiURL := os.Getenv("BRASILAPI_URL")
	if brasilapiURL == "" {
		brasilapiURL = "https://brasilapi.com.br"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	client := NewWeatherClient(cptecURL, brasilapiURL, 10*time.Minute)
	mux := http.NewServeMux()

	// 1. Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{"status": "OK"})
	})

	// 2. List cities (BrasilAPI proxy)
	mux.HandleFunc("GET /api/cptec/v1/cidade", func(w http.ResponseWriter, r *http.Request) {
		cities, err := client.ListCities()
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error(), "internal_error", "LIST_CITIES_ERROR")
			return
		}
		respondJSON(w, http.StatusOK, cities)
	})

	// 3. Search cities
	mux.HandleFunc("GET /api/cptec/v1/cidade/{cityName}", func(w http.ResponseWriter, r *http.Request) {
		cityName := r.PathValue("cityName")
		if cityName == "" {
			respondError(w, http.StatusBadRequest, "Nome da cidade é obrigatório", "bad_request", "CITY_NAME_REQUIRED")
			return
		}
		cities, err := client.SearchCity(cityName)
		if err != nil {
			respondError(w, http.StatusNotFound, "Nenhuma cidade localizada", "city_error", "CITY_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, cities)
	})

	// 4. Current conditions in capitals
	mux.HandleFunc("GET /api/cptec/v1/clima/capital", func(w http.ResponseWriter, r *http.Request) {
		conds, err := client.GetCurrentCapitais()
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error(), "internal_error", "CAPITALS_CONDITIONS_ERROR")
			return
		}
		respondJSON(w, http.StatusOK, conds)
	})

	// 5. Current conditions at airport
	mux.HandleFunc("GET /api/cptec/v1/clima/aeroporto/{icaoCode}", func(w http.ResponseWriter, r *http.Request) {
		icaoCode := r.PathValue("icaoCode")
		if icaoCode == "" {
			respondError(w, http.StatusBadRequest, "Código ICAO é obrigatório", "bad_request", "ICAO_CODE_REQUIRED")
			return
		}
		cond, err := client.GetAirportConditions(icaoCode)
		if err != nil {
			respondError(w, http.StatusNotFound, "Condições meteorológicas ou aeroporto não localizados", "not_found", "AIRPORT_CONDITIONS_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, cond)
	})

	// 6. Weather prediction for a city (1 day)
	mux.HandleFunc("GET /api/cptec/v1/clima/previsao/{cityCode}", func(w http.ResponseWriter, r *http.Request) {
		cityCodeStr := r.PathValue("cityCode")
		cityCode, err := strconv.Atoi(cityCodeStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Código da cidade inválido", "bad_request", "INVALID_CITY_CODE")
			return
		}
		prediction, err := client.GetCityClima(cityCode, 1)
		if err != nil {
			respondError(w, http.StatusNotFound, "Cidade não localizada", "not_found", "CITY_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, prediction)
	})

	// 7. Weather prediction for a city (up to 6 days)
	mux.HandleFunc("GET /api/cptec/v1/clima/previsao/{cityCode}/{days}", func(w http.ResponseWriter, r *http.Request) {
		cityCodeStr := r.PathValue("cityCode")
		cityCode, err := strconv.Atoi(cityCodeStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Código da cidade inválido", "bad_request", "INVALID_CITY_CODE")
			return
		}
		daysStr := r.PathValue("days")
		days, err := strconv.Atoi(daysStr)
		if err != nil || days < 1 || days > 6 {
			respondError(w, http.StatusBadRequest, "Quantidade de dias inválida (mínimo 1 dia e máximo 6 dias)", "bad_request", "INVALID_DAYS")
			return
		}
		prediction, err := client.GetCityClima(cityCode, days)
		if err != nil {
			respondError(w, http.StatusNotFound, "Cidade não localizada", "not_found", "CITY_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, prediction)
	})

	// 8. Weather prediction with Lat/Lon
	mux.HandleFunc("GET /api/cptec/v1/clima/previsao/semana/{lat}/{long}", func(w http.ResponseWriter, r *http.Request) {
		latStr := r.PathValue("lat")
		longStr := r.PathValue("long")
		lat, errLat := strconv.ParseFloat(latStr, 64)
		long, errLong := strconv.ParseFloat(longStr, 64)
		if errLat != nil || errLong != nil {
			respondError(w, http.StatusBadRequest, "Latitude e longitude inválidas", "bad_request", "INVALID_LAT_LONG")
			return
		}
		prediction, err := client.GetCityClimaLatLon(lat, long)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error(), "internal_error", "CLIMA_LAT_LONG_ERROR")
			return
		}
		respondJSON(w, http.StatusOK, prediction)
	})

	// 9. Waves prediction for a city (1 day)
	mux.HandleFunc("GET /api/cptec/v1/ondas/{cityCode}", func(w http.ResponseWriter, r *http.Request) {
		cityCodeStr := r.PathValue("cityCode")
		cityCode, err := strconv.Atoi(cityCodeStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Código da cidade inválido", "bad_request", "INVALID_CITY_CODE")
			return
		}
		prediction, err := client.GetOndas(cityCode, 1)
		if err != nil {
			respondError(w, http.StatusNotFound, "Cidade não localizada", "not_found", "CITY_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, prediction)
	})

	// 10. Waves prediction for a city (up to 6 days)
	mux.HandleFunc("GET /api/cptec/v1/ondas/{cityCode}/{days}", func(w http.ResponseWriter, r *http.Request) {
		cityCodeStr := r.PathValue("cityCode")
		cityCode, err := strconv.Atoi(cityCodeStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Código da cidade inválido", "bad_request", "INVALID_CITY_CODE")
			return
		}
		daysStr := r.PathValue("days")
		days, err := strconv.Atoi(daysStr)
		if err != nil || days < 1 || days > 6 {
			respondError(w, http.StatusBadRequest, "Quantidade de dias inválida (mínimo 1 dia e máximo 6 dias)", "bad_request", "INVALID_NUMBER_OF_DAYS")
			return
		}
		prediction, err := client.GetOndas(cityCode, days)
		if err != nil {
			respondError(w, http.StatusNotFound, "Cidade não localizada", "not_found", "CITY_NOT_FOUND")
			return
		}
		respondJSON(w, http.StatusOK, prediction)
	})

	log.Printf("go-cptec-proxy listening on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
