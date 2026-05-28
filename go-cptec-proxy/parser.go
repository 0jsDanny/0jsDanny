package main

import (
	"bytes"
	"encoding/xml"
	"io"
	"strings"
	"time"
)

// UFToRegion maps Brazilian state codes to their respective geographical regions
var UFToRegion = map[string]string{
	"AC": "Norte", "AP": "Norte", "AM": "Norte", "PA": "Norte", "RO": "Norte", "RR": "Norte", "TO": "Norte",
	"AL": "Nordeste", "BA": "Nordeste", "CE": "Nordeste", "MA": "Nordeste", "PB": "Nordeste", "PE": "Nordeste", "PI": "Nordeste", "RN": "Nordeste", "SE": "Nordeste",
	"DF": "Centro-Oeste", "GO": "Centro-Oeste", "MT": "Centro-Oeste", "MS": "Centro-Oeste",
	"ES": "Sudeste", "MG": "Sudeste", "RJ": "Sudeste", "SP": "Sudeste",
	"PR": "Sul", "RS": "Sul", "SC": "Sul",
}

// ClimaCondicaoDesc maps CPTEC climate acronyms to full descriptions
var ClimaCondicaoDesc = map[string]string{
	"ec":  "Encoberto com Chuvas Isoladas",
	"ci":  "Chuvas Isoladas",
	"c":   "Chuva",
	"in":  "Instável",
	"pp":  "Poss. de Pancadas de Chuva",
	"cm":  "Chuva pela Manhã",
	"cn":  "Chuva a Noite",
	"pt":  "Pancadas de Chuva a Tarde",
	"pm":  "Pancadas de Chuva pela Manhã",
	"np":  "Nublado e Pancadas de Chuva",
	"pc":  "Pancadas de Chuva",
	"pn":  "Parcialmente Nublado",
	"cv":  "Chuvisco",
	"ch":  "Chuvoso",
	"t":   "Tempestade",
	"ps":  "Predomínio de Sol",
	"e":   "Encoberto",
	"n":   "Nublado",
	"cl":  "Céu Claro",
	"nv":  "Nevoeiro",
	"g":   "Geada",
	"ne":  "Neve",
	"nd":  "Não Definido",
	"pnt": "Pancadas de Chuva a Noite",
	"psc": "Possibilidade de Chuva",
	"pcm": "Possibilidade de Chuva pela Manhã",
	"pct": "Possibilidade de Chuva a Tarde",
	"pcn": "Possibilidade de Chuva a Noite",
	"npt": "Nublado com Pancadas a Tarde",
	"npn": "Nublado com Pancadas a Noite",
	"ncn": "Nublado com Poss. de Chuva a Noite",
	"nct": "Nublado com Poss. de Chuva a Tarde",
	"ncm": "Nubl. c/ Poss. de Chuva pela Manhã",
	"npm": "Nublado com Pancadas pela Manhã",
	"npp": "Nublado com Possibilidade de Chuva",
	"vn":  "Variação de Nebulosidade",
	"ct":  "Chuva a Tarde",
	"ppn": "Poss. de Panc. de Chuva a Noite",
	"ppt": "Poss. de Panc. de Chuva a Tarde",
	"ppm": "Poss. de Panc. de Chuva pela Manhã",
}

// DirecaoDesc maps cardinal points to their descriptions
var DirecaoDesc = map[string]string{
	"N":   "Norte",
	"S":   "Sul",
	"E":   "Leste",
	"W":   "Oeste",
	"NE":  "Nordeste",
	"NW":  "Noroeste",
	"SE":  "Sudeste",
	"SW":  "Sudoeste",
	"NNE": "Norte-nordeste",
	"ENE": "Leste-nordeste",
	"ESE": "Lés-sudeste",
	"SSE": "Sul-sudeste",
	"SSW": "Sul-sudoeste",
	"WSW": "Oeste-sudoeste",
	"WNW": "Oeste-noroeste",
	"NNW": "Norte-noroeste",
}

// ISO88591ToUTF8 converts ISO-8859-1 byte array to UTF-8
func ISO88591ToUTF8(isoBytes []byte) []byte {
	buf := make([]rune, len(isoBytes))
	for i, b := range isoBytes {
		buf[i] = rune(b)
	}
	return []byte(string(buf))
}

// NewUTF8XMLDecoder returns an xml.Decoder pre-configured to decode ISO-8859-1 as UTF-8
func NewUTF8XMLDecoder(xmlBytes []byte) *xml.Decoder {
	utf8Bytes := ISO88591ToUTF8(xmlBytes)
	dec := xml.NewDecoder(bytes.NewReader(utf8Bytes))
	dec.CharsetReader = func(charset string, input io.Reader) (io.Reader, error) {
		return input, nil
	}
	return dec
}

// ParseMetarDate parses CPTEC METAR date "dd/mm/yyyy hh:mm:ss" to ISO 8601 format
func ParseMetarDate(dateStr string) string {
	t, err := time.Parse("02/01/2006 15:04:05", strings.TrimSpace(dateStr))
	if err != nil {
		return dateStr
	}
	return t.Format(time.RFC3339)
}

// ParseOndasDate normalizes date formatting ("dd-mm-yyyy" or "yyyy-mm-dd" or "dd-mm-yyyy Hh Z")
func ParseOndasDate(dateStr string) string {
	dateStr = strings.TrimSpace(dateStr)
	// If it has timezone zulu like "14-11-2013 12h Z", just return the date portion
	if idx := strings.Index(dateStr, " "); idx != -1 {
		dateStr = dateStr[:idx]
	}

	// Try dd-mm-yyyy
	t, err := time.Parse("02-01-2006", dateStr)
	if err == nil {
		return t.Format("2006-01-02")
	}

	// Try yyyy-mm-dd
	t, err = time.Parse("2006-01-02", dateStr)
	if err == nil {
		return t.Format("2006-01-02")
	}

	return dateStr
}

// GetOndaHora extracts the hour string from date string like "14-11-2013 12h Z" -> "12h Z"
func GetOndaHora(dateStr string) string {
	dateStr = strings.TrimSpace(dateStr)
	if idx := strings.Index(dateStr, " "); idx != -1 {
		return dateStr[idx+1:]
	}
	return "00h Z"
}

// GetClimaDesc returns the full description for a weather code
func GetClimaDesc(cond string) string {
	if desc, ok := ClimaCondicaoDesc[cond]; ok {
		return desc
	}
	return "Não Definido"
}

// GetDirecaoDesc returns the full description of a compass direction
func GetDirecaoDesc(dir string) string {
	if desc, ok := DirecaoDesc[strings.ToUpper(strings.TrimSpace(dir))]; ok {
		return desc
	}
	return dir
}
