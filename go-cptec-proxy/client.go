package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"time"
)

// CacheEntry represents an item in our memory cache
type CacheEntry struct {
	Data      interface{}
	ExpiresAt time.Time
}

// MemoryCache is a thread-safe cache
type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]CacheEntry
}

func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]CacheEntry),
	}
}

func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	item, found := c.items[key]
	if !found {
		return nil, false
	}
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}
	return item.Data, true
}

func (c *MemoryCache) Set(key string, data interface{}, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = CacheEntry{
		Data:      data,
		ExpiresAt: time.Now().Add(ttl),
	}
}

// WeatherClient coordinates CPTEC calls with BrasilAPI fallback
type WeatherClient struct {
	CPTECBaseURL     string
	BrasilAPIBaseURL string
	HTTPClient       *http.Client
	Cache            *MemoryCache
	CacheTTL         time.Duration
}

func NewWeatherClient(cptecURL, brasilapiURL string, cacheTTL time.Duration) *WeatherClient {
	return &WeatherClient{
		CPTECBaseURL:     cptecURL,
		BrasilAPIBaseURL: brasilapiURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		Cache:    NewMemoryCache(),
		CacheTTL: cacheTTL,
	}
}

// fetchCPTECXML fetches XML from CPTEC, converts encoding to UTF-8
func (c *WeatherClient) fetchCPTECXML(path string) ([]byte, error) {
	resp, err := c.HTTPClient.Get(c.CPTECBaseURL + path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("CPTEC returned status %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return bodyBytes, nil
}

// fetchBrasilAPIJSON fetches fallback data directly from BrasilAPI
func (c *WeatherClient) fetchBrasilAPIJSON(path string, target interface{}) error {
	resp, err := c.HTTPClient.Get(c.BrasilAPIBaseURL + path)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("BrasilAPI returned status %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// ListCities fetches the complete list of cities.
// CPTEC lists cities only by search, so we query BrasilAPI as primary for this route.
func (c *WeatherClient) ListCities() ([]City, error) {
	cacheKey := "list_cities"
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.([]City), nil
	}

	var cities []City
	err := c.fetchBrasilAPIJSON("/api/cptec/v1/cidade", &cities)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, cities, c.CacheTTL)
	return cities, nil
}

// SearchCity searches for cities matching a term
func (c *WeatherClient) SearchCity(cityName string) ([]City, error) {
	cacheKey := "search_city_" + cityName
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.([]City), nil
	}

	// 1. Try CPTEC
	escapedCity := url.QueryEscape(cityName)
	xmlBytes, err := c.fetchCPTECXML("/XML/listaCidades?city=" + escapedCity)
	if err == nil {
		var xmlCidades XMLCidades
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&xmlCidades); err == nil {
			cities := make([]City, len(xmlCidades.Cidades))
			for i, val := range xmlCidades.Cidades {
				cities[i] = City{
					Nome:   val.Nome,
					Estado: val.UF,
					Regiao: UFToRegion[val.UF],
					ID:     val.ID,
				}
			}
			c.Cache.Set(cacheKey, cities, c.CacheTTL)
			return cities, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var cities []City
	err = c.fetchBrasilAPIJSON("/api/cptec/v1/cidade/"+escapedCity, &cities)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, cities, c.CacheTTL)
	return cities, nil
}

// GetCurrentCapitais retrieves meteorological data for capitals
func (c *WeatherClient) GetCurrentCapitais() ([]Currentcondicao, error) {
	cacheKey := "current_capitais"
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.([]Currentcondicao), nil
	}

	// 1. Try CPTEC
	xmlBytes, err := c.fetchCPTECXML("/XML/capitais/condicoesAtuais.xml")
	if err == nil {
		var xmlCapitais XMLCapitais
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&xmlCapitais); err == nil {
			condicoes := make([]Currentcondicao, len(xmlCapitais.Metars))
			for i, m := range xmlCapitais.Metars {
				vis := m.Visibilidade
				if vis == "" {
					vis = m.Intensidade
				}
				condicoes[i] = Currentcondicao{
					CodigoICAO:         m.Codigo,
					AtualizadoEm:       ParseMetarDate(m.Atualizacao),
					PressaoAtmosferica: m.Pressao,
					Visibilidade:       vis,
					Vento:              m.VentoInt,
					DirecaoVento:       m.VentoDir,
					Umidade:            m.Umidade,
					Condicao:           m.Tempo,
					CondicaoDesc:       m.TempoDesc,
					Temp:               m.Temperatura,
				}
			}
			c.Cache.Set(cacheKey, condicoes, c.CacheTTL)
			return condicoes, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var condicoes []Currentcondicao
	err = c.fetchBrasilAPIJSON("/api/cptec/v1/clima/capital", &condicoes)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, condicoes, c.CacheTTL)
	return condicoes, nil
}

// GetAirportConditions retrieves current conditions for an airport via its ICAO code
func (c *WeatherClient) GetAirportConditions(icaoCode string) (*Currentcondicao, error) {
	cacheKey := "airport_" + icaoCode
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.(*Currentcondicao), nil
	}

	// 1. Try CPTEC
	xmlBytes, err := c.fetchCPTECXML("/XML/estacao/" + icaoCode + "/condicoesAtuais.xml")
	if err == nil {
		var m XMLMetar
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&m); err == nil {
			vis := m.Visibilidade
			if vis == "" {
				vis = m.Intensidade
			}
			condicao := &Currentcondicao{
				CodigoICAO:         m.Codigo,
				AtualizadoEm:       ParseMetarDate(m.Atualizacao),
				PressaoAtmosferica: m.Pressao,
				Visibilidade:       vis,
				Vento:              m.VentoInt,
				DirecaoVento:       m.VentoDir,
				Umidade:            m.Umidade,
				Condicao:           m.Tempo,
				CondicaoDesc:       m.TempoDesc,
				Temp:               m.Temperatura,
			}
			c.Cache.Set(cacheKey, condicao, c.CacheTTL)
			return condicao, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var condicao Currentcondicao
	err = c.fetchBrasilAPIJSON("/api/cptec/v1/clima/aeroporto/"+icaoCode, &condicao)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, &condicao, c.CacheTTL)
	return &condicao, nil
}

// GetCityClima gets weather prediction for a city code, limiting predictions to specified days
func (c *WeatherClient) GetCityClima(cityCode int, days int) (*ClimaPrediction, error) {
	cacheKey := fmt.Sprintf("clima_%d_%d", cityCode, days)
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.(*ClimaPrediction), nil
	}

	// Set appropriate CPTEC path depending on target days
	var path string
	if days == 1 {
		path = fmt.Sprintf("/XML/cidade/%d/previsao.xml", cityCode)
	} else {
		path = fmt.Sprintf("/XML/cidade/7dias/%d/previsao.xml", cityCode)
	}

	// 1. Try CPTEC
	xmlBytes, err := c.fetchCPTECXML(path)
	if err == nil {
		var xmlCPTEC XMLCidadePrevisao
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&xmlCPTEC); err == nil {
			prediction := &ClimaPrediction{
				Cidade:       xmlCPTEC.Nome,
				Estado:       xmlCPTEC.UF,
				AtualizadoEm: xmlCPTEC.Atualizacao,
				Clima:        make([]Clima, 0),
			}
			for i, p := range xmlCPTEC.Previsoes {
				if i >= days {
					break
				}
				prediction.Clima = append(prediction.Clima, Clima{
					Data:         p.Dia,
					Condicao:     p.Tempo,
					Min:          p.Minima,
					Max:          p.Maxima,
					IndiceUV:     p.Iuv,
					CondicaoDesc: GetClimaDesc(p.Tempo),
				})
			}
			c.Cache.Set(cacheKey, prediction, c.CacheTTL)
			return prediction, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var prediction ClimaPrediction
	var fallbackPath string
	if days == 1 {
		fallbackPath = fmt.Sprintf("/api/cptec/v1/clima/previsao/%d", cityCode)
	} else {
		fallbackPath = fmt.Sprintf("/api/cptec/v1/clima/previsao/%d/%d", cityCode, days)
	}

	err = c.fetchBrasilAPIJSON(fallbackPath, &prediction)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, &prediction, c.CacheTTL)
	return &prediction, nil
}

// GetCityClimaLatLon gets weather prediction for a city close to lat/long coordinates
func (c *WeatherClient) GetCityClimaLatLon(lat, long float64) (*ClimaPrediction, error) {
	cacheKey := fmt.Sprintf("clima_latlon_%f_%f", lat, long)
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.(*ClimaPrediction), nil
	}

	// 1. Try CPTEC
	// CPTEC uses negative values in Lat/Lon (e.g. -22.90/-47.06)
	path := fmt.Sprintf("/XML/cidade/7dias/%s/%s/previsaoLatLon.xml",
		strconv.FormatFloat(lat, 'f', 2, 64),
		strconv.FormatFloat(long, 'f', 2, 64))

	xmlBytes, err := c.fetchCPTECXML(path)
	if err == nil {
		var xmlCPTEC XMLCidadePrevisao
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&xmlCPTEC); err == nil {
			prediction := &ClimaPrediction{
				Cidade:       xmlCPTEC.Nome,
				Estado:       xmlCPTEC.UF,
				AtualizadoEm: xmlCPTEC.Atualizacao,
				Clima:        make([]Clima, 0),
			}
			// CPTEC returns 7 days for LatLon previsoes
			for _, p := range xmlCPTEC.Previsoes {
				prediction.Clima = append(prediction.Clima, Clima{
					Data:         p.Dia,
					Condicao:     p.Tempo,
					Min:          p.Minima,
					Max:          p.Maxima,
					IndiceUV:     p.Iuv,
					CondicaoDesc: GetClimaDesc(p.Tempo),
				})
			}
			c.Cache.Set(cacheKey, prediction, c.CacheTTL)
			return prediction, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var prediction ClimaPrediction
	fallbackPath := fmt.Sprintf("/api/cptec/v1/clima/previsao/semana/%s/%s",
		strconv.FormatFloat(lat, 'f', -1, 64),
		strconv.FormatFloat(long, 'f', -1, 64))

	err = c.fetchBrasilAPIJSON(fallbackPath, &prediction)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, &prediction, c.CacheTTL)
	return &prediction, nil
}

// GetOndas retrieves wave predictions for litoranean cities
func (c *WeatherClient) GetOndas(cityCode int, days int) (*OndasPrediction, error) {
	cacheKey := fmt.Sprintf("ondas_%d_%d", cityCode, days)
	if cached, ok := c.Cache.Get(cacheKey); ok {
		return cached.(*OndasPrediction), nil
	}

	var path string
	if days == 1 {
		path = fmt.Sprintf("/XML/cidade/%d/dia/0/ondas.xml", cityCode)
	} else {
		path = fmt.Sprintf("/XML/cidade/%d/todos/tempos/ondas.xml", cityCode)
	}

	// 1. Try CPTEC
	xmlBytes, err := c.fetchCPTECXML(path)
	if err == nil {
		var xmlOndas XMLCidadeOndas
		dec := NewUTF8XMLDecoder(xmlBytes)
		if err := dec.Decode(&xmlOndas); err == nil {
			prediction := &OndasPrediction{
				Cidade:       xmlOndas.Nome,
				Estado:       xmlOndas.UF,
				AtualizadoEm: ParseOndasDate(xmlOndas.Atualizacao),
				Ondas:        make([]OndasData, 0),
			}

			if days == 1 {
				// Single day with manha/tarde/noite subdivisions
				var dataList []Ondas
				mapPeriodo := func(p *XMLOndaPeriodo) {
					if p == nil {
						return
					}
					dataList = append(dataList, Ondas{
						Vento:            p.Vento,
						DirecaoVento:     p.VentoDir,
						DirecaoVentoDesc: GetDirecaoDesc(p.VentoDir),
						AlturaOnda:       p.Altura,
						DirecaoOnda:      p.Direcao,
						DirecaoOndaDesc:  GetDirecaoDesc(p.Direcao),
						Agitacao:         p.Agitacao,
						Hora:             GetOndaHora(p.Dia),
					})
				}
				mapPeriodo(xmlOndas.Manha)
				mapPeriodo(xmlOndas.Tarde)
				mapPeriodo(xmlOndas.Noite)

				if len(dataList) > 0 {
					targetDate := ParseOndasDate(xmlOndas.Atualizacao)
					if xmlOndas.Manha != nil {
						targetDate = ParseOndasDate(xmlOndas.Manha.Dia)
					}
					prediction.Ondas = append(prediction.Ondas, OndasData{
						Data:      targetDate,
						OndasData: dataList,
					})
				}
			} else {
				// Multiple days list with 8 forecasts per day
				dayMap := make(map[string][]Ondas)
				var dayOrder []string
				for _, p := range xmlOndas.Previsoes {
					normDate := ParseOndasDate(p.Dia)
					o := Ondas{
						Vento:            p.Vento,
						DirecaoVento:     p.VentoDir,
						DirecaoVentoDesc: GetDirecaoDesc(p.VentoDir),
						AlturaOnda:       p.Altura,
						DirecaoOnda:      p.Direcao,
						DirecaoOndaDesc:  GetDirecaoDesc(p.Direcao),
						Agitacao:         p.Agitacao,
						Hora:             GetOndaHora(p.Dia),
					}
					if _, ok := dayMap[normDate]; !ok {
						dayOrder = append(dayOrder, normDate)
					}
					dayMap[normDate] = append(dayMap[normDate], o)
				}

				for i, d := range dayOrder {
					if i >= days {
						break
					}
					prediction.Ondas = append(prediction.Ondas, OndasData{
						Data:      d,
						OndasData: dayMap[d],
					})
				}
			}

			c.Cache.Set(cacheKey, prediction, c.CacheTTL)
			return prediction, nil
		}
	}

	// 2. Fallback to BrasilAPI
	var prediction OndasPrediction
	var fallbackPath string
	if days == 1 {
		fallbackPath = fmt.Sprintf("/api/cptec/v1/ondas/%d", cityCode)
	} else {
		fallbackPath = fmt.Sprintf("/api/cptec/v1/ondas/%d/%d", cityCode, days)
	}

	err = c.fetchBrasilAPIJSON(fallbackPath, &prediction)
	if err != nil {
		return nil, err
	}

	c.Cache.Set(cacheKey, &prediction, c.CacheTTL)
	return &prediction, nil
}
