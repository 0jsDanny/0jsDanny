package main

import (
	"strings"
	"unicode"
)

// CNPJNormalizedResponse represents the unified CNPJ payload format
type CNPJNormalizedResponse struct {
	CNPJ                    string           `json:"cnpj"`
	CNPJFormatado           string           `json:"cnpjFormatado"`
	RazaoSocial             string           `json:"razaoSocial"`
	NomeFantasia            *string          `json:"nomeFantasia"`
	SituacaoCadastral       string           `json:"situacaoCadastral"`
	DataSituacaoCadastral   *string          `json:"dataSituacaoCadastral"`
	MotivoSituacaoCadastral *string          `json:"motivoSituacaoCadastral"`
	Tipo                    string           `json:"tipo"`
	Porte                   *string          `json:"porte"`
	NaturezaJuridica        *string          `json:"naturezaJuridica"`
	CapitalSocial           *float64         `json:"capitalSocial"`
	AtividadePrincipal      *CNPJActivity    `json:"atividadePrincipal"`
	AtividadesSecundarias   []CNPJActivity   `json:"atividadesSecundarias"`
	Endereco                CNPJAddress      `json:"endereco"`
	Telefone1               *string          `json:"telefone1"`
	Telefone2               *string          `json:"telefone2"`
	Email                   *string          `json:"email"`
	DataAbertura            *string          `json:"dataAbertura"`
	DataAtualizacao         *string          `json:"dataAtualizacao"`
	SimplesNacional         *SimplesOption   `json:"simplesNacional"`
	MEI                     *MEIOption       `json:"mei"`
	Socios                  []CNPJSocio      `json:"socios"`
	Suframa                 []CNPJSuframa    `json:"suframa"`
	Meta                    CNPJMetadata     `json:"_meta"`
}

type CNPJActivity struct {
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
}

type CNPJAddress struct {
	TipoLogradouro string  `json:"tipoLogradouro"`
	Logradouro     *string `json:"logradouro"`
	Numero         *string `json:"numero"`
	Complemento    *string `json:"complemento"`
	Bairro         *string `json:"bairro"`
	CEP            *string `json:"cep"`
	Municipio      *string `json:"municipio"`
	UF             *string `json:"uf"`
}

type SimplesOption struct {
	Optante      *bool   `json:"optante"`
	DataOpcao    *string `json:"dataOpcao"`
	DataExclusao *string `json:"dataExclusao"`
}

type MEIOption struct {
	Optante      *bool   `json:"optante"`
	DataOpcao    *string `json:"dataOpcao"`
	DataExclusao *string `json:"dataExclusao"`
}

type CNPJSocio struct {
	Nome         string  `json:"nome"`
	Qualificacao string  `json:"qualificacao"`
	DataEntrada  *string `json:"dataEntrada"`
}

type CNPJSuframa struct {
	Inscricao     string  `json:"inscricao"`
	Ativo         bool    `json:"ativo"`
	DataAprovacao *string `json:"dataAprovacao"`
}

type CNPJMetadata struct {
	Provider     string `json:"provider"`
	ResponseTime int64  `json:"responseTime"`
	Timestamp    string `json:"timestamp"`
}

// CNPJResponseWrapper holds results of query strategy
type CNPJQueryResult struct {
	Success   bool                    `json:"success"`
	Data      *CNPJNormalizedResponse `json:"data"`
	Error     string                  `json:"error,omitempty"`
	Providers ProvidersMeta           `json:"providers"`
}

type ProvidersMeta struct {
	Attempted  []string      `json:"attempted"`
	Successful *string       `json:"successful"`
	Failed     []FailedMeta  `json:"failed"`
}

type FailedMeta struct {
	Provider string `json:"provider"`
	Error    string `json:"error"`
}

// CleanCNPJ removes any non-alphanumeric character
func CleanCNPJ(cnpj string) string {
	var sb strings.Builder
	for _, r := range cnpj {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			sb.WriteRune(r)
		}
	}
	return sb.String()
}

// FormatCNPJ formats the CNPJ string to XX.XXX.XXX/XXXX-XX layout
func FormatCNPJ(cnpj string) string {
	cleaned := CleanCNPJ(cnpj)
	if len(cleaned) != 14 {
		return cnpj
	}
	return cleaned[0:2] + "." + cleaned[2:5] + "." + cleaned[5:8] + "/" + cleaned[8:12] + "-" + cleaned[12:14]
}

// ValidateCNPJ performs a mathematical validation of the CNPJ, supporting both
// the legacy numeric-only format and the new alphanumeric format (COCAD 01/2024).
func ValidateCNPJ(cnpj string) bool {
	cleaned := CleanCNPJ(cnpj)
	if len(cleaned) != 14 {
		return false
	}

	// Alphanumeric validation (ASCII code - 48)
	// Digits 0-9: ASCII 48-57 -> values 0-9
	// Letters A-Z: ASCII 65-90 -> values 17-42
	// Last 2 characters must be digits for the check digits.
	
	// Check if all characters are the same (invalid pattern)
	allSame := true
	for i := 1; i < 14; i++ {
		if cleaned[i] != cleaned[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}

	// Helper to resolve character value
	getCharVal := func(r byte) (int, bool) {
		if r >= '0' && r <= '9' {
			return int(r - '0'), true
		}
		if r >= 'A' && r <= 'Z' {
			return int(r - '0'), true // 'A'(65) - '0'(48) = 17
		}
		if r >= 'a' && r <= 'z' {
			return int(r - 'a' + 17), true
		}
		return 0, false
	}

	// 1. Validate first check digit
	weights1 := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum1 := 0
	for i := 0; i < 12; i++ {
		val, ok := getCharVal(cleaned[i])
		if !ok {
			return false
		}
		sum1 += val * weights1[i]
	}
	
	rest1 := sum1 % 11
	digit1 := 0
	if rest1 >= 2 {
		digit1 = 11 - rest1
	}

	if int(cleaned[12]-'0') != digit1 {
		return false
	}

	// 2. Validate second check digit
	weights2 := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum2 := 0
	for i := 0; i < 12; i++ {
		val, _ := getCharVal(cleaned[i]) // already validated in step 1
		sum2 += val * weights2[i]
	}
	sum2 += digit1 * weights2[12] // weights2[12] is 2

	rest2 := sum2 % 11
	digit2 := 0
	if rest2 >= 2 {
		digit2 = 11 - rest2
	}

	return int(cleaned[13]-'0') == digit2
}
