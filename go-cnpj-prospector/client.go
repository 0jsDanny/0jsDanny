package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

// Common CNAE descriptions map for OpenCNPJ fallback
var commonCnaeMap = map[string]string{
	"6202300": "Desenvolvimento de programas de computador sob encomenda",
	"6203100": "Desenvolvimento de programas de computador customizáveis",
	"6204000": "Consultoria em tecnologia da informação",
	"6209100": "Suporte técnico, manutenção e outros serviços em tecnologia da informação",
	"4713002": "Lojas de variedades, exceto lojas de departamentos ou magazines",
	"4781400": "Comércio varejista de artigos do vestuário e acessórios",
	"5611201": "Restaurantes e similares",
	"5611203": "Lanchonetes, casas de chá, de sucos e similares",
	"7319002": "Promoção de vendas",
	"8599604": "Treinamento em desenvolvimento profissional e gerencial",
	"7020400": "Atividades de consultoria em gestão empresarial, exceto consultoria técnica",
	"8219999": "Preparação de documentos e serviços especializados de apoio administrativo não especificados anteriormente",
	"7490104": "Atividades de intermediação e agenciamento de serviços e negócios em geral",
	"4751201": "Comércio varejista especializado de equipamentos e suprimentos de informática",
	"4723700": "Comércio varejista de bebidas",
	"9430800": "Atividades de associações de defesa de direitos sociais",
	"9493600": "Atividades de organizações associativas ligadas à cultura e à arte",
	"9499500": "Atividades associativas não especificadas anteriormente",
	"8599699": "Outras atividades de ensino não especificadas anteriormente",
	"8230001": "Serviços de organização de feiras, congressos, exposições e festas",
}

func resolveCnaeDesc(code string) string {
	clean := strings.ReplaceAll(code, "-", "")
	clean = strings.ReplaceAll(clean, "/", "")
	clean = strings.TrimSpace(clean)
	if desc, ok := commonCnaeMap[clean]; ok {
		return desc
	}
	return "Descrição não disponível"
}

// Structs for BrasilAPI response
type BrasilAPICnae struct {
	Codigo    interface{} `json:"codigo"` // Can be float64 or string
	Descricao string      `json:"descricao"`
}

type BrasilAPISocio struct {
	NomeSocio            string `json:"nome_socio"`
	QualificacaoSocio    string `json:"qualificacao_socio"`
	DataEntradaSociedade string `json:"data_entrada_sociedade"`
}

type BrasilAPIResponse struct {
	CNPJ                             string           `json:"cnpj"`
	RazaoSocial                      string           `json:"razao_social"`
	NomeFantasia                     string           `json:"nome_fantasia"`
	UF                               string           `json:"uf"`
	CEP                              string           `json:"cep"`
	Porte                            string           `json:"porte"`
	Bairro                           string           `json:"bairro"`
	Numero                           string           `json:"numero"`
	Municipio                        string           `json:"municipio"`
	Logradouro                       string           `json:"logradouro"`
	CnaeFiscal                       interface{}      `json:"cnae_fiscal"` // Can be float64 or string
	CnaeFiscalDescricao              string           `json:"cnae_fiscal_descricao"`
	CnaesSecundarios                 []BrasilAPICnae  `json:"cnaes_secundarios"`
	QSA                              []BrasilAPISocio `json:"qsa"`
	OpcaoPeloSimples                 *bool            `json:"opcao_pelo_simples"`
	OpcaoPeloMEI                     *bool            `json:"opcao_pelo_mei"`
	DescricaoSituacaoCadastral       string           `json:"descricao_situacao_cadastral"`
	DataSituacaoCadastral            string           `json:"data_situacao_cadastral"`
	DescricaoMotivoSituacaoCadastral string           `json:"descricao_motivo_situacao_cadastral"`
	IdentificadorMatrizFilial        int              `json:"identificador_matriz_filial"`
	DataOpcaoPeloSimples             *string          `json:"data_opcao_pelo_simples"`
	DataExclusaoDoSimples            *string          `json:"data_exclusao_do_simples"`
	DataOpcaoPeloMEI                 *string          `json:"data_opcao_pelo_mei"`
	DataExclusaoDoMEI                *string          `json:"data_exclusao_do_mei"`
	DescricaoTipoDeLogradouro        string           `json:"descricao_tipo_de_logradouro"`
	NaturezaJuridica                 string           `json:"natureza_juridica"`
	CapitalSocial                    float64          `json:"capital_social"`
	DDDTelefone1                     string           `json:"ddd_telefone_1"`
	DDDTelefone2                     string           `json:"ddd_telefone_2"`
	DataInicioAtividade              string           `json:"data_inicio_atividade"`
}

// Structs for ReceitaWS response
type ReceitaWSActivity struct {
	Code string `json:"code"`
	Text string `json:"text"`
}

type ReceitaWSSocio struct {
	Nome string `json:"nome"`
	Qual string `json:"qual"`
}

type ReceitaWSSimples struct {
	Optante       bool   `json:"optante"`
	DataOpcao     string `json:"data_opcao"`
	DataExclusao  string `json:"data_exclusao"`
}

type ReceitaWSResponse struct {
	Status             string              `json:"status"`
	Message            string              `json:"message"`
	UltimaAtualizacao  string              `json:"ultima_atualizacao"`
	CNPJ               string              `json:"cnpj"`
	Tipo               string              `json:"tipo"`
	Porte              string              `json:"porte"`
	Nome               string              `json:"nome"`
	Fantasia           string              `json:"fantasia"`
	Abertura           string              `json:"abertura"`
	AtividadePrincipal []ReceitaWSActivity `json:"atividade_principal"`
	AtividadesSecund   []ReceitaWSActivity `json:"atividades_secundarias"`
	NaturezaJuridica   string              `json:"natureza_juridica"`
	Logradouro         string              `json:"logradouro"`
	Numero             string              `json:"numero"`
	Complemento        string              `json:"complemento"`
	CEP                string              `json:"cep"`
	Bairro             string              `json:"bairro"`
	Municipio          string              `json:"municipio"`
	UF                 string              `json:"uf"`
	Email              string              `json:"email"`
	Telefone           string              `json:"telefone"`
	Situacao           string              `json:"situacao"`
	DataSituacao       string              `json:"data_situacao"`
	MotivoSituacao     string              `json:"motivo_situacao"`
	CapitalSocial      string              `json:"capital_social"`
	QSA                []ReceitaWSSocio    `json:"qsa"`
	Simples            *ReceitaWSSimples   `json:"simples"`
	Simei              *ReceitaWSSimples   `json:"simei"`
}

// Structs for CNPJ.ws response
type CNPJWSPorte struct {
	Descricao string `json:"descricao"`
}

type CNPJWSNatureza struct {
	Descricao string `json:"descricao"`
}

type CNPJWSSocio struct {
	Nome             string `json:"nome"`
	DataEntrada      string `json:"data_entrada"`
	QualificacaoSoci struct {
		Descricao string `json:"descricao"`
	} `json:"qualificacao_socio"`
}

type CNPJWSSimples struct {
	Simples             string `json:"simples"`
	DataOpcaoSimples    string `json:"data_opcao_simples"`
	DataExclusaoSimples string `json:"data_exclusao_simples"`
	MEI                 string `json:"mei"`
	DataOpcaoMEI        string `json:"data_opcao_mei"`
	DataExclusaoMEI     string `json:"data_exclusao_mei"`
}

type CNPJWSActivity struct {
	ID        string `json:"id"`
	Descricao string `json:"descricao"`
}

type CNPJWSEstabelecimento struct {
	CNPJ                 string           `json:"cnpj"`
	NomeFantasia         string           `json:"nome_fantasia"`
	SituacaoCadastral    string           `json:"situacao_cadastral"`
	DataSituacaoCadastral string          `json:"data_situacao_cadastral"`
	DataInicioAtividade  string           `json:"data_inicio_atividade"`
	TipoLogradouro       string           `json:"tipo_logradouro"`
	Logradouro           string           `json:"logradouro"`
	Numero               string           `json:"numero"`
	Complemento          string           `json:"complemento"`
	Bairro               string           `json:"bairro"`
	CEP                  string           `json:"cep"`
	DDD1                 string           `json:"ddd1"`
	Telefone1            string           `json:"telefone1"`
	DDD2                 string           `json:"ddd2"`
	Telefone2            string           `json:"telefone2"`
	Email                string           `json:"email"`
	Tipo                 string           `json:"tipo"`
	AtividadePrincipal   CNPJWSActivity   `json:"atividade_principal"`
	AtividadesSecund     []CNPJWSActivity `json:"atividades_secundarias"`
	Estado               struct {
		Sigla string `json:"sigla"`
	} `json:"estado"`
	Cidade               struct {
		Nome string `json:"nome"`
	} `json:"cidade"`
	MotivoSituacaoCadastral string `json:"motivo_situacao_cadastral"`
}

type CNPJWSResponse struct {
	CNPJRaiz         string                `json:"cnpj_raiz"`
	RazaoSocial      string                `json:"razao_social"`
	CapitalSocial    string                `json:"capital_social"`
	Porte            CNPJWSPorte           `json:"porte"`
	NaturezaJuridica CNPJWSNatureza        `json:"natureza_juridica"`
	Socios           []CNPJWSSocio         `json:"socios"`
	Simples          *CNPJWSSimples        `json:"simples"`
	Estabelecimento  CNPJWSEstabelecimento `json:"estabelecimento"`
}

// Structs for OpenCNPJ response
type OpenCNPJTelefone struct {
	DDD    string `json:"ddd"`
	Numero string `json:"numero"`
	IsFax  bool   `json:"is_fax"`
}

type OpenCNPJSocio struct {
	NomeSocio             string  `json:"nome_socio"`
	QualificacaoSocio     string  `json:"qualificacao_socio"`
	DataEntradaSociedade  *string `json:"data_entrada_sociedade"`
}

type OpenCNPJResponse struct {
	CNPJ                  string             `json:"cnpj"`
	RazaoSocial           string             `json:"razao_social"`
	NomeFantasia          *string            `json:"nome_fantasia"`
	SituacaoCadastral     string             `json:"situacao_cadastral"`
	DataSituacaoCadastral *string            `json:"data_situacao_cadastral"`
	MatrizFilial          string             `json:"matriz_filial"`
	DataInicioAtividade   *string            `json:"data_inicio_atividade"`
	CnaePrincipal         *string            `json:"cnae_principal"`
	CnaesSecundarios      []string           `json:"cnaes_secundarios"`
	NaturezaJuridica      *string            `json:"natureza_juridica"`
	Logradouro            *string            `json:"logradouro"`
	Numero                *string            `json:"numero"`
	Complemento           *string            `json:"complemento"`
	Bairro                *string            `json:"bairro"`
	CEP                   *string            `json:"cep"`
	UF                    *string            `json:"uf"`
	Municipio             *string            `json:"municipio"`
	Email                 *string            `json:"email"`
	Telefones             []OpenCNPJTelefone `json:"telefones"`
	CapitalSocial         *string            `json:"capital_social"`
	PorteEmpresa          *string            `json:"porte_empresa"`
	OpcaoSimples          interface{}        `json:"opcao_simples"` // Can be bool or string
	DataOpcaoSimples      *string            `json:"data_opcao_simples"`
	OpcaoMEI              interface{}        `json:"opcao_mei"`     // Can be bool or string
	DataOpcaoMEI          *string            `json:"data_opcao_mei"`
	QSA                   []OpenCNPJSocio    `json:"QSA"`
}

// Helper to format complete logradouro
func formatCompleteLogradouro(tipo, nome string) string {
	tipo = strings.TrimSpace(tipo)
	nome = strings.TrimSpace(nome)
	if nome == "" {
		return ""
	}
	if tipo == "" {
		return nome
	}
	if strings.HasPrefix(strings.ToUpper(nome), strings.ToUpper(tipo)) {
		return nome
	}
	return tipo + " " + nome
}

// Client query implementations
func queryBrasilAPI(ctx context.Context, cnpj string) (*CNPJNormalizedResponse, error) {
	url := fmt.Sprintf("https://brasilapi.com.br/api/cnpj/v1/%s", cnpj)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "CNPJProspectorProxy/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	var data BrasilAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	// Normalizer
	cleanCNPJ := CleanCNPJ(data.CNPJ)
	tipo := "MATRIZ"
	if data.IdentificadorMatrizFilial != 1 {
		tipo = "FILIAL"
	}

	var actPrincipal *CNPJActivity
	var cnaeCodeStr string
	switch v := data.CnaeFiscal.(type) {
	case float64:
		cnaeCodeStr = strconv.FormatFloat(v, 'f', -1, 64)
	case string:
		cnaeCodeStr = v
	}

	if cnaeCodeStr != "" {
		actPrincipal = &CNPJActivity{
			Codigo:    cnaeCodeStr,
			Descricao: data.CnaeFiscalDescricao,
		}
	}

	secundarias := make([]CNPJActivity, 0)
	for _, cnae := range data.CnaesSecundarios {
		var secCodeStr string
		switch v := cnae.Codigo.(type) {
		case float64:
			secCodeStr = strconv.FormatFloat(v, 'f', -1, 64)
		case string:
			secCodeStr = v
		}
		if secCodeStr != "" {
			secundarias = append(secundarias, CNPJActivity{
				Codigo:    secCodeStr,
				Descricao: cnae.Descricao,
			})
		}
	}

	socios := make([]CNPJSocio, 0)
	for _, socio := range data.QSA {
		socios = append(socios, CNPJSocio{
			Nome:         socio.NomeSocio,
			Qualificacao: socio.QualificacaoSocio,
			DataEntrada:  &socio.DataEntradaSociedade,
		})
	}

	tel1 := data.DDDTelefone1
	tel2 := data.DDDTelefone2

	var normalizedCapital float64 = data.CapitalSocial
	var optanteSimples *bool = data.OpcaoPeloSimples
	var optanteMEI *bool = data.OpcaoPeloMEI

	var simplesOption *SimplesOption
	if optanteSimples != nil {
		simplesOption = &SimplesOption{
			Optante:      optanteSimples,
			DataOpcao:    data.DataOpcaoPeloSimples,
			DataExclusao: data.DataExclusaoDoSimples,
		}
	}

	var meiOption *MEIOption
	if optanteMEI != nil {
		meiOption = &MEIOption{
			Optante:      optanteMEI,
			DataOpcao:    data.DataOpcaoPeloMEI,
			DataExclusao: data.DataExclusaoDoMEI,
		}
	}

	logr := formatCompleteLogradouro(data.DescricaoTipoDeLogradouro, data.Logradouro)

	return &CNPJNormalizedResponse{
		CNPJ:                    cleanCNPJ,
		CNPJFormatado:           FormatCNPJ(cleanCNPJ),
		RazaoSocial:             data.RazaoSocial,
		NomeFantasia:            &data.NomeFantasia,
		SituacaoCadastral:       strings.ToUpper(data.DescricaoSituacaoCadastral),
		DataSituacaoCadastral:   &data.DataSituacaoCadastral,
		MotivoSituacaoCadastral: &data.DescricaoMotivoSituacaoCadastral,
		Tipo:                    tipo,
		Porte:                   &data.Porte,
		NaturezaJuridica:        &data.NaturezaJuridica,
		CapitalSocial:           &normalizedCapital,
		AtividadePrincipal:      actPrincipal,
		AtividadesSecundarias:   secundarias,
		Endereco: CNPJAddress{
			TipoLogradouro: data.DescricaoTipoDeLogradouro,
			Logradouro:     &logr,
			Numero:         &data.Numero,
			Complemento:    nil, // BrasilAPI v1 does not split complemento, but it is often omitted or in logradouro
			Bairro:         &data.Bairro,
			CEP:            &data.CEP,
			Municipio:      &data.Municipio,
			UF:             &data.UF,
		},
		Telefone1:       &tel1,
		Telefone2:       &tel2,
		Email:           nil,
		DataAbertura:    &data.DataInicioAtividade,
		DataAtualizacao: nil,
		SimplesNacional: simplesOption,
		MEI:             meiOption,
		Socios:          socios,
		Suframa:         nil,
	}, nil
}

func queryReceitaWS(ctx context.Context, cnpj string) (*CNPJNormalizedResponse, error) {
	url := fmt.Sprintf("https://receitaws.com.br/v1/cnpj/%s", cnpj)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "CNPJProspectorProxy/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	var data ReceitaWSResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	if data.Status == "ERROR" {
		return nil, fmt.Errorf("API error: %s", data.Message)
	}

	cleanCNPJ := CleanCNPJ(data.CNPJ)

	var actPrincipal *CNPJActivity
	if len(data.AtividadePrincipal) > 0 {
		actPrincipal = &CNPJActivity{
			Codigo:    data.AtividadePrincipal[0].Code,
			Descricao: data.AtividadePrincipal[0].Text,
		}
	}

	secundarias := make([]CNPJActivity, 0)
	for _, act := range data.AtividadesSecund {
		secundarias = append(secundarias, CNPJActivity{
			Codigo:    act.Code,
			Descricao: act.Text,
		})
	}

	socios := make([]CNPJSocio, 0)
	for _, socio := range data.QSA {
		socios = append(socios, CNPJSocio{
			Nome:         socio.Nome,
			Qualificacao: socio.Qual,
			DataEntrada:  nil,
		})
	}

	var capSocial float64
	if data.CapitalSocial != "" {
		if val, err := strconv.ParseFloat(data.CapitalSocial, 64); err == nil {
			capSocial = val
		}
	}

	var simplesOption *SimplesOption
	if data.Simples != nil {
		simplesOption = &SimplesOption{
			Optante:      &data.Simples.Optante,
			DataOpcao:    &data.Simples.DataOpcao,
			DataExclusao: &data.Simples.DataExclusao,
		}
	}

	var meiOption *MEIOption
	if data.Simei != nil {
		meiOption = &MEIOption{
			Optante:      &data.Simei.Optante,
			DataOpcao:    &data.Simei.DataOpcao,
			DataExclusao: &data.Simei.DataExclusao,
		}
	}

	return &CNPJNormalizedResponse{
		CNPJ:                    cleanCNPJ,
		CNPJFormatado:           FormatCNPJ(cleanCNPJ),
		RazaoSocial:             data.Nome,
		NomeFantasia:            &data.Fantasia,
		SituacaoCadastral:       strings.ToUpper(data.Situacao),
		DataSituacaoCadastral:   &data.DataSituacao,
		MotivoSituacaoCadastral: &data.MotivoSituacao,
		Tipo:                    data.Tipo,
		Porte:                   &data.Porte,
		NaturezaJuridica:        &data.NaturezaJuridica,
		CapitalSocial:           &capSocial,
		AtividadePrincipal:      actPrincipal,
		AtividadesSecundarias:   secundarias,
		Endereco: CNPJAddress{
			TipoLogradouro: "",
			Logradouro:     &data.Logradouro,
			Numero:         &data.Numero,
			Complemento:    &data.Complemento,
			Bairro:         &data.Bairro,
			CEP:            &data.CEP,
			Municipio:      &data.Municipio,
			UF:             &data.UF,
		},
		Telefone1:       &data.Telefone,
		Telefone2:       nil,
		Email:           &data.Email,
		DataAbertura:    &data.Abertura,
		DataAtualizacao: &data.UltimaAtualizacao,
		SimplesNacional: simplesOption,
		MEI:             meiOption,
		Socios:          socios,
		Suframa:         nil,
	}, nil
}

func queryCNPJWS(ctx context.Context, cnpj string) (*CNPJNormalizedResponse, error) {
	url := fmt.Sprintf("https://publica.cnpj.ws/cnpj/%s", cnpj)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "CNPJProspectorProxy/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	var data CNPJWSResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	est := data.Estabelecimento
	cleanCNPJ := CleanCNPJ(est.CNPJ)

	var actPrincipal *CNPJActivity
	if est.AtividadePrincipal.ID != "" {
		actPrincipal = &CNPJActivity{
			Codigo:    est.AtividadePrincipal.ID,
			Descricao: est.AtividadePrincipal.Descricao,
		}
	}

	secundarias := make([]CNPJActivity, 0)
	for _, act := range est.AtividadesSecund {
		secundarias = append(secundarias, CNPJActivity{
			Codigo:    act.ID,
			Descricao: act.Descricao,
		})
	}

	socios := make([]CNPJSocio, 0)
	for _, socio := range data.Socios {
		entrada := socio.DataEntrada
		socios = append(socios, CNPJSocio{
			Nome:         socio.Nome,
			Qualificacao: socio.QualificacaoSoci.Descricao,
			DataEntrada:  &entrada,
		})
	}

	var capSocial float64
	if data.CapitalSocial != "" {
		if val, err := strconv.ParseFloat(data.CapitalSocial, 64); err == nil {
			capSocial = val
		}
	}

	var simplesOption *SimplesOption
	var meiOption *MEIOption
	if data.Simples != nil {
		isSimples := data.Simples.Simples == "Sim"
		simplesOption = &SimplesOption{
			Optante:      &isSimples,
			DataOpcao:    &data.Simples.DataOpcaoSimples,
			DataExclusao: &data.Simples.DataExclusaoSimples,
		}

		isMEI := data.Simples.MEI == "Sim"
		meiOption = &MEIOption{
			Optante:      &isMEI,
			DataOpcao:    &data.Simples.DataOpcaoMEI,
			DataExclusao: &data.Simples.DataExclusaoMEI,
		}
	}

	tipo := "MATRIZ"
	if strings.ToUpper(est.Tipo) == "FILIAL" {
		tipo = "FILIAL"
	}

	tel1 := est.DDD1 + est.Telefone1
	tel2 := est.DDD2 + est.Telefone2

	logr := formatCompleteLogradouro(est.TipoLogradouro, est.Logradouro)

	return &CNPJNormalizedResponse{
		CNPJ:                    cleanCNPJ,
		CNPJFormatado:           FormatCNPJ(cleanCNPJ),
		RazaoSocial:             data.RazaoSocial,
		NomeFantasia:            &est.NomeFantasia,
		SituacaoCadastral:       strings.ToUpper(est.SituacaoCadastral),
		DataSituacaoCadastral:   &est.DataSituacaoCadastral,
		MotivoSituacaoCadastral: &est.MotivoSituacaoCadastral,
		Tipo:                    tipo,
		Porte:                   &data.Porte.Descricao,
		NaturezaJuridica:        &data.NaturezaJuridica.Descricao,
		CapitalSocial:           &capSocial,
		AtividadePrincipal:      actPrincipal,
		AtividadesSecundarias:   secundarias,
		Endereco: CNPJAddress{
			TipoLogradouro: est.TipoLogradouro,
			Logradouro:     &logr,
			Numero:         &est.Numero,
			Complemento:    &est.Complemento,
			Bairro:         &est.Bairro,
			CEP:            &est.CEP,
			Municipio:      &est.Cidade.Nome,
			UF:             &est.Estado.Sigla,
		},
		Telefone1:       &tel1,
		Telefone2:       &tel2,
		Email:           &est.Email,
		DataAbertura:    &est.DataInicioAtividade,
		DataAtualizacao: nil,
		SimplesNacional: simplesOption,
		MEI:             meiOption,
		Socios:          socios,
		Suframa:         nil,
	}, nil
}

func queryOpenCNPJ(ctx context.Context, cnpj string) (*CNPJNormalizedResponse, error) {
	url := fmt.Sprintf("https://api.opencnpj.org/%s", cnpj)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "CNPJProspectorProxy/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	var data OpenCNPJResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	cleanCNPJ := CleanCNPJ(data.CNPJ)

	var actPrincipal *CNPJActivity
	if data.CnaePrincipal != nil && *data.CnaePrincipal != "" {
		actPrincipal = &CNPJActivity{
			Codigo:    *data.CnaePrincipal,
			Descricao: resolveCnaeDesc(*data.CnaePrincipal),
		}
	}

	secundarias := make([]CNPJActivity, 0)
	for _, code := range data.CnaesSecundarios {
		secundarias = append(secundarias, CNPJActivity{
			Codigo:    code,
			Descricao: resolveCnaeDesc(code),
		})
	}

	socios := make([]CNPJSocio, 0)
	for _, socio := range data.QSA {
		socios = append(socios, CNPJSocio{
			Nome:         socio.NomeSocio,
			Qualificacao: socio.QualificacaoSocio,
			DataEntrada:  socio.DataEntradaSociedade,
		})
	}

	var capSocial float64
	if data.CapitalSocial != nil {
		cleanCap := strings.ReplaceAll(*data.CapitalSocial, ".", "")
		cleanCap = strings.ReplaceAll(cleanCap, ",", ".")
		if val, err := strconv.ParseFloat(cleanCap, 64); err == nil {
			capSocial = val
		}
	}

	// Parsing Simples/MEI options which can be string ("Sim", "Não") or bool
	parseOptante := func(val interface{}) *bool {
		if val == nil {
			return nil
		}
		var b bool
		switch v := val.(type) {
		case bool:
			b = v
		case string:
			b = (strings.ToLower(v) == "sim" || strings.ToLower(v) == "true" || v == "1")
		default:
			return nil
		}
		return &b
	}

	var simplesOption *SimplesOption
	optSimples := parseOptante(data.OpcaoSimples)
	if optSimples != nil || data.DataOpcaoSimples != nil {
		simplesOption = &SimplesOption{
			Optante:   optSimples,
			DataOpcao: data.DataOpcaoSimples,
		}
	}

	var meiOption *MEIOption
	optMEI := parseOptante(data.OpcaoMEI)
	if optMEI != nil || data.DataOpcaoMEI != nil {
		meiOption = &MEIOption{
			Optante:   optMEI,
			DataOpcao: data.DataOpcaoMEI,
		}
	}

	tipo := "MATRIZ"
	if strings.ToUpper(data.MatrizFilial) == "FILIAL" {
		tipo = "FILIAL"
	}

	var tel1, tel2 *string
	if len(data.Telefones) > 0 {
		t1 := data.Telefones[0].DDD + data.Telefones[0].Numero
		tel1 = &t1
	}
	if len(data.Telefones) > 1 {
		t2 := data.Telefones[1].DDD + data.Telefones[1].Numero
		tel2 = &t2
	}

	return &CNPJNormalizedResponse{
		CNPJ:                    cleanCNPJ,
		CNPJFormatado:           FormatCNPJ(cleanCNPJ),
		RazaoSocial:             data.RazaoSocial,
		NomeFantasia:            data.NomeFantasia,
		SituacaoCadastral:       strings.ToUpper(data.SituacaoCadastral),
		DataSituacaoCadastral:   data.DataSituacaoCadastral,
		MotivoSituacaoCadastral: nil,
		Tipo:                    tipo,
		Porte:                   data.PorteEmpresa,
		NaturezaJuridica:        data.NaturezaJuridica,
		CapitalSocial:           &capSocial,
		AtividadePrincipal:      actPrincipal,
		AtividadesSecundarias:   secundarias,
		Endereco: CNPJAddress{
			TipoLogradouro: "",
			Logradouro:     data.Logradouro,
			Numero:         data.Numero,
			Complemento:    data.Complemento,
			Bairro:         data.Bairro,
			CEP:            data.CEP,
			Municipio:      data.Municipio,
			UF:             data.UF,
		},
		Telefone1:       tel1,
		Telefone2:       tel2,
		Email:           data.Email,
		DataAbertura:    data.DataInicioAtividade,
		DataAtualizacao: nil,
		SimplesNacional: simplesOption,
		MEI:             meiOption,
		Socios:          socios,
		Suframa:         nil,
	}, nil
}
