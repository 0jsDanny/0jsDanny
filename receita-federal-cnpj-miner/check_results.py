import sqlite3

conn = sqlite3.connect('dados_cnpj_belem_ativo.db')
c = conn.cursor()

print("=== RESUMO DA MIGRAÇÃO ===")

c.execute('SELECT COUNT(*) FROM estabelecimentos')
print(f"Estabelecimentos: {c.fetchone()[0]:,}")

c.execute('SELECT COUNT(*) FROM empresas')
print(f"Empresas: {c.fetchone()[0]:,}")

c.execute('SELECT COUNT(*) FROM socios')
print(f"Sócios: {c.fetchone()[0]:,}")

c.execute('SELECT COUNT(*) FROM simples_mei')
print(f"Registros Simples/MEI: {c.fetchone()[0]:,}")

c.execute('SELECT COUNT(*) FROM view_dados_completos WHERE eh_mei_ativo = 1')
print(f"MEIs Ativos: {c.fetchone()[0]:,}")

c.execute('SELECT COUNT(DISTINCT bairro_normalizado) FROM estabelecimentos WHERE bairro_normalizado IS NOT NULL')
print(f"Bairros Normalizados Únicos: {c.fetchone()[0]}")

c.execute('SELECT COUNT(*) FROM estabelecimentos WHERE bairro_normalizado IS NULL')
print(f"Estabelecimentos sem bairro normalizado: {c.fetchone()[0]:,}")

print("\n=== TOP 10 BAIRROS ===")
c.execute('''
    SELECT bairro_normalizado, COUNT(*) as total 
    FROM estabelecimentos 
    WHERE bairro_normalizado IS NOT NULL 
    GROUP BY bairro_normalizado 
    ORDER BY total DESC 
    LIMIT 10
''')
for row in c.fetchall():
    print(f"  {row[0]}: {row[1]:,}")

conn.close()
