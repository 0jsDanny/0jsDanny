"""
CISC Health Data — Relatório Visual Completo
=============================================
Gera um único HTML com TODAS as análises organizadas em seções temáticas:
  1. Resumo Geral (KPIs)
  2. Sazonalidade e Tendências
  3. Análise Espacial (Mapa Folium)
  4. Perfil Sociodemográfico
  5. Progressão Clínica — Dengue
  6. Etiologia e Diagnóstico Laboratorial
  7. Análise de Vacinação e Tratamento (SRAG)
  8. Doenças Diarreicas Agudas (DDA)
  9. Desfechos e Óbitos

Saída: db_devs/cisc_relatorio_visual.html
"""

import sqlite3, json, os, warnings
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import folium
from folium.plugins import HeatMap

warnings.filterwarnings("ignore")

# ── Caminhos ──────────────────────────────────────────────────────────────────
BASE     = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB       = os.path.join(BASE, "db_devs", "cisc_health.db")
GEOJSON  = os.path.join(BASE, "belem_maps", "belem_bairros_supremo.geojson")
OUT      = os.path.join(BASE, "db_devs", "cisc_relatorio_visual.html")

# ── Paleta ────────────────────────────────────────────────────────────────────
C_DENGUE  = "#F97316"
C_LEPTO   = "#06B6D4"
C_SRAG    = "#8B5CF6"
C_DDA     = "#22C55E"
C_ACCENT  = "#38BDF8"
C_WARN    = "#F59E0B"
C_DANGER  = "#EF4444"
C_OK      = "#22C55E"
DARK_BG   = "#0F1117"
DARK_GRID = "#1E293B"
TEXT_CLR  = "#E2E8F0"
MUTED     = "#64748B"

DIS_COLORS = {"DENGUE": C_DENGUE, "LEPTOSPIROSE": C_LEPTO, "SRAG": C_SRAG}
MES = {"01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun",
       "07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez"}

LAYOUT_BASE = dict(
    plot_bgcolor=DARK_BG, paper_bgcolor=DARK_BG,
    font=dict(color=TEXT_CLR, family="Satoshi"),
    title_font_size=16,
    margin=dict(t=50, b=40, l=40, r=20),
    legend=dict(bgcolor="#1E293B", bordercolor="#334155", borderwidth=1),
)
AXIS_STYLE = dict(gridcolor=DARK_GRID, zerolinecolor=DARK_GRID, tickfont=dict(family="JetBrains Mono"))

def q(sql): 
    conn = sqlite3.connect(DB)
    df = pd.read_sql_query(sql, conn)
    conn.close()
    return df

def fig2html(fig, div_id=None):
    return fig.to_html(full_html=False, include_plotlyjs=False, div_id=div_id,
                       config={"responsive": True, "displayModeBar": False})

def L(fig, **kw):
    fig.update_layout(**LAYOUT_BASE, **kw)
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(**AXIS_STYLE)
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 1 — RESUMO GERAL
# ══════════════════════════════════════════════════════════════════════════════
def get_kpis():
    s = q("""SELECT COUNT(*) t, 
                SUM(doenca='DENGUE') d, SUM(doenca='LEPTOSPIROSE') l, SUM(doenca='SRAG') s,
                SUM(evolucao='2') ob, SUM(hospitalizado='S') hosp,
                ROUND(AVG(paciente_idade_anos),1) age
             FROM notificacoes""").iloc[0]
    dda = q("SELECT SUM(faixa_total) v FROM dda_casos_semanal").iloc[0]["v"]
    return s, int(dda)


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 2 — SAZONALIDADE
# ══════════════════════════════════════════════════════════════════════════════
def chart_monthly():
    df = q("""SELECT doenca, strftime('%Y',data_notificacao) ano, strftime('%m',data_notificacao) mes, COUNT(*) casos
              FROM notificacoes WHERE data_notificacao IS NOT NULL
              GROUP BY doenca, ano, mes ORDER BY doenca, ano, mes""")
    df["mes_label"] = df["mes"].map(MES)
    
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    
    # Define line styles based on year
    year_styles = {
        "2024": dict(dash="dot", width=2),
        "2025": dict(dash="solid", width=3),
        "2026": dict(dash="dash", width=3)
    }
    
    months_order = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    
    groups = df.groupby(["doenca", "ano"])
    for (d, y), r in groups:
        c = DIS_COLORS.get(d, TEXT_CLR)
        style = year_styles.get(y, dict(dash="solid", width=3))
        is_lepto = (d == "LEPTOSPIROSE")
        name = f"{d.capitalize()} ({y})"
        if is_lepto:
            name += " (Eixo Dir.)"
            
        fig.add_trace(
            go.Scatter(x=r["mes_label"], y=r["casos"], name=name,
                mode="lines+markers", line=dict(color=c, **style), marker=dict(size=7),
                hovertemplate=f"<b>{name}</b> — %{{x}}: %{{y}} casos<extra></extra>"),
            secondary_y=is_lepto
        )
            
    fig.update_layout(**LAYOUT_BASE, title="Distribuição Mensal por Doença e Ano (2024–2026)",
        hovermode="x unified")
        
    fig.update_xaxes(**AXIS_STYLE, categoryorder="array", categoryarray=months_order)
    fig.update_yaxes(**AXIS_STYLE)
    
    # Label the axes and styling
    fig.update_yaxes(title_text="Notificações (Dengue / SRAG)", secondary_y=False)
    fig.update_yaxes(title_text="Notificações (Leptospirose)", secondary_y=True, showgrid=False)
    fig.update_xaxes(title_text="Mês de Notificação")
    
    return fig

def chart_seasonality_3d():
    df = q("""SELECT doenca, strftime('%m', data_notificacao) AS mes, COUNT(*) AS casos
              FROM notificacoes
              WHERE data_notificacao IS NOT NULL AND strftime('%Y', data_notificacao) = '2025'
              GROUP BY doenca, mes
              ORDER BY doenca, mes""")
    
    disease_data = {}
    for d in ["LEPTOSPIROSE", "SRAG", "DENGUE"]:
        sub = df[df["doenca"] == d].copy()
        months_mapped = {f"{i:02d}": 0 for i in range(1, 13)}
        for _, row in sub.iterrows():
            months_mapped[row["mes"]] = row["casos"]
        cases = [months_mapped[f"{i:02d}"] for i in range(1, 13)]
        disease_data[d] = cases
        
    months_order = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    colors = {
        "LEPTOSPIROSE": C_LEPTO,
        "SRAG": C_SRAG,
        "DENGUE": C_DENGUE
    }
    
    fig = go.Figure()
    
    y_coords = {
        "LEPTOSPIROSE": 0,
        "SRAG": 1,
        "DENGUE": 2
    }
    
    annotations = []
    
    for d in ["LEPTOSPIROSE", "SRAG", "DENGUE"]:
        cases = disease_data[d]
        y_val = y_coords[d]
        c = colors[d]
        
        max_cases = max(cases) if max(cases) > 0 else 1
        cases_norm = [float(v) / max_cases * 10 for v in cases]
        
        x = list(range(12))
        X = [x, x]
        Y = [[y_val]*12, [y_val]*12]
        Z = [[0]*12, cases_norm]
        
        # 1. Add curtain
        fig.add_trace(go.Surface(
            x=X, y=Y, z=Z,
            colorscale=[[0, c], [1, c]],
            showscale=False,
            opacity=0.45,
            hoverinfo='skip'
        ))
        
        # 2. Add line
        fig.add_trace(go.Scatter3d(
            x=x, y=[y_val]*12, z=cases_norm,
            mode="lines+markers",
            line=dict(color=c, width=7),
            marker=dict(size=4, color=c),
            customdata=list(zip(months_order, cases)),
            hovertemplate=f"<b>{d.capitalize()} (2025)</b><br>Mês: %{{customdata[0]}}<br>Casos: %{{customdata[1]}}<extra></extra>"
        ))
        
        # 3. Add text labels for values
        # Start
        annotations.append(dict(
            showarrow=False,
            x=0, y=y_val, z=cases_norm[0],
            text=str(cases[0]),
            xshift=0, yshift=15,
            font=dict(color=c, size=11, family="Satoshi"),
            align="center"
        ))
        # End
        annotations.append(dict(
            showarrow=False,
            x=11, y=y_val, z=cases_norm[11],
            text=str(cases[11]),
            xshift=0, yshift=15,
            font=dict(color=c, size=11, family="Satoshi"),
            align="center"
        ))
        # Peak
        peak_idx = cases.index(max(cases))
        if 0 < peak_idx < 11:
            annotations.append(dict(
                showarrow=False,
                x=peak_idx, y=y_val, z=cases_norm[peak_idx],
                text=str(cases[peak_idx]),
                xshift=0, yshift=15,
                font=dict(color=c, size=11, family="Satoshi"),
                align="center"
            ))
            
    fig.update_layout(
        title="Distribuição Sazonal 3D por Doença (Ano Consolidado de 2025)",
        plot_bgcolor=DARK_BG,
        paper_bgcolor=DARK_BG,
        font=dict(color=TEXT_CLR, family="Satoshi"),
        margin=dict(t=50, b=40, l=40, r=20),
        height=650,
        showlegend=False,
        scene=dict(
            xaxis=dict(
                title=dict(text="Meses", font=dict(size=12)),
                tickvals=list(range(12)),
                ticktext=months_order,
                gridcolor=DARK_GRID,
                backgroundcolor=DARK_BG,
                showbackground=True,
                tickfont=dict(family="JetBrains Mono")
            ),
            yaxis=dict(
                title=dict(text="", font=dict(size=12)),
                tickvals=[0, 1, 2],
                ticktext=["Leptospirose", "SRAG", "Dengue"],
                gridcolor=DARK_GRID,
                backgroundcolor=DARK_BG,
                showbackground=True,
                tickfont=dict(family="Satoshi")
            ),
            zaxis=dict(
                title=dict(text="", font=dict(size=12)),
                showticklabels=False,
                showgrid=True,
                gridcolor=DARK_GRID,
                backgroundcolor=DARK_BG,
                showbackground=True
            ),
            aspectmode='manual',
            aspectratio=dict(x=1.3, y=1.3, z=0.7),
            camera=dict(
                eye=dict(x=1.6, y=-1.6, z=1.2)
            ),
            annotations=annotations
        )
    )
    return fig

def chart_chronological_timeline():
    df = q("""SELECT doenca, strftime('%Y-%m', data_notificacao) ano_mes, COUNT(*) casos
              FROM notificacoes WHERE data_notificacao IS NOT NULL
              GROUP BY doenca, ano_mes ORDER BY ano_mes""")
    months = pd.date_range(start="2024-12-01", end="2026-05-01", freq="MS").strftime("%Y-%m").tolist()
    
    def map_label(ym):
        y, m = ym.split("-")
        return f"{MES.get(m, m)}/{y[2:]}"
        
    fig = make_subplots(
        rows=3, cols=1, 
        shared_xaxes=True, 
        vertical_spacing=0.08,
        subplot_titles=("Dengue", "Leptospirose", "SRAG")
    )
    
    disease_rows = {"DENGUE": 1, "LEPTOSPIROSE": 2, "SRAG": 3}
    
    for d, c in DIS_COLORS.items():
        r = df[df["doenca"]==d].set_index("ano_mes").reindex(months).fillna(0).reset_index()
        r["label"] = r["ano_mes"].apply(map_label)
        row = disease_rows.get(d)
        fig.add_trace(go.Scatter(x=r["label"], y=r["casos"], name=d.capitalize(),
            mode="lines+markers", line=dict(color=c, width=3), marker=dict(size=7),
            hovertemplate=f"<b>{d.capitalize()}</b> — %{{x}}: %{{y}} casos<extra></extra>"),
            row=row, col=1)
            
    fig.update_layout(**LAYOUT_BASE, title="Evolução Chronológica Mensal por Doença (Dez 2024 – Mai 2026)",
        hovermode="x unified", height=650)
        
    # Personalização da fonte dos títulos dos subplots
    for ann in fig["layout"]["annotations"]:
        ann["font"] = dict(size=12, color=TEXT_CLR, family="Satoshi")
        
    fig.update_xaxes(**AXIS_STYLE, tickangle=-45)
    fig.update_yaxes(**AXIS_STYLE)
    
    # Adicionar títulos de eixos individuais
    fig.update_yaxes(title_text="Casos", row=1, col=1)
    fig.update_yaxes(title_text="Casos", row=2, col=1)
    fig.update_yaxes(title_text="Casos", row=3, col=1)
    fig.update_xaxes(title_text="Período (Mês/Ano)", row=3, col=1)
    
    return fig

def chart_delay():
    """Box: atraso notificação → sintomas por doença"""
    df = q("""SELECT doenca,
                ROUND(julianday(data_notificacao) - julianday(data_sintomas), 0) AS delay
              FROM notificacoes
              WHERE data_notificacao IS NOT NULL AND data_sintomas IS NOT NULL
                AND julianday(data_notificacao) - julianday(data_sintomas) BETWEEN 0 AND 90""")
    fig = go.Figure()
    for d, c in DIS_COLORS.items():
        r = df[df["doenca"]==d]["delay"].dropna()
        fig.add_trace(go.Box(y=r, name=d.capitalize(), marker_color=c,
            boxmean=True, hovertemplate="%{y} dias<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE,
        title="Atraso Sintomas → Notificação (2024–2026)",
        yaxis_title="Dias", showlegend=False)
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 3 — MAPA FOLIUM
# ══════════════════════════════════════════════════════════════════════════════
import unicodedata, re as _re

def _norm(s):
    """Normaliza string para matching de nomes de bairros."""
    s = str(s).upper().strip()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = _re.sub(r"\s+", " ", s)
    return s

def _bubble_radius(casos, max_casos, min_r=5, max_r=28):
    """Normaliza número de casos para raio de bolha entre min_r e max_r."""
    if max_casos == 0:
        return min_r
    return min_r + (max_r - min_r) * (casos / max_casos) ** 0.5

def build_map():
    df = q("""SELECT doenca, residencia_bairro bairro,
                ROUND(AVG(latitude),6) lat, ROUND(AVG(longitude),6) lon,
                COUNT(*) casos
              FROM notificacoes
              WHERE residencia_bairro IS NOT NULL AND latitude IS NOT NULL
              GROUP BY doenca, residencia_bairro""")

    # ── GeoJSON: lê e corrige encoding ───────────────────────────────────────
    try:
        with open(GEOJSON, "r", encoding="utf-8") as f:
            geo = json.load(f)
    except Exception:
        with open(GEOJSON, "r", encoding="latin-1") as f:
            geo = json.load(f)

    geo_lookup = {}
    for feat in geo["features"]:
        raw = feat["properties"].get("bairro_nome") or feat["properties"].get("name") or ""
        try:
            fixed = raw.encode("latin-1").decode("utf-8")
        except Exception:
            fixed = raw
        feat["properties"]["name"] = fixed
        geo_lookup[_norm(fixed)] = fixed

    # ── Bounds automáticos a partir do GeoJSON ────────────────────────────────
    lats, lons = [], []
    for feat in geo["features"]:
        geom = feat["geometry"]
        rings = geom["coordinates"] if geom["type"] == "Polygon" else \
                [r for poly in geom["coordinates"] for r in poly]
        for ring in rings:
            for lon, lat in ring:
                lats.append(lat); lons.append(lon)
    sw, ne = [min(lats), min(lons)], [max(lats), max(lons)]

    # ── Choropleth: TODOS os 52 bairros, 0 onde não há caso ──────────────────
    all_geo_names   = [f["properties"]["name"] for f in geo["features"]]
    choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    dengue      = df[df["doenca"] == "DENGUE"].copy()
    dengue["geo_name"] = dengue["bairro"].apply(_norm).map(geo_lookup)
    dengue_matched = dengue[dengue["geo_name"].notna()][["geo_name","casos"]].copy()
    dengue_matched.columns = ["bairro","casos"]
    dengue_dict = dict(zip(dengue_matched["bairro"], dengue_matched["casos"]))
    choropleth_data["casos"] = choropleth_data["bairro"].map(dengue_dict).fillna(0).astype(int)

    lepto_data = df[df["doenca"] == "LEPTOSPIROSE"].copy()
    lepto_data["geo_name"] = lepto_data["bairro"].apply(_norm).map(geo_lookup)
    lepto_matched = lepto_data[lepto_data["geo_name"].notna()][["geo_name","casos"]].copy()
    lepto_matched.columns = ["bairro","casos"]
    lepto_dict = dict(zip(lepto_matched["bairro"], lepto_matched["casos"]))
    lepto_choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    lepto_choropleth_data["casos"] = lepto_choropleth_data["bairro"].map(lepto_dict).fillna(0).astype(int)

    # ── SRAG segmented counts ──
    srag_df = q("""
        SELECT 
            n.residencia_bairro AS bairro,
            SUM(CASE WHEN s.pcr_sars2 = '1' THEN 1 ELSE 0 END) AS covid,
            SUM(CASE WHEN s.pos_pcrflu = '1' THEN 1 ELSE 0 END) AS influenza,
            SUM(CASE WHEN s.pcr_vsr = '1' THEN 1 ELSE 0 END) AS vsr,
            SUM(CASE WHEN (s.pcr_sars2 != '1' OR s.pcr_sars2 IS NULL) 
                          AND (s.pos_pcrflu != '1' OR s.pos_pcrflu IS NULL) 
                          AND (s.pcr_vsr != '1' OR s.pcr_vsr IS NULL) THEN 1 ELSE 0 END) AS outros
        FROM notificacoes n
        LEFT JOIN srag_detalhes s ON n.id_notificacao = s.id_notificacao
        WHERE n.doenca = 'SRAG' AND n.residencia_bairro IS NOT NULL
        GROUP BY n.residencia_bairro
    """)
    srag_df["geo_name"] = srag_df["bairro"].apply(_norm).map(geo_lookup)
    srag_matched = srag_df[srag_df["geo_name"].notna()]
    
    covid_dict = dict(zip(srag_matched["geo_name"], srag_matched["covid"]))
    flu_dict   = dict(zip(srag_matched["geo_name"], srag_matched["influenza"]))
    vsr_dict   = dict(zip(srag_matched["geo_name"], srag_matched["vsr"]))
    outros_dict = dict(zip(srag_matched["geo_name"], srag_matched["outros"]))
    
    covid_choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    covid_choropleth_data["casos"] = covid_choropleth_data["bairro"].map(covid_dict).fillna(0).astype(int)
    
    flu_choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    flu_choropleth_data["casos"] = flu_choropleth_data["bairro"].map(flu_dict).fillna(0).astype(int)
    
    vsr_choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    vsr_choropleth_data["casos"] = vsr_choropleth_data["bairro"].map(vsr_dict).fillna(0).astype(int)
    
    outros_choropleth_data = pd.DataFrame({"bairro": all_geo_names, "casos": 0})
    outros_choropleth_data["casos"] = outros_choropleth_data["bairro"].map(outros_dict).fillna(0).astype(int)

    for feat in geo["features"]:
        feat["properties"]["dengue_casos"] = dengue_dict.get(feat["properties"]["name"], 0)
        feat["properties"]["lepto_casos"] = lepto_dict.get(feat["properties"]["name"], 0)
        feat["properties"]["srag_covid"] = covid_dict.get(feat["properties"]["name"], 0)
        feat["properties"]["srag_flu"] = flu_dict.get(feat["properties"]["name"], 0)
        feat["properties"]["srag_vsr"] = vsr_dict.get(feat["properties"]["name"], 0)
        feat["properties"]["srag_outros"] = outros_dict.get(feat["properties"]["name"], 0)

    # ── Mapa base (sem tile padrão — definidos abaixo como layers) ───────────
    m = folium.Map(
        location=[-1.455, -48.490],
        zoom_start=13,
        tiles=None,           # tiles adicionados manualmente abaixo
        prefer_canvas=True,
    )
    m.fit_bounds([sw, ne], padding=(20, 20))

    # ── Base layers: escuro (ON) e claro (OFF) ────────────────────────────────
    folium.TileLayer(
        tiles="CartoDB dark_matter",
        name="Escuro",
        attr="© CartoDB",
        show=True,
    ).add_to(m)
    folium.TileLayer(
        tiles="CartoDB positron",
        name="Claro",
        attr="© CartoDB",
        show=False,
    ).add_to(m)

    # ── Layer 1: Choropleth Dengue (padrão: ON) ───────────────────────────────
    max_dengue_casos = int(choropleth_data["casos"].max())
    dengue_bins = [0, 0.9, 10, 50, 100, 200, max(260, max_dengue_casos + 1)]

    choropleth = folium.Choropleth(
        geo_data=geo,
        data=choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="YlOrRd",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="Dengue — Casos por Bairro (2025–2026)",
        name="Dengue (Choropleth, 2025–2026)",
        show=True,
        bins=dengue_bins,
    )
    choropleth.add_to(m)
    choropleth.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "dengue_casos"],
            aliases=["Bairro:", "Dengue:"],
            style=(
                "background:#1E293B;color:#E2E8F0;border:1px solid #334155;"
                "font-family:Satoshi,sans-serif;font-size:13px;"
                "padding:6px 10px;border-radius:6px;"
            ),
        )
    )

    # ── Helper: Circle em metros (escala com zoom) ────────────────────────────
    def add_circles(grp, sub_df, color, max_casos, min_m=300, max_m=2500, opacity=0.70):
        for r in sub_df.itertuples():
            if max_casos == 0:
                rad_m = min_m
            else:
                rad_m = min_m + (max_m - min_m) * (r.casos / max_casos) ** 0.5
            folium.Circle(
                location=[r.lat, r.lon],
                radius=rad_m,
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=opacity,
                weight=1.5,
                tooltip=(
                    f"<b style='color:{color}'>{r.bairro}</b>"
                    f"<br>Casos: <b>{r.casos}</b>"
                ),
            ).add_to(grp)

    # ── Layer 2.2: Leptospirose (Choropleth, 2025) ───────────────────────────────
    max_lepto_casos = int(lepto_choropleth_data["casos"].max())
    lepto_bins = [0, 0.9, 2, 5, 10, max(12, max_lepto_casos + 1)]
    lepto_choropleth = folium.Choropleth(
        geo_data=geo,
        data=lepto_choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="PuBu",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="Leptospirose — Casos por Bairro (2025)",
        name="Leptospirose (Choropleth, 2025)",
        show=False,
        bins=lepto_bins,
    )
    lepto_choropleth.add_to(m)
    lepto_choropleth.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "lepto_casos"],
            aliases=["Bairro:", "Leptospirose:"],
            style=(
                "background:#1E293B;color:#E2E8F0;border:1px solid #334155;"
                "font-family:Satoshi,sans-serif;font-size:13px;"
                "padding:6px 10px;border-radius:6px;"
            ),
        )
    )
    # ── Layer 3.1: SRAG — COVID-19 (Choropleth, 2024–2026) ─────────────────────
    max_covid = int(covid_choropleth_data["casos"].max())
    covid_bins = [0, 0.9, 2, 5, 10, max(12, max_covid + 1)]
    srag_covid = folium.Choropleth(
        geo_data=geo,
        data=covid_choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="Purples",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="SRAG COVID-19 — Casos por Bairro",
        name="SRAG — COVID-19 (Choropleth)",
        show=False,
        bins=covid_bins,
    )
    srag_covid.add_to(m)
    srag_covid.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "srag_covid"],
            aliases=["Bairro:", "SRAG COVID-19:"],
            style="background:#1E293B;color:#E2E8F0;border:1px solid #334155;font-family:Satoshi,sans-serif;font-size:13px;padding:6px 10px;border-radius:6px;",
        )
    )

    # ── Layer 3.2: SRAG — Influenza (Choropleth, 2024–2026) ─────────────────────
    max_flu = int(flu_choropleth_data["casos"].max())
    flu_bins = [0, 0.9, 2, 5, 10, max(12, max_flu + 1)]
    srag_flu = folium.Choropleth(
        geo_data=geo,
        data=flu_choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="Purples",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="SRAG Influenza — Casos por Bairro",
        name="SRAG — Influenza (Choropleth)",
        show=False,
        bins=flu_bins,
    )
    srag_flu.add_to(m)
    srag_flu.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "srag_flu"],
            aliases=["Bairro:", "SRAG Influenza:"],
            style="background:#1E293B;color:#E2E8F0;border:1px solid #334155;font-family:Satoshi,sans-serif;font-size:13px;padding:6px 10px;border-radius:6px;",
        )
    )

    # ── Layer 3.3: SRAG — VSR (Choropleth, 2024–2026) ───────────────────────────
    max_vsr = int(vsr_choropleth_data["casos"].max())
    vsr_bins = [0, 0.9, 2, 5, 10, max(12, max_vsr + 1)]
    srag_vsr = folium.Choropleth(
        geo_data=geo,
        data=vsr_choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="Purples",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="SRAG VSR — Casos por Bairro",
        name="SRAG — VSR (Choropleth)",
        show=False,
        bins=vsr_bins,
    )
    srag_vsr.add_to(m)
    srag_vsr.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "srag_vsr"],
            aliases=["Bairro:", "SRAG VSR:"],
            style="background:#1E293B;color:#E2E8F0;border:1px solid #334155;font-family:Satoshi,sans-serif;font-size:13px;padding:6px 10px;border-radius:6px;",
        )
    )

    # ── Layer 3.4: SRAG — Outros / Não Espec. (Choropleth, 2024–2026) ───────────
    max_outros = int(outros_choropleth_data["casos"].max())
    outros_bins = [0, 0.9, 5, 20, 50, max(60, max_outros + 1)]
    srag_outros = folium.Choropleth(
        geo_data=geo,
        data=outros_choropleth_data,
        columns=["bairro", "casos"],
        key_on="feature.properties.name",
        fill_color="Purples",
        fill_opacity=0.82,
        line_opacity=0.45,
        line_color="#475569",
        legend_name="SRAG Outros / Não Espec. — Casos por Bairro",
        name="SRAG — Outros / Não Espec. (Choropleth)",
        show=False,
        bins=outros_bins,
    )
    srag_outros.add_to(m)
    srag_outros.geojson.add_child(
        folium.features.GeoJsonTooltip(
            fields=["name", "srag_outros"],
            aliases=["Bairro:", "SRAG Outros/Não Espec:"],
            style="background:#1E293B;color:#E2E8F0;border:1px solid #334155;font-family:Satoshi,sans-serif;font-size:13px;padding:6px 10px;border-radius:6px;",
        )
    )

    # ── Mapas de Calor (Grouped together) ──────────────────────────────────────

    # ── Heatmap 1: Dengue (Mapa de Calor, 2025–2026) ───────────────────────────
    dengue_df = df[df["doenca"] == "DENGUE"].dropna(subset=["lat","lon"])
    dengue_heat_grp = folium.FeatureGroup(name="Mapa de Calor (Dengue, 2025–2026)", show=False)
    HeatMap(
        [[r.lat, r.lon, r.casos] for r in dengue_df.itertuples()],
        radius=18, blur=20, max_zoom=14,
    ).add_to(dengue_heat_grp)
    dengue_heat_grp.add_to(m)

    # ── Heatmap 2: Leptospirose (Mapa de Calor, 2025) ──────────────────────────
    lepto_df  = df[df["doenca"] == "LEPTOSPIROSE"].dropna(subset=["lat","lon"])
    lepto_heat_grp = folium.FeatureGroup(name="Mapa de Calor (Leptospirose, 2025)", show=False)
    HeatMap(
        [[r.lat, r.lon, r.casos] for r in lepto_df.itertuples()],
        radius=18, blur=20, max_zoom=14,
    ).add_to(lepto_heat_grp)
    lepto_heat_grp.add_to(m)

    # ── Heatmap 3: SRAG Geral (Mapa de Calor, 2024–2026) ───────────────────────
    srag_coords = q("""
        SELECT latitude AS lat, longitude AS lon, 1 AS casos
        FROM notificacoes
        WHERE doenca = 'SRAG' AND latitude IS NOT NULL AND longitude IS NOT NULL
    """)
    srag_heat_grp = folium.FeatureGroup(name="Mapa de Calor (SRAG Geral, 2024–2026)", show=False)
    HeatMap(
        [[r.lat, r.lon, r.casos] for r in srag_coords.itertuples()],
        radius=18, blur=20, max_zoom=14,
    ).add_to(srag_heat_grp)
    srag_heat_grp.add_to(m)

    # ── Controle de camadas ───────────────────────────────────────────────────
    folium.LayerControl(collapsed=False).add_to(m)

    # ── CSS + JS injetados no root do mapa ────────────────────────────────────
    custom_element_html = """
<style>
/* ── Controle de camadas dark ── */
.leaflet-control-layers {
  background: rgba(15,17,23,0.95) !important;
  border: 1px solid #334155 !important;
  border-radius: 10px !important;
  color: #E2E8F0 !important;
  font-family: Satoshi, sans-serif !important;
  font-size: 13px !important;
}
.leaflet-control-layers-expanded { padding: 8px 14px !important; }
.leaflet-control-layers label    { color: #E2E8F0 !important; cursor: pointer; }
.leaflet-control-layers-separator{ border-top: 1px solid #334155 !important; }
.leaflet-control-layers-overlays input[type="checkbox"],
.leaflet-control-layers-base     input[type="radio"] {
  accent-color: #38BDF8;
  width: 14px; height: 14px;
  cursor: pointer;
}
/* ── Indicadores personalizados das camadas ── */
.layer-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  margin-left: 4px;
  vertical-align: middle;
  transition: transform 0.2s, box-shadow 0.2s;
}
.layer-indicator.dengue {
  background: #F97316 !important;
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.6) !important;
}
.layer-indicator.lepto {
  background: #06B6D4 !important;
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.6) !important;
}
.layer-indicator.srag {
  background: #8B5CF6 !important;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.6) !important;
}
.layer-indicator.heatmap {
  background: linear-gradient(135deg, #EF4444, #F59E0B) !important;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6) !important;
}
.layer-indicator.escuro {
  background: transparent !important;
  border: 1.5px solid #E2E8F0 !important;
  width: 7px;
  height: 7px;
}
.layer-indicator.claro {
  background: #FACC15 !important;
  box-shadow: 0 0 6px rgba(250, 204, 21, 0.6) !important;
}
.leaflet-control-layers label:hover .layer-indicator {
  transform: scale(1.2);
}
/* ── Legenda do choropleth ── */
.legend:empty {
  display: none !important;
}
.legend {
  position: fixed !important;
  bottom: 20px !important;
  left: 10px !important;
  top: auto !important;
  right: auto !important;
  background: rgba(15,17,23,0.92) !important;
  border: 1px solid #475569 !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.5) !important;
  z-index: 9999 !important;
}
.legend text, .legend .caption {
  fill:  #E2E8F0 !important;
  color: #E2E8F0 !important;
  font-family: Satoshi, sans-serif !important;
  font-size: 11px !important;
}
.legend svg text { fill: #E2E8F0 !important; }
/* ── Botões de zoom ── */
.leaflet-control-zoom a {
  background: rgba(15,17,23,0.95) !important;
  color: #E2E8F0 !important;
  border-color: #334155 !important;
}
.leaflet-control-zoom a:hover { background: #1E293B !important; }
</style>

<script>
/* Overlays se comportam como radio buttons: apenas 1 ativo por vez */
(function() {
  function makeRadio() {
    var boxes = document.querySelectorAll(
      '.leaflet-control-layers-overlays input[type="checkbox"]'
    );
    if (!boxes.length) { setTimeout(makeRadio, 300); return; }
    boxes.forEach(function(box) {
      box.addEventListener('change', function() {
        if (!this.checked) return;
        var self = this;
        boxes.forEach(function(other) {
          if (other !== self && other.checked) other.click();
        });
      });
    });
  }
  document.addEventListener('DOMContentLoaded', makeRadio);
  setTimeout(makeRadio, 700);
})();

(function() {
  function attachHeat() {
    /* encontra o objeto L.Map gerado pelo Folium */
    var mapObj = null;
    for (var key in window) {
      try {
        if (key.indexOf('map_') === 0 &&
            window[key] &&
            typeof window[key].eachLayer === 'function') {
          mapObj = window[key];
          break;
        }
      } catch(e) {}
    }
    if (!mapObj) { setTimeout(attachHeat, 300); return; }
    
    // Vincula a sincronização de legendas aos eventos do Leaflet
    mapObj.on('overlayadd', syncLegends);
    mapObj.on('overlayremove', syncLegends);
    
    // Executa uma sincronização inicial após renderizar
    setTimeout(syncLegends, 100);
    setTimeout(syncLegends, 500);
    setTimeout(syncLegends, 1200);

    // Adiciona botão de enquadramento (reset view) no controle de zoom
    var zoomContainer = document.querySelector('.leaflet-control-zoom');
    if (zoomContainer && !document.querySelector('.leaflet-control-reset-view')) {
      var resetBtn = document.createElement('a');
      resetBtn.className = 'leaflet-control-reset-view';
      resetBtn.href = '#';
      resetBtn.title = 'Enquadrar Belém';
      resetBtn.role = 'button';
      resetBtn.innerHTML = '🗺️';
      resetBtn.style.display = 'flex';
      resetBtn.style.alignItems = 'center';
      resetBtn.style.justifyContent = 'center';
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        mapObj.fitBounds(BOUNDS_PLACEHOLDER, {padding: [20, 20]});
      });
      zoomContainer.appendChild(resetBtn);
    }

    // Configura MutationObserver para reaplicar a estilização sempre que o controle de camadas for recriado pelo Leaflet
    var layerControlEl = document.querySelector('.leaflet-control-layers');
    if (layerControlEl) {
      var observer = new MutationObserver(customizeLayerControl);
      observer.observe(layerControlEl, { childList: true, subtree: true });
    }
    customizeLayerControl();
  }

  document.addEventListener('DOMContentLoaded', attachHeat);
  setTimeout(attachHeat, 900);
})();

/* Personalização CSS das labels do LayerControl via injeção de <style> dinâmico */
/* Abordagem: zero manipulação de DOM — usa CSS ::before nos spans de texto */
function customizeLayerControl() {
  var labels = document.querySelectorAll('.leaflet-control-layers label');
  labels.forEach(function(label) {
    if (label.dataset.customized) return;
    var span = label.querySelector('span');
    if (!span) return;
    var text = span.textContent.trim();
    var color = '';
    var shadow = '';
    var isGradient = false;

    if (text.includes('Escuro')) {
      color = 'transparent'; shadow = '0 0 0 1.5px #94A3B8';
    } else if (text.includes('Claro')) {
      color = '#FACC15'; shadow = '0 0 5px rgba(250,204,21,.7)';
    } else if (text.includes('Dengue') && text.includes('Choropleth')) {
      color = '#F97316'; shadow = '0 0 5px rgba(249,115,22,.7)';
    } else if (text.includes('Leptospirose') && text.includes('Choropleth')) {
      color = '#06B6D4'; shadow = '0 0 5px rgba(6,182,212,.7)';
    } else if (text.includes('SRAG') && text.includes('Choropleth')) {
      color = '#8B5CF6'; shadow = '0 0 5px rgba(139,92,246,.7)';
    } else if (text.includes('Mapa de Calor')) {
      color = '#EF4444'; shadow = '0 0 5px rgba(239,68,68,.7)';
    }

    if (!color) return;

    // Inject a small <i> before the text — leaves input untouched
    var dot = document.createElement('i');
    dot.style.cssText = [
      'display:inline-block',
      'width:9px',
      'height:9px',
      'border-radius:50%',
      'background:' + color,
      'box-shadow:' + shadow,
      'margin-right:7px',
      'margin-left:3px',
      'vertical-align:middle',
      'flex-shrink:0',
      'transition:transform .15s',
    ].join(';');
    span.insertBefore(dot, span.firstChild);
    label.dataset.customized = '1';
  });
}

/* Sincronização de legendas com os mapas ativos */
function syncLegends() {
  customizeLayerControl();
  var labels = Array.from(document.querySelectorAll('.leaflet-control-layers-overlays label'));
  var legends = Array.from(document.querySelectorAll('.legend'));
  
  legends.forEach(function(legend) {
    if (!legend.innerHTML.trim() || legend.children.length === 0) {
      legend.style.setProperty('display', 'none', 'important');
      return;
    }
    
    var html = legend.innerHTML || '';
    var text = legend.textContent || '';
    var layerName = '';
    
    if (text.includes('Dengue') || html.includes('Dengue')) {
      layerName = 'Dengue';
    } else if (text.includes('Leptospirose') || html.includes('Leptospirose')) {
      layerName = 'Leptospirose';
    } else if (text.includes('COVID-19') || html.includes('COVID-19')) {
      layerName = 'COVID-19';
    } else if (text.includes('Influenza') || html.includes('Influenza')) {
      layerName = 'Influenza';
    } else if (text.includes('VSR') || html.includes('VSR')) {
      layerName = 'VSR';
    } else if (text.includes('Outros') || html.includes('Outros')) {
      layerName = 'Outros';
    }
    
    if (layerName) {
      var matchingLabel = labels.find(function(lbl) {
        return lbl.textContent.includes(layerName) && lbl.textContent.includes('Choropleth');
      });
      if (matchingLabel) {
        var checkbox = matchingLabel.querySelector('input');
        if (checkbox && checkbox.checked) {
          legend.style.setProperty('display', 'block', 'important');
        } else {
          legend.style.setProperty('display', 'none', 'important');
        }
      } else {
        // Fallback inicial se o painel de controle de camadas ainda não carregou
        if (layerName === 'Dengue') {
          legend.style.setProperty('display', 'block', 'important');
        } else {
          legend.style.setProperty('display', 'none', 'important');
        }
      }
    } else {
      legend.style.setProperty('display', 'none', 'important');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  syncLegends();
  document.addEventListener('change', function(e) {
    if (e.target && e.target.type === 'checkbox') {
      syncLegends();
    }
  });
});
</script>
"""
    custom_element_html = custom_element_html.replace("BOUNDS_PLACEHOLDER", str([[sw[0], sw[1]], [ne[0], ne[1]]]))
    m.get_root().html.add_child(folium.Element(custom_element_html))

    import re
    html_content = m._repr_html_()
    colormap_ids = set(re.findall(r'color_map_([a-f0-9]{32})', html_content))
    for cid in colormap_ids:
        # Corrige a criação do elemento DOM injetando uma classe única
        html_content = re.sub(
            fr"(color_map_{cid}\.legend\.onAdd\s*=\s*function\s*\(map\)\s*\{{var\s+div\s*=\s*L\.DomUtil\.create\((['&#x27;]+)div\2,\s*(['&#x27;]+)legend(?:\s+leaflet-control)?\3\))",
            fr"color_map_{cid}.legend.onAdd = function (map) {{var div = L.DomUtil.create(\2div\2, \3legend leaflet-control legend-{cid}\3)",
            html_content
        )
        # Corrige o seletor d3 para anexar o SVG no elemento correto
        html_content = re.sub(
            fr"(color_map_{cid}\.svg\s*=\s*d3\.select\((['&quot;\&#x27;]+)\.legend)\.leaflet-control\2\)",
            fr"\1-{cid}\2)",
            html_content
        )

    return html_content

def get_centroids_dict():
    try:
        with open(GEOJSON, "r", encoding="utf-8") as f:
            geo = json.load(f)
    except Exception:
        with open(GEOJSON, "r", encoding="latin-1") as f:
            geo = json.load(f)
            
    centroids = {}
    for feat in geo["features"]:
        raw = feat["properties"].get("bairro_nome") or feat["properties"].get("name") or ""
        try:
            fixed = raw.encode("latin-1").decode("utf-8")
        except Exception:
            fixed = raw
            
        geom = feat["geometry"]
        if not geom or 'coordinates' not in geom:
            continue
        rings = geom["coordinates"] if geom["type"] == "Polygon" else \
                [r for poly in geom["coordinates"] for r in poly]
        
        lats, lons = [], []
        for ring in rings:
            for lon, lat in ring:
                lats.append(lat)
                lons.append(lon)
        if lats and lons:
            centroids[fixed.strip().upper()] = [sum(lats)/len(lats), sum(lons)/len(lons)]
    return centroids



def chart_top_bairros():

    df = q("""SELECT doenca, residencia_bairro bairro, COUNT(*) casos
              FROM notificacoes WHERE residencia_bairro IS NOT NULL AND residencia_bairro != ''
              GROUP BY doenca, residencia_bairro""")
    top = df.groupby("bairro")["casos"].sum().nlargest(15).index.tolist()
    df = df[df["bairro"].isin(top)]
    fig = go.Figure()
    for d, c in DIS_COLORS.items():
        r = df[df["doenca"]==d].set_index("bairro").reindex(top).fillna(0)
        fig.add_trace(go.Bar(y=top, x=r["casos"].values, name=d.capitalize(),
            orientation="h", marker_color=c, opacity=0.9))
    fig.update_layout(**LAYOUT_BASE, barmode="stack",
        title="Top 15 Bairros — Incidência Acumulada (2024–2026)",
        xaxis_title="Casos", yaxis=dict(autorange="reversed", gridcolor=DARK_GRID),
        hovermode="y")
    fig.update_xaxes(**AXIS_STYLE)
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 4 — SOCIODEMOGRAFIA
# ══════════════════════════════════════════════════════════════════════════════
RACA_MAP = {"1":"Branca","2":"Preta","3":"Amarela","4":"Parda","5":"Indígena","9":"Ignorada"}
ESC_MAP = {
    "0":"Analfabeto","1":"1ª–4ª","2":"5ª–8ª","3":"Médio Incompleto",
    "4":"Médio Completo","5":"Sup. Incompleto","6":"Sup. Completo",
    "7":"Não se aplica","8":"4ª série completa","9":"Ignorada","10":"Ignorada"
}
GEST_MAP = {"1":"1º Trim.","2":"2º Trim.","3":"3º Trim.","4":"Idade Gest. Ign.",
            "5":"Não","6":"Não se aplica","9":"Ignorada","0":"Ignorada"}
ZONA_MAP = {"1":"Urbana","2":"Rural","3":"Periurbana","9":"Ignorada"}

def chart_raca():
    df = q("SELECT paciente_raca, doenca, COUNT(*) n FROM notificacoes GROUP BY paciente_raca, doenca")
    df["raca_label"] = df["paciente_raca"].astype(str).map(RACA_MAP).fillna("Ignorada")
    fig = px.bar(df, x="raca_label", y="n", color="doenca", barmode="stack",
        color_discrete_map=DIS_COLORS,
        labels={"raca_label":"Raça/Etnia","n":"Casos","doenca":"Doença"},
        title="Distribuição Racial por Doença (2024–2026) — escala log")
    fig.update_layout(**LAYOUT_BASE, hovermode="x")
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(**AXIS_STYLE, type="log")
    return fig

def chart_escolaridade():
    df = q("SELECT paciente_escolaridade, COUNT(*) n FROM notificacoes GROUP BY paciente_escolaridade")
    df["esc_label"] = df["paciente_escolaridade"].astype(str).str.strip().str.lstrip("0").map(ESC_MAP).fillna("Ignorada")
    df = df.groupby("esc_label")["n"].sum().reset_index().sort_values("n", ascending=True)
    fig = go.Figure(go.Bar(y=df["esc_label"], x=df["n"], orientation="h",
        marker=dict(color=df["n"], colorscale=[[0,C_LEPTO],[1,C_SRAG]], showscale=False),
        hovertemplate="<b>%{y}</b>: %{x}<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Escolaridade dos Pacientes (2024–2026) — escala log",
        xaxis_title="Casos (log)")
    fig.update_xaxes(**AXIS_STYLE, type="log")
    fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_gestante():
    df = q("""SELECT paciente_gestante, doenca, COUNT(*) n
              FROM notificacoes WHERE paciente_sexo='F'
              GROUP BY paciente_gestante, doenca""")
    df["gest_label"] = df["paciente_gestante"].astype(str).map(GEST_MAP).fillna("Ignorada")
    df = df.groupby(["gest_label", "doenca"])["n"].sum().reset_index()
    
    labels = ["1º Trim.", "2º Trim.", "3º Trim.", "Idade Gest. Ign.", "Não", "Não se aplica", "Ignorada"]
    diseases = ["DENGUE", "LEPTOSPIROSE", "SRAG"]
    
    idx = pd.MultiIndex.from_product([labels, diseases], names=["gest_label", "doenca"])
    df = df.set_index(["gest_label", "doenca"]).reindex(idx, fill_value=0).reset_index()
    df = df[df["n"] > 0]
    
    fig = px.bar(df, x="gest_label", y="n", color="doenca",
        barmode="stack",
        color_discrete_map=DIS_COLORS,
        category_orders={"gest_label": labels},
        labels={"gest_label":"Status Gestacional","n":"Casos (Feminino) (log)","doenca":"Doença"},
        title="Status Gestacional — Pacientes do Sexo Feminino (2024–2026) — escala log")
    fig.update_layout(**LAYOUT_BASE, hovermode="x")
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(**AXIS_STYLE, type="log")
    return fig

def chart_zona_sexo():
    fig = make_subplots(rows=1, cols=2,
        specs=[[{"type": "domain"}, {"type": "xy"}]],
        subplot_titles=["Zona Residencial", "Distribuição por Sexo"])
    # Zona — pie needs type="domain"
    dz = q("SELECT residencia_zona, COUNT(*) n FROM notificacoes GROUP BY residencia_zona")
    dz["label"] = dz["residencia_zona"].astype(str).map(ZONA_MAP).fillna("Ignorada")
    dz = dz.groupby("label")["n"].sum().reset_index()
    fig.add_trace(go.Pie(labels=dz["label"], values=dz["n"], hole=0.55,
        marker_colors=[C_ACCENT, C_WARN, C_LEPTO, MUTED],
        textinfo="label+percent", name="Zona"), row=1, col=1)
    # Sexo
    ds = q("""SELECT doenca, paciente_sexo sexo, COUNT(*) n
              FROM notificacoes WHERE paciente_sexo IN ('M','F')
              GROUP BY doenca, paciente_sexo""")
    for d, c in DIS_COLORS.items():
        r = ds[ds["doenca"]==d]
        fig.add_trace(go.Bar(name=d.capitalize(), x=r["sexo"], y=r["n"],
            marker_color=c, showlegend=True), row=1, col=2)
    fig.update_layout(**LAYOUT_BASE, barmode="group",
        title="Zona Residencial e Distribuição por Sexo (2024–2026)")
    fig.update_xaxes(AXIS_STYLE, row=1, col=2)
    fig.update_yaxes(dict(**AXIS_STYLE, type="log", title_text="Casos (log)"), row=1, col=2)
    return fig

def chart_age_pyramid():
    df = q("""SELECT doenca,
               CASE WHEN paciente_idade_anos<5 THEN '0–4'
                    WHEN paciente_idade_anos<15 THEN '5–14'
                    WHEN paciente_idade_anos<30 THEN '15–29'
                    WHEN paciente_idade_anos<45 THEN '30–44'
                    WHEN paciente_idade_anos<60 THEN '45–59'
                    WHEN paciente_idade_anos<75 THEN '60–74'
                    ELSE '75+' END faixa,
               COUNT(*) casos
              FROM notificacoes WHERE paciente_idade_anos IS NOT NULL
              GROUP BY doenca, faixa ORDER BY doenca, faixa""")
    faixas = ["0–4","5–14","15–29","30–44","45–59","60–74","75+"]
    fig = go.Figure()
    for d, c in DIS_COLORS.items():
        r = df[df["doenca"]==d].set_index("faixa").reindex(faixas).fillna(0)
        # +1 evita log(0) em faixas sem casos
        fig.add_trace(go.Bar(name=d.capitalize(), x=faixas,
            y=r["casos"].values + 1, marker_color=c, opacity=0.85,
            hovertemplate="%{x}: %{customdata} casos<extra></extra>",
            customdata=r["casos"].values))
    fig.update_layout(**LAYOUT_BASE, barmode="stack",
        title="Distribuição por Faixa Etária (2024–2026) — escala log",
        xaxis_title="Faixa", yaxis_title="Casos (log)", hovermode="x")
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(**AXIS_STYLE, type="log")
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 5 — PROGRESSÃO CLÍNICA DENGUE
# ══════════════════════════════════════════════════════════════════════════════
CLASSI_MAP = {"5":"Dengue s/ Sinais Alarme","8":"Dengue c/ Sinais Alarme",
              "10":"Dengue Grave","11":"Descartado","12":"Inconclusivo"}

def chart_dengue_classificacao():
    df = q("""SELECT classificacao_final, COUNT(*) n FROM notificacoes
              WHERE doenca='DENGUE' GROUP BY classificacao_final ORDER BY n DESC""")
    df["label"] = df["classificacao_final"].astype(str).map(CLASSI_MAP).fillna("Sem Info")
    df = df[df["label"]!="Sem Info"].sort_values("n")
    cores = {
        "Dengue s/ Sinais Alarme": C_OK,
        "Dengue c/ Sinais Alarme": C_WARN,
        "Dengue Grave": C_DANGER,
        "Descartado": MUTED,
        "Inconclusivo": "#334155",
    }
    fig = go.Figure(go.Bar(
        y=df["label"], x=df["n"], orientation="h",
        marker_color=[cores.get(l, MUTED) for l in df["label"]],
        hovertemplate="<b>%{y}</b>: %{x} casos<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Classificação Final — Dengue (2025–2026) — escala log",
        xaxis_title="Casos (log)")
    fig.update_xaxes(**AXIS_STYLE, type="log")
    fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_dengue_alarm():
    # 1. Total classificados como Dengue com Sinais de Alarme (Classificação '8')
    t_class_8 = q("""SELECT COUNT(*) FROM notificacoes 
                     WHERE doenca='DENGUE' AND classificacao_final='8'""").iloc[0, 0]
    
    # 2. Casos com Classificação '8' que têm a ficha detalhada preenchida (qualquer campo não nulo)
    c_class_8_filled = q("""
        SELECT COUNT(DISTINCT n.id_notificacao) 
        FROM notificacoes n 
        JOIN dengue_detalhes d ON n.id_notificacao = d.id_notificacao
        WHERE n.doenca='DENGUE' AND n.classificacao_final='8'
          AND (d.alrm_hipot IS NOT NULL OR d.alrm_plaq IS NOT NULL OR d.alrm_vom IS NOT NULL 
               OR d.alrm_sang IS NOT NULL OR d.alrm_hemat IS NOT NULL OR d.alrm_abdom IS NOT NULL 
               OR d.alrm_letar IS NOT NULL OR d.alrm_hepat IS NOT NULL OR d.alrm_liq IS NOT NULL)
    """).iloc[0, 0]

    # 3. Casos Descartados/Inconclusivos (Classificação '11' ou '12') com a ficha detalhada preenchida
    c_other_filled = q("""
        SELECT COUNT(DISTINCT n.id_notificacao) 
        FROM notificacoes n 
        JOIN dengue_detalhes d ON n.id_notificacao = d.id_notificacao
        WHERE n.doenca='DENGUE' AND n.classificacao_final IN ('11', '12')
          AND (d.alrm_hipot IS NOT NULL OR d.alrm_plaq IS NOT NULL OR d.alrm_vom IS NOT NULL 
               OR d.alrm_sang IS NOT NULL OR d.alrm_hemat IS NOT NULL OR d.alrm_abdom IS NOT NULL 
               OR d.alrm_letar IS NOT NULL OR d.alrm_hepat IS NOT NULL OR d.alrm_liq IS NOT NULL)
    """).iloc[0, 0]

    # 4. Casos Sem Sinais de Alarme (Classificação '5') com a ficha detalhada preenchida
    c_class_5_filled = q("""
        SELECT COUNT(DISTINCT n.id_notificacao) 
        FROM notificacoes n 
        JOIN dengue_detalhes d ON n.id_notificacao = d.id_notificacao
        WHERE n.doenca='DENGUE' AND n.classificacao_final = '5'
          AND (d.alrm_hipot IS NOT NULL OR d.alrm_plaq IS NOT NULL OR d.alrm_vom IS NOT NULL 
               OR d.alrm_sang IS NOT NULL OR d.alrm_hemat IS NOT NULL OR d.alrm_abdom IS NOT NULL 
               OR d.alrm_letar IS NOT NULL OR d.alrm_hepat IS NOT NULL OR d.alrm_liq IS NOT NULL)
    """).iloc[0, 0]

    categories = [
        "Casos Confirmados<br>com Sinais de<br>Alarme (Total)",
        "Sinais Clínicos<br>Preenchidos (Casos com<br>Sinais de Alarme)",
        "Sinais Clínicos<br>Preenchidos (Casos<br>Descartados/Inconclusivos)",
        "Sinais Clínicos<br>Preenchidos (Casos sem<br>Sinais de Alarme)"
    ]
    values = [int(t_class_8), int(c_class_8_filled), int(c_other_filled), int(c_class_5_filled)]
    colors = [C_WARN, C_WARN, MUTED, "#334155"]
    
    df = pd.DataFrame({
        "Categoria": categories,
        "Casos": values,
        "Cor": colors
    })
    df = df.sort_values("Casos", ascending=True)

    fig = go.Figure(go.Bar(
        y=df["Categoria"], x=df["Casos"], orientation="h",
        marker_color=df["Cor"],
        text=df["Casos"].apply(lambda val: f"<b>{val}</b>"),
        textposition="outside",
        hovertemplate="<b>%{y}</b>: %{x} casos<extra></extra>"
    ))
    
    max_val = df["Casos"].max()
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(
        title="Qualidade dos Dados: Auditoria de Sinais de Alarme (Dengue)",
        xaxis_title="Notificações / Fichas Preenchidas",
        yaxis=dict(gridcolor=DARK_GRID),
        margin=dict(t=50, b=40, l=180, r=80)
    )
    fig.update_xaxes(**AXIS_STYLE, range=[0, max_val * 1.2])
    fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_dengue_gravity():
    # 1. Total classificados como Dengue Grave (Classificação '10')
    t_class_10 = q("""SELECT COUNT(*) FROM notificacoes 
                      WHERE doenca='DENGUE' AND classificacao_final='10'""").iloc[0, 0]
    
    # 2. Casos com Classificação '10' que têm a ficha detalhada de gravidade preenchida
    c_class_10_filled = q("""
        SELECT COUNT(DISTINCT n.id_notificacao) 
        FROM notificacoes n 
        JOIN dengue_detalhes d ON n.id_notificacao = d.id_notificacao
        WHERE n.doenca='DENGUE' AND n.classificacao_final='10'
          AND (d.grav_pulso IS NOT NULL OR d.grav_conv IS NOT NULL OR d.grav_insuf IS NOT NULL 
               OR d.grav_hipot IS NOT NULL OR d.grav_hemat IS NOT NULL OR d.grav_ast IS NOT NULL 
               OR d.grav_mioc IS NOT NULL OR d.grav_consc IS NOT NULL OR d.grav_orgao IS NOT NULL)
    """).iloc[0, 0]

    # 3. Casos Descartados/Inconclusivos (Classificação '11' ou '12') com a ficha detalhada de gravidade preenchida
    c_other_filled = q("""
        SELECT COUNT(DISTINCT n.id_notificacao) 
        FROM notificacoes n 
        JOIN dengue_detalhes d ON n.id_notificacao = d.id_notificacao
        WHERE n.doenca='DENGUE' AND n.classificacao_final IN ('11', '12')
          AND (d.grav_pulso IS NOT NULL OR d.grav_conv IS NOT NULL OR d.grav_insuf IS NOT NULL 
               OR d.grav_hipot IS NOT NULL OR d.grav_hemat IS NOT NULL OR d.grav_ast IS NOT NULL 
               OR d.grav_mioc IS NOT NULL OR d.grav_consc IS NOT NULL OR d.grav_orgao IS NOT NULL)
    """).iloc[0, 0]

    categories = [
        "Casos Confirmados<br>de Dengue Grave<br>(Total)",
        "Sinais de Gravidade<br>Preenchidos (Casos<br>de Dengue Grave)",
        "Sinais de Gravidade<br>Preenchidos (Casos<br>Descartados/Inconclusivos)"
    ]
    values = [int(t_class_10), int(c_class_10_filled), int(c_other_filled)]
    colors = [C_DANGER, C_DANGER, MUTED]
    
    df = pd.DataFrame({
        "Categoria": categories,
        "Casos": values,
        "Cor": colors
    })
    df = df.sort_values("Casos", ascending=True)

    fig = go.Figure(go.Bar(
        y=df["Categoria"], x=df["Casos"], orientation="h",
        marker_color=df["Cor"],
        text=df["Casos"].apply(lambda val: f"<b>{val}</b>"),
        textposition="outside",
        hovertemplate="<b>%{y}</b>: %{x} casos<extra></extra>"
    ))
    
    max_val = df["Casos"].max()
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(
        title="Qualidade dos Dados: Auditoria de Sinais de Gravidade (Dengue Grave)",
        xaxis_title="Notificações / Fichas Preenchidas",
        yaxis=dict(gridcolor=DARK_GRID),
        margin=dict(t=50, b=40, l=180, r=80)
    )
    fig.update_xaxes(**AXIS_STYLE, range=[0, max_val * 1.2])
    fig.update_yaxes(**AXIS_STYLE)
    return fig


def chart_dengue_symptoms_radar():
    df = q("""SELECT
        SUM(febre='1') febre, SUM(mialgia='1') mialgia, SUM(cefaleia='1') cefaleia,
        SUM(exantema='1') exantema, SUM(vomito='1') vomito, SUM(nausea='1') nausea,
        SUM(dor_costas='1') dor_costas, SUM(artralgia='1') artralgia,
        SUM(dor_retro='1') dor_retro, COUNT(*) total
    FROM dengue_detalhes""")
    total = df["total"].iloc[0]
    cats  = ["Febre","Mialgia","Cefaleia","Exantema","Vômito","Náusea",
             "Dor Costas","Artralgia","Dor Retroorbitária"]
    vals  = [round(df[c.lower().replace(" ","_").replace("ô","o").replace("á","a")
                       .replace("é","e").replace("ú","u")].iloc[0]/total*100, 1)
             for c in ["febre","mialgia","cefaleia","exantema","vomito","nausea",
                       "dor_costas","artralgia","dor_retro"]]
    fig = go.Figure(go.Scatterpolar(
        r=vals+[vals[0]], theta=cats+[cats[0]],
        fill="toself", fillcolor="rgba(249,115,22,0.2)",
        line=dict(color=C_DENGUE, width=2.5), name="Dengue",
        hovertemplate="%{theta}: %{r}%<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Perfil de Sintomas — Dengue (2025–2026) (%)",
        polar=dict(bgcolor=DARK_BG,
            radialaxis=dict(range=[0,100], gridcolor=DARK_GRID, tickfont=dict(color=MUTED)),
            angularaxis=dict(gridcolor=DARK_GRID)))
    return fig

def chart_dengue_sorotipo_criterio():
    fig = make_subplots(rows=1, cols=2,
        specs=[[{"type": "domain"}, {"type": "xy"}]],
        subplot_titles=["Sorotipo Detectado (DENV)", "Critério de Confirmação"])
    # Sorotipo
    dso = q("SELECT sorotipo, COUNT(*) n FROM dengue_detalhes WHERE sorotipo NOT IN ('','None') AND sorotipo IS NOT NULL GROUP BY sorotipo ORDER BY n DESC")
    dso["label"] = "DENV-" + dso["sorotipo"].astype(str)
    fig.add_trace(go.Pie(labels=dso["label"], values=dso["n"], hole=0.55,
        marker_colors=[C_DENGUE, C_WARN, C_LEPTO], textinfo="label+value",
        name="Sorotipo"), row=1, col=1)
    # Critério
    CRIT_MAP = {"1":"Laboratorial","2":"Clínico-Epidemiológico","3":"Clínico","4":"Ignorado"}
    dc = q("SELECT criterio_confirmacao, doenca, COUNT(*) n FROM notificacoes WHERE doenca IN ('DENGUE','LEPTOSPIROSE','SRAG') GROUP BY criterio_confirmacao, doenca")
    dc["crit_label"] = dc["criterio_confirmacao"].astype(str).map(CRIT_MAP).fillna("Sem Info")
    dc2 = dc.groupby(["crit_label","doenca"])["n"].sum().reset_index()
    for d, c in DIS_COLORS.items():
        r = dc2[dc2["doenca"]==d]
        fig.add_trace(go.Bar(name=d.capitalize(), x=r["crit_label"], y=r["n"],
            marker_color=c, showlegend=True), row=1, col=2)
    fig.update_layout(**LAYOUT_BASE, barmode="stack",
        title="Sorotipo e Critério de Confirmação (2024–2026)", hovermode="x")
    fig.update_xaxes(AXIS_STYLE, row=1, col=2)
    fig.update_yaxes(dict(**AXIS_STYLE, type="log", title_text="Casos (log)"), row=1, col=2)
    return fig

def chart_dengue_lab():
    df_sums = q("""SELECT
        SUM(CASE WHEN resul_soro='1' THEN 1 ELSE 0 END) AS 'Soro_Pos',
        SUM(CASE WHEN resul_soro='2' THEN 1 ELSE 0 END) AS 'Soro_Neg',
        SUM(CASE WHEN resul_ns1='1'  THEN 1 ELSE 0 END) AS 'NS1_Pos',
        SUM(CASE WHEN resul_ns1='2'  THEN 1 ELSE 0 END) AS 'NS1_Neg',
        SUM(CASE WHEN resul_pcr_='1' THEN 1 ELSE 0 END) AS 'PCR_Pos',
        SUM(CASE WHEN resul_pcr_='2' THEN 1 ELSE 0 END) AS 'PCR_Neg'
    FROM dengue_detalhes""").iloc[0]
    
    data = [
        {"teste": "Sorologia", "resultado": "Positivo", "n": int(df_sums["Soro_Pos"])},
        {"teste": "Sorologia", "resultado": "Negativo", "n": int(df_sums["Soro_Neg"])},
        {"teste": "NS1", "resultado": "Positivo", "n": int(df_sums["NS1_Pos"])},
        {"teste": "NS1", "resultado": "Negativo", "n": int(df_sums["NS1_Neg"])},
        {"teste": "PCR", "resultado": "Positivo", "n": int(df_sums["PCR_Pos"])},
        {"teste": "PCR", "resultado": "Negativo", "n": int(df_sums["PCR_Neg"])},
    ]
    df = pd.DataFrame(data)
    
    cores_lab = {"Positivo": C_OK, "Negativo": C_DANGER}
    fig = px.bar(df, x="teste", y="n", color="resultado",
        barmode="stack",
        color_discrete_map=cores_lab,
        category_orders={"resultado": ["Positivo", "Negativo"]},
        labels={"teste": "Teste", "n": "Resultados", "resultado": "Resultado"},
        title="Resultados Laboratoriais — Dengue (2025–2026)")
        
    fig.update_layout(**LAYOUT_BASE, hovermode="x")
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_lepto_exposure():
    row = q("""SELECT
        SUM(ant_cb_lam='1') AS 'Lama / Enchente',
        SUM(ant_cb_cri='1') AS 'Criação de Animais',
        SUM(ant_cb_cai='1') AS 'Caiu em Rio/Lago',
        SUM(ant_cb_roe='1') AS 'Contato com Roedores',
        SUM(ant_cb_gra='1') AS 'Trabalho Agrícola',
        SUM(ant_cb_ter='1') AS 'Terraplanagem',
        SUM(ant_cb_lix='1') AS 'Contato com Lixo',
        SUM(ant_cb_sin='1') AS 'Trabalho em Saneamento',
        SUM(ant_cb_pla='1') AS 'Contato com Plantações'
    FROM leptospirose_detalhes""").T.rename(columns={0:"n"}).reset_index()
    row.columns = ["fator","n"]
    row = row.sort_values("n")
    fig = go.Figure(go.Bar(y=row["fator"], x=row["n"], orientation="h",
        marker=dict(color=row["n"], colorscale=[[0,"#0EA5E9"],[1,C_LEPTO]], showscale=False),
        hovertemplate="<b>%{y}</b>: %{x}<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Exposição Ambiental — Leptospirose (2025)",
        xaxis_title="Pacientes")
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_lepto_lab():
    row = q("""SELECT
        SUM(cli_febre='1') 'Febre', SUM(cli_mialgi='1') 'Mialgia',
        SUM(cli_cefale='1') 'Cefaleia', SUM(cli_pantur='1') 'Dor Panturrilha',
        SUM(cli_icteri='1') 'Icterícia', SUM(cli_renal='1') 'Insuf. Renal',
        SUM(cli_respir='1') 'Insuf. Respiratória', SUM(cli_cardia='1') 'Insuf. Cardíaca',
        SUM(cli_hemorr='1') 'Hemorragia', SUM(cli_mening='1') 'Meningite',
        SUM(lab_elis_1='1') 'ELISA +', SUM(lab_micr_1='1') 'Microaglut. +'
    FROM leptospirose_detalhes""").T.rename(columns={0:"n"}).reset_index()
    row.columns = ["indicador","n"]
    row = row.sort_values("n")
    is_lab = row["indicador"].str.contains("ELISA|Micro")
    cores = [C_WARN if b else C_LEPTO for b in is_lab]
    fig = go.Figure(go.Bar(y=row["indicador"], x=row["n"], orientation="h",
        marker_color=cores, hovertemplate="<b>%{y}</b>: %{x}<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Sintomas e Laboratório — Leptospirose (2025)",
        xaxis_title="Pacientes")
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig


def chart_lepto_soil_moisture():
    # Fetch daily cases of Leptospirose, precipitation and tides
    df_cases = q("""
        SELECT data_sintomas, COUNT(*) casos
        FROM notificacoes
        WHERE doenca='LEPTOSPIROSE' AND data_sintomas IS NOT NULL
        GROUP BY data_sintomas
    """)
    df_clima = q("""
        SELECT data_diaria, chuva_inmet_total, mare_maxima
        FROM view_clima_diario
    """)
    
    df_cases['data_sintomas'] = pd.to_datetime(df_cases['data_sintomas'])
    df_clima['data_diaria'] = pd.to_datetime(df_clima['data_diaria'])
    
    # Construct complete date range matching DB dates
    date_range = pd.date_range(start='2025-01-01', end='2026-05-16', freq='D')
    df_cases = df_cases.set_index('data_sintomas').reindex(date_range, fill_value=0)
    df_cases.index.name = 'data'
    df_cases = df_cases.reset_index()
    
    df_clima = df_clima.rename(columns={'data_diaria': 'data'})
    df_merged = pd.merge(df_cases, df_clima, on='data', how='left')
    
    df_merged['chuva_inmet_total'] = df_merged['chuva_inmet_total'].fillna(0.0)
    df_merged['mare_maxima'] = df_merged['mare_maxima'].ffill().bfill()
    
    # Rolling averages (7d)
    df_merged['casos_smoothed'] = df_merged['casos'].rolling(window=7, min_periods=1).mean()
    df_merged['chuva_smoothed'] = df_merged['chuva_inmet_total'].rolling(window=7, min_periods=1).mean()
    df_merged['mare_smoothed'] = df_merged['mare_maxima'].rolling(window=7, min_periods=1).mean()
    
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    # Chuva (mm) on left axis
    fig.add_trace(go.Scatter(x=df_merged["data"], y=df_merged["chuva_smoothed"], name="Precipitação INMET (Média 7d)",
        mode="lines", line=dict(color=C_ACCENT, width=2.2)), secondary_y=False)
    # Maré Máxima (m) on left axis
    fig.add_trace(go.Scatter(x=df_merged["data"], y=df_merged["mare_smoothed"], name="Maré Máxima Marinha (Média 7d)",
        mode="lines", line=dict(color=C_WARN, width=2.2, dash="dash")), secondary_y=False)
    # Casos on right axis
    fig.add_trace(go.Bar(x=df_merged["data"], y=df_merged["casos_smoothed"], name="Casos Leptospirose (Média 7d)",
        marker_color=C_LEPTO, opacity=0.65), secondary_y=True)
        
    fig.update_layout(**LAYOUT_BASE, title="Sazonalidade: Casos de Leptospirose vs. Chuva e Maré Máxima (2025–2026)",
        hovermode="x unified")
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(title_text="Chuva (mm) / Maré (m)", gridcolor=DARK_GRID, secondary_y=False)
    fig.update_yaxes(title_text="Casos Leptospirose (Suavizado)", gridcolor=DARK_GRID, secondary_y=True)
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 6 — VIROLOGIA SRAG (PCR + Sorotipo)
# ══════════════════════════════════════════════════════════════════════════════
def chart_srag_virus_pcr():
    row = q("""SELECT
        SUM(pcr_sars2='1')  'SARS-CoV-2',
        SUM(pos_pcrflu='1') 'Influenza (any)',
        SUM(pcr_fluasu='1') 'Influenza A',
        SUM(pcr_flubli='1') 'Influenza B',
        SUM(pcr_vsr='1')    'VSR',
        SUM(pcr_adeno='1')  'Adenovírus',
        SUM(pcr_metap='1')  'Metapneumovírus',
        SUM(pcr_rino='1')   'Rinovírus',
        SUM(pcr_para1='1' OR pcr_para2='1' OR pcr_para3='1' OR pcr_para4='1') 'Parainfluenza'
    FROM srag_detalhes""").T.rename(columns={0:"n"}).reset_index()
    row.columns = ["virus","n"]
    row = row.sort_values("n")
    cores_v = {
        "SARS-CoV-2": "#F43F5E", "Influenza (any)": C_WARN, "Influenza A": C_WARN,
        "Influenza B": "#FCD34D", "VSR": C_SRAG, "Adenovírus": C_LEPTO,
        "Metapneumovírus": "#34D399", "Rinovírus": C_ACCENT, "Parainfluenza": "#A78BFA"
    }
    fig = go.Figure(go.Bar(
        y=row["virus"], x=row["n"], orientation="h",
        marker_color=[cores_v.get(v, MUTED) for v in row["virus"]],
        hovertemplate="<b>%{y}</b>: %{x} detecções<extra></extra>"))
    fig.update_layout(**LAYOUT_BASE, title="Vírus Detectados por PCR — SRAG (2024–2026)",
        xaxis_title="Casos com Detecção Positiva")
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_srag_comorbidades():
    row = q("""SELECT
        SUM(febre='1') 'Febre', SUM(tosse='1') 'Tosse',
        SUM(dispneia='1') 'Dispneia', SUM(saturacao='1') 'Baixa Saturação O₂',
        SUM(diarreia='1') 'Diarreia', SUM(fadiga='1') 'Fadiga',
        SUM(perd_olft='1') 'Perda Olfato', SUM(perd_pala='1') 'Perda Paladar',
        SUM(diabetes='1') 'Diabetes', SUM(cardiopati='1') 'Cardiopatia',
        SUM(obesidade='1') 'Obesidade', SUM(asma='1') 'Asma',
        SUM(neurologic='1') 'D. Neurológica', SUM(renal='1') 'D. Renal',
        SUM(imunodepre='1') 'Imunodeficiência', SUM(pneumopati='1') 'Pneumopatia',
        SUM(hematologi='1') 'D. Hematológica', SUM(sind_down='1') 'Sínd. Down'
    FROM srag_detalhes""").T.rename(columns={0:"n"}).reset_index()
    row.columns = ["indicador","n"]
    row = row.sort_values("n")
    sintomas = {"Febre","Tosse","Dispneia","Baixa Saturação O₂","Diarreia",
                "Fadiga","Perda Olfato","Perda Paladar"}
    cores = [C_SRAG if r in sintomas else C_LEPTO for r in row["indicador"]]
    fig = go.Figure(go.Bar(y=row["indicador"], x=row["n"], orientation="h",
        marker_color=cores, hovertemplate="<b>%{y}</b>: %{x}<extra></extra>"))
    # Legend annotation
    fig.add_annotation(x=1, y=1, xref="paper", yref="paper",
        text="<span style='color:#8B5CF6'>■</span> Sintoma  "
             "<span style='color:#06B6D4'>■</span> Comorbidade",
        showarrow=False, font=dict(size=11), align="right")
    fig.update_layout(**LAYOUT_BASE, title="Sintomas e Comorbidades — SRAG (2024–2026)",
        xaxis_title="Pacientes")
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig


def chart_srag_air_quality():
    # Fetch daily cases of SRAG and daily average PM2.5
    df_cases = q("""
        SELECT data_sintomas, COUNT(*) casos
        FROM notificacoes
        WHERE doenca='SRAG' AND data_sintomas IS NOT NULL
        GROUP BY data_sintomas
    """)
    df_clima = q("""
        SELECT data_diaria, pm25_ugm3_medio
        FROM view_clima_diario
        WHERE pm25_ugm3_medio IS NOT NULL
    """)
    # Merge and interpolate
    df_cases['data_sintomas'] = pd.to_datetime(df_cases['data_sintomas'])
    df_clima['data_diaria'] = pd.to_datetime(df_clima['data_diaria'])
    
    date_range = pd.date_range(start='2025-01-01', end='2026-05-16', freq='D')
    df_cases = df_cases.set_index('data_sintomas').reindex(date_range, fill_value=0)
    df_cases.index.name = 'data'
    df_cases = df_cases.reset_index()
    
    df_clima = df_clima.rename(columns={'data_diaria': 'data'})
    df_merged = pd.merge(df_cases, df_clima, on='data', how='left')
    df_merged['pm25_ugm3_medio'] = df_merged['pm25_ugm3_medio'].ffill().bfill()
    
    # Rolling averages (7d)
    df_merged['casos_smoothed'] = df_merged['casos'].rolling(window=7, min_periods=1).mean()
    df_merged['pm25_smoothed'] = df_merged['pm25_ugm3_medio'].rolling(window=7, min_periods=1).mean()
    
    # Create two stacked subplots with shared x axes
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True, vertical_spacing=0.08,
                        subplot_titles=("Material Particulado Estimado (PM2.5)", "Casos de SRAG"))
    
    # Row 1: PM2.5 Line (Orange)
    fig.add_trace(go.Scatter(
        x=df_merged["data"], 
        y=df_merged["pm25_smoothed"], 
        name="PM2.5 Estimado (7d)",
        mode="lines", 
        line=dict(color=C_WARN, width=2.5),
        hovertemplate="PM2.5: %{y:.1f} µg/m³<extra></extra>"
    ), row=1, col=1)
    
    # Row 2: Daily SRAG (Translucent Bar)
    fig.add_trace(go.Bar(
        x=df_merged["data"], 
        y=df_merged["casos"], 
        name="Casos Diários",
        marker_color=C_SRAG, 
        opacity=0.3,
        hovertemplate="Casos Diários: %{y}<extra></extra>"
    ), row=2, col=1)
    
    # Row 2: 7-day Moving Average (Solid Purple Line)
    fig.add_trace(go.Scatter(
        x=df_merged["data"], 
        y=df_merged["casos_smoothed"], 
        name="Média Móvel (7d)",
        mode="lines", 
        line=dict(color=C_SRAG, width=3),
        hovertemplate="Média (7d): %{y:.1f} casos<extra></extra>"
    ), row=2, col=1)
    
    # Add a highlighted region for the seasonal peak of SRAG: April to June 2025
    fig.add_vrect(
        x0="2025-04-01", x1="2025-06-30",
        fillcolor="rgba(139, 92, 246, 0.08)", opacity=1,
        layer="below", line_width=0,
        annotation_text="Maior Incidência de SRAG",
        annotation_position="top left",
        annotation_font=dict(size=10, color=MUTED, family="Satoshi"),
        row=2, col=1
    )
    
    # Update layout
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(
        title="Qualidade do Ar e SRAG em Belém — 2025–2026<br><span style='font-size: 0.8rem; color: #64748B;'>Pico de SRAG ocorre entre abril e junho de 2025, enquanto o PM2.5 estimado permanece relativamente estável.</span>",
        height=600,
        hovermode="x unified",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        ),
        margin=dict(t=80, b=40, l=40, r=20)
    )
    
    # Custom axes titles and styles
    fig.update_xaxes(**AXIS_STYLE, row=1, col=1)
    fig.update_xaxes(**AXIS_STYLE, title_text="Período de Notificação", row=2, col=1)
    
    has_pm25 = not df_merged["pm25_smoothed"].isna().all()
    pm25_range = [20, 28] if has_pm25 else [0, 35]
    
    fig.update_yaxes(title_text="PM2.5 (µg/m³)", gridcolor=DARK_GRID, range=pm25_range, row=1, col=1)
    fig.update_yaxes(title_text="Casos de SRAG", gridcolor=DARK_GRID, row=2, col=1)
    
    # Personalização da fonte dos títulos dos subplots
    for ann in fig["layout"]["annotations"]:
        t = getattr(ann, "text", None)
        if t and "Incidência" not in t:
            ann["font"] = dict(size=13, color=TEXT_CLR, family="Satoshi")
            ann["x"] = 0 # align titles to the left
            
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 7 — VACINAÇÃO E TRATAMENTO (SRAG)
# ══════════════════════════════════════════════════════════════════════════════
def chart_vacina_desfecho():
    df = q("""SELECT s.vacina_cov, n.evolucao, COUNT(*) cnt
              FROM srag_detalhes s
              JOIN notificacoes n ON s.id_notificacao = n.id_notificacao
              GROUP BY s.vacina_cov, n.evolucao""")
    VAC_MAP = {"1":"Vacinado","2":"Não Vacinado","9":"Ignorado"}
    EVO_MAP = {"1":"Cura","2":"Óbito (Doença)","3":"Óbito (Outras)","9":"Ignorado"}
    df["vac_label"] = df["vacina_cov"].astype(str).map(VAC_MAP).fillna("S/Info")
    df["evo_label"] = df["evolucao"].astype(str).map(EVO_MAP).fillna("S/Info")
    df2 = df.groupby(["vac_label","evo_label"])["cnt"].sum().reset_index()
    
    # Calculate percentages within each group
    df_total = df2.groupby("vac_label")["cnt"].sum().reset_index().rename(columns={"cnt": "total"})
    df3 = pd.merge(df2, df_total, on="vac_label")
    df3["pct"] = (df3["cnt"] / df3["total"] * 100).round(0)
    
    # Custom label with group size 'n' formatted in Portuguese style (dots for thousands)
    df3["group_label"] = df3.apply(
        lambda r: f"{r['vac_label']}<br><span style='font-size: 0.72rem; color: #8E9AAF; font-weight: normal;'>n ≈ {r['total']:,}</span>".replace(",", "."), 
        axis=1
    )
    
    # Text inside the bars
    df3["text_label"] = df3["pct"].apply(lambda p: f"{p:.0f}%" if p >= 2 else "")
    
    # Define custom outcome order for stack (optional but clean)
    category_order = ["Cura", "Ignorado", "S/Info", "Óbito (Doença)", "Óbito (Outras)"]
    
    fig = px.bar(df3, y="group_label", x="pct", color="evo_label", orientation="h", barmode="stack",
        text="text_label",
        color_discrete_map={"Cura": C_OK, "Óbito (Doença)": C_DANGER,
                            "Óbito (Outras)": C_WARN, "Ignorado": MUTED, "S/Info": "#334155"},
        category_orders={"evo_label": category_order},
        labels={"group_label":"Status Vacinal","pct":"% dos casos dentro do grupo","evo_label":"Desfecho"},
        title="Vacinação COVID-19 × Desfecho Clínico — SRAG (2024–2026)")
        
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(hovermode="y unified", legend=dict(orientation="h", y=-0.2, x=0.5, xanchor="center", bgcolor="#1E293B", bordercolor="#334155", borderwidth=1))
    fig.update_xaxes(**AXIS_STYLE, range=[0, 100], ticksuffix="%")
    fig.update_yaxes(**AXIS_STYLE, categoryorder="category descending") # Alphabetical from top to bottom
    fig.update_traces(textposition='inside', textfont=dict(size=11, color=TEXT_CLR))
    return fig

def chart_antiviral_desfecho():
    df = q("""SELECT s.antiviral, n.evolucao, COUNT(*) cnt
              FROM srag_detalhes s
              JOIN notificacoes n ON s.id_notificacao = n.id_notificacao
              GROUP BY s.antiviral, n.evolucao""")
    ANTIV = {"1":"Com Antiviral","2":"Sem Antiviral","9":"Ignorado"}
    EVO_MAP = {"1":"Cura","2":"Óbito (Doença)","3":"Óbito (Outras)","9":"Ignorado"}
    df["antiv_label"] = df["antiviral"].astype(str).map(ANTIV).fillna("S/Info")
    df["evo_label"] = df["evolucao"].astype(str).map(EVO_MAP).fillna("S/Info")
    df2 = df.groupby(["antiv_label","evo_label"])["cnt"].sum().reset_index()
    
    # Calculate percentages within each group
    df_total = df2.groupby("antiv_label")["cnt"].sum().reset_index().rename(columns={"cnt": "total"})
    df3 = pd.merge(df2, df_total, on="antiv_label")
    df3["pct"] = (df3["cnt"] / df3["total"] * 100).round(0)
    
    # Custom label with group size 'n' formatted in Portuguese style (dots for thousands)
    df3["group_label"] = df3.apply(
        lambda r: f"{r['antiv_label']}<br><span style='font-size: 0.72rem; color: #8E9AAF; font-weight: normal;'>n ≈ {r['total']:,}</span>".replace(",", "."), 
        axis=1
    )
    
    # Text inside the bars
    df3["text_label"] = df3["pct"].apply(lambda p: f"{p:.0f}%" if p >= 2 else "")
    
    # Define custom outcome order for stack (optional but clean)
    category_order = ["Cura", "Ignorado", "S/Info", "Óbito (Doença)", "Óbito (Outras)"]
    
    fig = px.bar(df3, y="group_label", x="pct", color="evo_label", orientation="h", barmode="stack",
        text="text_label",
        color_discrete_map={"Cura": C_OK, "Óbito (Doença)": C_DANGER,
                            "Óbito (Outras)": C_WARN, "Ignorado": MUTED, "S/Info": "#334155"},
        category_orders={"evo_label": category_order},
        labels={"group_label":"Uso de Antiviral","pct":"% dos casos dentro do grupo","evo_label":"Desfecho"},
        title="Uso de Antiviral × Desfecho Clínico — SRAG (2024–2026)")
        
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(hovermode="y unified", legend=dict(orientation="h", y=-0.2, x=0.5, xanchor="center", bgcolor="#1E293B", bordercolor="#334155", borderwidth=1))
    fig.update_xaxes(**AXIS_STYLE, range=[0, 100], ticksuffix="%")
    fig.update_yaxes(**AXIS_STYLE, categoryorder="category descending") # Alphabetical from top to bottom
    fig.update_traces(textposition='inside', textfont=dict(size=11, color=TEXT_CLR))
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 8 — DDA
# ══════════════════════════════════════════════════════════════════════════════
def chart_dda_weekly():
    df_c = q("SELECT semana, faixa_total casos FROM dda_casos_semanal ORDER BY semana")
    df_s = q("SELECT semana, surtos_detectados surtos FROM dda_surtos_semanal ORDER BY semana")
    df = pd.merge(df_c, df_s, on="semana", how="left")
    df["surtos"] = df["surtos"].fillna(0)
    df["label"] = df["semana"].apply(lambda s: f"SE{s[4:6]}/{s[2:4]}" if len(str(s))==6 else str(s))
    
    # Calculate the average (mean) weekly cases
    mean_casos = df["casos"].mean()
    
    # Split into normal and outbreak cases for separate styling and legend
    df["casos_normal"] = df.apply(lambda r: r["casos"] if r["surtos"] <= 0 else None, axis=1)
    df["casos_surto"] = df.apply(lambda r: r["casos"] if r["surtos"] > 0 else None, axis=1)
    
    fig = go.Figure()
    
    # Normal weeks
    fig.add_trace(go.Bar(
        x=df["label"], y=df["casos_normal"], name="Casos DDA (Sem Surto)",
        marker_color=C_DDA, opacity=0.8
    ))
    
    # Outbreak weeks
    fig.add_trace(go.Bar(
        x=df["label"], y=df["casos_surto"], name="Casos DDA (Com Surto)",
        marker_color=C_DANGER, opacity=0.95
    ))
    
    # Outbreak warning triangle
    df_surtos = df[df["surtos"] > 0]
    if not df_surtos.empty:
        fig.add_trace(go.Scatter(
            x=df_surtos["label"], y=df_surtos["casos"] + 40,
            name="Alerta de Surto",
            mode="markers",
            marker=dict(symbol="triangle-up", size=11, color=C_DANGER, line=dict(width=1, color=TEXT_CLR)),
            hovertemplate="<b>Surto Detectado nesta Semana!</b><br>Casos: %{y}<extra></extra>"
        ))
        
    fig.update_layout(**LAYOUT_BASE, title="DDA — Casos Semanais e Surtos Detectados (2025)",
        barmode="stack", hovermode="x unified",
        xaxis=dict(tickangle=-45, gridcolor=DARK_GRID),
        yaxis=dict(title_text="Casos Notificados", gridcolor=DARK_GRID))
        
    # Add horizontal line for the average weekly cases
    fig.add_hline(
        y=mean_casos,
        line_dash="dash",
        line_width=1.5,
        line_color="#E2E8F0",
        annotation_text=f"Média: {mean_casos:.0f} casos",
        annotation_position="top left",
        annotation_font=dict(color="#E2E8F0", size=10, family="Satoshi")
    )
        
    return fig

def chart_dda_planos():
    df = q("SELECT semana, plano_a, plano_b, plano_c FROM dda_casos_semanal ORDER BY semana")
    df["label"] = df["semana"].apply(lambda s: f"SE{s[4:6]}/{s[2:4]}" if len(str(s))==6 else str(s))
    fig = go.Figure()
    for col, name, color in [("plano_a","Plano A (leve)",C_OK),
                              ("plano_b","Plano B (moderado)",C_WARN),
                              ("plano_c","Plano C (grave)",C_DANGER)]:
        fig.add_trace(go.Scatter(x=df["label"], y=df[col], name=name, mode="lines",
            stackgroup="one", line=dict(width=0.5, color=color)))
    fig.update_layout(**LAYOUT_BASE, title="DDA — Planos de Reidratação por Semana (2025)",
        xaxis=dict(tickangle=-45, gridcolor=DARK_GRID),
        yaxis=dict(gridcolor=DARK_GRID), hovermode="x unified")
    return fig

def chart_dda_age():
    df = q("""SELECT semana, COALESCE(faixa_menor_1,0) a0, COALESCE(faixa_1_a_4,0) a1,
               COALESCE(faixa_5_a_9,0) a5, COALESCE(faixa_10_mais,0) a10
              FROM dda_casos_semanal ORDER BY semana""")
    df["label"] = df["semana"].apply(lambda s: f"SE{s[4:6]}/{s[2:4]}" if len(str(s))==6 else str(s))
    fig = go.Figure()
    for col, name, color in [("a0","< 1 ano",C_DANGER),("a1","1–4 anos",C_WARN),
                              ("a5","5–9 anos",C_DDA),("a10","10+ anos",C_ACCENT)]:
        fig.add_trace(go.Scatter(x=df["label"], y=df[col], name=name, mode="lines",
            stackgroup="one", line=dict(width=0.5, color=color)))
    fig.update_layout(**LAYOUT_BASE, title="DDA — Casos por Faixa Etária Semanal (2025)",
        xaxis=dict(tickangle=-45, gridcolor=DARK_GRID),
        yaxis=dict(gridcolor=DARK_GRID), hovermode="x unified")
    return fig


# ══════════════════════════════════════════════════════════════════════════════
#  SEÇÃO 9 — DESFECHOS
# ══════════════════════════════════════════════════════════════════════════════
def chart_hospitalizacao():
    df = q("SELECT doenca, hospitalizado, COUNT(*) n FROM notificacoes GROUP BY doenca, hospitalizado")
    HOSP = {"S":"Hospitalizado","N":"Não Hospitalizado","9":"Ignorado"}
    df["hosp_label"] = df["hospitalizado"].map(HOSP).fillna("S/Info")
    fig = px.bar(df, x="doenca", y="n", color="hosp_label", barmode="stack",
        color_discrete_map={"Hospitalizado":C_DANGER,"Não Hospitalizado":C_OK,
                            "Ignorado":MUTED,"S/Info":"#334155"},
        labels={"doenca":"Doença","n":"Casos","hosp_label":"Status"},
        title="Hospitalização por Doença (2024–2026)")
    fig.update_layout(**LAYOUT_BASE)
    fig.update_xaxes(**AXIS_STYLE); fig.update_yaxes(**AXIS_STYLE)
    return fig

def chart_evolucao():
    df = q("SELECT doenca, evolucao, COUNT(*) n FROM notificacoes GROUP BY doenca, evolucao")
    EVO_MAP = {"1":"Cura","2":"Óbito (Doença)","3":"Óbito (Outras)","9":"Ignorado"}
    df["evo_label"] = df["evolucao"].astype(str).map(EVO_MAP).fillna("Sem Info")
    fig = px.bar(df, x="doenca", y="n", color="evo_label", barmode="stack",
        color_discrete_map={"Cura":C_OK,"Óbito (Doença)":C_DANGER,
                            "Óbito (Outras)":C_WARN,"Ignorado":MUTED,"Sem Info":"#334155"},
        labels={"doenca":"Doença","n":"Casos","evo_label":"Evolução"},
        title="Evolução Clínica (Desfecho Final) (2024–2026) — escala log")
    fig.update_layout(**LAYOUT_BASE)
    fig.update_xaxes(**AXIS_STYLE)
    fig.update_yaxes(**AXIS_STYLE, type="log", title_text="Casos (log)")
    return fig

def chart_obitos_perfil():
    """Perfil dos óbitos: média de idade e volume de óbitos por doença e sexo"""
    df = q("""SELECT doenca, paciente_sexo sexo,
               ROUND(AVG(paciente_idade_anos),1) avg_age,
               COUNT(*) obitos
              FROM notificacoes WHERE evolucao='2'
              GROUP BY doenca, paciente_sexo
              ORDER BY doenca, paciente_sexo""")
    df = df[df["sexo"].isin(["M","F"])]
    
    # Mapeamento para nomes de doenças formatados amigavelmente
    disease_map = {"DENGUE": "Dengue", "LEPTOSPIROSE": "Leptospirose", "SRAG": "SRAG"}
    df["doenca"] = df["doenca"].map(disease_map)
    
    df_f = df[df["sexo"] == "F"]
    df_m = df[df["sexo"] == "M"]
    
    # Criação do subplot 1x2
    fig = make_subplots(
        rows=1, cols=2, 
        subplot_titles=(
            "Total de Óbitos por Gênero (Escala Logarítmica)",
            "Idade Média dos Pacientes nos Óbitos"
        )
    )
    
    # Trace 1: Feminino - Total Óbitos (Log Scale)
    fig.add_trace(go.Bar(
        x=df_f["doenca"],
        y=df_f["obitos"],
        name="Feminino (F)",
        marker_color="#F43F5E",
        legendgroup="F",
        text=df_f["obitos"],
        textposition="outside",
        textfont=dict(color=TEXT_CLR, size=11),
        hovertemplate="Feminino - %{x}: %{y} óbitos<extra></extra>"
    ), row=1, col=1)
    
    # Trace 2: Masculino - Total Óbitos (Log Scale)
    fig.add_trace(go.Bar(
        x=df_m["doenca"],
        y=df_m["obitos"],
        name="Masculino (M)",
        marker_color="#38BDF8",
        legendgroup="M",
        text=df_m["obitos"],
        textposition="outside",
        textfont=dict(color=TEXT_CLR, size=11),
        hovertemplate="Masculino - %{x}: %{y} óbitos<extra></extra>"
    ), row=1, col=1)
    
    # Trace 3: Feminino - Idade Média (Linear Scale)
    fig.add_trace(go.Bar(
        x=df_f["doenca"],
        y=df_f["avg_age"],
        name="Feminino (F)",
        marker_color="#F43F5E",
        legendgroup="F",
        showlegend=False,
        text=df_f["avg_age"],
        texttemplate="%{y} anos",
        textposition="outside",
        textfont=dict(color=TEXT_CLR, size=11),
        hovertemplate="Feminino - %{x}: Idade Média %{y} anos<extra></extra>"
    ), row=1, col=2)
    
    # Trace 4: Masculino - Idade Média (Linear Scale)
    fig.add_trace(go.Bar(
        x=df_m["doenca"],
        y=df_m["avg_age"],
        name="Masculino (M)",
        marker_color="#38BDF8",
        legendgroup="M",
        showlegend=False,
        text=df_m["avg_age"],
        texttemplate="%{y} anos",
        textposition="outside",
        textfont=dict(color=TEXT_CLR, size=11),
        hovertemplate="Masculino - %{x}: Idade Média %{y} anos<extra></extra>"
    ), row=1, col=2)

    # Layout do Gráfico
    fig.update_layout(**LAYOUT_BASE)
    fig.update_layout(
        title="Perfil dos Óbitos por Agravo e Sexo (2024–2026)",
        barmode="group",
        bargap=0.15,
        bargroupgap=0.05,
        margin=dict(t=80, b=40, l=40, r=20)
    )
    
    # Personalização da fonte dos títulos dos subplots
    for ann in fig["layout"]["annotations"]:
        ann["font"] = dict(size=12, color=TEXT_CLR, family="Satoshi")
    
    # Eixos X
    fig.update_xaxes(**AXIS_STYLE, title_text="Agravo", row=1, col=1)
    fig.update_xaxes(**AXIS_STYLE, title_text="Agravo", row=1, col=2)
    
    # Eixo Y Esquerdo (Escala Logarítmica)
    fig.update_yaxes(
        **AXIS_STYLE, 
        title_text="Nº de Óbitos", 
        type="log", 
        range=[0, 2.1], # 10^0 = 1 a 10^2.1 ≈ 125
        tickvals=[1, 2, 5, 10, 20, 50, 100],
        ticktext=["1", "2", "5", "10", "20", "50", "100"],
        row=1, col=1
    )
    
    # Eixo Y Direito (Escala Linear)
    fig.update_yaxes(
        **AXIS_STYLE, 
        title_text="Idade Média (anos)", 
        range=[0, 85],
        dtick=10,
        row=1, col=2
    )
    
    return fig


def chart_schema_graph():
    # Load static schema metadata — NO database connection required
    schema_path = os.path.join(BASE, "db_devs", "cisc_schema_metadata.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_data = json.load(f)

    schema_js = json.dumps(schema_data, ensure_ascii=False, indent=2)

    # ── Compute quick stats for the launch card ────────────────────────────
    total_tables = sum(1 for v in schema_data.values() if v["type"] == "table")
    total_views  = sum(1 for v in schema_data.values() if v["type"] == "view")
    total_cols   = sum(len(v["columns"]) for v in schema_data.values())
    total_rels   = sum(len(v.get("fk", [])) for v in schema_data.values())

    # ── Build the standalone full-page viewer HTML ─────────────────────────
    standalone_html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CISC Belém — Visualizador de Esquema de Dados</title>
<link rel="stylesheet" href="../assets/cisc-design-tokens.css"/>
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<style>
        :root {{
            --primary: #0076df;
            --secondary: #005db1;
            --accent: #ff007a;
            --bg-dark: #0a0e14;
            --card-bg: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.1);
            --text-main: #e0e6ed;
            --text-dim: #94a3b8;
            --glass: rgba(15, 23, 42, 0.8);
        }}

        header.site-header {{
            height: 80px; display: flex; align-items: center; justify-content: space-between;
            padding: 0 5%; position: relative; z-index: 10000;
            background: var(--glass); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
            font-family: 'Satoshi', sans-serif;
            flex-shrink: 0;
            box-sizing: border-box;
        }}

        header.site-header a {{
            text-decoration: none;
            color: inherit;
        }}

        .logo {{
            font-family: 'Clash Display', sans-serif; font-size: 1.5rem; font-weight: 800;
            display: flex; align-items: center; gap: 12px;
        }}
        .logo span {{
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .logo-img {{
            height: 36px;
            width: auto;
        }}

        .nav-links {{
            display: flex;
            align-items: center;
            gap: 30px;
        }}

        .nav-group {{
            position: relative;
            display: flex;
            align-items: center;
        }}

        .group-title {{
            color: var(--text-dim);
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 10px 0;
        }}

        .group-title i.ph-caret-down {{
            font-size: 0.7rem;
            opacity: 0.5;
            transition: transform 0.3s ease;
        }}

        .nav-group:hover .group-title {{
            color: var(--primary);
        }}

        .nav-group:hover i.ph-caret-down {{
            transform: rotate(180deg);
            color: var(--primary);
        }}

        .group-content {{
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 10px;
            min-width: 240px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 10000;
        }}

        .nav-group:hover .group-content {{
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }}

        .group-content a {{
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--text-dim) !important;
            font-size: 0.85rem !important;
            text-decoration: none !important;
            display: flex !important;
            align-items: center;
            gap: 12px;
            transition: all 0.2s ease;
        }}

        .group-content a:hover {{
            background: rgba(255,255,255,0.05);
            color: var(--primary) !important;
            padding-left: 20px;
        }}

        .group-content a i {{
            width: 18px;
            text-align: center;
            font-size: 1rem;
        }}

        @media (max-width: 1024px) {{
            .nav-links {{ gap: 15px; }}
            .group-title {{ font-size: 0.8rem; }}
        }}
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

html, body {{
    height: 100%; width: 100%;
    overflow: hidden;
    background: #020617;
    color: #e2e8f0;
    font-family: 'Satoshi', 'Segoe UI', sans-serif;
}}

#schema-app {{
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}}

/* ── Header ──────────────────────────────────────────────────────────────── */
#schema-header {{
    background: #0f172a;
    border-bottom: 1px solid #1e293b;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-shrink: 0;
    flex-wrap: wrap;
}}
#schema-header-left {{
    display: flex;
    align-items: center;
    gap: 12px;
}}
#schema-header-icon {{
    background: #4f46e5;
    border-radius: 10px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 22px rgba(79,70,229,0.4);
    flex-shrink: 0;
}}
#schema-header h1 {{
    font-size: 0.95rem;
    font-weight: 700;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 9px;
}}
#schema-header h1 .badge {{
    font-size: 0.6rem;
    background: rgba(99,102,241,0.12);
    color: #818cf8;
    border: 1px solid rgba(99,102,241,0.25);
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
}}
#schema-header p {{
    font-size: 0.7rem;
    color: #64748b;
    margin-top: 2px;
}}
#schema-header-right {{
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}}
#schema-search-wrap {{
    position: relative;
}}
#schema-search-wrap svg {{
    position: absolute;
    left: 9px; top: 50%;
    transform: translateY(-50%);
    color: #64748b; width: 14px; height: 14px;
    pointer-events: none;
}}
#schema-search {{
    background: #1e293b;
    border: 1px solid #334155;
    color: #e2e8f0;
    font-size: 0.72rem;
    padding: 7px 12px 7px 30px;
    border-radius: 8px;
    outline: none; width: 220px;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
}}
#schema-search:focus {{
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
}}
.hdr-btn {{
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    font-size: 0.7rem;
    font-weight: 500;
    padding: 7px 11px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    font-family: inherit;
}}
.hdr-btn:hover {{ background: #334155; color: #f1f5f9; }}

/* ── Body ────────────────────────────────────────────────────────────────── */
#schema-body {{
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
}}

/* ── Left Sidebar ────────────────────────────────────────────────────────── */
#schema-left {{
    width: 250px;
    min-width: 250px;
    background: rgba(15,23,42,0.92);
    border-right: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}}
#schema-left-top {{
    padding: 12px;
    border-bottom: 1px solid #1e293b;
    background: #0f172a;
}}
#schema-left-top h2 {{
    font-size: 0.6rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
}}
#schema-cat-filters {{
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}}
.schema-cat-btn {{
    font-size: 0.63rem; font-weight: 500;
    padding: 3px 9px; border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer; background: #1e293b; color: #94a3b8;
    transition: background 0.15s, color 0.15s;
    font-family: inherit;
}}
.schema-cat-btn:hover {{ background: #334155; color: #e2e8f0; }}
.schema-cat-btn.active {{ background: #4f46e5; color: #fff; border-color: #4338ca; }}
.schema-cat-btn[data-cat="saude"] {{ color: #fb7185; border-color: rgba(244,63,94,0.25); }}
.schema-cat-btn[data-cat="detalhes"] {{ color: #fbbf24; border-color: rgba(245,158,11,0.25); }}
.schema-cat-btn[data-cat="clima"] {{ color: #22d3ee; border-color: rgba(6,182,212,0.25); }}
.schema-cat-btn[data-cat="views"] {{ color: #34d399; border-color: rgba(16,185,129,0.25); }}
#schema-entity-list {{
    flex: 1; overflow-y: auto; padding: 6px;
    scrollbar-width: thin; scrollbar-color: #1e293b transparent;
}}
#schema-entity-list::-webkit-scrollbar {{ width: 5px; }}
#schema-entity-list::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 4px; }}
.schema-entity-btn {{
    width: 100%; text-align: left;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid #1e293b;
    background: rgba(15,23,42,0.6); color: #94a3b8;
    font-size: 0.72rem; display: flex;
    align-items: center; justify-content: space-between;
    cursor: pointer; margin-bottom: 3px;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
}}
.schema-entity-btn:hover {{ background: rgba(30,41,59,0.7); border-color: #334155; color: #e2e8f0; }}
.schema-entity-btn.selected {{ background: #1e293b; border-color: #6366f1; color: #fff; }}
.schema-entity-btn .ename {{ font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }}
.schema-entity-btn .ecols {{ font-size: 0.6rem; color: #475569; margin-top: 2px; }}
.schema-entity-badge {{
    font-size: 0.55rem; border: 1px solid; padding: 2px 5px;
    border-radius: 4px; text-transform: uppercase; font-weight: 700;
    letter-spacing: 0.06em; flex-shrink: 0;
}}
.schema-entity-badge.table-badge {{ color: #f472b6; border-color: rgba(244,114,182,0.35); background: rgba(244,63,94,0.07); }}
.schema-entity-badge.view-badge {{ color: #34d399; border-color: rgba(52,211,153,0.35); background: rgba(16,185,129,0.07); }}
#schema-metrics {{
    padding: 10px 12px;
    border-top: 1px solid #1e293b;
    background: rgba(15,23,42,0.5);
}}
#schema-metrics h3 {{ font-size: 0.65rem; font-weight: 500; color: #94a3b8; margin-bottom: 7px; }}
#schema-metrics-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }}
.schema-metric-box {{
    background: rgba(30,41,59,0.4); padding: 6px 8px;
    border-radius: 6px; border: 1px solid #1e293b;
}}
.schema-metric-box span:first-child {{ display: block; font-size: 0.58rem; color: #475569; }}
.schema-metric-box .metric-val {{ font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }}

/* ── Center Canvas ───────────────────────────────────────────────────────── */
#schema-workspace {{
    flex: 1; position: relative; overflow: hidden;
    background-color: #0f172a;
    background-image:
        radial-gradient(rgba(148,163,184,0.07) 1.5px, transparent 1.5px),
        radial-gradient(rgba(148,163,184,0.04) 1px, transparent 1px);
    background-size: 24px 24px, 120px 120px;
    cursor: grab;
    user-select: none;
}}
#schema-workspace.panning {{ cursor: grabbing; }}
#schema-pan-zoom {{
    position: absolute; top: 0; left: 0;
    width: 3200px; height: 2600px;
    transform-origin: top left;
}}
#schema-relations-svg {{
    position: absolute; inset: 0;
    width: 3200px; height: 2600px;
    pointer-events: none; z-index: 0;
}}
#schema-nodes-container {{
    position: absolute; top: 0; left: 0;
    width: 3200px; height: 2600px; z-index: 1;
}}
.schema-node {{
    position: absolute; width: 272px;
    background: rgba(15,23,42,0.95);
    border: 1px solid #1e293b; border-radius: 12px;
    overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    cursor: grab; transition: border-color 0.2s, box-shadow 0.2s;
}}
.schema-node:hover {{ border-color: #334155; }}
.schema-node.selected {{
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.25), 0 8px 30px rgba(0,0,0,0.5) !important;
}}
.schema-node.dim {{ opacity: 0.22; }}
.schema-node-header {{
    padding: 9px 12px; border-bottom: 1px solid #1e293b;
    display: flex; align-items: center; justify-content: space-between;
    cursor: grab;
}}
.schema-node-header.view-header {{ background: rgba(5,46,22,0.25); }}
.schema-node-header .nname {{ font-size: 0.78rem; font-weight: 700; color: #f1f5f9; }}
.schema-node-header .ntype {{ font-size: 0.58rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.07em; margin-top: 1px; }}
.schema-node-range {{
    padding: 5px 12px; font-size: 0.63rem; color: #22d3ee;
    background: rgba(6,182,212,0.06);
    border-bottom: 1px solid rgba(6,182,212,0.15);
    display: flex; align-items: center; gap: 5px;
}}
.schema-node-range svg {{
    flex-shrink: 0; width: 11px; height: 11px;
}}
.schema-node-cols {{ background: rgba(2,6,23,0.3); }}
.schema-node-col {{
    padding: 5px 12px; font-size: 0.67rem; color: #94a3b8;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(30,41,59,0.5);
}}
.schema-node-col:hover {{ background: rgba(30,41,59,0.4); color: #e2e8f0; }}
.schema-node-col .col-left {{ display: flex; align-items: center; gap: 5px; overflow: hidden; }}
.schema-node-col .col-cname {{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 145px; font-family: 'Fira Code', monospace; }}
.schema-node-col .col-type {{ font-size: 0.58rem; color: #475569; font-family: monospace; flex-shrink: 0; }}
.spill-btn {{
    padding: 5px 12px; font-size: 0.63rem; color: #818cf8;
    text-align: center; cursor: pointer; background: rgba(2,6,23,0.5);
    border-top: 1px solid rgba(30,41,59,0.4);
}}
.spill-btn:hover {{ background: rgba(49,46,129,0.2); }}
.kpill {{ font-size: 0.58rem; font-weight: 700; padding: 1px 5px; border-radius: 4px; flex-shrink: 0; }}
.pk-pill {{ background: rgba(245,158,11,0.12); color: #fbbf24; }}
.fk-pill {{ background: rgba(6,182,212,0.12); color: #22d3ee; }}
#schema-nav-hints {{
    position: absolute; bottom: 14px; left: 14px; z-index: 10;
    display: flex; flex-direction: column; gap: 6px; pointer-events: none;
}}
#schema-nav-box {{
    background: rgba(15,23,42,0.92); border: 1px solid #1e293b;
    border-radius: 10px; padding: 10px 13px;
    font-size: 0.65rem; color: #64748b; line-height: 1.65;
    backdrop-filter: blur(10px); max-width: 240px;
}}
#schema-nav-box strong {{ color: #94a3b8; }}
#schema-zoom-ctrl {{
    display: flex; align-items: center; gap: 3px;
    background: rgba(15,23,42,0.92); border: 1px solid #1e293b;
    padding: 5px 8px; border-radius: 8px; width: fit-content;
    pointer-events: auto;
}}
#schema-zoom-ctrl button {{
    background: none; border: none; color: #94a3b8; cursor: pointer;
    padding: 3px 7px; border-radius: 5px; font-size: 0.85rem; line-height: 1;
    transition: background 0.1s, color 0.1s;
}}
#schema-zoom-ctrl button:hover {{ background: #1e293b; color: #e2e8f0; }}
#schema-zoom-pct {{ font-size: 0.68rem; font-weight: 600; color: #94a3b8; width: 44px; text-align: center; user-select: none; }}

/* ── Right Sidebar ───────────────────────────────────────────────────────── */
#schema-right {{
    width: 330px; min-width: 330px;
    background: #0f172a; border-left: 1px solid #1e293b;
    display: flex; flex-direction: column; overflow: hidden;
}}
#schema-tabs {{
    display: flex; border-bottom: 1px solid #1e293b;
    background: #0f172a; flex-shrink: 0;
}}
.schema-tab-btn {{
    flex: 1; padding: 11px 4px; font-size: 0.7rem; font-weight: 600;
    text-align: center; background: none; border: none;
    border-bottom: 2px solid transparent; color: #64748b;
    cursor: pointer; font-family: inherit;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
}}
.schema-tab-btn:hover {{ color: #e2e8f0; }}
.schema-tab-btn.active {{
    border-bottom-color: #6366f1; color: #818cf8;
    background: rgba(30,41,59,0.3);
}}
#schema-tab-content {{
    flex: 1; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: #1e293b transparent;
}}
#schema-tab-content::-webkit-scrollbar {{ width: 5px; }}
#schema-tab-content::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 4px; }}
.schema-tab-panel {{ display: none; padding: 16px; }}
.schema-tab-panel.active {{ display: block; }}
#schema-empty-state {{
    text-align: center; padding: 40px 20px; color: #475569;
}}
#schema-empty-state svg {{ width: 44px; height: 44px; margin: 0 auto 12px; color: #1e293b; }}
#schema-empty-state p {{ font-size: 0.72rem; line-height: 1.65; }}
#schema-detail-state {{ display: none; }}
.sd-label {{ font-size: 0.58rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }}
.sd-title {{ font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 4px 0 13px; font-family: 'Fira Code', monospace; }}
.sd-desc {{
    font-size: 0.69rem; color: #94a3b8; line-height: 1.65;
    background: rgba(30,41,59,0.4); padding: 10px 13px;
    border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 13px;
}}
.sd-section-title {{ font-size: 0.6rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin: 12px 0 6px; }}
.sd-key-row {{
    background: #020617; padding: 8px 10px;
    border-radius: 6px; border: 1px solid rgba(30,41,59,0.8);
    display: flex; align-items: center; gap: 8px; margin-bottom: 5px;
}}
.sd-key-pill {{
    font-size: 0.58rem; font-weight: 700; padding: 2px 6px;
    border-radius: 4px; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0;
}}
.pk-key {{ background: rgba(245,158,11,0.12); color: #fbbf24; }}
.fk-key {{ background: rgba(6,182,212,0.12); color: #22d3ee; }}
.sd-key-text {{ font-size: 0.68rem; color: #94a3b8; font-family: 'Fira Code', monospace; }}
#sd-col-list {{
    max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 5px;
    scrollbar-width: thin; scrollbar-color: #1e293b transparent;
}}
#sd-col-list::-webkit-scrollbar {{ width: 4px; }}
#sd-col-list::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 4px; }}
.sd-col-entry {{
    background: #020617; padding: 9px 10px;
    border-radius: 6px; border: 1px solid #1e293b;
    transition: border-color 0.15s;
}}
.sd-col-entry:hover {{ border-color: #334155; }}
.sd-col-top {{ display: flex; align-items: center; justify-content: space-between; }}
.sd-col-name {{ font-size: 0.72rem; font-weight: 600; color: #e2e8f0; font-family: 'Fira Code', monospace; display: flex; align-items: center; gap: 5px; }}
.sd-col-type-int {{ color: #fbbf24; }}
.sd-col-type-real {{ color: #34d399; }}
.sd-col-type-text {{ color: #60a5fa; }}
.sd-col-desc {{ font-size: 0.63rem; color: #64748b; margin-top: 4px; line-height: 1.55; }}
#schema-ddl-header {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }}
#schema-ddl-header span {{ font-size: 0.68rem; font-weight: 600; color: #64748b; }}
.copy-btn {{
    font-size: 0.65rem; background: #1e293b; border: 1px solid #334155;
    color: #94a3b8; padding: 5px 11px; border-radius: 6px;
    cursor: pointer; display: flex; align-items: center; gap: 4px;
    transition: background 0.15s, color 0.15s; font-family: inherit;
}}
.copy-btn:hover {{ background: #334155; color: #e2e8f0; }}
#schema-ddl-box {{
    background: #020617; border: 1px solid #1e293b;
    border-radius: 8px; padding: 13px; overflow: auto;
    max-height: calc(100vh - 260px);
    scrollbar-width: thin; scrollbar-color: #1e293b transparent;
}}
#schema-ddl-box::-webkit-scrollbar {{ width: 5px; height: 5px; }}
#schema-ddl-box::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 4px; }}
#schema-ddl-pre {{
    font-family: 'Fira Code', monospace; font-size: 0.69rem;
    color: #34d399; line-height: 1.75;
    white-space: pre-wrap; word-break: break-word; margin: 0; user-select: text;
}}
.sql-query-btn {{
    width: 100%; text-align: left;
    background: rgba(30,41,59,0.8); border: 1px solid #334155;
    padding: 10px 13px; border-radius: 8px; font-size: 0.71rem;
    font-weight: 500; color: #cbd5e1; cursor: pointer; margin-bottom: 7px;
    transition: background 0.15s, border-color 0.15s; font-family: inherit;
}}
.sql-query-btn:hover {{ background: rgba(30,41,59,1); border-color: #475569; color: #f1f5f9; }}
.sql-query-btn.active {{ border-color: #6366f1; background: rgba(49,46,129,0.15); color: #f1f5f9; }}
#schema-sql-divider {{ border-top: 1px solid #1e293b; margin: 10px 0; padding-top: 10px; }}
#schema-sql-header {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }}
#schema-sql-header span {{ font-size: 0.7rem; font-weight: 600; color: #94a3b8; }}
#schema-sql-box {{
    background: #020617; border: 1px solid #1e293b;
    border-radius: 8px; padding: 11px; overflow: auto;
    max-height: 320px;
    scrollbar-width: thin; scrollbar-color: #1e293b transparent;
}}
#schema-sql-box::-webkit-scrollbar {{ width: 5px; height: 5px; }}
#schema-sql-box::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 4px; }}
#schema-sql-pre {{
    font-family: 'Fira Code', monospace; font-size: 0.65rem;
    color: #22d3ee; white-space: pre; margin: 0; user-select: text;
}}
</style>
</head>
<body>
<div id="schema-app">

  <!-- Portal Navbar -->
  <header class="site-header">
      <a href="../index.html" class="logo">
        <img src="../assets/cisc_vector.svg" alt="Logo CISC" class="logo-img">
        <span>CISC BELÉM</span>
    </a>
      <nav class="nav-links">
          <div class="nav-group">
              <span class="group-title">
                  <i class="ph ph-stack"></i> Estrutura
                  <i class="ph ph-caret-down"></i>
              </span>
              <div class="group-content">
                  <a href="../index.html"><i class="ph ph-house"></i> Início / Visão Geral</a>
                  <a href="../etl_arquitetura.html"><i class="ph ph-graph"></i> Arquitetura Core</a>
                  <a href="../schema_linkage.html"><i class="ph ph-database"></i> Schema PostGIS</a>
              </div>
          </div>
          <div class="nav-group">
              <span class="group-title">
                  <i class="ph ph-cpu"></i> Inteligência
                  <i class="ph ph-caret-down"></i>
              </span>
              <div class="group-content">
                  <a href="../devs_etl_detalhado.html"><i class="ph ph-file-text"></i> Pipeline DEVS</a>
                  <a href="../visa_etl_detalhado.html"><i class="ph ph-shield-warning"></i> Pipeline VISA</a>
                  <a href="../cisc_ia_modelagem.html"><i class="ph ph-robot"></i> Modelagem IA/HTR</a>
                  <a href="../hitl_devs_arquitetura.html"><i class="ph ph-users-gear"></i> Validação HITL</a>
                  <a href="../cisc_framework_estatistico.html"><i class="ph ph-calculator"></i> Framework Estatístico</a>
              </div>
          </div>
          <div class="nav-group">
              <span class="group-title">
                  <i class="ph ph-eye"></i> Decisão
                  <i class="ph ph-caret-down"></i>
              </span>
              <div class="group-content">
                  <a href="../sala_situacao.html"><i class="ph ph-monitor"></i> Sala de Situação</a>
                  <a href="../matriz_alertas.html"><i class="ph ph-warning"></i> Matriz de Alertas</a>
                  <a href="../dashboard/index.html"><i class="ph ph-chart-line-up"></i> Painel de Comando CISC</a>
              </div>
          </div>
          <div class="nav-group">
              <span class="group-title">
                  <i class="ph ph-database"></i> Análise &amp; BD
                  <i class="ph ph-caret-down"></i>
              </span>
              <div class="group-content">
                  <a href="cisc_relatorio_visual.html"><i class="ph ph-chart-bar"></i> Relatório Epidemiológico</a>
                  <a href="cisc_analise_correlacao.html"><i class="ph ph-brain"></i> Correlação &amp; ML</a>
                  <a href="cisc_schema_viewer.html" class="active"><i class="ph ph-graph"></i> Esquema BD SQLite</a>
                  <a href="auditoria_fontes.html"><i class="ph ph-clipboard-text"></i> Auditoria de Fontes</a>
              </div>
          </div>
          <a href="https://github.com/dummyDevisa/cisc" target="_blank" style="color: var(--text-dim); text-decoration: none; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-left: 10px;">
              <i class="ph ph-github-logo"></i> GitHub
          </a>
      </nav>
  </header>

  <!-- Header -->
  <div id="schema-header">
    <div id="schema-header-left">
      <div id="schema-header-icon">
        <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
        </svg>
      </div>
      <div>
        <h1>CISC Belém <span class="badge">SQLite DB Schema</span></h1>
        <p>Vigilância Epidemiológica de Doenças Climáticas &amp; Monitorização Ambiental</p>
      </div>
    </div>
    <div id="schema-header-right">
      <div id="schema-search-wrap">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" id="schema-search" placeholder="Procurar tabelas ou colunas...">
      </div>
      <button class="hdr-btn" id="schema-reset-btn">
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H18"/>
        </svg>
        Restaurar Layout
      </button>
      <button class="hdr-btn" id="schema-toggle-btn">Contrair / Expandir</button>
    </div>
  </div>

  <!-- Body -->
  <div id="schema-body">

    <!-- Left Sidebar -->
    <aside id="schema-left">
      <div id="schema-left-top">
        <h2>Grupo de Entidades</h2>
        <div id="schema-cat-filters">
          <button class="schema-cat-btn active" data-cat="all">Todos</button>
          <button class="schema-cat-btn" data-cat="saude">Saúde Core</button>
          <button class="schema-cat-btn" data-cat="detalhes">Clínicos</button>
          <button class="schema-cat-btn" data-cat="clima">Clima/Amb.</button>
          <button class="schema-cat-btn" data-cat="views">Views</button>
        </div>
      </div>
      <div id="schema-entity-list"></div>
      <div id="schema-metrics">
        <h3>Métricas do Esquema</h3>
        <div id="schema-metrics-grid">
          <div class="schema-metric-box"><span>Tabelas</span><span class="metric-val" id="sm-tables">—</span></div>
          <div class="schema-metric-box"><span>Views</span><span class="metric-val" id="sm-views">—</span></div>
          <div class="schema-metric-box"><span>Colunas</span><span class="metric-val" id="sm-cols">—</span></div>
          <div class="schema-metric-box"><span>Relações</span><span class="metric-val" id="sm-rels">—</span></div>
        </div>
      </div>
    </aside>

    <!-- Center Canvas -->
    <main id="schema-workspace">
      <div id="schema-pan-zoom">
        <svg id="schema-relations-svg">
          <defs>
            <marker id="sarr-fk" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e"/>
            </marker>
            <marker id="sarr-view" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7"/>
            </marker>
          </defs>
          <g id="schema-connections"></g>
        </svg>
        <div id="schema-nodes-container"></div>
      </div>
      <div id="schema-nav-hints">
        <div id="schema-nav-box">
          <strong>Dicas de Navegação</strong><br>
          • Arraste as tabelas para reorganizar.<br>
          • Arraste no espaço vazio para mover a câmara.<br>
          • Scroll para zoom rápido.<br>
          • Clique numa tabela para inspecionar metadados.
        </div>
        <div id="schema-zoom-ctrl">
          <button id="sz-out" title="Zoom Out">−</button>
          <span id="schema-zoom-pct">80%</span>
          <button id="sz-in" title="Zoom In">+</button>
        </div>
      </div>
    </main>

    <!-- Right Sidebar -->
    <aside id="schema-right">
      <div id="schema-tabs">
        <button class="schema-tab-btn active" data-panel="tab-doc">Explorar</button>
        <button class="schema-tab-btn" data-panel="tab-ddl">Código DDL</button>
        <button class="schema-tab-btn" data-panel="tab-sql">Query Helper</button>
      </div>
      <div id="schema-tab-content">

        <div class="schema-tab-panel active" id="tab-doc">
          <div id="schema-empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
            </svg>
            <p>Selecione ou clique em qualquer tabela do esquema para inspecionar colunas, restrições e relacionamentos de dados.</p>
          </div>
          <div id="schema-detail-state">
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:4px;">
              <div>
                <span id="sd-badge" class="schema-entity-badge"></span>
                <div id="sd-title" class="sd-title"></div>
              </div>
            </div>
            <div class="sd-label">Descrição Funcional</div>
            <div id="sd-desc" class="sd-desc"></div>
            <div id="sd-range-container" style="display:none;margin-bottom:12px;">
              <div class="sd-label">Período de Dados</div>
              <div id="sd-range" style="font-size:0.72rem;color:#22d3ee;display:flex;align-items:center;gap:5px;margin-top:2px;">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span id="sd-range-text"></span>
              </div>
            </div>
            <div class="sd-label">Chaves e Indexação</div>
            <div id="sd-pk-row" class="sd-key-row">
              <span class="sd-key-pill pk-key">PK</span>
              <span id="sd-pk" class="sd-key-text"></span>
            </div>
            <div id="sd-fk-row" class="sd-key-row" style="display:none;">
              <span class="sd-key-pill fk-key">FK</span>
              <span id="sd-fk" class="sd-key-text"></span>
            </div>
            <div class="sd-section-title">Metadados de Colunas (<span id="sd-col-count">0</span>)</div>
            <div id="sd-col-list"></div>
          </div>
        </div>

        <div class="schema-tab-panel" id="tab-ddl">
          <div id="schema-ddl-header">
            <span>Instruções DDL em SQLite</span>
            <button class="copy-btn" id="btn-copy-ddl">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar DDL
            </button>
          </div>
          <div id="schema-ddl-box">
            <pre id="schema-ddl-pre">-- Selecione uma tabela para ver o DDL...</pre>
          </div>
        </div>

        <div class="schema-tab-panel" id="tab-sql">
          <div class="sd-label" style="margin-bottom:8px;">Seletor de Consulta Rápida</div>
          <p style="font-size:0.65rem;color:#64748b;margin:0 0 12px;line-height:1.6;">Escolha o modelo de agregação e visualize as junções (JOINs) necessárias no CISC Belém.</p>
          <button class="sql-query-btn" data-qtype="notif-clima"><i class="ph ph-link"></i> Unir Notificações de Saúde com Dados Climáticos Diários</button>
          <button class="sql-query-btn" data-qtype="dengue-clinico"><i class="ph ph-thermometer-hot text-red-400"></i> Listar Casos de Dengue e Sinais de Gravidade Associados</button>
          <button class="sql-query-btn" data-qtype="dda-agregado"><i class="ph ph-chart-line-up text-green-400"></i> Casos de DDA vs Surtos Detetados por Semana</button>
          <button class="sql-query-btn" data-qtype="clima-complexo"><i class="ph ph-cloud-rain text-blue-400"></i> Integrar Estações INMET, CEMADEN e Maré no Mesmo Dia</button>
          <div id="schema-sql-divider">
            <div id="schema-sql-header">
              <span>Estrutura SQL Gerada</span>
              <button class="copy-btn" id="btn-copy-sql">Copiar SQL</button>
            </div>
            <div id="schema-sql-box">
              <pre id="schema-sql-pre">-- Escolha uma consulta acima para iniciar...</pre>
            </div>
          </div>
        </div>

      </div>
    </aside>

  </div>
</div>

<script>
(function() {{
    const DB_SCHEMA = {schema_js};

    let selectedKey = null;
    let scale = 0.8;
    let panX = 30, panY = 20;
    let isPanning = false;
    let panStart = {{ x: 0, y: 0 }};
    let activeDrag = null;
    let dragOffset = {{ x: 0, y: 0 }};
    let nodesData = {{}};
    let collapsedNodes = {{}};
    let layoutAnimationFrame = null;
    let cameraAnimationFrame = null;

    const workspace      = document.getElementById('schema-workspace');
    const panZoom        = document.getElementById('schema-pan-zoom');
    const nodesContainer = document.getElementById('schema-nodes-container');
    const connectionsGrp = document.getElementById('schema-connections');
    const entityList     = document.getElementById('schema-entity-list');
    const zoomPct        = document.getElementById('schema-zoom-pct');

    function copyText(text, btn) {{
        const orig = btn.innerText;
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
        btn.innerText = 'Copiado!';
        btn.style.background = '#065f46'; btn.style.color = '#fff';
        setTimeout(() => {{ btn.innerText = orig; btn.style.background = ''; btn.style.color = ''; }}, 1800);
    }}

    function applyTransform() {{
        panZoom.style.transform = `translate(${{panX}}px, ${{panY}}px) scale(${{scale}})`;
        zoomPct.innerText = `${{Math.round(scale * 100)}}%`;
    }}

    function easeOutCubic(t) {{
        return 1 - Math.pow(1 - t, 3);
    }}

    function animateCameraTo(targetX, targetY, duration = 320) {{
        if (cameraAnimationFrame) cancelAnimationFrame(cameraAnimationFrame);
        const startX = panX;
        const startY = panY;
        const started = performance.now();

        const tick = now => {{
            const t = easeOutCubic(Math.min(1, (now - started) / duration));
            panX = startX + (targetX - startX) * t;
            panY = startY + (targetY - startY) * t;
            applyTransform();
            if (t < 1) cameraAnimationFrame = requestAnimationFrame(tick);
            else cameraAnimationFrame = null;
        }};

        cameraAnimationFrame = requestAnimationFrame(tick);
    }}

    function estimateNodeHeight(schema, compact) {{
        const visibleCols = compact ? Math.min(5, schema.columns.length) : schema.columns.length;
        const headerHeight = 48;
        const rangeHeight = schema.dateRange ? 24 : 0;
        const rowHeight = 26;
        const spillHeight = schema.columns.length > 5 ? 24 : 0;
        const safety = compact ? 4 : 8;
        return headerHeight + rangeHeight + (visibleCols * rowHeight) + spillHeight + safety;
    }}

    function snapshotLayout() {{
        const snap = {{}};
        Object.keys(nodesData).forEach(key => {{
            snap[key] = {{
                x: nodesData[key].x,
                y: nodesData[key].y,
                width: nodesData[key].width,
                height: nodesData[key].height
            }};
        }});
        return snap;
    }}

    function syncHeightsToCollapsedState() {{
        Object.keys(DB_SCHEMA).forEach(key => {{
            const schema = DB_SCHEMA[key];
            const compact = !!collapsedNodes[key];
            if (nodesData[key]) {{
                nodesData[key].height = estimateNodeHeight(schema, compact);
            }}
        }});
    }}

    function measureRenderedHeights() {{
        let changed = false;
        Object.keys(DB_SCHEMA).forEach(key => {{
            const el = document.getElementById(`snode-${{key}}`);
            if (!el || !nodesData[key]) return;
            const header = el.querySelector('.schema-node-header');
            const range = el.querySelector('.schema-node-range');
            const cols = el.querySelector('.schema-node-cols');
            const measured = Math.max(
                0,
                Math.ceil(
                    (header?.offsetHeight || 0) +
                    (range?.offsetHeight || 0) +
                    (cols?.scrollHeight || 0) +
                    2
                )
            );
            if (measured && Math.abs(measured - nodesData[key].height) > 1) {{
                nodesData[key].height = measured;
                changed = true;
            }}
        }});
        return changed;
    }}

    function stackNodes(keys, x, startY, gap) {{
        let y = startY;
        keys.forEach(key => {{
            if (!nodesData[key]) return;
            nodesData[key].x = x;
            nodesData[key].y = y;
            y += nodesData[key].height + gap;
        }});
    }}

    const LAYOUT_COLUMNS = [
        {{ keys: ['dda_casos_semanal', 'dda_surtos_semanal'], x: 40, startY: 40, gap: 34 }},
        {{ keys: ['notificacoes', 'dengue_detalhes', 'leptospirose_detalhes', 'srag_detalhes'], x: 430, startY: 40, gap: 36 }},
        {{ keys: ['clima_inmet_horario', 'clima_cemaden_precipitacao', 'clima_marinha_tabua_mare', 'clima_cptec_previsao', 'clima_cptec_previsao_ondas', 'clima_cptec_precipitacao', 'clima_cptec_umidade_solo', 'clima_cptec_brams_gases'], x: 820, startY: 40, gap: 20 }},
        {{ keys: ['view_clima_diario', 'view_notificacoes_clima'], x: 1240, startY: 360, gap: 34 }}
    ];

    function applyInitialLayout() {{
        syncHeightsToCollapsedState();
        stackNodes(['dda_casos_semanal', 'dda_surtos_semanal'], 40, 40, 34);
        stackNodes(['notificacoes', 'dengue_detalhes', 'leptospirose_detalhes', 'srag_detalhes'], 430, 40, 36);
        stackNodes(['clima_inmet_horario', 'clima_cemaden_precipitacao', 'clima_marinha_tabua_mare', 'clima_cptec_previsao', 'clima_cptec_previsao_ondas', 'clima_cptec_precipitacao', 'clima_cptec_umidade_solo', 'clima_cptec_brams_gases'], 820, 40, 20);
        stackNodes(['view_clima_diario', 'view_notificacoes_clima'], 1240, 360, 34);
    }}

    function relayoutAndRender() {{
        const fromState = snapshotLayout();
        applyInitialLayout();
        buildNodes(fromState);
        requestAnimationFrame(() => {{
            const measured = measureRenderedHeights();
            if (measured) applyInitialLayout();
            const toState = snapshotLayout();
            buildNodes(fromState);
            animateLayout(fromState, toState, 360);
            applyTransform();
        }});
    }}

    function animateLayout(fromState, toState, duration) {{
        if (layoutAnimationFrame) cancelAnimationFrame(layoutAnimationFrame);
        const started = performance.now();

        const tick = now => {{
            const rawT = Math.min(1, (now - started) / duration);
            const sizeT = easeOutCubic(Math.min(1, rawT * 0.92));
            const leadT = easeOutCubic(Math.min(1, rawT * 1.08));
            const frameState = {{}};
            LAYOUT_COLUMNS.forEach(col => {{
                let y = col.startY;
                col.keys.forEach(key => {{
                    const from = fromState[key] || toState[key];
                    const to = toState[key];
                    if (!to) return;
                    const height = from.height + (to.height - from.height) * sizeT;
                    const x = from.x + (to.x - from.x) * leadT;
                    const finalY = y;
                    frameState[key] = {{
                        x,
                        y: from.y + (finalY - from.y) * leadT,
                        width: from.width + (to.width - from.width) * leadT,
                        height
                    }};
                    y += height + col.gap;
                }});
            }});
            Object.keys(toState).forEach(key => {{
                const el = document.getElementById(`snode-${{key}}`);
                if (el && frameState[key]) {{
                    el.style.left = `${{frameState[key].x}}px`;
                    el.style.top = `${{frameState[key].y}}px`;
                    el.style.height = `${{frameState[key].height}}px`;
                }}
            }});
            drawConnections(frameState);
            if (rawT < 1) {{
                layoutAnimationFrame = requestAnimationFrame(tick);
            }} else {{
                layoutAnimationFrame = null;
                Object.keys(toState).forEach(key => {{
                    nodesData[key].x = toState[key].x;
                    nodesData[key].y = toState[key].y;
                    nodesData[key].width = toState[key].width;
                    nodesData[key].height = toState[key].height;
                    
                    const el = document.getElementById(`snode-${{key}}`);
                    if (el) {{
                        el.style.left = `${{toState[key].x}}px`;
                        el.style.top = `${{toState[key].y}}px`;
                        el.style.height = 'auto';
                    }}
                }});
                drawConnections(nodesData);
            }}
        }};
        layoutAnimationFrame = requestAnimationFrame(tick);
    }}

    function initPositions() {{
        Object.keys(DB_SCHEMA).forEach(key => {{
            const schema = DB_SCHEMA[key];
            const compact = true;
            nodesData[key] = {{
                x: DB_SCHEMA[key].defaultPos.x,
                y: DB_SCHEMA[key].defaultPos.y,
                width: 272,
                height: estimateNodeHeight(schema, compact)
            }};
            collapsedNodes[key] = true;
        }});
        applyInitialLayout();
    }}

    function renderEntityList(cat) {{
        entityList.innerHTML = '';
        Object.keys(DB_SCHEMA).forEach(key => {{
            const s = DB_SCHEMA[key];
            if (cat !== 'all' && s.category !== cat) return;
            const isView = s.type === 'view';
            const btn = document.createElement('button');
            btn.className = 'schema-entity-btn' + (selectedKey === key ? ' selected' : '');
            btn.innerHTML = `<div><span class="ename">${{s.name}}</span><span class="ecols">${{s.columns.length}} colunas</span></div><span class="schema-entity-badge ${{isView ? 'view-badge' : 'table-badge'}}">${{s.type}}</span>`;
            btn.onclick = () => selectEntity(key);
            entityList.appendChild(btn);
        }});
    }}

    function selectEntity(key) {{
        selectedKey = key;
        const activeCat = document.querySelector('.schema-cat-btn.active')?.dataset.cat || 'all';
        renderEntityList(activeCat);
        document.querySelectorAll('.schema-node').forEach(n => n.classList.remove('selected'));
        const activeNode = document.getElementById(`snode-${{key}}`);
        if (activeNode) activeNode.classList.add('selected');
        const rn = nodesData[key];
        if (rn) {{
            const ws = workspace.getBoundingClientRect();
            const targetPanX = (ws.width / 2) - ((rn.x + (rn.width / 2)) * scale);
            const targetPanY = (ws.height / 2) - ((rn.y + (rn.height / 2)) * scale);
            animateCameraTo(targetPanX, targetPanY, 340);
        }}
        const s = DB_SCHEMA[key];
        document.getElementById('schema-empty-state').style.display = 'none';
        document.getElementById('schema-detail-state').style.display = 'block';
        const badge = document.getElementById('sd-badge');
        badge.textContent = s.type;
        badge.className = 'schema-entity-badge ' + (s.type === 'view' ? 'view-badge' : 'table-badge');
        document.getElementById('sd-title').textContent = s.name;
        document.getElementById('sd-desc').textContent = s.desc;

        const rangeContainer = document.getElementById('sd-range-container');
        if (s.dateRange) {{
            rangeContainer.style.display = 'block';
            document.getElementById('sd-range-text').textContent = s.dateRange;
        }} else {{
            rangeContainer.style.display = 'none';
        }}

        document.getElementById('sd-pk').textContent = s.pk.join(', ');
        document.getElementById('sd-col-count').textContent = s.columns.length;
        const fkRow = document.getElementById('sd-fk-row');
        if (s.fk && s.fk.length > 0) {{
            fkRow.style.display = 'flex';
            document.getElementById('sd-fk').textContent = s.fk.map(f => `${{f.sourceCol}} ➔ ${{f.targetTable}}(${{f.targetCol}})`).join(', ');
        }} else {{ fkRow.style.display = 'none'; }}
        const colList = document.getElementById('sd-col-list');
        colList.innerHTML = '';
        s.columns.forEach(col => {{
            const isPk = s.pk.includes(col.name);
            const isFk = s.fk.some(f => f.sourceCol === col.name);
            let kpill = isPk ? '<span class="kpill pk-pill">PK</span>' : (isFk ? '<span class="kpill fk-pill">FK</span>' : '');
            const typeClass = col.type === 'INTEGER' ? 'sd-col-type-int' : col.type === 'REAL' ? 'sd-col-type-real' : 'sd-col-type-text';
            const d = document.createElement('div');
            d.className = 'sd-col-entry';
            d.innerHTML = `<div class="sd-col-top"><span class="sd-col-name">${{col.name}} ${{kpill}}</span><span class="sd-col-type ${{typeClass}}">${{col.type}}</span></div><p class="sd-col-desc">${{col.desc}}</p>`;
            colList.appendChild(d);
        }});
        document.getElementById('schema-ddl-pre').textContent = s.ddl;
        drawConnections();
    }}

    function buildNodes(fromState = null) {{
        nodesContainer.innerHTML = '';
        Object.keys(DB_SCHEMA).forEach(key => {{
            const s = DB_SCHEMA[key];
            const rn = nodesData[key];
            const isView = s.type === 'view';
            const node = document.createElement('div');
            node.id = `snode-${{key}}`;
            node.className = 'schema-node' + (selectedKey === key ? ' selected' : '');
            const from = fromState?.[key];
            node.style.left = `${{(from || rn).x}}px`;
            node.style.top = `${{(from || rn).y}}px`;
            node.style.height = 'auto';
            node.style.minHeight = '0px';
            let colsHtml = '';
            s.columns.forEach((c, idx) => {{
                const isPk = s.pk.includes(c.name);
                const isFk = s.fk.some(f => f.sourceCol === c.name);
                const kpill = isPk ? '<span class="kpill pk-pill">PK</span>' : (isFk ? '<span class="kpill fk-pill">FK</span>' : '');
                const show = idx < 5 || !collapsedNodes[key];
                if (show) {{
                    colsHtml += `<div class="schema-node-col"><div class="col-left">${{kpill}}<span class="col-cname">${{c.name}}</span></div><span class="col-type">${{c.type}}</span></div>`;
                }}
            }});
            const extra = s.columns.length - 5;
            if (extra > 0 && collapsedNodes[key]) colsHtml += `<div class="spill-btn" onclick="event.stopPropagation(); schemaToggleNode('${{key}}', false)">+ Mostrar mais ${{extra}} colunas</div>`;
            else if (s.columns.length > 5) colsHtml += `<div class="spill-btn" onclick="event.stopPropagation(); schemaToggleNode('${{key}}', true)">Ocultar colunas extra</div>`;
            
            const rangeHtml = s.dateRange ? `
                <div class="schema-node-range">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>${{s.dateRange}}</span>
                </div>` : '';

            node.innerHTML = `
                <div class="schema-node-header ${{isView ? 'view-header' : ''}} node-header-drag">
                    <div><div class="nname">${{s.name}}</div><div class="ntype">${{s.type}}</div></div>
                    <button style="background:none;border:none;cursor:pointer;color:#64748b;padding:2px;" onclick="event.stopPropagation();selectEntity('${{key}}')" title="Inspecionar">
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                </div>
                ${{rangeHtml}}
                <div class="schema-node-cols">${{colsHtml}}</div>`;
            const hdr = node.querySelector('.node-header-drag');
            hdr.addEventListener('mousedown', e => startDrag(e, key));
            node.addEventListener('click', () => selectEntity(key));
            nodesContainer.appendChild(node);
        }});
        requestAnimationFrame(() => drawConnections(nodesData));
    }}

    window.schemaToggleNode = function(key, flag) {{
        collapsedNodes[key] = flag;
        relayoutAndRender();
    }};

    function startDrag(e, key) {{
        if (e.target.tagName.toLowerCase() === 'button') return;
        e.stopPropagation();
        activeDrag = key;
        const rn = nodesData[key];
        dragOffset.x = (e.clientX / scale) - rn.x;
        dragOffset.y = (e.clientY / scale) - rn.y;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
    }}
    function onDragMove(e) {{
        if (!activeDrag) return;
        const rn = nodesData[activeDrag];
        rn.x = Math.max(10, Math.min(2900, (e.clientX / scale) - dragOffset.x));
        rn.y = Math.max(10, Math.min(2400, (e.clientY / scale) - dragOffset.y));
        const el = document.getElementById(`snode-${{activeDrag}}`);
        if (el) {{ el.style.left = `${{rn.x}}px`; el.style.top = `${{rn.y}}px`; }}
        drawConnections();
    }}
    function onDragEnd() {{
        activeDrag = null;
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
    }}

    workspace.addEventListener('mousedown', e => {{
        if (e.target.closest('.schema-node') || e.target.closest('#schema-nav-hints')) return;
        if (cameraAnimationFrame) {{
            cancelAnimationFrame(cameraAnimationFrame);
            cameraAnimationFrame = null;
        }}
        isPanning = true;
        panStart.x = e.clientX - panX; panStart.y = e.clientY - panY;
        workspace.classList.add('panning');
    }});
    document.addEventListener('mousemove', e => {{
        if (!isPanning) return;
        panX = e.clientX - panStart.x; panY = e.clientY - panStart.y;
        applyTransform();
    }});
    document.addEventListener('mouseup', () => {{ isPanning = false; workspace.classList.remove('panning'); }});
    workspace.addEventListener('wheel', e => {{
        e.preventDefault();
        if (cameraAnimationFrame) {{
            cancelAnimationFrame(cameraAnimationFrame);
            cameraAnimationFrame = null;
        }}
        const prev = scale;
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        scale = Math.min(2.0, Math.max(0.35, scale + delta));
        const rect = workspace.getBoundingClientRect();
        panX = (e.clientX - rect.left) - ((e.clientX - rect.left) - panX) * (scale / prev);
        panY = (e.clientY - rect.top) - ((e.clientY - rect.top) - panY) * (scale / prev);
        applyTransform();
    }}, {{ passive: false }});

    document.getElementById('sz-in').addEventListener('click', () => {{ scale = Math.min(2.0, scale + 0.15); applyTransform(); }});
    document.getElementById('sz-out').addEventListener('click', () => {{ scale = Math.max(0.35, scale - 0.15); applyTransform(); }});
    document.getElementById('schema-reset-btn').addEventListener('click', () => {{ scale = 0.8; panX = 30; panY = 20; initPositions(); relayoutAndRender(); applyTransform(); }});

    let allCollapsed = true;
    document.getElementById('schema-toggle-btn').addEventListener('click', () => {{
        allCollapsed = !allCollapsed;
        Object.keys(collapsedNodes).forEach(k => collapsedNodes[k] = allCollapsed);
        relayoutAndRender();
    }});

    function drawConnections(state = nodesData) {{
        connectionsGrp.innerHTML = '';
        Object.keys(DB_SCHEMA).forEach(srcKey => {{
            const s = DB_SCHEMA[srcKey];
            const sn = state[srcKey];
            if (!s.fk || !s.fk.length || !sn) return;
            s.fk.forEach(fk => {{
                const tn = state[fk.targetTable];
                if (!tn) return;
                const isView = s.type === 'view';
                const isLeft = sn.x < tn.x;
                const x1 = isLeft ? sn.x + sn.width : sn.x;
                const y1 = sn.y + sn.height / 2;
                const x2 = isLeft ? tn.x : tn.x + tn.width;
                const y2 = tn.y + tn.height / 2;
                const off = Math.min(160, Math.abs(x2 - x1) * 0.5);
                const cp1x = isLeft ? x1 + off : x1 - off;
                const cp2x = isLeft ? x2 - off : x2 + off;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${{x1}} ${{y1}} C ${{cp1x}} ${{y1}}, ${{cp2x}} ${{y2}}, ${{x2}} ${{y2}}`);
                path.setAttribute('stroke', isView ? '#a855f7' : '#f43f5e');
                path.setAttribute('stroke-dasharray', isView ? '6,5' : 'none');
                path.setAttribute('stroke-width', (selectedKey === srcKey || selectedKey === fk.targetTable) ? '3' : '1.6');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', isView ? 'url(#sarr-view)' : 'url(#sarr-fk)');
                path.setAttribute('opacity', selectedKey && selectedKey !== srcKey && selectedKey !== fk.targetTable ? '0.22' : '0.82');
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = isView ? `VIEW Lineage: ${{s.name}} via ${{fk.sourceCol}}` : `FK: ${{s.name}}.${{fk.sourceCol}} ➔ ${{fk.targetTable}}.${{fk.targetCol}}`;
                path.appendChild(title);
                connectionsGrp.appendChild(path);
            }});
        }});
    }}

    document.querySelectorAll('.schema-cat-btn').forEach(btn => {{
        btn.addEventListener('click', () => {{
            document.querySelectorAll('.schema-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderEntityList(btn.dataset.cat);
        }});
    }});

    document.getElementById('schema-search').addEventListener('input', e => {{
        const q = e.target.value.toLowerCase().trim();
        if (!q) {{ document.querySelectorAll('.schema-node').forEach(n => n.classList.remove('dim')); renderEntityList(document.querySelector('.schema-cat-btn.active')?.dataset.cat || 'all'); return; }}
        Object.keys(DB_SCHEMA).forEach(key => {{
            const s = DB_SCHEMA[key];
            const match = s.name.toLowerCase().includes(q) || s.columns.some(c => c.name.toLowerCase().includes(q));
            const el = document.getElementById(`snode-${{key}}`);
            if (el) {{ match ? el.classList.remove('dim') : el.classList.add('dim'); }}
        }});
    }});

    document.querySelectorAll('.schema-tab-btn').forEach(btn => {{
        btn.addEventListener('click', () => {{
            document.querySelectorAll('.schema-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.schema-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.panel).classList.add('active');
        }});
    }});

    document.getElementById('btn-copy-ddl').addEventListener('click', e => copyText(document.getElementById('schema-ddl-pre').textContent, e.currentTarget));
    document.getElementById('btn-copy-sql').addEventListener('click', e => copyText(document.getElementById('schema-sql-pre').textContent, e.currentTarget));

    const PRESETS = {{
        "notif-clima": `SELECT
    n.id_notificacao,
    n.doenca,
    n.data_sintomas,
    n.residencia_bairro,
    c.chuva_inmet_total      AS precipitacao_inmet_mm,
    c.temp_media_diaria      AS temp_media_ar_c,
    c.mare_maxima            AS pico_mare_estuario
FROM notificacoes n
INNER JOIN view_clima_diario c
    ON COALESCE(n.data_sintomas, n.data_notificacao) = c.data_diaria
WHERE n.doenca IN ('LEPTOSPIROSE', 'DENGUE')
  AND n.data_sintomas BETWEEN '2026-01-01' AND '2026-05-30'
ORDER BY c.chuva_inmet_total DESC;`,
        "dengue-clinico": `SELECT
    n.id_notificacao,
    n.paciente_nome,
    n.paciente_idade_anos,
    n.residencia_bairro,
    d.febre, d.mialgia, d.cefaleia,
    d.resul_ns1              AS antigeno_ns1,
    d.sorotipo,
    d.alrm_hipot             AS alarme_hipotensao,
    d.grav_pulso             AS gravidade_pulso
FROM notificacoes n
INNER JOIN dengue_detalhes d
    ON n.id_notificacao = d.id_notificacao
WHERE n.doenca = 'DENGUE'
  AND (d.alrm_hipot = 'S' OR d.grav_pulso = 'S');`,
        "dda-agregado": `SELECT
    c.semana,
    c.faixa_total            AS total_casos_semanal,
    c.plano_c                AS internacoes_graves,
    s.surtos_detectados,
    s.surtos_com_amostras,
    s.pct_investigados
FROM dda_casos_semanal c
LEFT JOIN dda_surtos_semanal s
    ON c.semana = s.semana
ORDER BY c.semana DESC;`,
        "clima-complexo": `SELECT
    d.data_diaria,
    d.chuva_inmet_total,
    d.chuva_cemaden_media_estacoes AS chuva_media_bairros,
    d.mare_maxima                  AS preamar_estuario_metros,
    d.mare_amplitude               AS amplitude_mare,
    d.temp_media_diaria
FROM view_clima_diario d
WHERE d.chuva_inmet_total > 50.0
   OR d.mare_maxima > 3.2
ORDER BY d.chuva_inmet_total DESC;`
    }};
    document.querySelectorAll('.sql-query-btn').forEach(btn => {{
        btn.addEventListener('click', () => {{
            const q = PRESETS[btn.dataset.qtype];
            if (q) {{
                document.getElementById('schema-sql-pre').textContent = q;
                document.querySelectorAll('.sql-query-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }}
        }});
    }});

    (function computeMetrics() {{
        let tables = 0, views = 0, cols = 0, rels = 0;
        Object.values(DB_SCHEMA).forEach(s => {{
            if (s.type === 'view') views++; else tables++;
            cols += s.columns.length;
            rels += (s.fk || []).length;
        }});
        document.getElementById('sm-tables').textContent = tables;
        document.getElementById('sm-views').textContent  = views;
        document.getElementById('sm-cols').textContent   = cols;
        document.getElementById('sm-rels').textContent   = rels;
    }})();

    initPositions();
    relayoutAndRender();
    renderEntityList('all');
    applyTransform();
}})();
</script>
</body>
</html>"""

    # ── Write the standalone file ──────────────────────────────────────────
    viewer_path = os.path.join(BASE, "db_devs", "cisc_schema_viewer.html")
    with open(viewer_path, "w", encoding="utf-8") as f:
        f.write(standalone_html)

    # ── Return a launch-card for embedding in the report section ───────────
    launch_card = f"""
<style>
#schema-launch-card {{
    background: linear-gradient(135deg, #0f172a 0%, #0c1322 60%, #0a1020 100%);
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 28px;
    font-family: 'Satoshi','Segoe UI',sans-serif;
    position: relative;
    overflow: hidden;
}}
#schema-launch-card::before {{
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%);
    pointer-events: none;
}}
#schema-launch-icon {{
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 40px rgba(99,102,241,0.45), 0 8px 20px rgba(0,0,0,0.4);
}}
#schema-launch-title {{
    font-size: 1.35rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
}}
#schema-launch-desc {{
    font-size: 0.82rem;
    color: #64748b;
    line-height: 1.7;
    max-width: 520px;
}}
#schema-stats-row {{
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
}}
.schema-stat {{
    background: rgba(30,41,59,0.5);
    border: 1px solid #1e293b;
    border-radius: 10px;
    padding: 10px 18px;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
}}
.schema-stat .stat-val {{
    font-size: 1.4rem; font-weight: 700; color: #e2e8f0;
    line-height: 1;
}}
.schema-stat .stat-lbl {{
    font-size: 0.62rem; color: #475569; text-transform: uppercase;
    letter-spacing: 0.07em; font-weight: 600;
}}
#schema-launch-btn {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 13px 28px;
    border-radius: 10px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(99,102,241,0.45);
    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
    font-family: 'Satoshi','Segoe UI',sans-serif;
}}
#schema-launch-btn:hover {{
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(99,102,241,0.6);
    filter: brightness(1.1);
}}
#schema-launch-btn:active {{
    transform: translateY(0);
}}
#schema-launch-features {{
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}}
.schema-feature {{
    display: flex; align-items: center; gap: 6px;
    font-size: 0.68rem; color: #475569;
}}
.schema-feature-dot {{
    width: 6px; height: 6px; border-radius: 50%;
    background: #6366f1; flex-shrink: 0;
}}
</style>

<div id="schema-launch-card">
    <div id="schema-launch-icon">
        <svg width="36" height="36" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
        </svg>
    </div>

    <div>
        <div id="schema-launch-title">Visualizador Interativo do Banco de Dados</div>
        <div id="schema-launch-desc" style="margin-top:8px;">
            Explore a arquitetura completa do CISC Belém num canvas interativo full-screen —
            arraste tabelas, inspecione colunas, visualize relações FK em tempo real e gere queries SQLite prontas a usar.
        </div>
    </div>

    <div id="schema-stats-row">
        <div class="schema-stat">
            <span class="stat-val">{total_tables}</span>
            <span class="stat-lbl">Tabelas</span>
        </div>
        <div class="schema-stat">
            <span class="stat-val">{total_views}</span>
            <span class="stat-lbl">Views</span>
        </div>
        <div class="schema-stat">
            <span class="stat-val">{total_cols}</span>
            <span class="stat-lbl">Colunas</span>
        </div>
        <div class="schema-stat">
            <span class="stat-val">{total_rels}</span>
            <span class="stat-lbl">Relações</span>
        </div>
    </div>

    <a id="schema-launch-btn" href="cisc_schema_viewer.html" target="_blank">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        Abrir Visualizador em Tela Cheia
    </a>

    <div id="schema-launch-features">
        <div class="schema-feature"><div class="schema-feature-dot"></div>Canvas infinito pan/zoom</div>
        <div class="schema-feature"><div class="schema-feature-dot"></div>Nodes arrastáveis</div>
        <div class="schema-feature"><div class="schema-feature-dot"></div>Curvas FK/View interativas</div>
        <div class="schema-feature"><div class="schema-feature-dot"></div>DDL com copy-to-clipboard</div>
        <div class="schema-feature"><div class="schema-feature-dot"></div>4 queries SQLite prontas</div>
    </div>
</div>
"""
    return launch_card
# ══════════════════════════════════════════════════════════════════════════════
#  HTML FINAL
# ══════════════════════════════════════════════════════════════════════════════
SECTION_COLORS = {
    "sazonalidade": "#38BDF8",
    "espacial":     "#22C55E",
    "socio":        "#A78BFA",
    "dengue":       "#F97316",
    "lepto":        "#06B6D4",
    "virologia":    "#8B5CF6",
    "vacina":       "#F43F5E",
    "dda":          "#22C55E",
    "desfecho":     "#EF4444",
    "relacionamento": "#38BDF8",
}

def section_header(icon, title, color):
    return f"""
    <div class="section-header" style="--sh-color:{color}">
      <span class="sh-icon">{icon}</span>
      <span class="sh-title">{title}</span>
    </div>"""

def card(html, full=False):
    cls = "chart-card full" if full else "chart-card"
    return f'<div class="{cls}">{html}</div>'

def grid(*cards, cols=2):
    inner = "\n".join(f'<div class="chart-card">{c}</div>' for c in cards)
    return f'<div class="chart-grid" style="--cols:{cols}">{inner}</div>'


def build():
    print("Coletando KPIs...")
    stats, total_dda = get_kpis()

    print("Coletando centroides de bairros...")
    centroids_dict = get_centroids_dict()
    centroids_json = json.dumps(centroids_dict)

    print("Construindo mapa...")
    map_html = build_map()

    print("Gerando graficos...")
    C = {}

    # Sazonalidade
    C["sazonalidade_3d"] = fig2html(chart_seasonality_3d(), "sazonalidade_3d_chart")
    C["timeline"]       = fig2html(chart_chronological_timeline(), "timeline_chart")
    C["monthly"]        = fig2html(chart_monthly(), "346acc9a-319e-410b-a322-0e17169073c3")
    C["delay"]          = fig2html(chart_delay(), "d539dc44-2362-4b21-92a8-540bbbfa9501")
    # Espacial
    C["bairros"]        = fig2html(chart_top_bairros(), "8ae1f122-7b76-451e-8292-f1637d42f734")
    # Socio
    C["age"]            = fig2html(chart_age_pyramid(), "978c6319-4064-4afc-a85a-b4c8b70d271d")
    C["raca"]           = fig2html(chart_raca(), "852a3fc0-8567-463b-9116-c18cbca3da13")
    C["esc"]            = fig2html(chart_escolaridade(), "56b33b37-2d21-4cb4-b7e7-380bbc4a7674")
    C["gestante"]       = fig2html(chart_gestante(), "504c6934-130b-4ae3-a281-95ba3b796105")
    C["zona_sexo"]      = fig2html(chart_zona_sexo(), "6d7948ce-9e88-46db-9e7b-115bb6ce4ded")
    # Dengue clínico
    C["classi"]         = fig2html(chart_dengue_classificacao(), "f745e245-33b0-4b19-ac59-47756e0be36d")
    C["alarm"]          = fig2html(chart_dengue_alarm(), "039e3fb1-3ff4-4772-8a22-9dca4944194b")
    C["gravity"]        = fig2html(chart_dengue_gravity(), "06b7863e-8a50-4e40-93b0-f701f44f1a7c")
    C["radar"]          = fig2html(chart_dengue_symptoms_radar(), "d1342b99-803c-47c3-a346-0db1f5a10521")
    C["sorotipo"]       = fig2html(chart_dengue_sorotipo_criterio(), "554fbcb8-931c-455d-a96b-489ecc8d2da6")
    C["lab_dengue"]     = fig2html(chart_dengue_lab(), "247313ee-09ce-4464-b09a-af18457f05a8")
    # Lepto clínico
    C["lepto_exp"]      = fig2html(chart_lepto_exposure(), "53c8a3c9-1210-46c8-9dfd-e61d999f0d53")
    C["lepto_lab"]      = fig2html(chart_lepto_lab(), "42215229-deab-47b0-82ed-fb7f2d5de0c6")
    C["lepto_soil_moisture"] = fig2html(chart_lepto_soil_moisture(), "c62fe811-1250-482a-a921-b0db4d2269a8")
    # SRAG virologia
    C["srag_virus"]     = fig2html(chart_srag_virus_pcr(), "52fc32b7-ddf4-4b6f-8440-42995348cd8c")
    C["srag_comor"]     = fig2html(chart_srag_comorbidades(), "4e762a51-cfc6-4954-881d-31e33f3737e1")
    C["srag_air_quality"] = fig2html(chart_srag_air_quality(), "e72bf97b-3b7f-442c-882f-cc5d2d5de0cf")
    # Vacina/Tratamento
    C["vac_desfecho"]   = fig2html(chart_vacina_desfecho(), "e13f649a-273f-4689-aa31-27676c65be23")
    C["antiv_desfecho"] = fig2html(chart_antiviral_desfecho(), "e9397845-2392-4e0b-82b9-dadf4d22692d")
    # DDA
    C["dda_weekly"]     = fig2html(chart_dda_weekly(), "9d085292-a294-455f-b14f-849c3b4a99a4")
    C["dda_planos"]     = fig2html(chart_dda_planos(), "0bdd2004-1dea-454f-bd4b-ac5d01cee942")
    C["dda_age"]        = fig2html(chart_dda_age(), "42da8ba4-291e-4a6d-94d8-f55a68f73420")
    # Desfechos
    C["hosp"]           = fig2html(chart_hospitalizacao(), "6a9fdcc2-5e17-4dd1-8d7e-02d39d410da6")
    C["evolucao"]       = fig2html(chart_evolucao(), "a71ca7ac-0e41-4c1d-8887-1db59756b0f8")
    C["obitos_perfil"]  = fig2html(chart_obitos_perfil(), "433f4e79-d5ed-491e-909a-2c2e43323633")
    C["schema_graph"]   = chart_schema_graph()

    # ── Extrair painéis explicativos existentes ──────────────────────────────────
    panels = {}
    import re
    if os.path.exists(OUT):
        print("Extraindo painéis explicativos do arquivo HTML existente...")
        with open(OUT, "r", encoding="utf-8") as f:
            content = f.read()
        div_matches = list(re.finditer(r'id=["\']([a-f0-9\-]{36}|schema_graph|timeline_chart)["\']', content))
        for i, match in enumerate(div_matches):
            div_id = match.group(1)
            start_pos = match.end()
            end_pos = div_matches[i+1].start() if i+1 < len(div_matches) else len(content)
            chunk = content[start_pos:end_pos]
            panel_match = re.search(r'<div class="chart-info-panel">.*?</div>', chunk, re.DOTALL)
            if panel_match:
                panels[div_id] = panel_match.group(0).strip()
    
    # Sobrescrever o painel específico de obitos_perfil com a nova explicação detalhada
    panels["433f4e79-d5ed-491e-909a-2c2e43323633"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Subplots de análise do perfil de óbitos. O painel esquerdo apresenta o volume total de óbitos por gênero e agravo (escala logarítmica para visualização equitativa de Dengue/Leptospirose frente a SRAG); o painel direito exibe a média de idade por agravo e gênero (escala linear).</p>
    <p><strong>Leitura e Legenda:</strong> Cores: Rosa (Feminino) e Azul (Masculino). Clique nos itens da legenda para filtrar dados simultaneamente em ambos os subplots.</p>
</div>"""

    panels["c62fe811-1250-482a-a921-b0db4d2269a8"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Casos diários de Leptospirose (dados reais de vigilância do SINAN Belém) correlacionados com a precipitação diária acumulada (INMET) e o nível de maré máxima diária (Marinha do Brasil).</p>
    <p><strong>Nota Científica e Origem:</strong> Os casos de Leptospirose e as medições de precipitação do INMET e maré da Marinha são dados históricos reais. Todas as séries temporais foram suavizadas com média móvel de 7 dias para facilitar a identificação visual de tendências.</p>
    <p><strong>Uso na Decisão:</strong> A coincidência de períodos de chuva forte (picos azuis) com grandes picos de maré alta (linha amarela tracejada) gera condições favoráveis de alagamento em Belém, precedendo o aumento de casos da doença nas semanas seguintes.</p>
</div>"""

    panels["e72bf97b-3b7f-442c-882f-cc5d2d5de0cf"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que mostra:</strong> Casos de SRAG em Belém comparados ao PM2.5 diário estimado.</p>
    <p><strong>Origem:</strong> SRAG real do SIVEP-Gripe; PM2.5 modelado pelo BRAMS/CPTEC, cota Belém, 15 km.</p>
    <p><strong>Uso:</strong> Apoia a identificação visual de coincidências temporais; não estabelece nem implica causalidade.</p>
</div>"""

    panels["sazonalidade_3d_chart"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico 3D</h4>
    <p><strong>O que representa:</strong> Distribuição sazonal tridimensional comparativa de notificações por doença (Dengue, Leptospirose e SRAG) no ano consolidado de 2025.</p>
    <p><strong>Eixos e Normalização:</strong> O eixo longitudinal (X) representa os meses do ano de Janeiro a Dezembro. A profundidade (Y) separa as doenças em camadas discretas. A escala vertical (Z) é normalizada individualmente para cada doença em uma altura de 0 a 10, permitindo visualizar a sazonalidade e o comportamento de picos de Leptospirose (volume baixo: ~30 casos) e Dengue (volume alto: ~1.000 casos) na mesma proporção geométrica.</p>
    <p><strong>Rótulos de Valores:</strong> Os números exibidos nas linhas representam os valores reais de início de ano, pico sazonal e fim de ano para cada agravo.</p>
</div>"""

    panels["346acc9a-319e-410b-a322-0e17169073c3"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Distribuição e sazonalidade mensal de notificações por doença e ano (2024–2026).</p>
    <p><strong>Eixos e Escalas:</strong> Dengue e SRAG (maior volume) utilizam o eixo vertical esquerdo. Leptospirose (menor volume) utiliza o eixo vertical direito para garantir que sua sazonalidade seja visível e legível.</p>
    <p><strong>Comparação e Linhas:</strong> Os anos são diferenciados pelo estilo das linhas: Linha Pontilhada (2024), Linha Contínua (2025) e Linha Tracejada (2026).</p>
</div>"""

    panels["9d085292-a294-455f-b14f-849c3b4a99a4"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Casos semanais de Doenças Diarreicas Agudas (DDA) sob vigilância epidemiológica em Belém, correlacionados com os surtos oficiais investigados.</p>
    <p><strong>Critério de Surto:</strong> Um surto de DDA é reconhecido quando há <strong>2 ou mais casos clinicamente associados</strong> compartilhando o mesmo vínculo epidemiológico (ex: mesma fonte de água, alimento ou instituição escolar/fechada).</p>
    <p><strong>Relação de Volume:</strong> Surtos são eventos <strong>localizados e delimitados</strong>. Por isso, podem ser identificados mesmo em semanas com baixo volume de casos no total da cidade. Semanas com grande volume total de casos (ex: barras verdes altas) refletem uma disseminação geral ampla (endêmica), mas não necessariamente a ocorrência de um surto concentrado de fonte comum.</p>
    <p><strong>Legenda e Alertas:</strong> As semanas típicas são representadas por barras verdes. Semanas nas quais foram oficialmente detectados surtos são destacadas por <strong>barras vermelhas</strong> e encimadas por um <strong>triângulo vermelho (Alerta de Surto)</strong>.</p>
</div>"""

    panels["039e3fb1-3ff4-4772-8a22-9dca4944194b"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Uma auditoria da qualidade de preenchimento dos sinais de alarme clínicos da dengue no SINAN Belém.</p>
    <p><strong>Gargalo Epidemiológico:</strong> Embora existam <strong>209 casos</strong> confirmados e classificados como "Dengue com Sinais de Alarme", apenas <strong>1 caso</strong> teve seus sintomas clínicos detalhados no sistema. Paralelamente, 132 casos descartados/inconclusivos tiveram esses campos preenchidos, revelando um desalinhamento crônico entre a confirmação do agravo e o preenchimento detalhado.</p>
</div>"""

    panels["06b7863e-8a50-4e40-93b0-f701f44f1a7c"] = """<div class="chart-info-panel">
    <h4>Entenda o Gráfico</h4>
    <p><strong>O que representa:</strong> Uma auditoria da qualidade de preenchimento dos sinais de gravidade (dengue grave) no SINAN Belém.</p>
    <p><strong>Gargalo Epidemiológico:</strong> Dos <strong>1.427 casos</strong> confirmados de Dengue Grave no município, <strong>nenhum (0%)</strong> possui o detalhamento dos sinais clínicos preenchido no sistema. O preenchimento detalhado ocorreu em apenas 10 casos que foram posteriormente descartados ou considerados inconclusivos.</p>
</div>"""


    # Mapeamento de chaves do dicionário C para os IDs HTML correspondentes
    key_to_id = {
        "timeline": "timeline_chart",
        "monthly": "346acc9a-319e-410b-a322-0e17169073c3",
        "delay": "d539dc44-2362-4b21-92a8-540bbbfa9501",
        "dda_weekly": "9d085292-a294-455f-b14f-849c3b4a99a4",
        "bairros": "8ae1f122-7b76-451e-8292-f1637d42f734",
        "age": "978c6319-4064-4afc-a85a-b4c8b70d271d",
        "zona_sexo": "6d7948ce-9e88-46db-9e7b-115bb6ce4ded",
        "raca": "852a3fc0-8567-463b-9116-c18cbca3da13",
        "esc": "56b33b37-2d21-4cb4-b7e7-380bbc4a7674",
        "gestante": "504c6934-130b-4ae3-a281-95ba3b796105",
        "classi": "f745e245-33b0-4b19-ac59-47756e0be36d",
        "radar": "d1342b99-803c-47c3-a346-0db1f5a10521",
        "alarm": "039e3fb1-3ff4-4772-8a22-9dca4944194b",
        "gravity": "06b7863e-8a50-4e40-93b0-f701f44f1a7c",
        "sorotipo": "554fbcb8-931c-455d-a96b-489ecc8d2da6",
        "lab_dengue": "247313ee-09ce-4464-b09a-af18457f05a8",
        "lepto_exp": "53c8a3c9-1210-46c8-9dfd-e61d999f0d53",
        "lepto_lab": "42215229-deab-47b0-82ed-fb7f2d5de0c6",
        "lepto_soil_moisture": "c62fe811-1250-482a-a921-b0db4d2269a8",
        "srag_virus": "52fc32b7-ddf4-4b6f-8440-42995348cd8c",
        "srag_comor": "4e762a51-cfc6-4954-881d-31e33f3737e1",
        "srag_air_quality": "e72bf97b-3b7f-442c-882f-cc5d2d5de0cf",
        "vac_desfecho": "e13f649a-273f-4689-aa31-27676c65be23",
        "antiv_desfecho": "e9397845-2392-4e0b-82b9-dadf4d22692d",
        "dda_planos": "0bdd2004-1dea-454f-bd4b-ac5d01cee942",
        "dda_age": "42da8ba4-291e-4a6d-94d8-f55a68f73420",
        "hosp": "6a9fdcc2-5e17-4dd1-8d7e-02d39d410da6",
        "evolucao": "a71ca7ac-0e41-4c1d-8887-1db59756b0f8",
        "obitos_perfil": "433f4e79-d5ed-491e-909a-2c2e43323633",
        "schema_graph": "schema_graph"
    }

    # Envolver os componentes com o botão e o painel correspondente
    for key, graph_id in key_to_id.items():
        if key in C:
            panel_html = panels.get(graph_id, "")
            if panel_html:
                trigger_html = '<div class="chart-info-trigger" onclick="toggleChartInfo(this)" title="Explicar gráfico"><i class="ph ph-info"></i></div>'
                C[key] = f'{trigger_html}{C[key]}\n  {panel_html}'

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CISC — Relatório Analítico Inicial DEVS · Belém, PA</title>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<link rel="stylesheet" href="../assets/cisc-design-tokens.css"/>
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<style>
:root{{
  --bg:#0A0D14; --surface:#0F1117; --border:#1E293B; --muted:#64748B;
  --text:#E2E8F0; --accent:#38BDF8;
  --primary: #0076df;
  --secondary: #005db1;
  --accent-color: #ff007a;
  --bg-dark: #0a0e14;
  --card-bg: rgba(255, 255, 255, 0.03);
  --glass: rgba(15, 23, 42, 0.8);
}}
html{{
  scroll-behavior: smooth;
  scroll-padding-top: 90px;
}}
@media (max-width: 1200px) {{
  html{{
    scroll-padding-top: 135px;
  }}
}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Satoshi',sans-serif;background:var(--bg);color:var(--text);line-height:1.6;overflow-x:hidden}}

/* ── ANCHOR NAV (Sidebar on Desktop, Horizontal Scroll on Mobile) ── */
.page-layout {{
  display: block;
  width: 100%;
}}
.main-content-wrapper {{
  min-width: 0;
  width: 100%;
}}
@media (min-width: 1201px) {{
  .page-layout {{
    display: grid;
    grid-template-columns: 240px 1fr;
    width: 100%;
  }}
}}

.anchor-nav {{
  position: fixed;
  top: 80px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: rgba(10, 13, 20, 0.95);
  backdrop-filter: blur(12px);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 99;
  padding: 1.5rem 1rem;
  gap: 1.5rem;
  scrollbar-width: none;
}}
@media (min-width: 1201px) {{
  .anchor-nav {{
    position: sticky;
    top: 72px;
    height: calc(100vh - 72px);
    width: 100%;
    left: auto;
    bottom: auto;
    overflow-y: auto;
  }}
}}
.anchor-nav::-webkit-scrollbar {{ display: none; }}

.anchor-nav-links {{
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}}

.anchor-nav a {{
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted) !important;
  text-decoration: none;
  border-left: 3px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}}

.anchor-nav a:hover {{
  color: var(--text) !important;
  background: rgba(255, 255, 255, 0.03);
}}

.anchor-nav a.active {{
  color: var(--text) !important;
  background: rgba(56, 189, 248, 0.08);
  border-left-color: var(--accent);
}}

/* Stack Wrapper at bottom of sidebar on desktop */
.nav-stack-wrapper {{
  margin-top: auto;
  position: relative;
  width: 100%;
}}
.nav-stack-btn {{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(56, 189, 248, 0.07);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}}
.nav-stack-btn:hover {{ background: rgba(56, 189, 248, 0.14); }}

.nav-stack-popover {{
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  top: auto;
  right: auto;
  background: rgba(10, 13, 20, 0.97);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.9rem 1.1rem 1rem;
  min-width: 310px;
  box-shadow: 0 16px 40px rgba(0,0,0,.6);
  backdrop-filter: blur(12px);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.18s ease, transform 0.18s ease;
}}
.nav-stack-popover.open {{
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}}

@media (max-width: 1200px) {{
  .anchor-nav {{
    position: sticky;
    top: 72px;
    left: auto;
    bottom: auto;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
    align-items: center;
    padding: 0;
    overflow-x: auto;
    gap: 0;
    overflow-y: visible;
  }}
  .anchor-nav-links {{
    flex-direction: row;
    overflow-x: auto;
    width: auto;
    flex: 1;
    gap: 0;
    scrollbar-width: none;
  }}
  .anchor-nav-links::-webkit-scrollbar {{ display: none; }}
  .anchor-nav a {{
    padding: 0.8rem 1.1rem;
    font-size: 0.78rem;
    border-left: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
  }}
  .anchor-nav a:hover {{
    background: transparent;
  }}
  .anchor-nav a.active {{
    background: transparent;
    border-bottom-color: var(--accent);
  }}
  .nav-stack-wrapper {{
    margin-top: 0;
    width: auto;
  }}
  .nav-stack-btn {{
    width: auto;
    border: none;
    border-left: 1px solid var(--border);
    border-radius: 0;
    padding: 0.8rem 1.1rem;
  }}
  .nav-stack-popover {{
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    left: auto;
    bottom: auto;
    transform: translateY(-6px);
  }}
  .nav-stack-popover.open {{
    transform: translateY(0);
  }}
}}

/* ── REPORT HEADER ── */
.report-header{{
  background:linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%);
  border-bottom:1px solid var(--border);
  padding:2.5rem 3rem;
  display:flex;align-items:center;gap:1.5rem;
  flex-wrap:wrap;
}}
.hi{{font-size:3rem;filter:drop-shadow(0 0 20px rgba(56,189,248,.5))}}
header h1{{font-size:1.75rem;font-weight:700;
  background:linear-gradient(135deg,#38BDF8,#818CF8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}}
header p{{color:var(--muted);font-size:.88rem;margin-top:.2rem}}
.badge{{margin-left:auto;background:rgba(56,189,248,.1);
  border:1px solid rgba(56,189,248,.3);color:var(--accent);
  padding:.4rem 1rem;border-radius:999px;font-size:.78rem;white-space:nowrap}}

/* ── MAIN ── */
main{{max-width:1600px;margin:0 auto;padding:2rem 2rem 5rem;width:auto;box-sizing:border-box}}

/* ── KPI GRID ── */
.kpi-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:2rem}}
.kpi{{background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:1.25rem 1rem;text-align:center;position:relative;overflow:hidden;
  transition:border-color .2s,transform .2s}}
.kpi::before{{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--kc,var(--accent))}}
.kpi:hover{{border-color:var(--accent);transform:translateY(-2px)}}
.kpi .v{{font-size:1.9rem;font-weight:700;color:var(--kc,var(--text))}}
.kpi .l{{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:.2rem}}

/* ── SECTION HEADER ── */
.section-header{{
  display:flex;align-items:center;gap:.75rem;
  margin:2.5rem 0 1.2rem;padding-bottom:.6rem;
  border-bottom:2px solid var(--sh-color,var(--accent));
}}
.sh-icon{{font-size:1.4rem}}
.sh-title{{font-size:1.05rem;font-weight:600;letter-spacing:.02em;color:var(--sh-color,var(--text))}}

/* ── CHART CARDS ── */
.chart-card{{background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;
  transition:border-color .2s;width:100%;overflow:hidden}}
.chart-card:hover{{border-color:#334155}}
.chart-card.full{{margin-bottom:1.5rem;width:100%}}
.chart-grid{{display:grid;grid-template-columns:repeat(var(--cols,2),1fr);
  gap:1.25rem;margin-bottom:1.5rem}}
.chart-grid .chart-card{{margin-bottom:0}}
@media(max-width:1024px){{.chart-grid{{grid-template-columns:1fr}}}}

/* Plotly responsiveness overrides to prevent grid overflow */
.js-plotly-plot, .plotly, .svg-container {{
  width: 100% !important;
  max-width: 100% !important;
}}

/* ── MAP ── */
.map-wrapper{{background:var(--surface);border:1px solid var(--border);
  border-radius:16px;overflow:hidden;margin-bottom:1.5rem;width:100%;max-width:100%}}
.map-wrapper iframe,.map-wrapper .folium-map{{width:100%;height:520px;border:none}}

/* ── LEGEND PILLS ── */
.pills{{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.25rem}}
.pill{{display:flex;align-items:center;gap:.4rem;background:var(--surface);
  border:1px solid var(--border);border-radius:999px;padding:.3rem .8rem;font-size:.78rem}}
.dot{{width:9px;height:9px;border-radius:50%;flex-shrink:0}}

/* ── FOOTER ── */
footer{{border-top:1px solid var(--border);padding:2rem 3rem;
  text-align:center;color:var(--muted);font-size:.8rem}}
footer strong{{color:var(--text)}}

/* ── CHART INFO ELEMENT ── */
.chart-card {{
  position: relative;
}}
.chart-info-trigger {{
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
  font-family: inherit;
}}
.chart-info-trigger:hover {{
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.08);
}}
.chart-info-trigger.active {{
  background: var(--accent);
  border-color: var(--accent);
  color: #0A0D14;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}}
.chart-info-panel {{
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.3s ease-out, opacity 0.2s ease-out, margin-bottom 0.2s ease-out;
  font-size: 0.78rem;
  background: rgba(15, 23, 42, 0.45);
  border-left: 2px solid var(--accent);
  border-radius: 6px;
  color: #94A3B8;
  line-height: 1.5;
  margin-top: 0.5rem;
}}
.chart-info-panel.active {{
  max-height: 250px;
  opacity: 1;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-left-width: 3px;
  overflow-y: auto;
}}
.chart-info-panel h4 {{
  color: var(--accent);
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}}
.chart-info-panel p {{
  margin-bottom: 0.4rem;
}}
.chart-info-panel p:last-child {{
  margin-bottom: 0;
}}
.chart-info-panel strong {{
  color: var(--text);
}}

/* Responsive alignments for navbar, headers, badge and footer spacing */
@media (max-width: 992px) {{
  header.site-header {{
    position: relative;
    height: auto;
    padding: 1rem 5%;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }}
  .nav-links {{
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }}
  .anchor-nav {{
    top: 0 !important;
  }}
  html {{
    scroll-padding-top: 60px !important;
  }}
}}
@media (max-width: 768px) {{
  .report-header {{
    padding: 1.5rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }}
  .report-header .badge {{
    margin-left: 0;
  }}
  main {{
    padding: 1rem 1rem 3rem;
  }}
  footer {{
    padding: 1.5rem 1.5rem;
  }}
}}
@media (max-width: 480px) {{
  .kpi-grid {{
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }}
  .kpi .v {{
    font-size: 1.5rem;
  }}
  .kpi .l {{
    font-size: 0.65rem;
  }}
  .nav-stack-popover {{
    min-width: 280px;
    width: calc(100vw - 20px);
    max-width: 300px;
  }}
}}
</style>
</head>
<body>

<!-- Portal Navbar -->
<header class="site-header">
    <a href="../index.html" class="logo">
        <img src="../assets/cisc_vector.svg" alt="Logo CISC" class="logo-img">
        <span>CISC BELÉM</span>
    </a>
    <nav class="nav-links">
        <div class="nav-group">
            <span class="group-title">
                <i class="ph ph-stack"></i> Estrutura
                <i class="ph ph-caret-down"></i>
            </span>
            <div class="group-content">
                <a href="../index.html"><i class="ph ph-house"></i> Início / Visão Geral</a>
                <a href="../etl_arquitetura.html"><i class="ph ph-graph"></i> Arquitetura Core</a>
                <a href="../schema_linkage.html"><i class="ph ph-database"></i> Schema PostGIS</a>
            </div>
        </div>
        <div class="nav-group">
            <span class="group-title">
                <i class="ph ph-cpu"></i> Inteligência
                <i class="ph ph-caret-down"></i>
            </span>
            <div class="group-content">
                <a href="../devs_etl_detalhado.html"><i class="ph ph-file-text"></i> Pipeline DEVS</a>
                <a href="../visa_etl_detalhado.html"><i class="ph ph-shield-warning"></i> Pipeline VISA</a>
                <a href="../cisc_ia_modelagem.html"><i class="ph ph-robot"></i> Modelagem IA/HTR</a>
                <a href="../hitl_devs_arquitetura.html"><i class="ph ph-users-gear"></i> Validação HITL</a>
                <a href="../cisc_framework_estatistico.html"><i class="ph ph-calculator"></i> Framework Estatístico</a>
            </div>
        </div>
        <div class="nav-group">
            <span class="group-title">
                <i class="ph ph-eye"></i> Decisão
                <i class="ph ph-caret-down"></i>
            </span>
            <div class="group-content">
                <a href="../sala_situacao.html"><i class="ph ph-monitor"></i> Sala de Situação</a>
                <a href="../matriz_alertas.html"><i class="ph ph-warning"></i> Matriz de Alertas</a>
                <a href="../dashboard/index.html"><i class="ph ph-chart-line-up"></i> Painel de Comando CISC</a>
            </div>
        </div>
        <div class="nav-group">
            <span class="group-title">
                <i class="ph ph-database"></i> Análise &amp; BD
                <i class="ph ph-caret-down"></i>
            </span>
            <div class="group-content">
                <a href="cisc_relatorio_visual.html" class="active"><i class="ph ph-chart-bar"></i> Relatório Epidemiológico</a>
                <a href="cisc_analise_correlacao.html"><i class="ph ph-brain"></i> Correlação &amp; ML</a>
                <a href="cisc_schema_viewer.html"><i class="ph ph-graph"></i> Esquema BD SQLite</a>
                <a href="auditoria_fontes.html"><i class="ph ph-clipboard-text"></i> Auditoria de Fontes</a>
            </div>
        </div>
        <a href="https://github.com/dummyDevisa/cisc" target="_blank" style="color: var(--text-dim); text-decoration: none; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-left: 10px;">
            <i class="ph ph-github-logo"></i> GitHub
        </a>
    </nav>
</header>

<!-- Wrapper layout para grid responsivo -->
<div class="page-layout">

<!-- Navegação por âncoras -->
<nav class="anchor-nav">
  <div class="anchor-nav-links">
    <a href="#resumo"><i class="ph ph-chart-bar"></i> Resumo</a>
    <a href="#sazonalidade"><i class="ph ph-calendar"></i> Sazonalidade</a>
    <a href="#espacial"><i class="ph ph-map-trifold"></i> Espacial</a>
    <a href="#socio"><i class="ph ph-users"></i> Sociodemografia</a>
    <a href="#dengue"><i class="ph ph-bug"></i> Dengue</a>
    <a href="#lepto"><i class="ph ph-waves"></i> Leptospirose</a>
    <a href="#virologia"><i class="ph ph-dna"></i> Virologia SRAG</a>
    <a href="#vacina"><i class="ph ph-syringe"></i> Vacina & Tratamento</a>
    <a href="#dda"><i class="ph ph-virus"></i> DDA</a>
    <a href="#desfechos"><i class="ph ph-first-aid-kit"></i> Desfechos</a>
    <a href="#relacionamento"><i class="ph ph-link"></i> Relacionamento</a>
  </div>
  <div class="nav-stack-wrapper">
    <button class="nav-stack-btn" id="stackBtn" onclick="toggleStack()" aria-label="Tech stack">
      <span class="ns-icon"><i class="ph ph-wrench"></i></span> Stack
    </button>
    <div class="nav-stack-popover" id="stackPopover">
      <h3>Tecnologias Utilizadas</h3>
      <div class="nsp-section">
        <div class="nsp-section-label"><i class="ph ph-chart-bar text-sky-400"></i> Visualização</div>
        <div class="nsp-pills">
          <span class="nsp-pill"><span class="nsp-dot" style="background:#636EFA"></span>Plotly 2.32</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#38BDF8"></span>Plotly Subplots</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#22C55E"></span>Folium + HeatMap</span>
        </div>
      </div>
      <div class="nsp-section">
        <div class="nsp-section-label"><i class="ph ph-code text-green-400"></i> Backend Python</div>
        <div class="nsp-pills">
          <span class="nsp-pill"><span class="nsp-dot" style="background:#F97316"></span>Pandas</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#8B5CF6"></span>SQLite3</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#06B6D4"></span>Unicodedata</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#F43F5E"></span>Regex (re)</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#A78BFA"></span>JSON</span>
        </div>
      </div>
      <div class="nsp-section">
        <div class="nsp-section-label"><i class="ph ph-database text-purple-400"></i> Dados</div>
        <div class="nsp-pills">
          <span class="nsp-pill"><span class="nsp-dot" style="background:#FACC15"></span>SINAN</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#34D399"></span>SIVEP-Gripe</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#F87171"></span>MDDA</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#64748B"></span>GeoJSON (IBGE)</span>
        </div>
      </div>
      <div class="nsp-section" style="margin-bottom:0">
        <div class="nsp-section-label"><i class="ph ph-globe text-amber-400"></i> Frontend</div>
        <div class="nsp-pills">
          <span class="nsp-pill"><span class="nsp-dot" style="background:#E2E8F0"></span>HTML5 / Vanilla CSS</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#FACC15"></span>Vanilla JS</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#38BDF8"></span>Fontshare · Satoshi / Clash</span>
          <span class="nsp-pill"><span class="nsp-dot" style="background:#22C55E"></span>Leaflet.js</span>
        </div>
      </div>
    </div>
  </div>
</nav>

<div class="main-content-wrapper">

<header class="report-header">
  <div class="hi"><i class="ph ph-thermometer-hot text-amber-400"></i></div>
  <div style="flex: 1; margin-left: 15px;">
    <h1>CISC — Relatório Analítico Inicial DEVS</h1>
    <p>Dengue · Leptospirose · SRAG · DDA &nbsp;|&nbsp; Belém, Pará &nbsp;|&nbsp; Período: 2024 – 2026</p>
  </div>
  <div class="badge"><i class="ph ph-microscope text-indigo-400"></i> {int(stats['t']):,} notificações analisadas</div>
</header>

<main>

<!-- ═══════ 1. RESUMO ═══════ -->
<section id="resumo">
{section_header('<i class="ph ph-chart-bar"></i>',"Resumo Geral — Indicadores-Chave","#38BDF8")}
<div class="kpi-grid">
  <div class="kpi" style="--kc:#38BDF8"><div class="v">{int(stats['t']):,}</div><div class="l">Total Notificações</div></div>
  <div class="kpi" style="--kc:{C_DENGUE}"><div class="v">{int(stats['d']):,}</div><div class="l">Dengue</div></div>
  <div class="kpi" style="--kc:{C_LEPTO}"><div class="v">{int(stats['l']):,}</div><div class="l">Leptospirose</div></div>
  <div class="kpi" style="--kc:{C_SRAG}"><div class="v">{int(stats['s']):,}</div><div class="l">SRAG</div></div>
  <div class="kpi" style="--kc:{C_DDA}"><div class="v">{total_dda:,}</div><div class="l">Casos DDA</div></div>
  <div class="kpi" style="--kc:#EF4444"><div class="v">{int(stats['ob']):,}</div><div class="l">Óbitos</div></div>
  <div class="kpi" style="--kc:#FACC15"><div class="v">{int(stats['hosp']):,}</div><div class="l">Hospitalizações</div></div>
  <div class="kpi" style="--kc:#A78BFA"><div class="v">{stats['age']}</div><div class="l">Idade Média (anos)</div></div>
</div>
</section>

<!-- ═══════ 2. SAZONALIDADE ═══════ -->
<section id="sazonalidade">
{section_header('<i class="ph ph-calendar"></i>',"Sazonalidade e Tendências Temporais","#38BDF8")}
<div class="chart-grid" style="--cols:2">
  <div class="chart-card">{C["sazonalidade_3d"]}</div>
  <div class="chart-card">{C["timeline"]}</div>
</div>
<div class="chart-grid">
  <div class="chart-card">{C["monthly"]}</div>
  <div class="chart-card">{C["delay"]}</div>
</div>
<div class="chart-card full">{C["dda_weekly"]}</div>
</section>

<!-- ═══════ 3. ESPACIAL ═══════ -->
<section id="espacial">
{section_header('<i class="ph ph-map-trifold"></i>',"Análise Espacial — Distribuição por Bairro","#22C55E")}
<div class="pills" style="justify-content: space-between; align-items: center; gap: 1rem;">
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
    <div class="pill"><div class="dot" style="background:{C_DENGUE}"></div>Dengue (Choropleth, 2025–2026)</div>
    <div class="pill"><div class="dot" style="background:{C_LEPTO}"></div>Leptospirose (Choropleth, 2025)</div>
    <div class="pill"><div class="dot" style="background:{C_SRAG}"></div>SRAG (Choropleth, 2024–2026)</div>
    <div class="pill"><div class="dot" style="background:#F59E0B"></div>Mapas de Calor (Dengue, Leptospirose, SRAG)</div>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <span style="font-size: 0.72rem; color: var(--muted); font-weight: 600; text-transform: uppercase;">Navegar Bairro:</span>
    <select id="bairroSelector" onchange="zoomToBairro()" style="background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; font-family: Satoshi, sans-serif; font-weight: bold; outline: none; cursor: pointer;">
       <!-- Populated by JS -->
    </select>
  </div>
</div>
<div class="map-wrapper">{map_html}</div>
<div class="chart-card full">{C["bairros"]}</div>
</section>

<!-- ═══════ 4. SOCIODEMOGRAFIA ═══════ -->
<section id="socio">
{section_header('<i class="ph ph-users"></i>',"Perfil Sociodemográfico dos Pacientes","#A78BFA")}
<div class="chart-grid">
  <div class="chart-card">{C["age"]}</div>
  <div class="chart-card">{C["zona_sexo"]}</div>
</div>
<div class="chart-grid">
  <div class="chart-card">{C["raca"]}</div>
  <div class="chart-card">{C["esc"]}</div>
</div>
<div class="chart-card full">{C["gestante"]}</div>
</section>

<!-- ═══════ 5. DENGUE ═══════ -->
<section id="dengue">
{section_header('<i class="ph ph-bug"></i>',"Progressão Clínica e Laboratório — Dengue","#F97316")}
<div class="chart-grid">
  <div class="chart-card">{C["classi"]}</div>
  <div class="chart-card">{C["radar"]}</div>
</div>
<div class="chart-grid">
  <div class="chart-card">{C["alarm"]}</div>
  <div class="chart-card">{C["gravity"]}</div>
</div>
<div class="chart-grid">
  <div class="chart-card">{C["sorotipo"]}</div>
  <div class="chart-card">{C["lab_dengue"]}</div>
</div>
</section>

<!-- ═══════ 6. LEPTOSPIROSE ═══════ -->
<section id="lepto">
{section_header('<i class="ph ph-waves"></i>',"Análise Clínica e Exposição — Leptospirose","#06B6D4")}
<div class="chart-grid">
  <div class="chart-card">{C["lepto_exp"]}</div>
  <div class="chart-card">{C["lepto_lab"]}</div>
</div>
<div class="chart-card full">{C["lepto_soil_moisture"]}</div>
</section>

<!-- ═══════ 7. VIROLOGIA SRAG ═══════ -->
<section id="virologia">
{section_header('<i class="ph ph-dna"></i>',"Etiologia Viral e Comorbidades — SRAG","#8B5CF6")}
<div class="chart-card full">{C["srag_virus"]}</div>
<div class="chart-card full">{C["srag_comor"]}</div>
<div class="chart-card full">{C["srag_air_quality"]}</div>
</section>

<!-- ═══════ 8. VACINA / TRATAMENTO ═══════ -->
<section id="vacina">
{section_header('<i class="ph ph-syringe"></i>',"Vacinação COVID-19 e Uso de Antiviral — SRAG","#F43F5E")}
<div class="chart-grid">
  <div class="chart-card">{C["vac_desfecho"]}</div>
  <div class="chart-card">{C["antiv_desfecho"]}</div>
</div>
</section>

<!-- ═══════ 9. DDA ═══════ -->
<section id="dda">
{section_header('<i class="ph ph-virus"></i>',"Doença Diarreica Aguda (DDA)","#22C55E")}
<div class="chart-grid">
  <div class="chart-card">{C["dda_planos"]}</div>
  <div class="chart-card">{C["dda_age"]}</div>
</div>
</section>

<!-- ═══════ 10. DESFECHOS ═══════ -->
<section id="desfechos">
{section_header('<i class="ph ph-first-aid-kit"></i>',"Desfechos Clínicos e Óbitos","#EF4444")}
<div class="chart-grid">
  <div class="chart-card">{C["hosp"]}</div>
  <div class="chart-card">{C["evolucao"]}</div>
</div>
<div class="chart-card full">{C["obitos_perfil"]}</div>
</section>

<!-- ═══════ 11. RELACIONAMENTO ═══════ -->
<section id="relacionamento">
{section_header('<i class="ph ph-link"></i>',"Relacionamento e Arquitetura do Banco de Dados","#38BDF8")}
<div class="chart-card full">{C["schema_graph"]}</div>
</section>

</main>

<footer>
  <strong>CISC Health Analytics</strong> &nbsp;·&nbsp;
  Fonte: SINAN / SIVEP-Gripe / MDDA (2024–2026) &nbsp;·&nbsp; Belém, Pará &nbsp;·&nbsp;
  Dados geoespaciais: belem_pa_bairros.geojson
</footer>

</div> <!-- .main-content-wrapper -->
</div> <!-- .page-layout -->

<script>
// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.anchor-nav a');
const observer  = new IntersectionObserver(entries => {{
  entries.forEach(e => {{
    if(e.isIntersecting){{
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.anchor-nav a[href="#${{e.target.id}}"]`);
      if(active) active.classList.add('active');
    }}
  }});
}}, {{threshold: 0.15}});
sections.forEach(s => observer.observe(s));

function toggleChartInfo(btn) {{
  const card = btn.closest('.chart-card');
  const panel = card.querySelector('.chart-info-panel');
  if (panel) {{
    const isActive = panel.classList.toggle('active');
    btn.classList.toggle('active', isActive);
  }}
}}

function toggleStack() {{
  const pop = document.getElementById('stackPopover');
  const btn = document.getElementById('stackBtn');
  const isOpen = pop.classList.toggle('open');
  btn.style.background = isOpen ? 'rgba(56,189,248,.18)' : '';
}}
document.addEventListener('click', (e) => {{
  if (!e.target.closest('.nav-stack-wrapper')) {{
    document.getElementById('stackPopover')?.classList.remove('open');
    document.getElementById('stackBtn').style.background = '';
  }}
}});

// Force Plotly charts resize on window resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {{
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {{
    const plots = document.querySelectorAll('.plotly-graph-div');
    plots.forEach(gd => {{
      if (window.Plotly) {{
        window.Plotly.Plots.resize(gd);
      }}
    }});
  }}, 100);
}});

// Centroids data injected by python
const CENTROIDS = {centroids_json};

function initBairroSelector() {{
  const selector = document.getElementById('bairroSelector');
  if (!selector) return;
  selector.innerHTML = '<option value="">-- Selecionar Bairro --</option>';
  const sortedNames = Object.keys(CENTROIDS).sort();
  sortedNames.forEach(name => {{
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    selector.appendChild(opt);
  }});
}}

function zoomToBairro() {{
  const b = document.getElementById('bairroSelector').value;
  
  // Find leaflet map object (check parent window first, then check iframe contentWindow)
  let mapObj = null;
  let mapWindow = window;
  
  for (let key in window) {{
    if (key.indexOf('map_') === 0 && window[key] && typeof window[key].setView === 'function') {{
      mapObj = window[key];
      mapWindow = window;
      break;
    }}
  }}
  
  if (!mapObj) {{
    const iframe = document.querySelector('.map-wrapper iframe');
    if (iframe && iframe.contentWindow) {{
      const iw = iframe.contentWindow;
      for (let key in iw) {{
        if (key.indexOf('map_') === 0 && iw[key] && typeof iw[key].setView === 'function') {{
          mapObj = iw[key];
          mapWindow = iw;
          break;
        }}
      }}
    }}
  }}
  
  if (!mapObj) return;

  const BELEM_BOUNDS = [[-1.5193797828048805, -48.5662866], [-1.0555630436945882, -48.3100766]];

  if (b) {{
    const coords = CENTROIDS[b];
    if (coords) {{
      mapObj.setView(coords, 14);
    }}
  }} else {{
    mapObj.fitBounds(BELEM_BOUNDS, {{padding: [20, 20]}});
  }}

  // Iterate over all layers on the map to hide/show GeoJSON vector shapes
  mapObj.eachLayer(function(layer) {{
    if (layer.eachLayer && typeof layer.setStyle === 'function') {{
      layer.eachLayer(function(subLayer) {{
        if (subLayer.feature && subLayer.feature.properties) {{
          const featName = subLayer.feature.properties.name;
          if (featName) {{
            // Normalise for matching
            const normSelected = b ? b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
            const normFeat = featName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
            
            if (!b || normFeat === normSelected) {{
              subLayer.setStyle({{
                fillOpacity: 0.82,
                opacity: 0.45,
                stroke: true,
                fill: true
              }});
            }} else {{
              subLayer.setStyle({{
                fillOpacity: 0,
                opacity: 0,
                stroke: false,
                fill: false
              }});
            }}
          }}
        }}
      }});
    }}
  }});
}}

document.addEventListener('DOMContentLoaded', initBairroSelector);
</script>
</body>
</html>"""

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\nRelatorio gerado: {OUT}")


if __name__ == "__main__":
    build()
