#!/usr/bin/env python3
"""Script para verificar dados do Simples/MEI no banco SQLite"""
import sqlite3

DB_FILE = "dados_cnpj_belem_ativo.db"

conn = sqlite3.connect(DB_FILE)

print("=== TABELAS ===")
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
for t in tables:
    print(f"  - {t[0]}")

print("\n=== CONTAGEM SIMPLES_MEI ===")
count = conn.execute("SELECT COUNT(*) FROM simples_mei").fetchone()[0]
print(f"Total de registros: {count}")

print("\n=== ESTRUTURA SIMPLES_MEI ===")
pragma = conn.execute("PRAGMA table_info(simples_mei)").fetchall()
for col in pragma:
    print(f"  {col[1]} ({col[2]})")

print("\n=== AMOSTRA DE DADOS ===")
sample = conn.execute("SELECT * FROM simples_mei LIMIT 5").fetchall()
for row in sample:
    print(f"  {row}")

print("\n=== ESTATÍSTICAS MEI ===")
mei_stats = conn.execute("""
    SELECT 
        opcao_pelo_mei,
        COUNT(*) as total
    FROM simples_mei
    GROUP BY opcao_pelo_mei
""").fetchall()
for stat in mei_stats:
    print(f"  Opção MEI '{stat[0]}': {stat[1]}")

print("\n=== MEIs ATIVOS (data_exclusao vazio/null) ===")
mei_ativo_count = conn.execute("""
    SELECT COUNT(*) FROM simples_mei 
    WHERE opcao_pelo_mei = 'S' 
    AND (data_exclusao_mei = '00000000' OR data_exclusao_mei IS NULL OR data_exclusao_mei = '')
""").fetchone()[0]
print(f"Total MEIs ativos: {mei_ativo_count}")

print("\n=== ESTATÍSTICAS SIMPLES ===")
simples_stats = conn.execute("""
    SELECT 
        opcao_pelo_simples,
        COUNT(*) as total
    FROM simples_mei
    GROUP BY opcao_pelo_simples
""").fetchall()
for stat in simples_stats:
    print(f"  Opção Simples '{stat[0]}': {stat[1]}")

conn.close()
print("\n=== FIM ===")
