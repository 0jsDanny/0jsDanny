CREATE TABLE estabelecimentos (
            cnpj_basico TEXT, cnpj_ordem TEXT, cnpj_dv TEXT, matriz_filial TEXT, nome_fantasia TEXT,
            situacao_cadastral TEXT, data_situacao_cadastral TEXT, motivo_situacao_cadastral TEXT,
            nome_cidade_exterior TEXT, pais TEXT, data_inicio_atividade TEXT, cnae_fiscal_principal TEXT,
            cnae_fiscal_secundaria TEXT, tipo_logradouro TEXT, logradouro TEXT, numero TEXT, complemento TEXT,
            bairro TEXT, cep TEXT, uf TEXT, municipio TEXT, ddd_1 TEXT, telefone_1 TEXT, ddd_2 TEXT, telefone_2 TEXT,
            ddd_fax TEXT, fax TEXT, correio_eletronico TEXT, situacao_especial TEXT, data_situacao_especial TEXT,
            bairro_normalizado TEXT,
            PRIMARY KEY (cnpj_basico, cnpj_ordem, cnpj_dv)
        );

CREATE INDEX idx_municipio ON estabelecimentos(municipio);

CREATE INDEX idx_bairro ON estabelecimentos(bairro);

CREATE INDEX idx_bairro_norm ON estabelecimentos(bairro_normalizado);

CREATE TABLE empresas (
            cnpj_basico TEXT PRIMARY KEY, razao_social TEXT, natureza_juridica TEXT, qualificacao_responsavel TEXT,
            capital_social TEXT, porte_empresa TEXT, ente_federativo_responsavel TEXT
        );

CREATE TABLE socios (
            cnpj_basico TEXT, identificador_socio TEXT, nome_socio_razao_social TEXT, cnpj_cpf_socio TEXT,
            qualificacao_socio TEXT, data_entrada_sociedade TEXT, pais TEXT, representante_legal TEXT,
            nome_representante TEXT, qualificacao_representante_legal TEXT, faixa_etaria TEXT
        );

CREATE INDEX idx_socios_cnpj ON socios(cnpj_basico);

CREATE TABLE cnaes (
            codigo TEXT PRIMARY KEY,
            descricao TEXT
        );

CREATE TABLE simples_mei (
            cnpj_basico TEXT PRIMARY KEY,
            opcao_pelo_simples TEXT,
            data_opcao_simples TEXT,
            data_exclusao_simples TEXT,
            opcao_pelo_mei TEXT,
            data_opcao_mei TEXT,
            data_exclusao_mei TEXT
        );

CREATE INDEX idx_simples_cnpj ON simples_mei(cnpj_basico);

CREATE TABLE motivos (codigo TEXT PRIMARY KEY, descricao TEXT);

CREATE TABLE paises (codigo TEXT PRIMARY KEY, descricao TEXT);

CREATE TABLE qualificacoes (codigo TEXT PRIMARY KEY, descricao TEXT);

CREATE TABLE naturezas (codigo TEXT PRIMARY KEY, descricao TEXT);

CREATE TABLE municipios (codigo TEXT PRIMARY KEY, descricao TEXT);

CREATE VIEW view_dados_completos AS
        SELECT 
            e.*,
            emp.razao_social,
            emp.capital_social,
            emp.natureza_juridica AS cod_natureza_juridica,
            nat.descricao AS desc_natureza_juridica,
            CASE e.situacao_cadastral 
                WHEN '01' THEN 'NULA' 
                WHEN '02' THEN 'ATIVA' 
                WHEN '03' THEN 'SUSPENSA' 
                WHEN '04' THEN 'INAPTA' 
                WHEN '08' THEN 'BAIXADA' 
            ELSE e.situacao_cadastral END AS desc_situacao_cadastral,
            mot.descricao AS desc_motivo_situacao,
            mun.descricao AS desc_municipio,
            cnae.descricao AS desc_cnae,
            CASE emp.porte_empresa
                WHEN '01' THEN 'MICRO EMPRESA'
                WHEN '03' THEN 'EMPRESA DE PEQUENO PORTE'
                WHEN '05' THEN 'DEMAIS'
                ELSE 'NÃO INFORMADO'
            END AS desc_porte,
            sim.opcao_pelo_simples,
            sim.opcao_pelo_mei,
            sim.data_exclusao_mei,
            (sim.opcao_pelo_mei = 'S' AND (sim.data_exclusao_mei = '00000000' OR sim.data_exclusao_mei IS NULL OR sim.data_exclusao_mei = '')) AS eh_mei_ativo
        FROM estabelecimentos e
        LEFT JOIN empresas emp ON e.cnpj_basico = emp.cnpj_basico
        LEFT JOIN naturezas nat ON emp.natureza_juridica = nat.codigo
        LEFT JOIN motivos mot ON e.motivo_situacao_cadastral = mot.codigo
        LEFT JOIN cnaes cnae ON e.cnae_fiscal_principal = cnae.codigo
        LEFT JOIN municipios mun ON e.municipio = mun.codigo
        LEFT JOIN simples_mei sim ON e.cnpj_basico = sim.cnpj_basico;

