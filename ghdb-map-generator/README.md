# GHDB Map Generator & Explorer

Este subprojeto é um processador de dados e visualizador interativo projetado para o portfólio pessoal, com foco em demonstrar habilidades em **Engenharia de Dados (ETL) com Python** e **Desenvolvimento de Interfaces Modernas e Responsivas**.

O objetivo da ferramenta é mapear a estrutura de categorias do **Google Hacking Database (GHDB)** hospedado pelo Exploit-DB, oferecendo explicações didáticas em português sobre como essas consultas de busca avançada (*Google Dorks*) expõem ativos na web e como os administradores de sistemas podem se defender.

## 🛠️ Arquitetura e Fluxo de Execução

O fluxo de dados da aplicação funciona de forma offline e altamente otimizada:

```
[exploitdb-main.zip] (Base Oficial)
        │
        ▼ (Extração em memória com zipfile)
 [exploitdb-main/ghdb.xml] (XML de 5.5MB)
        │
        ▼ (Parsing & Normalização com ElementTree)
     [generator.py] (Script de Consolidação em Python)
        │
        ├──► [ghdb_data.js] (JSON compactado com as TOP 30 Dorks por categoria)
        └──► [index.html] (Painel estático com explicações e buscador JS)
```

1. **Leitura e Extração:** O script `generator.py` lê diretamente o arquivo compactado `exploitdb-main.zip`, extraindo o arquivo estruturado XML `ghdb.xml` de 5.5MB sem a necessidade de descompactar toda a base em disco.
2. **Parsing Estruturado:** Utilizando a biblioteca nativa `xml.etree.ElementTree`, o Python realiza a análise de mais de 7.900 entradas, removendo tags HTML indesejadas e limpando as consultas de pesquisa.
3. **Agrupamento e Ordenação:** As dorks são categorizadas de acordo com as 14 classificações oficiais do Exploit-DB, ordenadas por data de publicação para destacar as descobertas mais recentes.
4. **Otimização de Payload:** Para evitar o carregamento lento de um JSON de 5.5MB no navegador do usuário, o Python gera um arquivo de resumo altamente condensado contendo estatísticas de contagem e as 30 dorks mais recentes de cada classe.
5. **Dashboard Estático:** O arquivo `index.html` carrega os dados locais através do script injetado `ghdb_data.js` de forma assíncrona, prevenindo problemas de CORS e permitindo que o painel seja executado em qualquer ambiente sem necessidade de iniciar um servidor web.

## 🚀 Como Executar o Gerador

Para processar o arquivo XML e gerar o painel estático atualizado:

1. Certifique-se de ter o arquivo compactado `exploitdb-main.zip` no diretório raiz do repositório.
2. Navegue até este subdiretório e execute o script gerador com Python:

```powershell
python generator.py
```

O script irá gerar instantaneamente o arquivo `ghdb_data.js` consolidado. Depois disso, basta abrir o arquivo `index.html` diretamente em seu navegador web de preferência.

## 🛡️ Foco em Segurança Defensiva e LGPD

Diferente de ferramentas de busca ativa de falhas, este painel serve a propósitos de conscientização de segurança:
* **Mitigação Didática:** Cada categoria inclui instruções claras de remediação, como configurações de cabeçalhos de servidor (Ex: desabilitar cabeçalho `Server`), manipulação de indexação (`robots.txt`, tags `noindex`) e boas práticas de armazenamento de credenciais.
* **Uso Ético:** As amostras expostas no painel servem para que administradores de sistemas auditem seus próprios nomes de domínio na internet pública, corrigindo vazamentos de informação de forma proativa.
