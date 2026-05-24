package classifier

import (
	"context"
	"fmt"
	"strings"
)

// entry is one row in the embedded sanitary risk matrix.
// The matrix encodes ANVISA Normative Instruction 66/2020, which
// mandates risk classification by economic activity code.
type entry struct {
	description string
	risk        RiskLevel
	baseFee     float64 // BRL, base value (Belém 2017 reference)
}

// riskMatrix is an in-memory representation of the sanitary risk table.
// In production, this is backed by a SQLite table synced from SEFIN.
// Keyed by the 7-digit CNAE root (the 9-digit variant appends "00" or "03").
var riskMatrix = map[string]entry{
	// --- Food & Beverage ---
	"5611201": {"Restaurantes e similares", RiskHigh, 635.51},
	"5611202": {"Bares e outros estabelecimentos especializados em servir bebidas", RiskHigh, 635.51},
	"5611203": {"Lanchonetes, casas de chá, de sucos e similares", RiskMedium, 423.67},
	"5612100": {"Serviços ambulantes de alimentação", RiskHigh, 635.51},
	"4711301": {"Comércio varejista de mercadorias em geral - supermercados", RiskHigh, 635.51},
	"4712100": {"Comércio varejista de mercadorias em geral - mercearias", RiskLow, 212.34},
	"1091101": {"Fabricação de produtos de panificação industrial", RiskHigh, 635.51},
	"1091102": {"Fabricação de produtos de padaria e confeitaria", RiskMedium, 423.67},

	// --- Pharmaceuticals ---
	"4771701": {"Comércio varejista de produtos farmacêuticos - drogarias", RiskMedium, 423.67},
	"4771702": {"Comércio varejista de produtos farmacêuticos - farmácias", RiskMedium, 423.67},
	"4771703": {"Comércio varejista de produtos farmacêuticos homeopáticos", RiskMedium, 423.67},

	// --- Healthcare ---
	"8610101": {"Atividades de atendimento hospitalar - hospitais gerais", RiskHigh, 635.51},
	"8610102": {"Atividades de atendimento hospitalar - hospitais especializados", RiskHigh, 635.51},
	"8630501": {"Atividade médica ambulatorial - clínicas médicas", RiskHigh, 635.51},
	"8630502": {"Atividade médica ambulatorial - clínicas de medicina especializada", RiskHigh, 635.51},
	"8640202": {"Laboratórios clínicos", RiskMedium, 423.67},
	"8650001": {"Atividades de enfermagem", RiskHigh, 635.51},

	// --- Gas Stations ---
	"4731800": {"Comércio varejista de combustíveis para veículos automotores", RiskHigh, 635.51},

	// --- Retail / Low Risk ---
	"4781400": {"Comércio varejista de artigos do vestuário e acessórios", RiskLow, 212.34},
	"4789004": {"Comércio varejista de animais vivos e artigos para animais de estimação", RiskLow, 212.34},
	"7500100": {"Atividades veterinárias", RiskMedium, 423.67},

	// --- Environmental ---
	"3811400": {"Coleta de resíduos não perigosos", RiskMedium, 423.67},
	"3812200": {"Coleta de resíduos perigosos", RiskMedium, 423.67},
	"3600601": {"Captação, tratamento e distribuição de água", RiskLow, 528.58},
}

// MatrixSource implements Source using the embedded in-memory risk matrix.
// It is the default source for the CLI and can be replaced in tests.
type MatrixSource struct{}

// Lookup resolves a CNAE code against the embedded matrix.
// It normalises the code (strips punctuation, handles 7 vs 9 digit variants)
// before querying, mirroring the normalisation logic in production.
func (MatrixSource) Lookup(_ context.Context, cnae string) (CNAEResult, error) {
	normalised := normaliseCNAE(cnae)
	if normalised == "" {
		return CNAEResult{}, fmt.Errorf("invalid CNAE code %q", cnae)
	}

	// Try exact match first, then 7-digit root fallback.
	if e, ok := riskMatrix[normalised]; ok {
		return CNAEResult{
			Code:        normalised,
			Description: e.description,
			Risk:        e.risk,
			BaseFee:     e.baseFee,
		}, nil
	}

	// Unknown CNAEs default to LOW risk — the system flags them for human review.
	return CNAEResult{
		Code:        normalised,
		Description: "Atividade não mapeada — análise humana necessária",
		Risk:        RiskLow,
		BaseFee:     0,
	}, nil
}

// normaliseCNAE strips non-digit characters and standardises length.
// The SEFIN database uses 7-digit roots; CNPJ registrations append "00"/"03".
func normaliseCNAE(raw string) string {
	var digits strings.Builder
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}
	s := digits.String()
	switch len(s) {
	case 9:
		// Strip trailing "00" to get 7-digit root for lookup.
		if strings.HasSuffix(s, "00") || strings.HasSuffix(s, "03") {
			return s[:7]
		}
		return s
	case 7:
		return s
	case 0:
		return ""
	default:
		return s
	}
}
