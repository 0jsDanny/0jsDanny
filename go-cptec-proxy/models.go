package main

import (
	"encoding/xml"
)

// XML structures for CPTEC

type XMLCidade struct {
	Nome string `xml:"nome"`
	UF   string `xml:"uf"`
	ID   int    `xml:"id"`
}

type XMLCidades struct {
	XMLName  xml.Name    `xml:"cidades"`
	Cidades  []XMLCidade `xml:"cidade"`
}

type XMLMetar struct {
	Codigo       string  `xml:"codigo"`
	Atualizacao  string  `xml:"atualizacao"`
	Pressao      int     `xml:"pressao"`
	Temperatura  float64 `xml:"temperatura"`
	Tempo        string  `xml:"tempo"`
	TempoDesc    string  `xml:"tempo_desc"`
	Umidade      int     `xml:"umidade"`
	VentoDir     int     `xml:"vento_dir"`
	VentoInt     int     `xml:"vento_int"`
	Visibilidade string  `xml:"visibilidade"`
	Intensidade  string  `xml:"intensidade"` // some endpoints use intensidade instead of visibilidade
}

type XMLCapitais struct {
	XMLName xml.Name   `xml:"capitais"`
	Metars  []XMLMetar `xml:"metar"`
}

type XMLPrevisao struct {
	Dia    string  `xml:"dia"`
	Tempo  string  `xml:"tempo"`
	Maxima int     `xml:"maxima"`
	Minima int     `xml:"minima"`
	Iuv    float64 `xml:"iuv"`
}

type XMLCidadePrevisao struct {
	Nome        string        `xml:"nome"`
	UF          string        `xml:"uf"`
	Atualizacao string        `xml:"atualizacao"`
	Previsoes   []XMLPrevisao `xml:"previsao"`
}

type XMLOndaPeriodo struct {
	Dia      string  `xml:"dia"`
	Agitacao string  `xml:"agitacao"`
	Altura   float64 `xml:"altura"`
	Direcao  string  `xml:"direcao"`
	Vento    float64 `xml:"vento"`
	VentoDir string  `xml:"vento_dir"`
}

type XMLOndaPrevisao struct {
	Dia      string  `xml:"dia"`
	Agitacao string  `xml:"agitacao"`
	Altura   float64 `xml:"altura"`
	Direcao  string  `xml:"direcao"`
	Vento    float64 `xml:"vento"`
	VentoDir string  `xml:"vento_dir"`
}

type XMLCidadeOndas struct {
	Nome        string            `xml:"nome"`
	UF          string            `xml:"uf"`
	Atualizacao string            `xml:"atualizacao"`
	Manha       *XMLOndaPeriodo   `xml:"manha"`
	Tarde       *XMLOndaPeriodo   `xml:"tarde"`
	Noite       *XMLOndaPeriodo   `xml:"noite"`
	Previsoes   []XMLOndaPrevisao `xml:"previsao"`
}

// JSON structures compatible with BrasilAPI

type City struct {
	Nome   string `json:"nome"`
	Estado string `json:"estado"`
	Regiao string `json:"regiao"`
	ID     int    `json:"id"`
}

type Currentcondicao struct {
	CodigoICAO         string  `json:"codigo_icao"`
	AtualizadoEm       string  `json:"atualizado_em"`
	PressaoAtmosferica int     `json:"pressao_atmosferica"`
	Visibilidade       string  `json:"visibilidade"`
	Vento              int     `json:"vento"`
	DirecaoVento       int     `json:"direcao_vento"`
	Umidade            int     `json:"umidade"`
	Condicao           string  `json:"condicao"`
	CondicaoDesc       string  `json:"condicao_desc"`
	Temp               float64 `json:"temp"`
}

type Clima struct {
	Data         string  `json:"data"`
	Condicao     string  `json:"condicao"`
	Min          int     `json:"min"`
	Max          int     `json:"max"`
	IndiceUV     float64 `json:"indice_uv"`
	CondicaoDesc string  `json:"condicao_desc"`
}

type ClimaPrediction struct {
	Cidade       string  `json:"cidade"`
	Estado       string  `json:"estado"`
	AtualizadoEm string  `json:"atualizado_em"`
	Clima        []Clima `json:"clima"`
}

type Ondas struct {
	Vento            float64 `json:"vento"`
	DirecaoVento     string  `json:"direcao_vento"`
	DirecaoVentoDesc string  `json:"direcao_vento_desc"`
	AlturaOnda       float64 `json:"altura_onda"`
	DirecaoOnda      string  `json:"direcao_onda"`
	DirecaoOndaDesc  string  `json:"direcao_onda_desc"`
	Agitacao         string  `json:"agitacao"`
	Hora             string  `json:"hora"`
}

type OndasData struct {
	Data      string  `json:"data"`
	OndasData []Ondas `json:"dados_ondas"`
}

type OndasPrediction struct {
	Cidade       string      `json:"cidade"`
	Estado       string      `json:"estado"`
	AtualizadoEm string      `json:"atualizado_em"`
	Ondas        []OndasData `json:"ondas"`
}

type ErrorMessage struct {
	Message string `json:"message"`
	Name    string `json:"name"`
	Type    string `json:"type"`
}
