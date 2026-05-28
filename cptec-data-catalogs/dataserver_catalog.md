# 📊 Catálogo Simplificado do CPTEC DataServer
> **Domínio:** [dataserver.cptec.inpe.br](https://dataserver.cptec.inpe.br/)
> 
> Este guia é focado no **DataServer do CPTEC/INPE**, um repositório centralizado de transferência de dados operacionais e de pesquisa. Enquanto o FTP principal contém dados públicos mais históricos e de distribuição geral, o DataServer armazena rodadas operacionais brutas de modelos de supercomputação, dados de projetos específicos (como o MONAN e o ENANDES) e dados de descargas elétricas (raios) detalhados por município.

---

## 🗺️ Visão Geral dos Diretórios Raiz

| Pasta | Nome Técnico | O que realmente contém (Simplificado) | Exemplos de Dados |
| :--- | :--- | :--- | :--- |
| `coids_dataserver/` | Dados do COIDS | Pasta operacional da equipe de satélites e imagens. | Arquivos de apoio internos. |
| [`dataserver_clima/`](#clima) | Documentação de Clima | Relatórios periódicos das reuniões e análises climáticas mensais. | Boletins *Climanálise*, *Infoclima* e *Progclima*. |
| [`dataserver_dimnt/`](#dimnt) | Divisão de Modelagem (DIMNT) | Códigos, treinamentos, logs de teste e dados do novo modelo **MONAN**. | Repositórios do MONAN, materiais de workshops e tutoriais. |
| [`dataserver_diptc/`](#diptc) | Divisão de Previsão (DIPTC) | Informações operacionais e painéis da Divisão de Previsão de Tempo. | PDFs de boletins técnicos, painel do El Niño. |
| [`dataserver_enandes/`](#enandes) | Projeto ENANDES | Dados climatológicos e geospaciais focados na Cordilheira dos Andes. | Arquivos diários de chuva/temperatura, GeoTIFFs e catálogos STAC. |
| [`dataserver_goestemp/`](#goestemp) | Variáveis Espaciais GOES | Dados e radiação solar captados pelos diversos sensores do satélite GOES. | Leituras de radiação magnética, raios (GLM) e imagens de umidade. |
| `dataserver_gpt/` | Projetos Gerais (GPT) | Área de transferência de dados gerais e compartilhados. | Arquivos temporários e dumps de projetos. |
| [`dataserver_modelos/`](#modelos) | Saídas Operacionais de Modelos | Arquivos brutos gerados pelas rodadas diárias de modelos (BAM, Eta, WRF, BESM). | Previsões numéricas para o Operador Nacional do Sistema Elétrico (ONS). |
| [`dataserver_prevoper/`](#prevoper) | Previsão Operacional | Saídas de modelos meteorológicos organizadas para a previsão diária imediata. | Rodadas diárias de tempo do GFS, BAM e WRF. |
| [`dataserver_raio/`](#raio) | Dados de Raios (Descargas) | Estatísticas e mapeamento de queda de raios por município e estado brasileiro. | Tabelas consolidadas, mapas de densidade de raios por mesorregião. |
| [`dataserver_sazonal/`](#sazonal) | Previsão Climatológica (Sazonal) | Médias de previsão física para os próximos meses (médias mensais/trimestrais). | Anomalias de chuva, temperatura do solo e radiação. |
| [`dataserver_subsaz/`](#subsaz) | Previsão Subsazonal (Semanal) | Previsões físicas em escala semanal e quinzenal (1 a 4 semanas de antecedência). | Dados calibrados compartilhados com centros como o ECMWF. |
| [`dataserver_wrf/`](#wrf) | Modelagem WRF e MPAS | Saídas experimentais de alta resolução e verificação visual do modelo MPAS. | Imagens de verificação de rodadas do modelo global/regional MPAS. |

---

## 🔍 Detalhamento das Pastas (Desmistificando o Tecniquês)

<a id="clima"></a>
### 1. `dataserver_clima/` (Climatologia Oficial)
* **O que é:** Guarda as publicações periódicas clássicas do INPE sobre o comportamento do clima.
* **Pastas principais:**
  * `climanalise/`: Revista mensal contendo dados de anomalia de temperatura, vento e chuva observados no mês anterior.
  * `infoclima/` e `progclima/`: Relatórios de apoio usados nas reuniões mensais de previsão climática para o Brasil.

<a id="dimnt"></a>
### 2. `dataserver_dimnt/` (O desenvolvimento do MONAN)
* **O que é:** DIMNT significa *Divisão de Modelagem Numérica e Desenvolvimento Tecnológico*. Esta pasta é muito rica em dados sobre o novo supermodelo climático brasileiro, o **MONAN**.
* **Destaques:**
  * `monan/MONAN-Model/`: Logs de desenvolvimento e dados de entrada para o modelo unificado de próxima geração.
  * `monan/curso_OMM_INPE_2025/` e `trainings_1_MONAN_.../`: Materiais didáticos completos de capacitação técnica no modelo.
  * `das/`: *Data Assimilation System* (Sistema de Assimilação de Dados). Guarda arquivos de satélites como o GOES-16 formatados para serem "digeridos" pelos modelos de previsão.

<a id="diptc"></a>
### 3. `dataserver_diptc/` (Divisão de Previsão de Tempo)
* **O que é:** DIPTC significa *Divisão de Previsão de Tempo e Clima*. Guarda os boletins que são gerados diariamente pela equipe de plantão de meteorologistas.
* **Destaques:**
  * `Painel-Elnino/`: Dados e figuras que alimentam o painel de monitoramento das condições do Oceano Pacífico.

<a id="enandes"></a>
### 4. `dataserver_enandes/` (Projeto Climático dos Andes)
* **O que é:** O ENANDES é um projeto multinacional que visa aumentar a resiliência de comunidades andinas (Chile, Peru, Colômbia, etc.) a eventos climáticos extremos. O INPE atua gerando as estimativas de alta resolução de chuva e temperatura para a região.
* **Destaques:**
  * `geotiff/modelos/`: Arquivos raster (imagens georreferenciadas `.tif`) prontos para serem importados em softwares de mapas (QGIS/ArcGIS).
  * `stac_catalog/`: Catálogo estruturado no padrão moderno STAC (*SpatioTemporal Asset Catalog*), facilitando a busca automatizada de dados diários por APIs.

<a id="goestemp"></a>
### 5. `dataserver_goestemp/` (Variáveis de Espaço e Satélite)
* **O que é:** Repositório dedicado a receber leituras de sensores específicos a bordo da série de satélites GOES.
* **Entendendo as subpastas (Siglas de Sensores):**
  * **`CMIPF/` (Cloud and Moisture Imagery Product):** Imagens cruas de nuvens e vapor d'água.
  * **`GLM/` (Geostationary Lightning Mapper):** Registro bruto dos flashes de raios.
  * **`MAG/` (Magnetometer):** Medição das perturbações no campo magnético da Terra causadas por tempestades solares.
  * **`SUVI/` (Solar Ultraviolet Imager):** Telescópio apontado para o sol para capturar erupções solares na faixa de ultravioleta extremo.

<a id="modelos"></a>
### 6. `dataserver_modelos/` (Saídas de Previsão e Distribuição)
* **O que é:** Armazena as rodadas físicas cruas geradas a cada 12 horas pelos modelos do INPE. 
* **Destaques:**
  * `ONS/`: Arquivos de previsão de chuva específicos que o INPE envia diretamente para o **Operador Nacional do Sistema Elétrico**. A chuva nas bacias hidrográficas determina quanta energia as hidrelétricas vão conseguir produzir.
  * `wwatch/`: Dados do WaveWatch III, modelo específico para simular a formação de ondas no mar aberto e na costa brasileira.

<a id="raio"></a>
### 7. `dataserver_raio/` (Mapeamento de Descargas Elétricas)
* **O que é:** Esta pasta agrupa os dados estatísticos consolidados sobre a incidência de raios (descargas atmosféricas para o solo) no território nacional.
* **Destaques:**
  * `ng_municipios_tabela/`: Tabelas contendo o número exato de raios que caíram em cada município brasileiro, permitindo análises de risco.
  * `ng_municipios_mapas/Brasil/` e `Estados/`: Imagens contendo mapas de densidade de queda de raios por quilômetro quadrado.

<a id="sazonal"></a>
### 8. `dataserver_sazonal/` (Previsão de Longo Prazo)
* **O que é:** Previsões de clima em escala mensal e sazonal (trimestral).
* **Entendendo as variáveis de modelo:**
  * `prec_seas` e `prec_mnth`: Precipitação acumulada prevista para a estação/mês.
  * `t2mt_seas`: Temperatura do ar prevista a 2 metros de altura.
  * `psnm_seas`: Pressão ao nível médio do mar.
  * `st20_seas` / `st85_seas`: Temperatura do solo (*Soil Temperature*) em diferentes profundidades.

<a id="subsaz"></a>
### 9. `dataserver_subsaz/` (Previsão de Médio-Longo Prazo)
* **O que é:** Previsões de escala intermediária (subsazonais), ótimas para a agricultura e planejamento elétrico, pois prevêm semanas específicas à frente.
* **Destaques:**
  * `real_time_forecast_to_ecmwf/`: Arquivos formatados no padrão internacional que o INPE envia em tempo real para o Centro Europeu de Previsões Meteorológicas de Médio Prazo (ECMWF) para compor previsões globais.

<a id="wrf"></a>
### 10. `dataserver_wrf/` (Imagens do MPAS)
* **O que é:** Área de verificação visual das rodadas do modelo numérico global de nova geração **MPAS** (Model for Prediction Across Scales).
* **Subpastas:**
  * `rodadas_MPAS/figuras/`: Gráficos gerados automaticamente mostrando mapas de vento, umidade e pressão projetados pelo modelo para as próximas horas, servindo para verificação rápida.

---

## 🌳 Estrutura Completa de Diretórios (Pastas e Subpastas)

Abaixo está o mapeamento lógico e recursivo das pastas e subpastas de `dataserver.cptec.inpe.br` até 3 níveis de profundidade. As subpastas baseadas em datas e anos foram marcadas com `[Dados Temporais]` para simplificação visual.

```text
├── coids_dataserver/
├── dataserver_clima/
│   ├── documentos/
│   │   ├── /dataserver_clima/
│   │   ├── climanalise/
│   │   ├── infoclima/
│   │   ├── progclima/
│   ├── imagens/
│   │   ├── /dataserver_clima/
│   │   ├── estacao_chuvosa/
├── dataserver_dimnt/
│   ├── das/
│   │   ├── /dataserver_dimnt/
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
│   ├── monan/
│   │   ├── /dataserver_dimnt/
│   │   ├── MONAN-Model/
│   │   ├── OMM/
│   │   ├── andre.lyra/
│   │   ├── antonio.manzi/
│   │   ├── curso_OMM_INPE_2025/
│   │   ├── eduardo.eras/
│   │   ├── eduardo.khamis/
│   │   ├── madeleine.gacita/
│   │   ├── marcelo.paiva/
│   │   ├── marcos.longo/
│   │   ├── meeting_AI_2024_06_19a21/
│   │   ├── monan_gam/
│   │   ├── monan_sitegit/
│   │   ├── ocean_model/
│   │   ├── paulo.kubota/
│   │   ├── peter/
│   │   ├── rosio.camayo/
│   │   ├── sylvio.neto/
│   │   ├── testes_continuos_CD-CT/
│   │   ├── testes_continuos_CD-CT_dev/
│   │   ├── testescontinuos-v0.1.0/
│   │   ├── trainings_1_MONAN_2024_08_12a16/
│   │   ├── trainings_2_WMO_2025/
│   │   ├── workshop_2023_10_02e03/
├── dataserver_diptc/
│   ├── web/
│   │   ├── /dataserver_diptc/
│   │   ├── Painel-Elnino/
│   │   ├── bd/
│   │   ├── boletim_tecnico/
│   │   ├── oficios/
│   │   ├── pdfs/
│   │   ├── rclima/
│   │   ├── rgptimg/
├── dataserver_enandes/
│   ├── dados/
│   │   ├── /dataserver_enandes/
│   │   ├── enandes_v2/
│   │   ├── wendy-lab-dados/
│   ├── estilos_merge_sld/
│   │   ├── /dataserver_enandes/
│   ├── geotiff/
│   │   ├── /dataserver_enandes/
│   │   ├── modelos/
│   ├── stac_catalog/
│   │   ├── /dataserver_enandes/
│   │   ├── enandes_daily/
├── dataserver_goestemp/
│   ├── CMIPF/
│   │   ├── /dataserver_goestemp/
│   ├── EXIS/
│   │   ├── /dataserver_goestemp/
│   ├── GLM/
│   │   ├── /dataserver_goestemp/
│   ├── MAG/
│   │   ├── /dataserver_goestemp/
│   ├── RadF/
│   │   ├── /dataserver_goestemp/
│   ├── SEIS/
│   │   ├── /dataserver_goestemp/
│   ├── SUVI/
│   │   ├── /dataserver_goestemp/
├── dataserver_gpt/
├── dataserver_modelos/
│   ├── MERGE/
│   │   ├── /dataserver_modelos/
│   ├── ONS/
│   │   ├── /dataserver_modelos/
│   │   ├── BAM/
│   │   ├── Eta/
│   │   ├── WRF/
│   ├── bam/
│   │   ├── /dataserver_modelos/
│   │   ├── TQ0666L064/
│   ├── besm/
│   │   ├── /dataserver_modelos/
│   │   ├── brutos/
│   ├── brams/
│   │   ├── /dataserver_modelos/
│   │   ├── ams_08km/
│   │   ├── ams_15km/
│   ├── clima/
│   │   ├── /dataserver_modelos/
│   ├── climaoper/
│   │   ├── /dataserver_modelos/
│   │   ├── BKP/
│   │   ├── Eta/
│   ├── eta/
│   │   ├── /dataserver_modelos/
│   │   ├── ams_08km/
│   │   ├── ams_40km/
│   │   ├── ons_40km/
│   │   ├── rjsp_01km/
│   ├── smna/
│   │   ├── /dataserver_modelos/
│   │   ├── brutos/
│   ├── umid_solo/
│   │   ├── /dataserver_modelos/
│   │   ├── brutos/
│   ├── wrf/
│   │   ├── /dataserver_modelos/
│   │   ├── ams_07km/
│   ├── wwatch/
│   │   ├── /dataserver_modelos/
│   │   ├── ww3_v5.16/
├── dataserver_prevoper/
│   ├── modelos/
│   │   ├── /dataserver_prevoper/
│   │   ├── BAM/
│   │   ├── Eta/
│   │   ├── GFS/
│   │   ├── WRF/
│   ├── produtos/
│   │   ├── /dataserver_prevoper/
│   │   ├── monitoramento/
│   │   ├── tempo/
├── dataserver_raio/
│   ├── mapas_ng/
│   │   ├── /dataserver_raio/
│   ├── ng_municipios_mapas/
│   │   ├── /dataserver_raio/
│   │   ├── Brasil/
│   │   ├── Estados/
│   │   ├── MesoRegioes/
│   ├── ng_municipios_tabela/
│   │   ├── /dataserver_raio/
│   ├── referencias/
│   │   ├── /dataserver_raio/
│   ├── tabela_ng/
│   │   ├── /dataserver_raio/
├── dataserver_sazonal/
│   ├── calibrated/
│   │   ├── /dataserver_sazonal/
│   │   ├── prec_mnth/
│   │   ├── prec_seas/
│   │   ├── t2mt_mnth/
│   │   ├── t2mt_seas/
│   ├── dados_humberto/
│   │   ├── /dataserver_sazonal/
│   │   ├── subsazonal/
│   ├── dados_trimestrais_ukmet_iracema/
│   │   ├── /dataserver_sazonal/
│   ├── data_exp_soil/
│   │   ├── /dataserver_sazonal/
│   │   ├── CPTEC/
│   │   ├── UKMET/
│   ├── ensemble_mean/
│   │   ├── /dataserver_sazonal/
│   │   ├── ch20_mnth/
│   │   ├── ch20_seas/
│   │   ├── ch85_mnth/
│   │   ├── ch85_seas/
│   │   ├── circulation.egeon/
│   │   ├── prec_mnth/
│   │   ├── prec_seas/
│   │   ├── psnm_mnth/
│   │   ├── psnm_seas/
│   │   ├── role_mnth/
│   │   ├── role_seas/
│   │   ├── st20_mnth/
│   │   ├── st20_seas/
│   │   ├── st85_mnth/
│   │   ├── st85_seas/
│   │   ├── t2mt_mnth/
│   │   ├── t2mt_seas/
│   │   ├── tp85_mnth/
│   │   ├── tp85_seas/
│   │   ├── uc20_mnth/
│   │   ├── uc20_seas/
│   │   ├── uc85_mnth/
│   │   ├── uc85_seas/
│   │   ├── uf20_mnth/
│   │   ├── uf20_seas/
│   │   ├── uf85_mnth/
│   │   ├── uf85_seas/
│   │   ├── up20_mnth/
│   │   ├── up20_seas/
│   │   ├── up85_mnth/
│   │   ├── up85_seas/
│   │   ├── uv20_mnth/
│   │   ├── uv20_seas/
│   │   ├── uv85_mnth/
│   │   ├── uv85_seas/
│   │   ├── vc20_mnth/
│   │   ├── vc20_seas/
│   │   ├── vc85_mnth/
│   │   ├── vc85_seas/
│   │   ├── vf20_mnth/
│   │   ├── vf20_seas/
│   │   ├── vf85_mnth/
│   │   ├── vf85_seas/
│   │   ├── vp20_mnth/
│   │   ├── vp20_seas/
│   │   ├── vp85_mnth/
│   │   ├── vp85_seas/
│   │   ├── vv20_mnth/
│   │   ├── vv20_seas/
│   │   ├── vv85_mnth/
│   │   ├── vv85_seas/
│   │   ├── zg50_mnth/
│   │   ├── zg50_seas/
│   ├── files_nc_mz/
│   │   ├── /dataserver_sazonal/
│   │   ├── pr/
│   ├── jess_ukmet/
│   │   ├── /dataserver_sazonal/
│   │   ├── consSSP1_RCP19/
│   │   ├── fullAMAZ_DEFOR/
├── dataserver_subsaz/
│   ├── calibrated/
│   │   ├── /dataserver_subsaz/
│   │   ├── prec_3wks/
│   │   ├── prec_fort/
│   │   ├── prec_mnth/
│   │   ├── prec_week/
│   │   ├── t2mt_3wks/
│   │   ├── t2mt_fort/
│   │   ├── t2mt_mnth/
│   │   ├── t2mt_week/
│   ├── ensemble_mean/
│   │   ├── /dataserver_subsaz/
│   │   ├── ch20_3wks/
│   │   ├── ch20_fort/
│   │   ├── ch20_mnth/
│   │   ├── ch20_week/
│   │   ├── ch85_3wks/
│   │   ├── ch85_fort/
│   │   ├── ch85_mnth/
│   │   ├── ch85_week/
│   │   ├── prec_3wks/
│   │   ├── prec_fort/
│   │   ├── prec_mnth/
│   │   ├── prec_week/
│   │   ├── psnm_3wks/
│   │   ├── psnm_fort/
│   │   ├── psnm_mnth/
│   │   ├── psnm_week/
│   │   ├── role_3wks/
│   │   ├── role_fort/
│   │   ├── role_mnth/
│   │   ├── role_week/
│   │   ├── st20_3wks/
│   │   ├── st20_fort/
│   │   ├── st20_mnth/
│   │   ├── st20_week/
│   │   ├── st85_3wks/
│   │   ├── st85_fort/
│   │   ├── st85_mnth/
│   │   ├── st85_week/
│   │   ├── t2mt_3wks/
│   │   ├── t2mt_fort/
│   │   ├── t2mt_mnth/
│   │   ├── t2mt_week/
│   │   ├── tp85_3wks/
│   │   ├── tp85_fort/
│   │   ├── tp85_mnth/
│   │   ├── tp85_week/
│   │   ├── u10t_3wks/
│   │   ├── u10t_fort/
│   │   ├── u10t_mnth/
│   │   ├── u10t_week/
│   │   ├── uc20_3wks/
│   │   ├── uc20_fort/
│   │   ├── uc20_mnth/
│   │   ├── uc20_week/
│   │   ├── uc85_3wks/
│   │   ├── uc85_fort/
│   │   ├── uc85_mnth/
│   │   ├── uc85_week/
│   │   ├── uf20_3wks/
│   │   ├── uf20_fort/
│   │   ├── uf20_mnth/
│   │   ├── uf20_week/
│   │   ├── uf85_3wks/
│   │   ├── uf85_fort/
│   │   ├── uf85_mnth/
│   │   ├── uf85_week/
│   │   ├── up20_3wks/
│   │   ├── up20_fort/
│   │   ├── up20_mnth/
│   │   ├── up20_week/
│   │   ├── up85_3wks/
│   │   ├── up85_fort/
│   │   ├── up85_mnth/
│   │   ├── up85_week/
│   │   ├── uv20_3wks/
│   │   ├── uv20_fort/
│   │   ├── uv20_mnth/
│   │   ├── uv20_week/
│   │   ├── uv85_3wks/
│   │   ├── uv85_fort/
│   │   ├── uv85_mnth/
│   │   ├── uv85_week/
│   │   ├── v10t_3wks/
│   │   ├── v10t_fort/
│   │   ├── v10t_mnth/
│   │   ├── v10t_week/
│   │   ├── vc20_3wks/
│   │   ├── vc20_fort/
│   │   ├── vc20_mnth/
│   │   ├── vc20_week/
│   │   ├── vc85_3wks/
│   │   ├── vc85_fort/
│   │   ├── vc85_mnth/
│   │   ├── vc85_week/
│   │   ├── vf20_3wks/
│   │   ├── vf20_fort/
│   │   ├── vf20_mnth/
│   │   ├── vf20_week/
│   │   ├── vf85_3wks/
│   │   ├── vf85_fort/
│   │   ├── vf85_mnth/
│   │   ├── vf85_week/
│   │   ├── vp20_3wks/
│   │   ├── vp20_fort/
│   │   ├── vp20_mnth/
│   │   ├── vp20_week/
│   │   ├── vp85_3wks/
│   │   ├── vp85_fort/
│   │   ├── vp85_mnth/
│   │   ├── vp85_week/
│   │   ├── vv20_3wks/
│   │   ├── vv20_fort/
│   │   ├── vv20_mnth/
│   │   ├── vv20_week/
│   │   ├── vv85_3wks/
│   │   ├── vv85_fort/
│   │   ├── vv85_mnth/
│   │   ├── vv85_week/
│   │   ├── zg50_3wks/
│   │   ├── zg50_fort/
│   │   ├── zg50_mnth/
│   │   ├── zg50_week/
│   ├── real_time_forecast_to_ecmwf/
│   │   ├── /dataserver_subsaz/
│   │   ├── 2026042200/ [Dados Temporais]
│   │   ├── 2026042300/ [Dados Temporais]
│   │   ├── 2026042900/ [Dados Temporais]
│   │   ├── 2026043000/ [Dados Temporais]
│   │   ├── 2026050600/ [Dados Temporais]
│   │   ├── 2026050700/ [Dados Temporais]
│   │   ├── 2026051300/ [Dados Temporais]
│   │   ├── 2026051400/ [Dados Temporais]
│   │   ├── 2026052000/ [Dados Temporais]
│   │   ├── 2026052100/ [Dados Temporais]
│   │   ├── 2026052700/ [Dados Temporais]
│   │   ├── 2026052800/ [Dados Temporais]
├── dataserver_wrf/
│   ├── rodadas_MPAS/
│   │   ├── /dataserver_wrf/
│   │   ├── dados/
│   │   ├── figuras/
│   │   ├── imagens_verificacao/
```
