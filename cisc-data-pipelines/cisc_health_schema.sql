-- CISC Belém - PostgreSQL + PostGIS Relational Database DDL Schema
-- Created: 2026-05-20

-- Enable PostGIS spatial extension (must be run by superuser or db owner)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. NOTIFICACOES: Unified Core Table for Dengue, Leptospirosis, and SRAG Case Notifications
CREATE TABLE IF NOT EXISTS notificacoes (
    id_notificacao VARCHAR(50) PRIMARY KEY,
    tp_notificacao VARCHAR(10),
    agravo_id VARCHAR(10),
    doenca VARCHAR(20) CHECK(doenca IN ('DENGUE', 'LEPTOSPIROSE', 'SRAG')),
    data_notificacao DATE,
    semana_notificacao VARCHAR(10),
    ano_notificacao INTEGER,
    data_sintomas DATE,
    semana_sintomas VARCHAR(10),
    paciente_nome VARCHAR(150),
    paciente_nascimento DATE,
    paciente_idade_anos NUMERIC(5, 2),
    paciente_sexo CHAR(1) CHECK(paciente_sexo IN ('M', 'F', 'I')),
    paciente_gestante VARCHAR(10),
    paciente_raca VARCHAR(10),
    paciente_escolaridade VARCHAR(10),
    paciente_cns VARCHAR(30),
    paciente_mae VARCHAR(150),
    residencia_uf CHAR(2),
    residencia_municipio_ibge VARCHAR(10),
    residencia_bairro VARCHAR(100),
    residencia_logradouro VARCHAR(150),
    residencia_numero VARCHAR(30),
    residencia_complemento VARCHAR(100),
    residencia_cep VARCHAR(10),
    residencia_zona VARCHAR(10),
    data_investigacao DATE,
    hospitalizado CHAR(1) CHECK(hospitalizado IN ('S', 'N', 'I')),
    data_internacao DATE,
    classificacao_final VARCHAR(50),
    criterio_confirmacao VARCHAR(50),
    evolucao VARCHAR(50),
    data_obito DATE,
    data_encerramento DATE,
    observacao TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    -- Spatial column for Point Geometry (WGS 84, EPSG:4326)
    geom_residencia geometry(Point, 4326)
);

-- 2. DENGUE_DETALHES: Clinical and Laboratory Details for Dengue Cases
CREATE TABLE IF NOT EXISTS dengue_detalhes (
    id_notificacao VARCHAR(50) PRIMARY KEY REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE,
    -- Clinical Symptoms
    febre VARCHAR(10),
    mialgia VARCHAR(10),
    cefaleia VARCHAR(10),
    exantema VARCHAR(10),
    vomito VARCHAR(10),
    nausea VARCHAR(10),
    dor_costas VARCHAR(10),
    conjuntvit VARCHAR(10),
    artrite VARCHAR(10),
    artralgia VARCHAR(10),
    petequia_n VARCHAR(10),
    leucopenia VARCHAR(10),
    laco VARCHAR(10),
    dor_retro VARCHAR(10),
    -- Comorbidities
    diabetes VARCHAR(10),
    hematolog VARCHAR(10),
    hepatopat VARCHAR(10),
    renal VARCHAR(10),
    hipertensa VARCHAR(10),
    acido_pept VARCHAR(10),
    auto_imune VARCHAR(10),
    -- Laboratory Results
    resul_soro VARCHAR(10),
    resul_ns1 VARCHAR(10),
    resul_vi_n VARCHAR(10),
    resul_pcr_ VARCHAR(10),
    sorotipo VARCHAR(10),
    histopa_n VARCHAR(10),
    imunoh_n VARCHAR(10),
    -- Alarm Signs
    alrm_hipot VARCHAR(10),
    alrm_plaq VARCHAR(10),
    alrm_vom VARCHAR(10),
    alrm_sang VARCHAR(10),
    alrm_hemat VARCHAR(10),
    alrm_abdom VARCHAR(10),
    alrm_letar VARCHAR(10),
    alrm_hepat VARCHAR(10),
    alrm_liq VARCHAR(10),
    -- Severity Indicators
    grav_pulso VARCHAR(10),
    grav_conv VARCHAR(10),
    grav_ench VARCHAR(10),
    grav_insuf VARCHAR(10),
    grav_taqui VARCHAR(10),
    grav_extre VARCHAR(10),
    grav_hipot VARCHAR(10),
    grav_hemat VARCHAR(10),
    grav_melen VARCHAR(10),
    grav_metro VARCHAR(10),
    grav_sang VARCHAR(10),
    grav_ast VARCHAR(10),
    grav_mioc VARCHAR(10),
    grav_consc VARCHAR(10),
    grav_orgao VARCHAR(10)
);

-- 3. LEPTOSPIROSE_DETALHES: Risk Factors, Exposures, Symptoms, and Lab for Leptospirosis Cases
CREATE TABLE IF NOT EXISTS leptospirose_detalhes (
    id_notificacao VARCHAR(50) PRIMARY KEY REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE,
    -- Risk Factors and Exposures
    ant_cb_lam VARCHAR(10),
    ant_cb_cri VARCHAR(10),
    ant_cb_cai VARCHAR(10),
    ant_cb_fos VARCHAR(10),
    ant_cb_sin VARCHAR(10),
    ant_cb_pla VARCHAR(10),
    ant_cb_cor VARCHAR(10),
    ant_cb_roe VARCHAR(10),
    ant_cb_gra VARCHAR(10),
    ant_cb_ter VARCHAR(10),
    ant_cb_lix VARCHAR(10),
    ant_cb_out VARCHAR(10),
    ant_ou_des VARCHAR(100),
    ant_humano VARCHAR(10),
    ant_animai VARCHAR(10),
    -- Clinical Symptoms
    cli_febre VARCHAR(10),
    cli_mialgi VARCHAR(10),
    cli_cefale VARCHAR(10),
    cli_prost VARCHAR(10),
    cli_conges VARCHAR(10),
    cli_pantur VARCHAR(10),
    cli_vomito VARCHAR(10),
    cli_diarre VARCHAR(10),
    cli_icteri VARCHAR(10),
    cli_renal VARCHAR(10),
    cli_respir VARCHAR(10),
    cli_cardia VARCHAR(10),
    cli_hemopu VARCHAR(10),
    cli_hemorr VARCHAR(10),
    cli_mening VARCHAR(10),
    cli_outros VARCHAR(10),
    cli_otrdes VARCHAR(100),
    -- Lab Results
    lab_elis_1 VARCHAR(10),
    lab_elis_2 VARCHAR(10),
    lab_micr_1 VARCHAR(10),
    lab_micr_2 VARCHAR(10),
    res_isol VARCHAR(10),
    res_imuno VARCHAR(10),
    res_pcr VARCHAR(10)
);

-- 4. SRAG_DETALHES: Comorbidities, Viral Panels, Symptoms, and Vaccines for SRAG Cases
CREATE TABLE IF NOT EXISTS srag_detalhes (
    id_notificacao VARCHAR(50) PRIMARY KEY REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE,
    -- Clinical Signs
    nosocomial VARCHAR(10),
    ave_suino VARCHAR(10),
    febre VARCHAR(10),
    tosse VARCHAR(10),
    garganta VARCHAR(10),
    dispneia VARCHAR(10),
    desc_resp VARCHAR(10),
    saturacao VARCHAR(10),
    diarreia VARCHAR(10),
    vomito VARCHAR(10),
    outro_sin VARCHAR(10),
    outro_des VARCHAR(100),
    dor_abd VARCHAR(10),
    fadiga VARCHAR(10),
    perd_olft VARCHAR(10),
    perd_pala VARCHAR(10),
    -- Comorbidities & Risk Factors
    puerpera VARCHAR(10),
    cardiopati VARCHAR(10),
    hematologi VARCHAR(10),
    sind_down VARCHAR(10),
    hepatica VARCHAR(10),
    asma VARCHAR(10),
    diabetes VARCHAR(10),
    neurologic VARCHAR(10),
    pneumopati VARCHAR(10),
    imunodepre VARCHAR(10),
    renal VARCHAR(10),
    obesidade VARCHAR(10),
    obes_imc VARCHAR(10),
    out_morbi VARCHAR(10),
    morb_desc VARCHAR(100),
    tabag VARCHAR(10),
    -- Vaccine Status and Treatment
    vacina VARCHAR(10),
    mae_vac VARCHAR(10),
    m_amamenta VARCHAR(10),
    antiviral VARCHAR(10),
    tp_antiviral VARCHAR(100),
    out_antiv VARCHAR(100),
    vacina_cov VARCHAR(10),
    dose_1_cov VARCHAR(30),
    dose_2_cov VARCHAR(30),
    dose_ref VARCHAR(30),
    dose_2ref VARCHAR(30),
    dose_adic VARCHAR(30),
    dos_re_bi VARCHAR(30),
    fab_cov_1 VARCHAR(150),
    fab_cov_2 VARCHAR(150),
    fab_covrf VARCHAR(150),
    fab_covrf2 VARCHAR(150),
    fab_adic VARCHAR(150),
    fab_re_bi VARCHAR(150),
    lote_1_cov VARCHAR(50),
    lote_2_cov VARCHAR(50),
    lote_ref VARCHAR(50),
    lote_ref2 VARCHAR(50),
    lote_adic VARCHAR(50),
    lot_re_bi VARCHAR(50),
    trat_cov VARCHAR(10),
    -- Lab results and tests
    pcr_resul VARCHAR(10),
    pos_pcrflu VARCHAR(10),
    tp_flu_pcr VARCHAR(10),
    pcr_fluasu VARCHAR(10),
    fluasu_out VARCHAR(100),
    pcr_flubli VARCHAR(10),
    flubli_out VARCHAR(100),
    pos_pcrout VARCHAR(10),
    pcr_vsr VARCHAR(10),
    pcr_para1 VARCHAR(10),
    pcr_para2 VARCHAR(10),
    pcr_para3 VARCHAR(10),
    pcr_para4 VARCHAR(10),
    pcr_adeno VARCHAR(10),
    pcr_metap VARCHAR(10),
    pcr_boca VARCHAR(10),
    pcr_rino VARCHAR(10),
    pcr_outro VARCHAR(10),
    ds_pcr_out VARCHAR(100),
    pcr_sars2 VARCHAR(10),
    tomo_res VARCHAR(10),
    tomo_out VARCHAR(100),
    tp_tes_an VARCHAR(10),
    res_an VARCHAR(10),
    an_sars2 VARCHAR(10),
    an_vsr VARCHAR(10),
    an_para1 VARCHAR(10),
    an_para2 VARCHAR(10),
    an_para3 VARCHAR(10),
    an_adeno VARCHAR(10),
    an_outro VARCHAR(10),
    res_igg VARCHAR(10),
    res_igm VARCHAR(10),
    res_iga VARCHAR(10)
);

-- 5. DDA_CASOS_SEMANAL: Aggregated DDA Case Count per Epidemiological Week
CREATE TABLE IF NOT EXISTS dda_casos_semanal (
    semana VARCHAR(10) PRIMARY KEY,
    -- Age Groups
    faixa_menor_1 INTEGER,
    faixa_1_a_4 INTEGER,
    faixa_5_a_9 INTEGER,
    faixa_10_mais INTEGER,
    faixa_ign INTEGER,
    faixa_total INTEGER,
    -- Treatment Plans
    plano_a INTEGER,
    plano_b INTEGER,
    plano_c INTEGER,
    plano_ign INTEGER,
    plano_total INTEGER,
    -- Reporting Units
    us_mdda_implantada INTEGER,
    us_que_informou INTEGER,
    pct_informou NUMERIC(5, 2)
);

-- 6. DDA_SURTOS_SEMANAL: Aggregated DDA Outbreaks per Epidemiological Week
CREATE TABLE IF NOT EXISTS dda_surtos_semanal (
    semana VARCHAR(10) PRIMARY KEY,
    surtos_detectados INTEGER,
    surtos_investigados INTEGER,
    pct_investigados NUMERIC(5, 2),
    surtos_com_amostras INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_doenca ON notificacoes(doenca);
CREATE INDEX IF NOT EXISTS idx_notificacoes_semana ON notificacoes(semana_notificacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_bairro ON notificacoes(residencia_bairro);

-- Spatial index (GIST) for spatial queries
CREATE INDEX IF NOT EXISTS idx_notificacoes_spatial ON notificacoes USING gist(geom_residencia);

-- 7. CLIMA_INMET_HORARIO: Hourly Weather Readings from INMET Station A201 (Belém)
CREATE TABLE IF NOT EXISTS clima_inmet_horario (
    estacao_codigo VARCHAR(20),
    datahora_utc TIMESTAMP,
    datahora_local TIMESTAMP,
    chuva_mm DOUBLE PRECISION,
    temperatura_seco_c DOUBLE PRECISION,
    temperatura_orvalho_c DOUBLE PRECISION,
    temperatura_maxima_c DOUBLE PRECISION,
    temperatura_minima_c DOUBLE PRECISION,
    umidade_relativa_pct DOUBLE PRECISION,
    umidade_maxima_pct DOUBLE PRECISION,
    umidade_minima_pct DOUBLE PRECISION,
    pressao_atmosferica_mb DOUBLE PRECISION,
    radiacao_global_kj_m2 DOUBLE PRECISION,
    vento_direcao_gr DOUBLE PRECISION,
    vento_velocidade_ms DOUBLE PRECISION,
    vento_rajada_ms DOUBLE PRECISION,
    PRIMARY KEY (estacao_codigo, datahora_utc)
);

-- 8. CLIMA_CEMADEN_PRECIPITACAO: Precipitation and Intensity from CEMADEN Stations in Belém
CREATE TABLE IF NOT EXISTS clima_cemaden_precipitacao (
    estacao_codigo VARCHAR(20),
    datahora_utc TIMESTAMP,
    datahora_local TIMESTAMP,
    estacao_nome VARCHAR(120),
    chuva_mm DOUBLE PRECISION,
    intensidade_mm_h DOUBLE PRECISION,
    qualificacao INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bairro_nome VARCHAR(100),
    PRIMARY KEY (estacao_codigo, datahora_utc)
);

-- 9. CLIMA_MARINHA_TABUA_MARE: Tide Table Forecasts from Marinha do Brasil
CREATE TABLE IF NOT EXISTS clima_marinha_tabua_mare (
    localidade VARCHAR(120),
    datahora_local TIMESTAMP,
    datahora_utc TIMESTAMP,
    altura_metros DOUBLE PRECISION,
    tipo_evento VARCHAR(20) CHECK(tipo_evento IN ('PREAMAR', 'BAIXAMAR')),
    PRIMARY KEY (localidade, datahora_local)
);

-- 10. CLIMA_CPTEC_PREVISAO: Daily Weather Forecast and UV Index from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_previsao (
    data_previsao DATE PRIMARY KEY,
    data_atualizacao VARCHAR(50),
    tempo_condicao VARCHAR(20),
    temperatura_maxima INTEGER,
    temperatura_minima INTEGER,
    iuv DOUBLE PRECISION,
    fonte VARCHAR(80)
);

-- 11. CLIMA_CPTEC_PREVISAO_ONDAS: Hourly Wave and Ocean Forecast from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_previsao_ondas (
    datahora_utc TIMESTAMP PRIMARY KEY,
    datahora_local TIMESTAMP,
    data_atualizacao VARCHAR(50),
    agitacao VARCHAR(50),
    altura_metros DOUBLE PRECISION,
    direcao_ondas VARCHAR(20),
    vento_velocidade_kmh DOUBLE PRECISION,
    vento_direcao VARCHAR(20)
);

-- 12. CLIMA_CPTEC_PRECIPITACAO: Daily Interpolated Precipitation from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_precipitacao (
    data_prec DATE PRIMARY KEY,
    chuva_mm DOUBLE PRECISION,
    data_atualizacao VARCHAR(50)
);

-- 13. CLIMA_CPTEC_UMIDADE_SOLO: Hourly/Daily Soil Moisture from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_umidade_solo (
    datahora_utc TIMESTAMP,
    datahora_local TIMESTAMP,
    bairro_nome VARCHAR(100),
    umidade_solo_l1 DOUBLE PRECISION, -- Layer 1: 0-10cm
    umidade_solo_l2 DOUBLE PRECISION, -- Layer 2: 10-40cm
    data_atualizacao VARCHAR(50),
    PRIMARY KEY (datahora_utc, bairro_nome)
);

-- 14. CLIMA_CPTEC_BRAMS_GASES: Hourly Air Quality / Gases from CPTEC BRAMS 15km
CREATE TABLE IF NOT EXISTS clima_cptec_brams_gases (
    datahora_utc TIMESTAMP,
    datahora_local TIMESTAMP,
    bairro_nome VARCHAR(100),
    co_ppm DOUBLE PRECISION, -- Monóxido de Carbono (ppm)
    pm25_ugm3 DOUBLE PRECISION, -- Material Particulado 2.5 (ug/m3)
    data_atualizacao VARCHAR(50),
    PRIMARY KEY (datahora_utc, bairro_nome)
);

CREATE INDEX IF NOT EXISTS idx_inmet_local ON clima_inmet_horario(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cemaden_dt ON clima_cemaden_precipitacao(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cemaden_bairro ON clima_cemaden_precipitacao(bairro_nome);
CREATE INDEX IF NOT EXISTS idx_marinha_dt ON clima_marinha_tabua_mare(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cptec_dt ON clima_cptec_previsao(data_previsao);
CREATE INDEX IF NOT EXISTS idx_cptec_ondas_dt ON clima_cptec_previsao_ondas(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cptec_prec_dt ON clima_cptec_precipitacao(data_prec);
CREATE INDEX IF NOT EXISTS idx_cptec_solo_dt ON clima_cptec_umidade_solo(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cptec_solo_bairro ON clima_cptec_umidade_solo(bairro_nome, datahora_local);
CREATE INDEX IF NOT EXISTS idx_cptec_brams_dt ON clima_cptec_brams_gases(datahora_local);
CREATE INDEX IF NOT EXISTS idx_cptec_brams_bairro ON clima_cptec_brams_gases(bairro_nome, datahora_local);

-- 15. VIEW_CLIMA_DIARIO: Unified daily weather aggregator
CREATE OR REPLACE VIEW view_clima_diario AS
WITH datas AS (
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_inmet_horario WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_cemaden_precipitacao WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_marinha_tabua_mare WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT data_previsao AS data_diaria FROM clima_cptec_previsao WHERE data_previsao IS NOT NULL
    UNION
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_cptec_previsao_ondas WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT data_prec AS data_diaria FROM clima_cptec_precipitacao WHERE data_prec IS NOT NULL
    UNION
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_cptec_umidade_solo WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_cptec_brams_gases WHERE datahora_local IS NOT NULL
),
inmet_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        SUM(chuva_mm) AS chuva_inmet_total,
        AVG(temperatura_seco_c) AS temp_media_diaria,
        MAX(temperatura_maxima_c) AS temp_maxima_diaria,
        MIN(temperatura_minima_c) AS temp_minima_diaria,
        AVG(umidade_relativa_pct) AS umidade_media_diaria,
        MAX(umidade_maxima_pct) AS umidade_maxima_diaria,
        MIN(umidade_minima_pct) AS umidade_minima_diaria,
        AVG(vento_velocidade_ms) AS vento_velocidade_media,
        MAX(vento_rajada_ms) AS vento_rajada_maxima
    FROM clima_inmet_horario
    GROUP BY datahora_local::date
),
cemaden_estacao_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        estacao_codigo,
        SUM(chuva_mm) AS chuva_estacao
    FROM clima_cemaden_precipitacao
    GROUP BY datahora_local::date, estacao_codigo
),
cemaden_diario AS (
    SELECT
        data_diaria,
        AVG(chuva_estacao) AS chuva_cemaden_media_estacoes,
        MAX(chuva_estacao) AS chuva_cemaden_maxima_estacoes
    FROM cemaden_estacao_diario
    GROUP BY data_diaria
),
marinha_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) AS mare_maxima,
        MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_minima,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) -
            MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_amplitude
    FROM clima_marinha_tabua_mare
    GROUP BY datahora_local::date
),
cptec_ondas_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        MAX(altura_metros) AS onda_prev_altura_maxima,
        MAX(vento_velocidade_kmh) AS vento_prev_velocidade_maxima
    FROM clima_cptec_previsao_ondas
    GROUP BY datahora_local::date
),
cptec_prec_diario AS (
    SELECT
        data_prec AS data_diaria,
        SUM(chuva_mm) AS chuva_cptec_total
    FROM clima_cptec_precipitacao
    GROUP BY data_prec
),
cptec_solo_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        AVG(umidade_solo_l1) AS umidade_solo_l1_media,
        AVG(umidade_solo_l2) AS umidade_solo_l2_media
    FROM clima_cptec_umidade_solo
    GROUP BY datahora_local::date
),
cptec_brams_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        AVG(co_ppm) AS co_ppm_medio,
        AVG(pm25_ugm3) AS pm25_ugm3_medio
    FROM clima_cptec_brams_gases
    GROUP BY datahora_local::date
)
SELECT
    d.data_diaria,
    i.chuva_inmet_total,
    i.temp_media_diaria,
    i.temp_maxima_diaria,
    i.temp_minima_diaria,
    i.umidade_media_diaria,
    i.umidade_maxima_diaria,
    i.umidade_minima_diaria,
    i.vento_velocidade_media,
    i.vento_rajada_maxima,
    c.chuva_cemaden_media_estacoes,
    c.chuva_cemaden_maxima_estacoes,
    m.mare_maxima,
    m.mare_minima,
    m.mare_amplitude,
    p.temperatura_maxima AS temp_prev_maxima,
    p.temperatura_minima AS temp_prev_minima,
    p.iuv AS iuv_prev_maximo,
    o.onda_prev_altura_maxima,
    o.vento_prev_velocidade_maxima,
    cp.chuva_cptec_total,
    cs.umidade_solo_l1_media,
    cs.umidade_solo_l2_media,
    cg.co_ppm_medio,
    cg.pm25_ugm3_medio
FROM datas d
LEFT JOIN inmet_diario i ON d.data_diaria = i.data_diaria
LEFT JOIN cemaden_diario c ON d.data_diaria = c.data_diaria
LEFT JOIN marinha_diario m ON d.data_diaria = m.data_diaria
LEFT JOIN clima_cptec_previsao p ON d.data_diaria = p.data_previsao
LEFT JOIN cptec_ondas_diario o ON d.data_diaria = o.data_diaria
LEFT JOIN cptec_prec_diario cp ON d.data_diaria = cp.data_diaria
LEFT JOIN cptec_solo_diario cs ON d.data_diaria = cs.data_diaria
LEFT JOIN cptec_brams_diario cg ON d.data_diaria = cg.data_diaria;

-- 16. VIEW_NOTIFICACOES_CLIMA: Integrates case notifications with daily weather factors
CREATE OR REPLACE VIEW view_notificacoes_clima AS
SELECT
    n.id_notificacao,
    n.tp_notificacao,
    n.agravo_id,
    n.doenca,
    n.data_notificacao,
    n.semana_notificacao,
    n.ano_notificacao,
    n.data_sintomas,
    n.semana_sintomas,
    n.residencia_bairro,
    n.latitude,
    n.longitude,
    c.chuva_inmet_total,
    c.temp_media_diaria,
    c.temp_maxima_diaria,
    c.temp_minima_diaria,
    c.umidade_media_diaria,
    c.umidade_maxima_diaria,
    c.umidade_minima_diaria,
    c.vento_velocidade_media,
    c.vento_rajada_maxima,
    c.chuva_cemaden_media_estacoes,
    c.chuva_cemaden_maxima_estacoes,
    c.mare_maxima,
    c.mare_minima,
    c.mare_amplitude,
    c.temp_prev_maxima,
    c.temp_prev_minima,
    c.iuv_prev_maximo,
    c.onda_prev_altura_maxima,
    c.vento_prev_velocidade_maxima,
    c.chuva_cptec_total,
    c.umidade_solo_l1_media,
    c.umidade_solo_l2_media,
    c.co_ppm_medio,
    c.pm25_ugm3_medio
FROM notificacoes n
LEFT JOIN view_clima_diario c ON COALESCE(n.data_sintomas, n.data_notificacao) = c.data_diaria;

-- 17. VIEW_CLIMA_BAIRRO_DIARIO: Unified daily weather aggregator by neighborhood (PostgreSQL)
CREATE OR REPLACE VIEW view_clima_bairro_diario AS
WITH datas_bairros AS (
    SELECT d.data_diaria, b.bairro_nome
    FROM (
        SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_inmet_horario WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_cemaden_precipitacao WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT datahora_local::date AS data_diaria FROM clima_marinha_tabua_mare WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT data_previsao AS data_diaria FROM clima_cptec_previsao WHERE data_previsao IS NOT NULL
    ) d
    CROSS JOIN (
        SELECT DISTINCT residencia_bairro AS bairro_nome FROM notificacoes WHERE residencia_bairro IS NOT NULL AND residencia_bairro != 'NÃO INFORMADO'
    ) b
),
inmet_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        SUM(chuva_mm) AS chuva_inmet_total,
        AVG(temperatura_seco_c) AS temp_media_diaria,
        MAX(temperatura_maxima_c) AS temp_maxima_diaria,
        MIN(temperatura_minima_c) AS temp_minima_diaria,
        AVG(umidade_relativa_pct) AS umidade_media_diaria,
        MAX(umidade_maxima_pct) AS umidade_maxima_diaria,
        MIN(umidade_minima_pct) AS umidade_minima_diaria,
        AVG(vento_velocidade_ms) AS vento_velocidade_media,
        MAX(vento_rajada_ms) AS vento_rajada_maxima
    FROM clima_inmet_horario
    GROUP BY datahora_local::date
),
cemaden_diario_bairro AS (
    SELECT
        datahora_local::date AS data_diaria,
        bairro_nome,
        SUM(chuva_mm) AS chuva_cemaden_total,
        MAX(intensidade_mm_h) AS chuva_cemaden_maxima
    FROM clima_cemaden_precipitacao
    WHERE bairro_nome IS NOT NULL
    GROUP BY datahora_local::date, bairro_nome
),
marinha_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) AS mare_maxima,
        MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_minima,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) -
            MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_amplitude
    FROM clima_marinha_tabua_mare
    GROUP BY datahora_local::date
),
cptec_diario AS (
    SELECT
        data_previsao AS data_diaria,
        temperatura_maxima AS temp_prev_maxima,
        temperatura_minima AS temp_prev_minima,
        iuv AS iuv_prev_maximo
    FROM clima_cptec_previsao
),
cptec_ondas_diario AS (
    SELECT
        datahora_local::date AS data_diaria,
        MAX(altura_metros) AS onda_prev_altura_maxima,
        MAX(vento_velocidade_kmh) AS vento_prev_velocidade_maxima
    FROM clima_cptec_previsao_ondas
    GROUP BY datahora_local::date
),
cptec_prec_diario AS (
    SELECT
        data_prec AS data_diaria,
        SUM(chuva_mm) AS chuva_cptec_total
    FROM clima_cptec_precipitacao
    GROUP BY data_prec
),
cptec_solo_diario_bairro AS (
    SELECT
        datahora_local::date AS data_diaria,
        bairro_nome,
        AVG(umidade_solo_l1) AS umidade_solo_l1_media,
        AVG(umidade_solo_l2) AS umidade_solo_l2_media
    FROM clima_cptec_umidade_solo
    GROUP BY datahora_local::date, bairro_nome
),
cptec_brams_diario_bairro AS (
    SELECT
        datahora_local::date AS data_diaria,
        bairro_nome,
        AVG(co_ppm) AS co_ppm_medio,
        AVG(pm25_ugm3) AS pm25_ugm3_medio
    FROM clima_cptec_brams_gases
    GROUP BY datahora_local::date, bairro_nome
)
SELECT
    db.data_diaria,
    db.bairro_nome,
    i.chuva_inmet_total,
    i.temp_media_diaria,
    i.temp_maxima_diaria,
    i.temp_minima_diaria,
    i.umidade_media_diaria,
    i.umidade_maxima_diaria,
    i.umidade_minima_diaria,
    i.vento_velocidade_media,
    i.vento_rajada_maxima,
    COALESCE(c.chuva_cemaden_total, i.chuva_inmet_total) AS chuva_local_total,
    m.mare_maxima,
    m.mare_minima,
    m.mare_amplitude,
    p.temp_prev_maxima,
    p.temp_prev_minima,
    p.iuv_prev_maximo,
    o.onda_prev_altura_maxima,
    o.vento_prev_velocidade_maxima,
    cp.chuva_cptec_total,
    cs.umidade_solo_l1_media,
    cs.umidade_solo_l2_media,
    cg.co_ppm_medio,
    cg.pm25_ugm3_medio
FROM datas_bairros db
LEFT JOIN inmet_diario i ON db.data_diaria = i.data_diaria
LEFT JOIN cemaden_diario_bairro c ON db.data_diaria = c.data_diaria AND db.bairro_nome = c.bairro_nome
LEFT JOIN marinha_diario m ON db.data_diaria = m.data_diaria
LEFT JOIN cptec_diario p ON db.data_diaria = p.data_diaria
LEFT JOIN cptec_ondas_diario o ON db.data_diaria = o.data_diaria
LEFT JOIN cptec_prec_diario cp ON db.data_diaria = cp.data_diaria
LEFT JOIN cptec_solo_diario_bairro cs ON db.data_diaria = cs.data_diaria AND db.bairro_nome = cs.bairro_nome
LEFT JOIN cptec_brams_diario_bairro cg ON db.data_diaria = cg.data_diaria AND db.bairro_nome = cg.bairro_nome;

-- 18. VIEW_NOTIFICACOES_CLIMA_BAIRRO: Integrates case notifications with daily weather factors by neighborhood (PostgreSQL)
CREATE OR REPLACE VIEW view_notificacoes_clima_bairro AS
SELECT
    n.id_notificacao,
    n.tp_notificacao,
    n.agravo_id,
    n.doenca,
    n.data_notificacao,
    n.semana_notificacao,
    n.ano_notificacao,
    n.data_sintomas,
    n.semana_sintomas,
    n.residencia_bairro,
    n.latitude,
    n.longitude,
    c.chuva_inmet_total,
    c.temp_media_diaria,
    c.temp_maxima_diaria,
    c.temp_minima_diaria,
    c.umidade_media_diaria,
    c.umidade_maxima_diaria,
    c.umidade_minima_diaria,
    c.vento_velocidade_media,
    c.vento_rajada_maxima,
    c.chuva_local_total,
    c.mare_maxima,
    c.mare_minima,
    c.mare_amplitude,
    c.temp_prev_maxima,
    c.temp_prev_minima,
    c.iuv_prev_maximo,
    c.onda_prev_altura_maxima,
    c.vento_prev_velocidade_maxima,
    c.chuva_cptec_total,
    c.umidade_solo_l1_media,
    c.umidade_solo_l2_media,
    c.co_ppm_medio,
    c.pm25_ugm3_medio
FROM notificacoes n
LEFT JOIN view_clima_bairro_diario c 
  ON COALESCE(n.data_sintomas, n.data_notificacao) = c.data_diaria 
  AND n.residencia_bairro = c.bairro_nome;

