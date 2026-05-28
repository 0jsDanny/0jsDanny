package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestWeatherClient_Success(t *testing.T) {
	// Helper to convert UTF-8 test strings to ISO-8859-1 bytes
	toISO := func(s string) []byte {
		runes := []rune(s)
		res := make([]byte, len(runes))
		for i, r := range runes {
			res[i] = byte(r)
		}
		return res
	}

	// Mock CPTEC XML Server
	cptecMock := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml; charset=iso-8859-1")
		if strings.Contains(r.URL.Path, "listaCidades") && r.URL.Query().Get("city") == "sao" {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(toISO(`<?xml version="1.0" encoding="ISO-8859-1"?><cidades><cidade><nome>São Paulo</nome><uf>SP</uf><id>244</id></cidade></cidades>`))
			return
		}
		if strings.Contains(r.URL.Path, "capitais/condicoesAtuais.xml") {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(toISO(`<?xml version="1.0" encoding="ISO-8859-1"?><capitais><metar><codigo>SBGR</codigo><atualizacao>08/08/2011 16:00:00</atualizacao><pressao>1017</pressao><temperatura>30</temperatura><tempo>cl</tempo><tempo_desc>Céu Claro</tempo_desc><umidade>35</umidade><vento_dir>300</vento_dir><vento_int>18</vento_int><visibilidade>>10000</visibilidade></metar></capitais>`))
			return
		}
		if strings.Contains(r.URL.Path, "cidade/244/previsao.xml") {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(toISO(`<?xml version="1.0" encoding="ISO-8859-1"?><cidade><nome>São Paulo</nome><uf>SP</uf><atualizacao>2011-08-09</atualizacao><previsao><dia>2011-08-10</dia><tempo>n</tempo><maxima>18</maxima><minima>15</minima><iuv>6.0</iuv></previsao></cidade>`))
			return
		}
		if strings.Contains(r.URL.Path, "cidade/241/dia/0/ondas.xml") {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(toISO(`<?xml version="1.0" encoding="ISO-8859-1"?><cidade><nome>Rio de Janeiro</nome><uf>RJ</uf><atualizacao>14-11-2013</atualizacao><manha><dia>14-11-2013 12h Z</dia><agitacao>Fraco</agitacao><altura>1.1</altura><direcao>SSW</direcao><vento>3.4</vento><vento_dir>S</vento_dir></manha></cidade>`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer cptecMock.Close()

	// Mock BrasilAPI JSON Server (not used in success tests but configured)
	brasilMock := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer brasilMock.Close()

	client := NewWeatherClient(cptecMock.URL, brasilMock.URL, 5*time.Second)

	// Test SearchCity
	cities, err := client.SearchCity("sao")
	if err != nil {
		t.Fatalf("SearchCity failed: %v", err)
	}
	if len(cities) != 1 || cities[0].Nome != "São Paulo" || cities[0].Regiao != "Sudeste" {
		t.Errorf("Unexpected SearchCity result: %+v", cities)
	}

	// Test GetCurrentCapitais
	capitais, err := client.GetCurrentCapitais()
	if err != nil {
		t.Fatalf("GetCurrentCapitais failed: %v", err)
	}
	if len(capitais) != 1 || capitais[0].CodigoICAO != "SBGR" || capitais[0].CondicaoDesc != "Céu Claro" {
		t.Errorf("Unexpected GetCurrentCapitais result: %+v", capitais)
	}

	// Test GetCityClima 1 day
	clima, err := client.GetCityClima(244, 1)
	if err != nil {
		t.Fatalf("GetCityClima failed: %v", err)
	}
	if clima.Cidade != "São Paulo" || len(clima.Clima) != 1 || clima.Clima[0].CondicaoDesc != "Nublado" {
		t.Errorf("Unexpected Clima result: %+v", clima)
	}

	// Test GetOndas 1 day
	ondas, err := client.GetOndas(241, 1)
	if err != nil {
		t.Fatalf("GetOndas failed: %v", err)
	}
	if ondas.Cidade != "Rio de Janeiro" || len(ondas.Ondas) != 1 || len(ondas.Ondas[0].OndasData) != 1 {
		t.Errorf("Unexpected Ondas result: %+v", ondas)
	}
}

func TestWeatherClient_Fallback(t *testing.T) {
	// Mock CPTEC XML Server failing
	cptecMock := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer cptecMock.Close()

	// Mock BrasilAPI JSON Server succeeding
	brasilMock := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(r.URL.Path, "cidade/sao") {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[{"nome": "São Paulo", "estado": "SP", "regiao": "Sudeste", "id": 244}]`))
			return
		}
		if strings.Contains(r.URL.Path, "clima/capital") {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[{"codigo_icao": "SBAR", "atualizado_em": "2021-01-27T15:00:00.974Z", "pressao_atmosferica": 1014, "visibilidade": "9000", "vento": 29, "direcao_vento": 90, "umidade": 74, "condicao": "ps", "condicao_desc": "Predomínio de Sol", "temp": 28}]`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer brasilMock.Close()

	client := NewWeatherClient(cptecMock.URL, brasilMock.URL, 5*time.Second)

	// Test Fallback SearchCity
	cities, err := client.SearchCity("sao")
	if err != nil {
		t.Fatalf("Fallback SearchCity failed: %v", err)
	}
	if len(cities) != 1 || cities[0].Nome != "São Paulo" {
		t.Errorf("Unexpected fallback SearchCity result: %+v", cities)
	}

	// Test Fallback GetCurrentCapitais
	capitais, err := client.GetCurrentCapitais()
	if err != nil {
		t.Fatalf("Fallback GetCurrentCapitais failed: %v", err)
	}
	if len(capitais) != 1 || capitais[0].CodigoICAO != "SBAR" {
		t.Errorf("Unexpected fallback GetCurrentCapitais result: %+v", capitais)
	}
}

func TestWeatherClient_Cache(t *testing.T) {
	callCount := 0
	// Mock CPTEC XML Server counting calls
	cptecMock := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.Header().Set("Content-Type", "application/xml; charset=iso-8859-1")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`<?xml version="1.0" encoding="ISO-8859-1"?><cidades><cidade><nome>São Paulo</nome><uf>SP</uf><id>244</id></cidade></cidades>`))
	}))
	defer cptecMock.Close()

	client := NewWeatherClient(cptecMock.URL, "http://invalid", 2*time.Second)

	// First search
	_, err := client.SearchCity("sao")
	if err != nil {
		t.Fatalf("First SearchCity failed: %v", err)
	}
	if callCount != 1 {
		t.Errorf("Expected 1 backend call, got %d", callCount)
	}

	// Second search (should hit cache)
	_, err = client.SearchCity("sao")
	if err != nil {
		t.Fatalf("Second SearchCity failed: %v", err)
	}
	if callCount != 1 {
		t.Errorf("Expected cache hit, backend call count rose to %d", callCount)
	}

	// Wait for cache expiry
	time.Sleep(2100 * time.Millisecond)

	// Third search (should reload from backend)
	_, err = client.SearchCity("sao")
	if err != nil {
		t.Fatalf("Third SearchCity failed: %v", err)
	}
	if callCount != 2 {
		t.Errorf("Expected cache expiry and new backend call, got %d calls", callCount)
	}
}
