
import sqlite3
from config import DB_FILE

def get_connection():
    return sqlite3.connect(DB_FILE)

def init_db(conn):
    cursor = conn.cursor()
    
    # 1. ESTABELECIMENTOS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS estabelecimentos (
            cnpj_basico TEXT, cnpj_ordem TEXT, cnpj_dv TEXT, matriz_filial TEXT, nome_fantasia TEXT,
            situacao_cadastral TEXT, data_situacao_cadastral TEXT, motivo_situacao_cadastral TEXT,
            nome_cidade_exterior TEXT, pais TEXT, data_inicio_atividade TEXT, cnae_fiscal_principal TEXT,
            cnae_fiscal_secundaria TEXT, tipo_logradouro TEXT, logradouro TEXT, numero TEXT, complemento TEXT,
            bairro TEXT, cep TEXT, uf TEXT, municipio TEXT, ddd_1 TEXT, telefone_1 TEXT, ddd_2 TEXT, telefone_2 TEXT,
            ddd_fax TEXT, fax TEXT, correio_eletronico TEXT, situacao_especial TEXT, data_situacao_especial TEXT,
            bairro_normalizado TEXT,
            PRIMARY KEY (cnpj_basico, cnpj_ordem, cnpj_dv)
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_municipio ON estabelecimentos(municipio);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_bairro ON estabelecimentos(bairro);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_bairro_norm ON estabelecimentos(bairro_normalizado);')

    # 2. EMPRESAS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS empresas (
            cnpj_basico TEXT PRIMARY KEY, razao_social TEXT, natureza_juridica TEXT, qualificacao_responsavel TEXT,
            capital_social TEXT, porte_empresa TEXT, ente_federativo_responsavel TEXT
        )
    ''')
    
    # 3. SOCIOS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS socios (
            cnpj_basico TEXT, identificador_socio TEXT, nome_socio_razao_social TEXT, cnpj_cpf_socio TEXT,
            qualificacao_socio TEXT, data_entrada_sociedade TEXT, pais TEXT, representante_legal TEXT,
            nome_representante TEXT, qualificacao_representante_legal TEXT, faixa_etaria TEXT
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_socios_cnpj ON socios(cnpj_basico);')

    # 4. CNAES (Lookup)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cnaes (
            codigo TEXT PRIMARY KEY,
            descricao TEXT
        )
    ''')

    # 6. SIMPLES / MEI DATA
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simples_mei (
            cnpj_basico TEXT PRIMARY KEY,
            opcao_pelo_simples TEXT,
            data_opcao_simples TEXT,
            data_exclusao_simples TEXT,
            opcao_pelo_mei TEXT,
            data_opcao_mei TEXT,
            data_exclusao_mei TEXT
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_simples_cnpj ON simples_mei(cnpj_basico);')

    # 7. REFERENCE TABLES
    cursor.execute('CREATE TABLE IF NOT EXISTS motivos (codigo TEXT PRIMARY KEY, descricao TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS paises (codigo TEXT PRIMARY KEY, descricao TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS qualificacoes (codigo TEXT PRIMARY KEY, descricao TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS naturezas (codigo TEXT PRIMARY KEY, descricao TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS municipios (codigo TEXT PRIMARY KEY, descricao TEXT)')

    conn.commit()

def create_views(conn):
    cursor = conn.cursor()
    
    # Drop existing views to ensure update
    cursor.execute('DROP VIEW IF EXISTS view_dados_completos;')
    cursor.execute('DROP VIEW IF EXISTS view_socios_completos;')

    # View with translated labels
    cursor.execute('''
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
    ''')
    
    conn.commit()
