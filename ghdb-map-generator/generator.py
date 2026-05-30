import os
import zipfile
import xml.etree.ElementTree as ET
import json
import re

def main():
    zip_path = r'c:\Users\Daniel\Downloads\meu_portfolio_github\exploitdb-main.zip'
    output_dir = r'c:\Users\Daniel\Downloads\meu_portfolio_github\ghdb-map-generator'
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"[*] Acessando arquivo compactado: {zip_path}")
    if not os.path.exists(zip_path):
        print(f"[!] Erro: Arquivo {zip_path} não encontrado.")
        return

    xml_entry_name = 'exploitdb-main/ghdb.xml'
    
    print(f"[*] Extraindo e parseando {xml_entry_name} em memória...")
    try:
        with zipfile.ZipFile(zip_path) as z:
            with z.open(xml_entry_name) as f:
                # Carrega o XML diretamente
                tree = ET.parse(f)
                root = tree.getroot()
    except Exception as e:
        print(f"[!] Erro ao ler XML do arquivo compactado: {e}")
        return

    print("[*] Processando entradas do GHDB...")
    
    # Categorias e contador
    categories_data = {}
    total_dorks = 0
    
    # Mapeamento didático das categorias oficiais para português
    category_explanations = {
        "Footholds": {
            "title_pt": "Pontos de Entrada (Footholds)",
            "desc": "Consultas que identificam sinais iniciais de acesso ou rastros de vulnerabilidades em sistemas.",
            "impact": "Alto",
            "mitigation": "Manter sistemas atualizados e desativar assinaturas públicas de tecnologias nos cabeçalhos de resposta."
        },
        "Files Containing Usernames": {
            "title_pt": "Arquivos contendo Usuários",
            "desc": "Listas de usuários expostas, registros de e-mail ou logs de acessos indexados incorretamente.",
            "impact": "Médio",
            "mitigation": "Aplicar regras estritas de acesso (ACLs) a logs e diretórios administrativos."
        },
        "Sensitive Directories": {
            "title_pt": "Diretórios Sensíveis",
            "desc": "Pastas de servidores que deveriam ser privadas, expondo estruturas internas (Ex: /backup, /admin).",
            "impact": "Alto",
            "mitigation": "Desativar a listagem de diretórios (Directory Browsing) nas configurações do servidor web (Nginx/Apache)."
        },
        "Web Server Detection": {
            "title_pt": "Detecção de Servidor Web",
            "desc": "Informações que revelam a marca, versão e sistema operacional que hospeda o servidor.",
            "impact": "Baixo",
            "mitigation": "Remover ou mascarar cabeçalhos Server e X-Powered-By."
        },
        "Vulnerable Files": {
            "title_pt": "Arquivos Vulneráveis",
            "desc": "Arquivos específicos conhecidos por apresentarem falhas de segurança prontas para exploração.",
            "impact": "Crítico",
            "mitigation": "Realizar auditoria de dependências e aplicar patches de segurança nos componentes do CMS ou framework."
        },
        "Vulnerable Servers": {
            "title_pt": "Servidores Vulneráveis",
            "desc": "Servidores inteiros mal configurados ou rodando versões de softwares expostas a falhas públicas.",
            "impact": "Crítico",
            "mitigation": "Implementar firewalls robustos e realizar scans periódicos de vulnerabilidades externas."
        },
        "Error Messages": {
            "title_pt": "Mensagens de Erro",
            "desc": "Páginas de erro detalhadas que vazam caminhos de arquivos, segredos ou estruturas de queries SQL.",
            "impact": "Médio",
            "mitigation": "Configurar páginas de erro customizadas e desativar o modo de depuração (debug) em ambiente de produção."
        },
        "Files Containing Juicy Info": {
            "title_pt": "Informações Úteis (Juicy Info)",
            "desc": "Arquivos que contêm metadados organizacionais importantes, esquemas de rede ou dados de configuração.",
            "impact": "Médio",
            "mitigation": "Auditar backups e arquivos temporários criados em pastas públicas do servidor."
        },
        "Files Containing Passwords": {
            "title_pt": "Arquivos contendo Senhas",
            "desc": "O pior cenário de vazamento: credenciais expostas em texto limpo, arquivos .env ou chaves SSH privadas.",
            "impact": "Crítico",
            "mitigation": "Armazenar segredos em gerenciadores seguros (Vaults), usar chaves criptográficas fortes e nunca versionar dados sensíveis."
        },
        "Sensitive Online Shopping Info": {
            "title_pt": "Informações de Compras Online",
            "desc": "Vazamentos relacionados a dados de transações, dados cadastrais de clientes ou logs de lojas virtuais.",
            "impact": "Alto",
            "mitigation": "Assegurar conformidade com PCI-DSS e LGPD para criptografia e proteção de dados de pagamentos."
        },
        "Pages Containing Login Portals": {
            "title_pt": "Portais de Login",
            "desc": "Telas de autenticação para sistemas internos, roteadores, bancos de dados ou administração geral.",
            "impact": "Médio",
            "mitigation": "Restringir o acesso a portais administrativos por IP (VPN/Firewall) ou usar políticas rígidas de MFA."
        },
        "Various Online Devices": {
            "title_pt": "Dispositivos Conectados (IoT)",
            "desc": "Painéis de controle expostos de câmeras de segurança, impressoras, termostatos e outros aparelhos IoT.",
            "impact": "Alto",
            "mitigation": "Isolar dispositivos IoT em redes VLAN separadas e alterar todas as credenciais padrão de fábrica."
        },
        "Advisories and Vulnerabilities": {
            "title_pt": "Avisos e Vulnerabilidades",
            "desc": "Alertas oficiais de falhas e correspondências de dorks com vulnerabilidades catalogadas (CVEs).",
            "impact": "Baixo",
            "mitigation": "Acompanhar boletins de segurança de fabricantes de software utilizados na organização."
        }
    }

    # Inicializar as categorias mapeadas
    for cat, meta in category_explanations.items():
        categories_data[cat] = {
            "title_pt": meta["title_pt"],
            "desc": meta["desc"],
            "impact": meta["impact"],
            "mitigation": meta["mitigation"],
            "dorks": []
        }

    # Iterar sobre as entradas do XML
    for entry in root.findall('entry'):
        total_dorks += 1
        
        category = entry.find('category')
        category_name = category.text if category is not None else "Outros"
        
        # Limpar e estruturar a dork
        dork_id = entry.find('id').text if entry.find('id') is not None else ""
        query = entry.find('query').text if entry.find('query') is not None else ""
        desc = entry.find('textualDescription').text if entry.find('textualDescription') is not None else ""
        date = entry.find('date').text if entry.find('date') is not None else ""
        link = entry.find('link').text if entry.find('link') is not None else ""
        
        # Filtrar tags HTML de descrições e dorks
        if query:
            query = re.sub('<[^<]+?>', '', query)
        if desc:
            desc = re.sub('<[^<]+?>', '', desc)
            
        dork_obj = {
            "id": dork_id,
            "query": query,
            "desc": desc,
            "date": date,
            "link": link
        }
        
        # Se a categoria for desconhecida, adiciona ao Outros temporariamente
        if category_name not in categories_data:
            categories_data[category_name] = {
                "title_pt": category_name,
                "desc": "Categoria adicional identificada na base de dados.",
                "impact": "Variável",
                "mitigation": "Auditar as consultas correspondentes.",
                "dorks": []
            }
            
        categories_data[category_name]["dorks"].append(dork_obj)

    # Ordenar as dorks por data (mais recentes primeiro)
    for cat in categories_data:
        categories_data[cat]["dorks"].sort(key=lambda x: x["date"], reverse=True)

    # Para manter o payload leve no browser, geramos:
    # 1. ghdb_summary.json com estatísticas e explicações conceituais + apenas as top 20 dorks mais recentes de cada categoria
    # 2. Opcionalmente todo o dataset se o usuário quiser, mas 5.5MB de JSON bruto é muito. Vamos exportar um resumo com as top 30 por categoria para visualização inicial dinâmica.
    
    summary_data = {
        "total_dorks": total_dorks,
        "categories": {}
    }
    
    for cat, data in categories_data.items():
        summary_data["categories"][cat] = {
            "title_pt": data["title_pt"],
            "desc": data["desc"],
            "impact": data["impact"],
            "mitigation": data["mitigation"],
            "count": len(data["dorks"]),
            "dorks_sample": data["dorks"][:30] # Limitar a 30 dorks no resumo para agilizar o carregamento
        }
        
    # Escrever arquivo JS de dados para ser lido localmente direto no index.html sem necessidade de servidor web (contornando CORS)
    js_output_path = os.path.join(output_dir, 'ghdb_data.js')
    with open(js_output_path, 'w', encoding='utf-8') as f:
        f.write("const GHDB_DATA = ")
        json.dump(summary_data, f, ensure_ascii=False, indent=2)
        f.write(";")
        
    print(f"[+] Arquivo de dados consolidado salvo em: {js_output_path}")
    print(f"[+] Total de Dorks processadas: {total_dorks}")
    
if __name__ == '__main__':
    main()
