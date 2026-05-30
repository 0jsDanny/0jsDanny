# 📊 CISC Belém — Pipelines e Análise de Dados (Clima e Saúde)

Este diretório contém a arquitetura lógica, os esquemas de banco de dados e os scripts analíticos desenvolvidos para o **Centro de Informação em Saúde e Clima (CISC) de Belém**.

---

## 🔒 Conformidade LGPD e Proteção de Dados Epidemiológicos

> [!IMPORTANT]
> Em estrita observância à Lei Geral de Proteção de Dados (LGPD) e regras de sigilo sanitário municipal, **o banco de dados relacional populado (`cisc_health.db`) e os arquivos brutos de notificação do SINAN/DDA foram deliberadamente omitidos deste repositório público.**
> 
> As estruturas lógicas, consultas SQL e modelos analíticos disponibilizados aqui operam sobre esta especificação de dados, podendo ser replicados em ambientes restritos governamentais ou utilizando dados sintéticos/mocados.

---

## 📁 Estrutura dos Arquivos

### 🗄️ Esquemas de Banco de Dados
*   **[cisc_health_schema.sql](./cisc_health_schema.sql)**: Esquema de tabelas DDL otimizado para produção em **PostgreSQL + PostGIS**, projetado para conter dados espaciais de distritos, bairros, além de séries de clima e saúde.
*   **[cisc_health_sqlite.sql](./cisc_health_sqlite.sql)**: Esquema DDL traduzido e adaptado para **SQLite**, utilizado no ambiente de desenvolvimento local e prototipagem rápida.

### ⚙️ Engenharia e Ingestão de Dados (ETL)
*   **[etl_clima.py](./etl_clima.py)**: Pipeline Python que automatiza a ingestão de fontes ambientais críticas para Belém:
    *   Previsões de chuva, ventos e ondas do **CPTEC/INPE**.
    *   Dados em tempo real de pluviômetros do **CEMADEN**.
    *   Boletins de estações automáticas do **INMET**.
    *   Previsões de maré da **Marinha do Brasil** (fator de risco crucial em Belém devido à confluência de marés altas e temporais).
*   **[etl_pipeline.py](./etl_pipeline.py)**: Pipeline de higienização e ingestão das fichas epidemiológicas do SINAN (Dengue, Leptospirose, SRAG) e planilhas semanais de Doenças Diarreicas Agudas (DDA), convertendo planilhas e relatórios legados do SUS em registros relacionais estruturados.

### 🧠 Estatística e Modelagem Preditiva
*   **[correlation_analytics.py](./correlation_analytics.py)**: Motor analítico do CISC. Realiza análises estatísticas para encontrar a relação causal entre clima e saúde:
    *   Correlação cruzada de Spearman com cálculo de lag (atraso de semanas entre o pico de chuva e o pico de internações de leptospirose, ou calor vs. dengue).
    *   Regressão logística e algoritmos de detecção estatística de anomalias (como **CUSUM**), usados para sinalizar quando o volume de atendimentos de triagem em UBS/UPAs excede o limite endêmico esperado.
*   **[visualizations.py](./visualizations.py)**: Script que lê as tabelas consolidadas de clima e saúde do banco de dados e gera relatórios interativos avançados (gráficos temporais, canais endêmicos e matrizes de correlação).
