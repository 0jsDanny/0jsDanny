-- CISC Belém - SQLite Relational Database DDL Schema
-- Location: db_devs/cisc_health.db
-- Created: 2026-05-20

-- Enable foreign keys support in SQLite
PRAGMA foreign_keys = ON;

-- 1. NOTIFICACOES: Unified Core Table for Dengue, Leptospirosis, and SRAG Case Notifications
CREATE TABLE IF NOT EXISTS notificacoes (
    id_notificacao TEXT PRIMARY KEY,
    tp_notificacao TEXT,
    agravo_id TEXT,
    doenca TEXT CHECK(doenca IN ('DENGUE', 'LEPTOSPIROSE', 'SRAG')),
    data_notificacao TEXT, -- ISO YYYY-MM-DD
    semana_notificacao TEXT,
    ano_notificacao INTEGER,
    data_sintomas TEXT, -- ISO YYYY-MM-DD
    semana_sintomas TEXT,
    paciente_nome TEXT,
    paciente_nascimento TEXT, -- ISO YYYY-MM-DD
    paciente_idade_anos REAL,
    paciente_sexo TEXT CHECK(paciente_sexo IN ('M', 'F', 'I')),
    paciente_gestante TEXT,
    paciente_raca TEXT,
    paciente_escolaridade TEXT,
    paciente_cns TEXT,
    paciente_mae TEXT,
    residencia_uf TEXT,
    residencia_municipio_ibge TEXT,
    residencia_bairro TEXT,
    residencia_logradouro TEXT,
    residencia_numero TEXT,
    residencia_complemento TEXT,
    residencia_cep TEXT,
    residencia_zona TEXT,
    data_investigacao TEXT, -- ISO YYYY-MM-DD
    hospitalizado TEXT CHECK(hospitalizado IN ('S', 'N', 'I')),
    data_internacao TEXT, -- ISO YYYY-MM-DD
    classificacao_final TEXT,
    criterio_confirmacao TEXT,
    evolucao TEXT,
    data_obito TEXT, -- ISO YYYY-MM-DD
    data_encerramento TEXT, -- ISO YYYY-MM-DD
    observacao TEXT,
    latitude REAL,
    longitude REAL
);

-- 2. DENGUE_DETALHES: Clinical and Laboratory Details for Dengue Cases
CREATE TABLE IF NOT EXISTS dengue_detalhes (
    id_notificacao TEXT PRIMARY KEY,
    -- Clinical Symptoms
    febre TEXT,
    mialgia TEXT,
    cefaleia TEXT,
    exantema TEXT,
    vomito TEXT,
    nausea TEXT,
    dor_costas TEXT,
    conjuntvit TEXT,
    artrite TEXT,
    artralgia TEXT,
    petequia_n TEXT,
    leucopenia TEXT,
    laco TEXT,
    dor_retro TEXT,
    -- Comorbidities
    diabetes TEXT,
    hematolog TEXT,
    hepatopat TEXT,
    renal TEXT,
    hipertensa TEXT,
    acido_pept TEXT,
    auto_imune TEXT,
    -- Laboratory Results
    resul_soro TEXT,
    resul_ns1 TEXT,
    resul_vi_n TEXT,
    resul_pcr_ TEXT,
    sorotipo TEXT,
    histopa_n TEXT,
    imunoh_n TEXT,
    -- Alarm Signs
    alrm_hipot TEXT,
    alrm_plaq TEXT,
    alrm_vom TEXT,
    alrm_sang TEXT,
    alrm_hemat TEXT,
    alrm_abdom TEXT,
    alrm_letar TEXT,
    alrm_hepat TEXT,
    alrm_liq TEXT,
    -- Severity Indicators
    grav_pulso TEXT,
    grav_conv TEXT,
    grav_ench TEXT,
    grav_insuf TEXT,
    grav_taqui TEXT,
    grav_extre TEXT,
    grav_hipot TEXT,
    grav_hemat TEXT,
    grav_melen TEXT,
    grav_metro TEXT,
    grav_sang TEXT,
    grav_ast TEXT,
    grav_mioc TEXT,
    grav_consc TEXT,
    grav_orgao TEXT,
    FOREIGN KEY(id_notificacao) REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE
);

-- 3. LEPTOSPIROSE_DETALHES: Risk Factors, Exposures, Symptoms, and Lab for Leptospirosis Cases
CREATE TABLE IF NOT EXISTS leptospirose_detalhes (
    id_notificacao TEXT PRIMARY KEY,
    -- Risk Factors and Exposures
    ant_cb_lam TEXT,
    ant_cb_cri TEXT,
    ant_cb_cai TEXT,
    ant_cb_fos TEXT,
    ant_cb_sin TEXT,
    ant_cb_pla TEXT,
    ant_cb_cor TEXT,
    ant_cb_roe TEXT,
    ant_cb_gra TEXT,
    ant_cb_ter TEXT,
    ant_cb_lix TEXT,
    ant_cb_out TEXT,
    ant_ou_des TEXT,
    ant_humano TEXT,
    ant_animai TEXT,
    -- Clinical Symptoms
    cli_febre TEXT,
    cli_mialgi TEXT,
    cli_cefale TEXT,
    cli_prost TEXT,
    cli_conges TEXT,
    cli_pantur TEXT,
    cli_vomito TEXT,
    cli_diarre TEXT,
    cli_icteri TEXT,
    cli_renal TEXT,
    cli_respir TEXT,
    cli_cardia TEXT,
    cli_hemopu TEXT,
    cli_hemorr TEXT,
    cli_mening TEXT,
    cli_outros TEXT,
    cli_otrdes TEXT,
    -- Lab Results
    lab_elis_1 TEXT,
    lab_elis_2 TEXT,
    lab_micr_1 TEXT,
    lab_micr_2 TEXT,
    res_isol TEXT,
    res_imuno TEXT,
    res_pcr TEXT,
    FOREIGN KEY(id_notificacao) REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE
);

-- 4. SRAG_DETALHES: Comorbidities, Viral Panels, Symptoms, and Vaccines for SRAG Cases
CREATE TABLE IF NOT EXISTS srag_detalhes (
    id_notificacao TEXT PRIMARY KEY,
    -- Clinical Signs
    nosocomial TEXT,
    ave_suino TEXT,
    febre TEXT,
    tosse TEXT,
    garganta TEXT,
    dispneia TEXT,
    desc_resp TEXT,
    saturacao TEXT,
    diarreia TEXT,
    vomito TEXT,
    outro_sin TEXT,
    outro_des TEXT,
    dor_abd TEXT,
    fadiga TEXT,
    perd_olft TEXT,
    perd_pala TEXT,
    -- Comorbidities & Risk Factors
    puerpera TEXT,
    cardiopati TEXT,
    hematologi TEXT,
    sind_down TEXT,
    hepatica TEXT,
    asma TEXT,
    diabetes TEXT,
    neurologic TEXT,
    pneumopati TEXT,
    imunodepre TEXT,
    renal TEXT,
    obesidade TEXT,
    obes_imc TEXT,
    out_morbi TEXT,
    morb_desc TEXT,
    tabag TEXT,
    -- Vaccine Status and Treatment
    vacina TEXT,
    mae_vac TEXT,
    m_amamenta TEXT,
    antiviral TEXT,
    tp_antiviral TEXT,
    out_antiv TEXT,
    vacina_cov TEXT,
    dose_1_cov TEXT,
    dose_2_cov TEXT,
    dose_ref TEXT,
    dose_2ref TEXT,
    dose_adic TEXT,
    dos_re_bi TEXT,
    fab_cov_1 TEXT,
    fab_cov_2 TEXT,
    fab_covrf TEXT,
    fab_covrf2 TEXT,
    fab_adic TEXT,
    fab_re_bi TEXT,
    lote_1_cov TEXT,
    lote_2_cov TEXT,
    lote_ref TEXT,
    lote_ref2 TEXT,
    lote_adic TEXT,
    lot_re_bi TEXT,
    trat_cov TEXT,
    -- Lab results and tests
    pcr_resul TEXT,
    pos_pcrflu TEXT,
    tp_flu_pcr TEXT,
    pcr_fluasu TEXT,
    fluasu_out TEXT,
    pcr_flubli TEXT,
    flubli_out TEXT,
    pos_pcrout TEXT,
    pcr_vsr TEXT,
    pcr_para1 TEXT,
    pcr_para2 TEXT,
    pcr_para3 TEXT,
    pcr_para4 TEXT,
    pcr_adeno TEXT,
    pcr_metap TEXT,
    pcr_boca TEXT,
    pcr_rino TEXT,
    pcr_outro TEXT,
    ds_pcr_out TEXT,
    pcr_sars2 TEXT,
    tomo_res TEXT,
    tomo_out TEXT,
    tp_tes_an TEXT,
    res_an TEXT,
    an_sars2 TEXT,
    an_vsr TEXT,
    an_para1 TEXT,
    an_para2 TEXT,
    an_para3 TEXT,
    an_adeno TEXT,
    an_outro TEXT,
    res_igg TEXT,
    res_igm TEXT,
    res_iga TEXT,
    FOREIGN KEY(id_notificacao) REFERENCES notificacoes(id_notificacao) ON DELETE CASCADE
);

-- 5. DDA_CASOS_SEMANAL: Aggregated DDA Case Count per Epidemiological Week
CREATE TABLE IF NOT EXISTS dda_casos_semanal (
    semana TEXT PRIMARY KEY,
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
    pct_informou REAL
);

-- 6. DDA_SURTOS_SEMANAL: Aggregated DDA Outbreaks per Epidemiological Week
CREATE TABLE IF NOT EXISTS dda_surtos_semanal (
    semana TEXT PRIMARY KEY,
    surtos_detectados INTEGER,
    surtos_investigados INTEGER,
    pct_investigados REAL,
    surtos_com_amostras INTEGER
);

-- Indices for spatial and temporal linkage speed
CREATE INDEX IF NOT EXISTS idx_notificacoes_doenca ON notificacoes(doenca);
CREATE INDEX IF NOT EXISTS idx_notificacoes_semana ON notificacoes(semana_notificacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_bairro ON notificacoes(residencia_bairro);
CREATE INDEX IF NOT EXISTS idx_notificacoes_coords ON notificacoes(latitude, longitude);

-- 7. CLIMA_INMET_HORARIO: Hourly Weather Readings from INMET Station A201 (Belém)
CREATE TABLE IF NOT EXISTS clima_inmet_horario (
    estacao_codigo TEXT,
    datahora_utc TEXT,
    datahora_local TEXT,
    chuva_mm REAL,
    temperatura_seco_c REAL,
    temperatura_orvalho_c REAL,
    temperatura_maxima_c REAL,
    temperatura_minima_c REAL,
    umidade_relativa_pct REAL,
    umidade_maxima_pct REAL,
    umidade_minima_pct REAL,
    pressao_atmosferica_mb REAL,
    radiacao_global_kj_m2 REAL,
    vento_direcao_gr REAL,
    vento_velocidade_ms REAL,
    vento_rajada_ms REAL,
    PRIMARY KEY (estacao_codigo, datahora_utc)
);

-- 8. CLIMA_CEMADEN_PRECIPITACAO: Precipitation and Intensity from CEMADEN Stations in Belém
CREATE TABLE IF NOT EXISTS clima_cemaden_precipitacao (
    estacao_codigo TEXT,
    datahora_utc TEXT,
    datahora_local TEXT,
    estacao_nome TEXT,
    chuva_mm REAL,
    intensidade_mm_h REAL,
    qualificacao INTEGER,
    latitude REAL,
    longitude REAL,
    bairro_nome TEXT,
    PRIMARY KEY (estacao_codigo, datahora_utc)
);

-- 9. CLIMA_MARINHA_TABUA_MARE: Hourly Tide Table Forecasts from Marinha do Brasil
CREATE TABLE IF NOT EXISTS clima_marinha_tabua_mare (
    localidade TEXT,
    datahora_local TEXT,
    datahora_utc TEXT,
    altura_metros REAL,
    tipo_evento TEXT CHECK(tipo_evento IN ('PREAMAR', 'BAIXAMAR')),
    PRIMARY KEY (localidade, datahora_local)
);

-- 10. CLIMA_CPTEC_PREVISAO: Daily Weather Forecast and UV Index from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_previsao (
    data_previsao TEXT PRIMARY KEY, -- ISO YYYY-MM-DD
    data_atualizacao TEXT,
    tempo_condicao TEXT,
    temperatura_maxima INTEGER,
    temperatura_minima INTEGER,
    iuv REAL,
    fonte TEXT
);

-- 11. CLIMA_CPTEC_PREVISAO_ONDAS: Hourly Wave and Ocean Forecast from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_previsao_ondas (
    datahora_utc TEXT PRIMARY KEY,
    datahora_local TEXT,
    data_atualizacao TEXT,
    agitacao TEXT,
    altura_metros REAL,
    direcao_ondas TEXT,
    vento_velocidade_kmh REAL,
    vento_direcao TEXT
);

-- 12. CLIMA_CPTEC_PRECIPITACAO: Daily Interpolated Precipitation from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_precipitacao (
    data_prec TEXT PRIMARY KEY, -- ISO YYYY-MM-DD
    chuva_mm REAL,
    data_atualizacao TEXT
);

-- 13. CLIMA_CPTEC_UMIDADE_SOLO: Hourly/Daily Soil Moisture from CPTEC
CREATE TABLE IF NOT EXISTS clima_cptec_umidade_solo (
    datahora_utc TEXT,
    datahora_local TEXT,
    bairro_nome TEXT,
    umidade_solo_l1 REAL, -- Layer 1: 0-10cm
    umidade_solo_l2 REAL, -- Layer 2: 10-40cm
    data_atualizacao TEXT,
    PRIMARY KEY (datahora_utc, bairro_nome)
);

-- 14. CLIMA_CPTEC_BRAMS_GASES: Hourly Air Quality / Gases from CPTEC BRAMS 15km
CREATE TABLE IF NOT EXISTS clima_cptec_brams_gases (
    datahora_utc TEXT,
    datahora_local TEXT,
    bairro_nome TEXT,
    co_ppm REAL, -- Monóxido de Carbono (ppm)
    pm25_ugm3 REAL, -- Material Particulado 2.5 (ug/m3)
    data_atualizacao TEXT,
    PRIMARY KEY (datahora_utc, bairro_nome)
);

-- Climate indexes for fast query linkage
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
DROP VIEW IF EXISTS view_clima_diario;
CREATE VIEW IF NOT EXISTS view_clima_diario AS
WITH datas AS (
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_inmet_horario WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_cemaden_precipitacao WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_marinha_tabua_mare WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT data_previsao AS data_diaria FROM clima_cptec_previsao WHERE data_previsao IS NOT NULL
    UNION
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_cptec_previsao_ondas WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT data_prec AS data_diaria FROM clima_cptec_precipitacao WHERE data_prec IS NOT NULL
    UNION
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_cptec_umidade_solo WHERE datahora_local IS NOT NULL
    UNION
    SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_cptec_brams_gases WHERE datahora_local IS NOT NULL
),
inmet_diario AS (
    SELECT 
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
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
    GROUP BY data_diaria
),
cemaden_diario AS (
    SELECT 
        data_diaria,
        AVG(chuva_estacao) AS chuva_cemaden_media_estacoes,
        MAX(chuva_estacao) AS chuva_cemaden_maxima_estacoes
    FROM (
        SELECT 
            SUBSTR(datahora_local, 1, 10) AS data_diaria,
            estacao_codigo,
            SUM(chuva_mm) AS chuva_estacao
        FROM clima_cemaden_precipitacao
        GROUP BY data_diaria, estacao_codigo
    )
    GROUP BY data_diaria
),
marinha_diario AS (
    SELECT 
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) AS mare_maxima,
        MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_minima,
        (MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) - MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END)) AS mare_amplitude
    FROM clima_marinha_tabua_mare
    GROUP BY data_diaria
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
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        MAX(altura_metros) AS onda_prev_altura_maxima,
        MAX(vento_velocidade_kmh) AS vento_prev_velocidade_maxima
    FROM clima_cptec_previsao_ondas
    GROUP BY data_diaria
),
cptec_prec_diario AS (
    SELECT
        data_prec AS data_diaria,
        SUM(chuva_mm) AS chuva_cptec_total
    FROM clima_cptec_precipitacao
    GROUP BY data_diaria
),
cptec_solo_diario AS (
    SELECT
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        AVG(umidade_solo_l1) AS umidade_solo_l1_media,
        AVG(umidade_solo_l2) AS umidade_solo_l2_media
    FROM clima_cptec_umidade_solo
    GROUP BY data_diaria
),
cptec_brams_diario AS (
    SELECT
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        AVG(co_ppm) AS co_ppm_medio,
        AVG(pm25_ugm3) AS pm25_ugm3_medio
    FROM clima_cptec_brams_gases
    GROUP BY data_diaria
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
FROM datas d
LEFT JOIN inmet_diario i ON d.data_diaria = i.data_diaria
LEFT JOIN cemaden_diario c ON d.data_diaria = c.data_diaria
LEFT JOIN marinha_diario m ON d.data_diaria = m.data_diaria
LEFT JOIN cptec_diario p ON d.data_diaria = p.data_diaria
LEFT JOIN cptec_ondas_diario o ON d.data_diaria = o.data_diaria
LEFT JOIN cptec_prec_diario cp ON d.data_diaria = cp.data_diaria
LEFT JOIN cptec_solo_diario cs ON d.data_diaria = cs.data_diaria
LEFT JOIN cptec_brams_diario cg ON d.data_diaria = cg.data_diaria;

-- 16. VIEW_NOTIFICACOES_CLIMA: Integrates case notifications with daily weather factors
DROP VIEW IF EXISTS view_notificacoes_clima;
CREATE VIEW IF NOT EXISTS view_notificacoes_clima AS
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

-- 17. VIEW_CLIMA_BAIRRO_DIARIO: Unified daily weather aggregator by neighborhood
DROP VIEW IF EXISTS view_clima_bairro_diario;
CREATE VIEW IF NOT EXISTS view_clima_bairro_diario AS
WITH datas_bairros AS (
    SELECT d.data_diaria, b.bairro_nome
    FROM (
        SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_inmet_horario WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_cemaden_precipitacao WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT SUBSTR(datahora_local, 1, 10) AS data_diaria FROM clima_marinha_tabua_mare WHERE datahora_local IS NOT NULL
        UNION
        SELECT DISTINCT data_previsao AS data_diaria FROM clima_cptec_previsao WHERE data_previsao IS NOT NULL
    ) d
    CROSS JOIN (
        SELECT DISTINCT residencia_bairro AS bairro_nome FROM notificacoes WHERE residencia_bairro IS NOT NULL AND residencia_bairro != 'NÃO INFORMADO'
    ) b
),
inmet_diario AS (
    SELECT 
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
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
    GROUP BY data_diaria
),
cemaden_diario_bairro AS (
    SELECT 
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        bairro_nome,
        SUM(chuva_mm) AS chuva_cemaden_total,
        MAX(intensidade_mm_h) AS chuva_cemaden_maxima
    FROM clima_cemaden_precipitacao
    WHERE bairro_nome IS NOT NULL
    GROUP BY data_diaria, bairro_nome
),
marinha_diario AS (
    SELECT 
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) AS mare_maxima,
        MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END) AS mare_minima,
        (MAX(CASE WHEN tipo_evento = 'PREAMAR' THEN altura_metros END) - MIN(CASE WHEN tipo_evento = 'BAIXAMAR' THEN altura_metros END)) AS mare_amplitude
    FROM clima_marinha_tabua_mare
    GROUP BY data_diaria
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
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        MAX(altura_metros) AS onda_prev_altura_maxima,
        MAX(vento_velocidade_kmh) AS vento_prev_velocidade_maxima
    FROM clima_cptec_previsao_ondas
    GROUP BY data_diaria
),
cptec_prec_diario AS (
    SELECT
        data_prec AS data_diaria,
        SUM(chuva_mm) AS chuva_cptec_total
    FROM clima_cptec_precipitacao
    GROUP BY data_diaria
),
cptec_solo_diario_bairro AS (
    SELECT
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        bairro_nome,
        AVG(umidade_solo_l1) AS umidade_solo_l1_media,
        AVG(umidade_solo_l2) AS umidade_solo_l2_media
    FROM clima_cptec_umidade_solo
    GROUP BY data_diaria, bairro_nome
),
cptec_brams_diario_bairro AS (
    SELECT
        SUBSTR(datahora_local, 1, 10) AS data_diaria,
        bairro_nome,
        AVG(co_ppm) AS co_ppm_medio,
        AVG(pm25_ugm3) AS pm25_ugm3_medio
    FROM clima_cptec_brams_gases
    GROUP BY data_diaria, bairro_nome
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

-- 18. VIEW_NOTIFICACOES_CLIMA_BAIRRO: Integrates case notifications with daily weather factors by neighborhood
DROP VIEW IF EXISTS view_notificacoes_clima_bairro;
CREATE VIEW IF NOT EXISTS view_notificacoes_clima_bairro AS
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


