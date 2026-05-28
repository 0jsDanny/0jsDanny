# 📊 Catálogo Simplificado do FTP CPTEC/INPE
> **Domínio:** [ftp.cptec.inpe.br](https://ftp.cptec.inpe.br/)
> 
> Este guia traduz o "tecniquês" e mapeia a estrutura de arquivos e pastas do servidor de dados do Centro de Previsão de Tempo e Estudos Climáticos (CPTEC/INPE). Ele ajuda desenvolvedores e pesquisadores a entenderem o que há em cada diretório e onde encontrar dados úteis de meteorologia, satélites e clima.

---

## 🗺️ Visão Geral dos Diretórios Raiz

| Pasta | Nome Técnico | O que realmente contém (Simplificado) | Exemplos de Dados |
| :--- | :--- | :--- | :--- |
| [`avalia/`](#avalia) | Avaliação de Modelos | Arquivos para validar a precisão dos modelos meteorológicos. | Saídas de teste e códigos de validação. |
| [`bdados/`](#bdados) | Banco de Dados | Dados históricos consolidados de estações meteorológicas automáticas (EMA). | Arquivos compactados de medições anuais (2019-2025). |
| [`chuva/`](#chuva) | Projeto CHUVA | Experimentos científicos sobre formação de nuvens e microfísica da precipitação. | Dados de radares locais, disdrômetros e balões meteorológicos. |
| [`clima/`](#clima) | Climatologia | Relatórios e medições de longo prazo (El Niño, temperatura do mar, anomalias). | Boletins informativos, dados do INMET e projeções mensais. |
| [`dbnet/`](#dbnet) | Direct Broadcast Network | Softwares e dados brutos de satélites de órbita polar recebidos em tempo real. | Pacotes de calibração para NOAA e MetOp. |
| [`distribuicao/`](#distribuicao) | Distribuição de Produtos | Dados meteorológicos consolidados prontos para consumo externo. | Imagens de satélite GOES, dados de radar compilados e chuva acumulada. |
| [`goes/`](#goes) | Satélites GOES | Arquivos dos satélites geoestacionários GOES (do histórico GOES-8 até o moderno GOES-19). | Imagens retangulares, vento, radiação solar e detecção de raios. |
| [`modelos/`](#modelos) | Modelos Numéricos | Previsões numéricas geradas por supercomputadores (BAM, Eta, WRF, BRAMS, MONAN). | Saídas diárias de previsão de tempo, umidade e vento. |
| [`ncep/`](#ncep) | NCEP (UV e Ozônio) | Dados de radiação ultravioleta e perfil da camada de ozônio para a América Latina. | Gráficos de índice UV (IUV) por cidade. |
| [`nowcasting/`](#nowcasting) | Nowcasting (Curtíssimo Prazo) | Previsões de tempo imediatas (próximas 0 a 2 horas) com foco em tempestades e raios. | Dados de descargas elétricas e modelos de curtíssimo prazo. |
| [`oceano/`](#oceano) | Oceanografia Satelitária | Medições de temperatura da superfície do mar e ventos nos oceanos. | Dados obtidos via satélites de órbita (MetOp, Oceansat, Aqua). |
| [`pesquisa/`](#pesquisa) | Pesquisa e Desenvolvimento | Códigos-fonte, scripts, manuais e dados brutos de projetos experimentais. | Códigos de modelos (BRAMS/MONAN), simulações e dados de pesquisadores. |
| [`rainfall/`](#rainfall) | Estimativas de Precipitação | Dados consolidados de chuva baseados em múltiplos satélites e algoritmos. | Estimativas horárias de chuva para a América Latina (IMERG/GPM). |

---

## 🔍 Detalhamento das Pastas (Desmistificando o Tecniquês)

<a id="avalia"></a>
### 1. `avalia/` (Avaliação)
* **O que é:** Ferramentas e logs para verificar se as previsões do computador bateram com a realidade (validação de modelos).
* **Estrutura interna:** Contém subpastas como `CTW/`, `energetica/`, `jacaranda/` e `saveiro/`, que se referem a projetos internos de validação de balanço de energia e radiação.

<a id="bdados"></a>
### 2. `bdados/` (Banco de Dados)
* **O que é:** Repositório de dados consolidados de observações em superfície.
* **Principais Arquivos:** Arquivos `ema_2019.tgz` até `ema_2025.tgz`. 
  * **Traduzindo:** **EMA** significa **Estação Meteorológica Automática**. Estes arquivos contêm as leituras físicas reais (temperatura, umidade, pressão, vento, chuva) de centenas de estações espalhadas pelo Brasil, consolidadas ano a ano.

<a id="chuva"></a>
### 3. `chuva/` (Projeto CHUVA)
* **O que é:** O projeto "CHUVA" foi uma campanha de campo que estudou a física de formação das nuvens e chuvas em diferentes regiões do Brasil.
* **Subpastas por Campanha Regional:**
  * `alcantara/`, `belem/`, `fortaleza/`, `goamazon/` (Manaus), `santa_maria/`, `soschuva/` (Campinas).
* **Jargon e Equipamentos:**
  * **Disdrômetro (Disdrometer):** Equipamento que mede o tamanho e a velocidade de queda das gotas de chuva.
  * **X-Band Radar:** Radar móvel de altíssima resolução para acompanhar nuvens de tempestade de perto.
  * **Radiosondes:** Balões meteorológicos soltos na atmosfera para medir pressão e umidade em altitude.

<a id="clima"></a>
### 4. `clima/` (Climatologia)
* **O que é:** Monitoramento do clima em escala global e nacional (mensal/sazonal), olhando para o comportamento histórico.
* **Destaques:**
  * `boletins/elnino2026/`: Relatórios de monitoramento do fenômeno El Niño e La Niña.
  * `nota_tecnica/`: Documentos formais explicando anomalias climáticas extremas (secas ou excesso de chuvas).
  * `sst_conference/`: Imagens de anomalia de temperatura da superfície do mar (**SST** - *Sea Surface Temperature*). Se a água do mar estiver muito quente, isso altera todo o regime de chuvas.

<a id="dbnet"></a>
### 5. `dbnet/` (Direct Broadcast Network)
* **O que é:** Softwares e scripts para processar e calibrar dados brutos recebidos diretamente de satélites polares quando eles passam sobre as antenas receptoras no Brasil.
* **Jargon:**
  * **AAPP e CSPP:** São pacotes de software internacionais usados para processar dados de satélites das séries NOAA, Suomi-NPP e MetOp.
  * **atovs / iasi / cris / atms:** Sensores (radiômetros e espectrômetros) acoplados aos satélites que medem temperatura e umidade em diferentes camadas da atmosfera (sondagem atmosférica).

<a id="distribuicao"></a>
### 6. `distribuicao/` (Distribuição Geral)
* **O que é:** Uma das pastas mais úteis para desenvolvedores externos. Reúne arquivos processados prontos para uso comercial, aplicativos ou pesquisa.
* **Destaques:**
  * `GOES_FD/`: Arquivos NetCDF (`.nc`) contendo imagens do disco completo (**FD** - *Full Disk*) do satélite GOES-16.
  * `Alan/`: Séries temporais de chuva horária observada no Brasil.
  * `RADAR/`: Dados históricos consolidados de radares meteorológicos nacionais (2018 a 2024).

<a id="goes"></a>
### 7. `goes/` (Satélites Geoestacionários)
* **O que é:** Imagens e dados derivados dos satélites meteorológicos que ficam "parados" sobre o equador monitorando as Américas.
* **Modelos:** Do histórico `goes8` ao atual satélite operacional principal `goes16` (e o recém-lançado `goes19`).
* **Principais Produtos Internos:**
  * **`glm/` (Geostationary Lightning Mapper):** Sensor do satélite que detecta flashes de raios em tempo real.
  * **`fortracc/` (Forecasting and Tracking of Active Convective Systems):** Algoritmo que rastreia nuvens de tempestade para prever para onde elas vão se mover nos próximos minutos.
  * **`nevoeiro/`:** Imagens tratadas que destacam a presença de neblina de manhã cedo.
  * **`rad_solar/`:** Estimativa de quanta energia solar está chegando ao chão (útil para energia fotovoltaica).

<a id="modelos"></a>
### 8. `modelos/` (Previsão de Tempo Computacional)
* **O que é:** O coração da previsão do tempo numérica. São simulações físicas que rodam no supercomputador do INPE.
* **Subpastas principais:**
  * `tempo/`: Previsões de curto e médio prazo.
  * `produtos/`: Gráficos e tabelas prontos para exibição.
* **O dicionário dos modelos:**
  * 🌐 **BAM (Brazilian Global Atmospheric Model):** O modelo global desenvolvido no Brasil. Simula o planeta inteiro.
  * 🇧🇷 **BRAMS (Brazilian Regional Atmospheric Modeling System):** Modelo focado na América do Sul, excelente para prever fumaça de queimadas e chuvas regionais.
  * 🗺️ **Eta:** Modelo regional tradicional do CPTEC, rodado sobre grades de alta resolução para prever relevos e microclimas.
  * 🌪️ **WRF (Weather Research and Forecasting):** Modelo de mesoescala internacional muito usado para previsões locais de alta precisão.
  * 🚀 **MONAN (Model for Ocean-Land-Atmosphere Prediction):** O novíssimo modelo unificado de próxima geração que o INPE está desenvolvendo para substituir os anteriores.
  * 📊 **MERGE:** Um algoritmo do CPTEC que junta a estimativa de chuva por satélite com a chuva real medida nos pluviômetros terrestres para gerar o mapa de chuva mais realístico possível.

<a id="ncep"></a>
### 9. `ncep/` (Ozônio e Ultravioleta)
* **O que é:** Arquivos focados em radiação solar nociva.
* **Destaques:**
  * `conteudo_oz/`: Concentração de ozônio na atmosfera.
  * `graficoiuv_.../`: Gráficos com as curvas do Índice Ultravioleta máximo diário para capitais da América Latina (ex: Belém, Brasília, Buenos Aires).

<a id="nowcasting"></a>
### 10. `nowcasting/` (Previsão Imediata)
* **O que é:** Ferramentas de previsão de curtíssimo prazo (segurança contra desastres naturais).
* **Destaques:**
  * `RAIOS/`: Arquivos JSON em tempo real atualizados a cada 5 minutos contendo a geolocalização e intensidade de descargas elétricas (raios) no Brasil.
  * `LightningCast/`: Imagens que mostram a probabilidade de ocorrência de raios em nuvens que estão se desenvolvendo.

<a id="oceano"></a>
### 11. `oceano/` (Oceanografia e Ventos)
* **O que é:** Monitoramento dos oceanos usando satélites meteorológicos e radares orbitais.
* **Jargon:**
  * **TSM (Temperatura da Superfície do Mar):** Indica a energia térmica disponível no mar.
  * **VSM (Velocidade e Direção do Vento sobre o Mar):** Medido usando sensores ativos de micro-ondas (espalhometros) que detectam o "rugido" das ondas. Satélites comuns aqui: *HY-2B/C/D* e *Oceansat*.

<a id="pesquisa"></a>
### 12. `pesquisa/` (Desenvolvimento Científico)
* **O que é:** Onde os cientistas e meteorologistas do INPE guardam seus códigos e rodadas de teste.
* **Pastas interessantes:**
  * `SisMOM/`: Sistema de Modelagem de Ondas do INPE (previsão de ressaca e agitação marítima).
  * `oceanwave/`: Códigos de modelagem física de ondas de vento para as praias brasileiras.

<a id="rainfall"></a>
### 13. `rainfall/` (Chuva por Satélite)
* **O que é:** Compilações exclusivas de volume de chuva acumulado.
* **Destaques:**
  * `pyForTraCC_IMERG_FinalRun/`: Histórico de precipitação do satélite GPM (NASA/JAXA) processado pelo algoritmo do INPE para identificar e rastrear sistemas de chuva ano a ano.

---

## 📖 Dicionário de Sobrevivência (Acrônimos e Siglas)

* **EMA:** Estação Meteorológica Automática (plataformas físicas terrestres que registram o clima local).
* **IUV:** Índice Ultravioleta (escala de 1 a 11+ indicando a intensidade de radiação UV nociva à pele).
* **SST / TSM:** *Sea Surface Temperature* / Temperatura da Superfície do Mar (essencial para prever ciclones e El Niño).
* **NetCDF (`.nc`):** Formato de arquivo binário padrão em geociências usado para armazenar dados multidimensionais (ex: temperatura por latitude, longitude e altitude).
* **GLM:** *Geostationary Lightning Mapper* (sensor espacial que captura o flash dos raios).
* **MONAN:** Modelo de previsão brasileiro de próxima geração, projetado para supercomputadores modernos.
* **GRIB / GRIB2:** Formato binário compacto otimizado para distribuir saídas de modelos numéricos de previsão do tempo.

---

## 🌳 Estrutura Completa de Diretórios (Pastas e Subpastas)

Abaixo está o mapeamento lógico completo gerado recursivamente a partir do servidor FTP. Subpastas contendo datas/anos repetitivos foram agrupadas em `[Dados Temporais]` para facilitar a visualização.

```text
├── avalia/
│   ├── avalia/
│   │   ├── /avalia/
│   │   ├── CTW/
│   │   ├── energetica/
│   │   ├── examples/
│   │   ├── jacaranda/
│   │   ├── samples/
│   │   ├── saveiro/
├── bdados/
│   ├── web/
│   │   ├── /bdados/
│   │   ├── coverage/
│   │   ├── monitor/
├── chuva/
│   ├── WEB-INF/
│   │   ├── /chuva/
│   ├── alcantara/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── model/
│   │   ├── satelite/
│   │   ├── satellite/
│   ├── belem/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── model/
│   │   ├── satellite/
│   ├── fortaleza/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── model/
│   │   ├── satellite/
│   ├── glm_vale_paraiba/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── satellite/
│   ├── goamazon/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── model/
│   │   ├── satellite/
│   ├── goamazon2iop/
│   │   ├── /chuva/
│   │   ├── experimental/
│   ├── mega_cidades/
│   │   ├── /chuva/
│   │   ├── experimental/
│   ├── pesquisa/
│   │   ├── /chuva/
│   │   ├── JAS2020/
│   │   ├── JGR2021/
│   ├── read_me/
│   │   ├── /chuva/
│   │   ├── alcantara/
│   │   ├── belem/
│   │   ├── fortaleza/
│   │   ├── glm_vale_paraiba/
│   │   ├── goamazon/
│   │   ├── mega_cidades/
│   │   ├── santa_maria/
│   │   ├── satelite/
│   │   ├── sos_chuva/
│   ├── relampago_sao_borja/
│   │   ├── /chuva/
│   │   ├── Electric_Field_Mill_Brazil/
│   │   ├── GPS_receiver_Brazil/
│   │   ├── Lightning_data_Brazil/
│   │   ├── Micro_Rain_Radar_Brazil/
│   │   ├── OTT_Parsivel_disdrometer_Brazil/
│   │   ├── RD80_disdrometer_Brazil/
│   │   ├── Radiosondes_Brazil/
│   │   ├── Surface_stations_Brazil/
│   │   ├── X-Band_Radar_Brazil/
│   ├── reprocessamento/
│   │   ├── /chuva/
│   │   ├── GoAmazon_iop2/
│   │   ├── soschuva/
│   ├── santa_maria/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── satelite/
│   ├── soschuva/
│   │   ├── /chuva/
│   │   ├── experimental/
│   │   ├── model/
│   ├── transfer/
│   │   ├── /chuva/
│   │   ├── CAFE/
│   │   ├── LONTRAS/
│   │   ├── NEB_TRACKING/
│   │   ├── dados_RS/
├── clima/
│   ├── INMET/
│   │   ├── /clima/
│   │   ├── analises/
│   │   ├── scripts/
│   ├── Modelos_Numericos/
│   │   ├── /clima/
│   │   ├── BAM1.2/
│   ├── MultiModelo/
│   │   ├── /clima/
│   │   ├── binctl/
│   │   ├── figuras/
│   ├── atendimento/
│   │   ├── /clima/
│   │   ├── AlexAlmeida/
│   │   ├── CaioCoelho/
│   │   ├── GuilhermeMartins/
│   │   ├── GustavoSilva/
│   │   ├── LivioMartins/
│   │   ├── ManoelGan/
│   │   ├── MultiModel/
│   │   ├── RamonBicudo/
│   ├── boletins/
│   │   ├── /clima/
│   │   ├── elnino2026/
│   ├── dados/
│   │   ├── /clima/
│   │   ├── prec/
│   ├── misc_GPT/
│   │   ├── /clima/
│   │   ├── 202301/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202302/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202303/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202304/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202305/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202306/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202307/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202308/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202309/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202310/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202311/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202312/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202401/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202402/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202403/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202404/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202405/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202406/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202407/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202408/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202409/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202410/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202411/ [Dados Temporais: Ano/Mês/Dia]
│   ├── nota_tecnica/
│   │   ├── /clima/
│   │   ├── 2022/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2023/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2024/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2025/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2026/ [Dados Temporais: Ano/Mês/Dia]
│   ├── pldsdias/
│   │   ├── /clima/
│   ├── sst_conference/
│   │   ├── /clima/
│   │   ├── DT300/
├── dbnet/
│   ├── install_aapp/
│   │   ├── /dbnet/
│   ├── install_cspp/
│   │   ├── /dbnet/
│   ├── metopb/
│   │   ├── /dbnet/
│   │   ├── atovs/
│   │   ├── iasi/
│   ├── metopc/
│   │   ├── /dbnet/
│   │   ├── atovs/
│   │   ├── iasi/
│   ├── noaa18/
│   │   ├── /dbnet/
│   │   ├── atovs/
│   ├── noaa19/
│   │   ├── /dbnet/
│   │   ├── atovs/
│   ├── noaa20/
│   │   ├── /dbnet/
│   │   ├── atms/
│   │   ├── cris/
│   ├── npp/
│   │   ├── /dbnet/
│   │   ├── CBA/
│   │   ├── CPT/
│   ├── snpp/
│   │   ├── /dbnet/
│   │   ├── atms/
│   │   ├── cris/
├── distribuicao/
│   ├── AQUA/
│   │   ├── /distribuicao/
│   ├── Alan/
│   │   ├── /distribuicao/
│   ├── CSPP/
│   │   ├── /distribuicao/
│   ├── Demmily/
│   │   ├── /distribuicao/
│   ├── GOES_FD/
│   │   ├── /distribuicao/
│   ├── HRPT/
│   │   ├── /distribuicao/
│   ├── RADAR/
│   │   ├── /distribuicao/
│   ├── dbnet/
│   │   ├── /distribuicao/
│   │   ├── AAPP/
├── goes/
│   ├── ats/
│   │   ├── /goes/
│   │   ├── ats_web/
│   ├── goes10/
│   │   ├── /goes/
│   │   ├── bruto/
│   │   ├── class_nuvem_web/
│   │   ├── dg_eletrica/
│   │   ├── fortracc_web/
│   │   ├── hidro_web/
│   │   ├── hidroest/
│   │   ├── insolacao/
│   │   ├── mapa_risco_web/
│   │   ├── nevoeiro/
│   │   ├── rad_sol_web/
│   │   ├── retangular_4km/
│   │   ├── vento/
│   │   ├── web/
│   ├── goes12/
│   │   ├── /goes/
│   │   ├── bruto/
│   │   ├── goes12_web/
│   │   ├── goes_prim2/
│   │   ├── hidro_web/
│   │   ├── hidroest/
│   │   ├── nevoeiro/
│   │   ├── rad_solar/
│   │   ├── retangular_4km/
│   │   ├── vento/
│   ├── goes13/
│   │   ├── /goes/
│   │   ├── bruto/
│   │   ├── class_nuvem_web/
│   │   ├── class_nuvens/
│   │   ├── dg_eletrica/
│   │   ├── fortracc_web/
│   │   ├── goes13_web/
│   │   ├── hidro_web/
│   │   ├── hidroest/
│   │   ├── insolacao/
│   │   ├── rad_sol_web/
│   │   ├── rad_solar/
│   │   ├── retangular_1km/
│   │   ├── retangular_4km/
│   │   ├── vento/
│   ├── goes16/
│   │   ├── /goes/
│   │   ├── class_nuvens/
│   │   ├── fortracc/
│   │   ├── glm/
│   │   ├── goes16_web/
│   │   ├── hidroest/
│   │   ├── level2_noaa/
│   │   ├── nevoeiro/
│   │   ├── rad_solar/
│   │   ├── retangular/
│   │   ├── rgb/
│   │   ├── sanduiche/
│   │   ├── vento/
│   ├── goes19/
│   │   ├── /goes/
│   │   ├── broadcast/
│   │   ├── class_nuvens/
│   │   ├── fortracc/
│   │   ├── goes19_gnc/
│   │   ├── goes19_web/
│   │   ├── hidroest/
│   │   ├── level2_noaa/
│   │   ├── nevoeiro/
│   │   ├── rad_solar/
│   │   ├── retangular/
│   │   ├── rgb/
│   │   ├── tathu-databases/
│   │   ├── vento/
│   ├── goes8/
│   │   ├── /goes/
│   │   ├── goes8_web/
│   │   ├── goes_prim2/
├── modelos/
│   ├── produtos/
│   │   ├── /modelos/
│   │   ├── BAM/
│   │   ├── BRAMS/
│   │   ├── Eta/
│   │   ├── GFS/
│   │   ├── Modelos/
│   │   ├── WRF/
│   │   ├── avaliacao/
│   │   ├── broadcast/
│   │   ├── curso_OMM_INPE_2025/
│   │   ├── parceiros/
│   │   ├── tabelas/
│   ├── tempo/
│   │   ├── /modelos/
│   │   ├── BAM/
│   │   ├── BRAMS/
│   │   ├── CRNG/
│   │   ├── Eta/
│   │   ├── MERGE/
│   │   ├── OENSMB09/
│   │   ├── SAMeT/
│   │   ├── SMEC/
│   │   ├── WRF/
│   │   ├── WWatch/
├── ncep/
│   ├── radiacao_uv/
│   │   ├── /ncep/
│   │   ├── conteudo_oz/
│   │   ├── conteudo_oz_bin/
│   │   ├── conteudo_oz_nc/
│   │   ├── graficoiuv_aracaju/
│   │   ├── graficoiuv_arequipa/
│   │   ├── graficoiuv_arica/
│   │   ├── graficoiuv_assuncao/
│   │   ├── graficoiuv_belem/
│   │   ├── graficoiuv_belo_horizonte/
│   │   ├── graficoiuv_boa_vista/
│   │   ├── graficoiuv_bogota/
│   │   ├── graficoiuv_brasilia/
│   │   ├── graficoiuv_buenosaires/
│   │   ├── graficoiuv_caiena/
│   │   ├── graficoiuv_cali/
│   │   ├── graficoiuv_campo_grande/
│   │   ├── graficoiuv_caracas/
│   │   ├── graficoiuv_cartagena/
│   │   ├── graficoiuv_cuiaba/
│   │   ├── graficoiuv_curitiba/
│   │   ├── graficoiuv_cusco/
│   │   ├── graficoiuv_florianopolis/
│   │   ├── graficoiuv_fortaleza/
│   │   ├── graficoiuv_georgetown/
│   │   ├── graficoiuv_goiania/
│   │   ├── graficoiuv_guayaquil/
│   │   ├── graficoiuv_huancayo/
│   │   ├── graficoiuv_joao_pessoa/
│   │   ├── graficoiuv_lapaz/
│   │   ├── graficoiuv_laquiaca/
│   │   ├── graficoiuv_lima/
│   │   ├── graficoiuv_macapa/
│   │   ├── graficoiuv_maceio/
│   │   ├── graficoiuv_manaus/
│   │   ├── graficoiuv_mendonza/
│   │   ├── graficoiuv_montevideu/
│   │   ├── graficoiuv_natal/
│   │   ├── graficoiuv_palmas/
│   │   ├── graficoiuv_paramaribo/
│   │   ├── graficoiuv_porto_alegre/
│   │   ├── graficoiuv_porto_velho/
│   │   ├── graficoiuv_quito/
│   │   ├── graficoiuv_recife/
│   │   ├── graficoiuv_rio_branco/
│   │   ├── graficoiuv_rj/
│   │   ├── graficoiuv_salvador/
│   │   ├── graficoiuv_santiago/
│   │   ├── graficoiuv_sao_luiz/
│   │   ├── graficoiuv_sp/
│   │   ├── graficoiuv_stacruzlasierra/
│   │   ├── graficoiuv_teresina/
│   │   ├── graficoiuv_valdivia/
│   │   ├── graficoiuv_vitoria/
│   │   ├── iuv_inst_atenuado/
│   │   ├── iuv_inst_atenuado_bin/
│   │   ├── iuv_inst_atenuado_nc/
│   │   ├── iuv_inst_snuvem/
│   │   ├── iuv_inst_snuvem_bin/
│   │   ├── iuv_inst_snuvem_nc/
│   │   ├── iuv_max_snuvens/
│   │   ├── iuv_max_snuvens_bin/
│   │   ├── iuv_max_snuvens_nc/
├── nowcasting/
│   ├── DADOS/
│   │   ├── /nowcasting/
│   │   ├── MONAN/
│   │   ├── previsoes/
│   │   ├── radar_volumetrico/
│   │   ├── velocidade_radial/
│   ├── LightningCast/
│   │   ├── /nowcasting/
│   │   ├── png/
│   │   ├── png_sp/
│   ├── MONAN_figuras/
│   │   ├── /nowcasting/
│   │   ├── MONAN/
│   │   ├── MONAN_10km/
│   │   ├── MONAN_3km/
│   │   ├── sondagens/
│   ├── OUTPUT/
│   │   ├── /nowcasting/
│   │   ├── LOG/
│   │   ├── TMP/
│   │   ├── tathu_db/
│   │   ├── tathu_geo_diag/
│   │   ├── tathu_geo_prog/
│   │   ├── tathu_web/
│   │   ├── tathu_web_prev030/
│   │   ├── tathu_web_prev060/
│   │   ├── tathu_web_prev090/
│   │   ├── tathu_web_prev120/
│   │   ├── tathu_web_txt120/
│   │   ├── tathu_web_txt30/
│   │   ├── tathu_web_txt60/
│   │   ├── tathu_web_txt90/
│   │   ├── tathu_web_txt_diag/
│   ├── RAIOS/
│   │   ├── /nowcasting/
│   │   ├── 2025/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2026/ [Dados Temporais: Ano/Mês/Dia]
│   ├── Workshop2019/
│   │   ├── /nowcasting/
│   │   ├── CASO1_20180915/
│   │   ├── CASO2_20171116/
│   ├── glm_faltante/
│   │   ├── /nowcasting/
│   │   ├── 202411/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 202412/ [Dados Temporais: Ano/Mês/Dia]
│   ├── jaraguari/
│   │   ├── /nowcasting/
│   ├── modelo/
│   │   ├── /nowcasting/
│   │   ├── geoserver/
│   ├── prev_sroque/
│   │   ├── /nowcasting/
│   ├── radar/
│   │   ├── /nowcasting/
│   ├── temp/
│   │   ├── /nowcasting/
│   ├── workshop2025/
│   │   ├── /nowcasting/
│   │   ├── caso_5/
│   │   ├── caso_6/
│   │   ├── caso_7/
│   │   ├── caso_8/
├── oceano/
│   ├── aqua/
│   │   ├── /oceano/
│   │   ├── aqua_web/
│   │   ├── level2/
│   │   ├── level3/
│   ├── blend/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── dist/
│   │   ├── /oceano/
│   ├── goes16/
│   │   ├── /oceano/
│   │   ├── tsm/
│   ├── goes19/
│   │   ├── /oceano/
│   │   ├── tsm/
│   ├── hy2B/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── hy2C/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── hy2D/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── iss/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── metopA/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── metopB/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── metopC/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── msg/
│   │   ├── /oceano/
│   │   ├── tsm/
│   ├── oceansat2/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── oceansat3/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── scatsat1/
│   │   ├── /oceano/
│   │   ├── vsm/
│   ├── snpp/
│   │   ├── /oceano/
│   │   ├── level2/
│   │   ├── level3/
│   │   ├── snpp_web/
├── pesquisa/
│   ├── SisMOM/
│   │   ├── /pesquisa/
│   │   ├── BRICS/
│   │   ├── manuais/
│   │   ├── sipec/
│   │   ├── sismom_fig/
│   │   ├── sismom_forecast/
│   ├── apgmet/
│   │   ├── /pesquisa/
│   │   ├── JOAO/
│   │   ├── Tiago/
│   ├── bam/
│   │   ├── /pesquisa/
│   │   ├── antonio.manzi/
│   │   ├── dayana.souza/
│   │   ├── enver.ramirez/
│   │   ├── isabella.talamoni/
│   │   ├── nicolas.salvador/
│   │   ├── paulo.kubota/
│   │   ├── transicao/
│   ├── bamc/
│   │   ├── /pesquisa/
│   │   ├── AmazonShCu/
│   │   ├── CESM/
│   │   ├── EOF/
│   │   ├── MOA_gAMAZON/
│   │   ├── MPDI/
│   │   ├── go_Amazon/
│   │   ├── saildrone_Arctic2019/
│   │   ├── test1_AmazonShCu/
│   │   ├── windERA5/
│   ├── bramsrd/
│   │   ├── /pesquisa/
│   │   ├── 4SRF/
│   │   ├── AMZ2015/
│   │   ├── BIA/
│   │   ├── BRAMS-5.5/
│   │   ├── BRAMS-6.0/
│   │   ├── BRAMS/
│   │   ├── BRAMS_5.4/
│   │   ├── DataAvaliaModelBrams/
│   │   ├── MATEUSFF/
│   │   ├── TST_MONAN/
│   │   ├── ariane/
│   │   ├── avData/
│   │   ├── av_b6/
│   │   ├── avaliacao_BRAMS_5.6/
│   │   ├── cpia_oper/
│   │   ├── dados/
│   │   ├── dados_jules/
│   │   ├── era5/
│   │   ├── gfs/
│   │   ├── issue-301/
│   │   ├── paraAngel/
│   │   ├── paraGabriel/
│   │   ├── paraJulliana/
│   │   ├── paraSergio/
│   │   ├── prep_frp/
│   │   ├── prep_novo_FRP/
│   │   ├── prep_novo_FRP2/
│   │   ├── risc/
│   │   ├── rodrigo/
│   │   ├── saulo/
│   │   ├── scripts/
│   │   ├── site_test/
│   │   ├── sst/
│   │   ├── toEgeon/
│   │   ├── topo/
│   ├── clima/
│   │   ├── /pesquisa/
│   │   ├── AlexFernandes/
│   │   ├── Boletins/
│   │   ├── CaioCoelho/
│   │   ├── Gan/
│   │   ├── GustavoEscobar/
│   │   ├── HenriRossi/
│   │   ├── INMET/
│   │   ├── LucianaVieira/
│   │   ├── MarcusSuassuna/
│   │   ├── Renato/
│   │   ├── Sabrina/
│   │   ├── TainaMartins/
│   │   ├── ValescaFernandes/
│   │   ├── VandersonSantos/
│   │   ├── ZeAlberto/
│   ├── das/
│   │   ├── /pesquisa/
│   │   ├── EXPS_SMNA/
│   │   ├── GOES16/
│   │   ├── MPAS-Tutorial-NCAR-2023/
│   │   ├── MPAS-Tutorial-NCAR-2024/
│   │   ├── carlos.bastarz/
│   │   ├── caroline.viezel/
│   │   ├── cesar.magno/
│   │   ├── joao.gerd/
│   │   ├── luiz.sapucci/
│   │   ├── scantec/
│   │   ├── testecase/
│   │   ├── thaisa.lopes/
│   │   ├── victor.ranieri/
│   ├── dmdcc/
│   │   ├── /pesquisa/
│   │   ├── HPE/
│   │   ├── LNCC/
│   │   ├── joao.messias/
│   │   ├── monan/
│   │   ├── volatil/
│   ├── dmdpesq/
│   │   ├── /pesquisa/
│   │   ├── VA/
│   │   ├── alvaro.avila/
│   │   ├── data/
│   │   ├── giovana.galetti/
│   │   ├── luis.goncalves/
│   │   ├── nilo.figueroa/
│   ├── doppesq/
│   │   ├── /pesquisa/
│   │   ├── GustavoEscobar/
│   │   ├── avaliacao/
│   │   ├── temp/
│   ├── forcatarefa/
│   │   ├── /pesquisa/
│   │   ├── besm/
│   │   ├── era5/
│   │   ├── gfs/
│   │   ├── mercator/
│   │   ├── ww3/
│   ├── grpeta/
│   │   ├── /pesquisa/
│   │   ├── Apresentacao/
│   │   ├── BDados/
│   │   ├── CORDEX/
│   │   ├── Codigo/
│   │   ├── Daniela/
│   │   ├── DataSet/
│   │   ├── DiegoChagas/
│   │   ├── Diego_Campos/
│   │   ├── Discos/
│   │   ├── Dragan/
│   │   ├── Eta_Model_Image/
│   │   ├── FF_2021/
│   │   ├── Grades_ModeloETA/
│   │   ├── Isabel/
│   │   ├── JOAOFIGUEIREDO/
│   │   ├── PROJETA/
│   │   ├── Projetos/
│   │   ├── SST/
│   │   ├── VII-WorkEta/
│   │   ├── VIII-WorkEta/
│   │   ├── code/
│   │   ├── datain/
│   │   ├── mudclimaticas/
│   │   ├── paleo/
│   │   ├── petamdl/
│   │   ├── python/
│   │   ├── sazonal/
│   │   ├── subsazonal/
│   │   ├── tempo/
│   │   ├── tmp/
│   │   ├── users/
│   │   ├── util/
│   ├── oceanmc/
│   │   ├── /pesquisa/
│   │   ├── ARA/
│   │   ├── BESM/
│   │   ├── BESM3/
│   │   ├── BESM_AM/
│   │   ├── CMIP5/
│   │   ├── INPUT_LM4/
│   │   ├── PIRATA/
│   │   ├── THMB/
│   │   ├── repos/
│   │   ├── telemac-3d/
│   ├── oceanwave/
│   │   ├── /pesquisa/
│   │   ├── Ana/
│   │   ├── Angelo/
│   │   ├── Ariane/
│   │   ├── Barbara/
│   │   ├── Efraime/
│   │   ├── Emanuel/
│   │   ├── GTC/
│   │   ├── Helena/
│   │   ├── MONAN/
│   │   ├── Marcos/
│   │   ├── SISMOM/
│   │   ├── Valdir/
│   │   ├── Vinicio/
│   │   ├── backup_egeon2/
│   │   ├── roms/
│   │   ├── temp/
│   ├── p4cn/
│   │   ├── /pesquisa/
│   │   ├── 3%20Inventario-CN/
│   │   ├── 4%20Inventario-CN/
│   ├── soschuva/
│   │   ├── /pesquisa/
│   │   ├── Lianet/
│   │   ├── Relampago/
│   │   ├── RelampagoP/
│   ├── sysadmin/
│   │   ├── /pesquisa/
│   │   ├── eugenio/
│   │   ├── migration/
│   │   ├── paulo.ribeiro/
│   ├── wrf/
│   │   ├── /pesquisa/
│   │   ├── AV/
│   │   ├── BAMaerosol/
│   │   ├── EGEON/
│   ├── rainfall/
│   │   ├── ainpp-pb-latam/
│   │   ├── /rainfall/
│   │   ├── sample/
│   │   ├── cif.latam/
│   │   ├── /rainfall/
│   │   ├── output_americas/
│   │   ├── disdrometers/
│   │   ├── /rainfall/
│   │   ├── processed/
│   │   ├── pyForTraCC_IMERG_FinalRun/
│   │   ├── /rainfall/
│   │   ├── 2015/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2016/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2017/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2018/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2019/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2020/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2021/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2022/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2023/ [Dados Temporais: Ano/Mês/Dia]
│   │   ├── 2024/ [Dados Temporais: Ano/Mês/Dia]
```
