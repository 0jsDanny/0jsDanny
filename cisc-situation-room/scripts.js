// --- RELÓGIO ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('pt-BR');
}
setInterval(updateClock, 1000);
updateClock();

// --- PREDICTIVE STATE ---
let isPredictiveMode = true; // Always on by default but without special visuals
let currentPanel = 'epi';

function emitirAlertaPreventivo() {
    document.getElementById('alert-modal').classList.remove('hidden');
}

function closeAlertModal() {
    document.getElementById('alert-modal').classList.add('hidden');
}

function updateAIInsights(type, sub = null) {
    const names = {
        dda: 'DDA/SRAG', arbo: 'Arboviroses', lepto: 'Leptospirose', mort: 'Mortalidade',
        lacen: 'Laboratorial', vigiar: 'Qualidade do Ar', vigiagua: 'VIGIAGUA', dta: 'Surtos DTA',
        uv: 'Índice UV', ic: 'Índice Calor', precip: 'Precipitação 24h', precip72: 'Precipitação 72h',
        rio: 'Nível do Rio', mare: 'Tábua de Marés'
    };
    const activeName = names[sub] || type.toUpperCase();
    const ctxTitle = document.getElementById('ai-ctx-title');
    if (ctxTitle) ctxTitle.innerText = `ANÁLISE: ${activeName}`;

    const probVal = document.getElementById('ai-prob-val');
    const probLabel = document.getElementById('ai-prob-label');
    const probDesc = document.getElementById('ai-prob-desc');
    
    if (!probVal) return;

    // --- Dynamic Risk Matrix Logic (Synchronized with Panel Status) ---
    const statusEl = document.getElementById('status-' + type);
    const statusText = statusEl ? statusEl.innerText.toUpperCase() : "NORMAL";
    
    let ncLevel = "NÍVEL 1";
    let ncColor = "text-green-500";
    let ncBg = "bg-green-500/20";
    let ncDesc = "Vigilância de Rotina";
    let ncLongDesc = "Normalidade / Risco Baixo";

    if (statusText === 'EMERGÊNCIA') {
        ncLevel = "NÍVEL 4";
        ncColor = "text-red-500 soft-pulse";
        ncBg = "bg-red-500/25";
        ncDesc = "ESTADO DE EMERGÊNCIA";
        ncLongDesc = "Risco crítico detectado. Ativação imediata de Gabinete de Crise.";
    } else if (statusText === 'ALERTA') {
        ncLevel = "NÍVEL 3";
        ncColor = "text-orange-500";
        ncBg = "bg-orange-500/15";
        ncDesc = "ALERTA MÁXIMO";
        ncLongDesc = "Acionamento intersetorial e triagem intensificada na rede.";
    } else if (statusText === 'ATENÇÃO') {
        ncLevel = "NÍVEL 2";
        ncColor = "text-yellow-500";
        ncBg = "bg-yellow-500/15";
        ncDesc = "ATENÇÃO";
        ncLongDesc = "Comunicação de risco ativa e monitoramento em tempo real.";
    }

    const ncBadge = `
        <div class="nc-status-indicator ${ncBg} ${ncColor} border border-current transition-all duration-500 text-center">
            ${ncLevel} ${ncDesc}
        </div>
        <p class="text-[9px] text-slate-500 mt-2 text-center px-4 leading-tight">${ncLongDesc}</p>
    `;

    let thoughtText = '';
    let driverData = [];
    let actionsHtml = '';

    if (type === 'clima') {
        probLabel.innerText = "RISCO METEOROLÓGICO";
        probVal.innerHTML = "96.2%";
        probDesc.innerHTML = ncBadge;
        thoughtText = '"INMET escalou alerta para Laranja. Convergência de frente úmida com ilha de calor urbana. Risco de alagamentos severos em DABEN e DAOUT."';
        
        const p72 = mockDataCache.clima.precip72.slice(-1)[0];
        const icVal = mockDataCache.clima.ic.slice(-1)[0];
        const tmaxVal = mockDataCache.clima.uv.slice(-1)[0];

        driverData = [
            { label: 'Chuva Acumulada', val: `${p72}mm`, icon: 'fa-cloud-showers-heavy', color: 'text-blue-400' },
            { label: 'Índice de Calor', val: `${icVal}°C`, icon: 'fa-temperature-high', color: 'text-orange-400' },
            { label: 'Anomalia Térmica', val: `+${(tmaxVal - 36).toFixed(1)}°C`, icon: 'fa-sun', color: 'text-red-400' }
        ];

        actionsHtml = `
            <li class="ai-action-item"><i class="fas fa-bullhorn"></i><span>Aviso Prévio Defesa Civil (199).</span></li>
            <li class="ai-action-item"><i class="fas fa-triangle-exclamation"></i><span>Monitoramento DABEN/DAOUT.</span></li>
            <li class="ai-action-item bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2 mt-2 cursor-pointer transition-all flex items-center justify-between" onclick="abrirPromocaoSaude('clima')">
                <div class="flex items-center gap-2">
                    <i class="fas fa-share-nodes text-emerald-400 animate-pulse"></i>
                    <span class="text-[10px] font-bold text-slate-200 uppercase tracking-tight">Divulgar Alerta (Calor)</span>
                </div>
                <i class="fas fa-chevron-right text-[8px] text-emerald-400"></i>
            </li>
        `;
    } else if (type === 'epi') {
        probLabel.innerText = "PROBABILIDADE DE SURTO";
        probVal.innerHTML = isPredictiveMode ? "88.9%" : "84.2%";
        probDesc.innerHTML = ncBadge;
        thoughtText = isPredictiveMode
            ? '"Nowcasting detecta subnotificação de 30% em SRAG. Projeção indica pico epidêmico em 10 dias."'
            : '"O lag epidemiológico indica que o pico de arboviroses ocorrerá em 12 dias."';
        
        const ddaVal = mockDataCache.epi.dda.slice(-1)[0];
        const leptoVal = mockDataCache.epi.lepto.slice(-1)[0];

        driverData = [
            { label: 'Casos DDA/SRAG', val: ddaVal.toString(), icon: 'fa-hospital-user', color: 'text-red-400' },
            { label: 'Notificações LIRAa', val: 'Elevado', icon: 'fa-mosquito', color: 'text-orange-400' },
            { label: 'Casos Lepto', val: leptoVal.toString(), icon: 'fa-search', color: 'text-purple-400' }
        ];

        actionsHtml = `
            <li class="ai-action-item"><i class="fas fa-vial"></i><span>Reforço de Insumos UPAs.</span></li>
            <li class="ai-action-item"><i class="fas fa-users-viewfinder"></i><span>Mutirão Focal Icoaraci.</span></li>
            <li class="ai-action-item bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2 mt-2 cursor-pointer transition-all flex items-center justify-between" onclick="abrirPromocaoSaude('epi')">
                <div class="flex items-center gap-2">
                    <i class="fas fa-share-nodes text-emerald-400 animate-pulse"></i>
                    <span class="text-[10px] font-bold text-slate-200 uppercase tracking-tight">Divulgar Campanha (Dengue)</span>
                </div>
                <i class="fas fa-chevron-right text-[8px] text-emerald-400"></i>
            </li>
        `;
    } else if (type === 'visa') {
        probLabel.innerText = "RISCO SANITÁRIO";
        probVal.innerHTML = isPredictiveMode ? "76.4%" : "12.0%";
        probDesc.innerHTML = ncBadge;
        thoughtText = isPredictiveMode
            ? '"Correlação positiva entre falhas no branqueamento e picos de DDA detectada via AI."'
            : '"Monitoramento de rotina indica baixa conformidade em 3 distritos."';
            
        const waterVal = mockDataCache.visa.vigiagua.slice(-1)[0];
        const airVal = mockDataCache.visa.vigiar.slice(-1)[0];

        driverData = [
            { label: 'Conf. VIGIAGUA', val: `${waterVal}%`, icon: 'fa-droplet', color: 'text-green-400' },
            { label: 'IQAr (Qualid. Ar)', val: airVal.toString(), icon: 'fa-wind', color: 'text-blue-400' },
            { label: 'Surtos DTA', val: '01', icon: 'fa-vial-circle-check', color: 'text-emerald-400' }
        ];

        actionsHtml = `
            <li class="ai-action-item"><i class="fas fa-clipboard-check"></i><span>Fiscalização Cluster Batista Campos.</span></li>
            <li class="ai-action-item"><i class="fas fa-ban"></i><span>Suspensão Alvarás Críticos.</span></li>
            <li class="ai-action-item bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2 mt-2 cursor-pointer transition-all flex items-center justify-between" onclick="abrirPromocaoSaude('visa')">
                <div class="flex items-center gap-2">
                    <i class="fas fa-share-nodes text-emerald-400 animate-pulse"></i>
                    <span class="text-[10px] font-bold text-slate-200 uppercase tracking-tight">Divulgar Cuidados (Água)</span>
                </div>
                <i class="fas fa-chevron-right text-[8px] text-emerald-400"></i>
            </li>
        `;
    } else if (type === 'hidro') {
        probLabel.innerText = "RISCO DE INUNDAÇÃO";
        probVal.innerHTML = isPredictiveMode ? "98.1%" : "65.0%";
        probDesc.innerHTML = ncBadge;
        thoughtText = '"Alinhamento astronômico indica maré de 3.8m. Risco de inundação severa no centro histórico."';
        
        const rioVal = mockDataCache.hidro.rio.slice(-1)[0];
        const mareVal = mockDataCache.hidro.mare.slice(-1)[0];

        driverData = [
            { label: 'Nível do Rio', val: `${rioVal.toFixed(2)}m`, icon: 'fa-water', color: 'text-blue-400' },
            { label: 'Tábua de Marés', val: `${mareVal.toFixed(2)}m`, icon: 'fa-arrow-up-right-dots', color: 'text-cyan-400' },
            { label: 'Risco Hidrológico', val: 'Baixo', icon: 'fa-house-flood-water', color: 'text-green-400' }
        ];

        actionsHtml = `
            <li class="ai-action-item"><i class="fas fa-tower-broadcast"></i><span>Ativação de Sirenes (Vila da Barca).</span></li>
            <li class="ai-action-item"><i class="fas fa-truck-moving"></i><span>Remoção Preventiva.</span></li>
            <li class="ai-action-item bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2 mt-2 cursor-pointer transition-all flex items-center justify-between" onclick="abrirPromocaoSaude('hidro')">
                <div class="flex items-center gap-2">
                    <i class="fas fa-share-nodes text-emerald-400 animate-pulse"></i>
                    <span class="text-[10px] font-bold text-slate-200 uppercase tracking-tight">Divulgar Alerta (Enchente)</span>
                </div>
                <i class="fas fa-chevron-right text-[8px] text-emerald-400"></i>
            </li>
        `;
    }

    // Update Drivers UI
    driverData.forEach((d, i) => {
        const idx = i + 1;
        const icon = document.getElementById(`ai-driver-${idx}-icon`);
        const label = document.getElementById(`ai-driver-${idx}-label`);
        const val = document.getElementById(`ai-driver-${idx}-val`);
        
        if (icon) {
            icon.className = `fas ${d.icon} ${d.color} text-xs`;
        }
        if (label) label.innerText = d.label;
        if (val) {
            val.innerText = d.val;
            val.className = `text-[11px] font-bold ${d.color}`;
        }
    });

    const actions = document.getElementById('ai-actions-list');
    const thought = document.getElementById('ai-thought-text');

    if (actions) actions.innerHTML = actionsHtml || `
        <li class="flex gap-2"><i class="fas fa-check-circle text-primary mt-0.5"></i><span>Monitoramento de rotina ativado.</span></li>
        <li class="flex gap-2"><i class="fas fa-check-circle text-primary mt-0.5"></i><span>Protocolo de contingência standby.</span></li>
    `;
    if (thought) thought.innerText = thoughtText;
}

// --- CENTRAL DE PROMOÇÃO DA SAÚDE E ALERTAS ---
const ALERTAS_PROMO_SAUDE = {
    clima: {
        header: "📢 ALERTA CISC: ONDA DE CALOR EXTREMO",
        text: `O Centro de Informação em Saúde e Clima (CISC Belém) e a SESMA informam:

Índice de calor crítico previsto acima de 40°C nas próximas 48 horas.

Medidas de Saúde Recomendadas:
1. Beber água regularmente, mesmo sem sentir sede.
2. Evitar atividades físicas intensas sob o sol entre 10h e 16h.
3. Manter ambientes ventilados e usar roupas leves.
4. Redobrar atenção com idosos, crianças e animais de estimação.

Compartilhe com sua comunidade e ajude a prevenir casos de desidratação e insolação!`
    },
    epi: {
        header: "📢 ALERTA CISC: COMBATE À DENGUE E ARBOVIROSES",
        text: `O Centro de Informação em Saúde e Clima (CISC Belém) e a Vigilância Epidemiológica informam:

Período de calor intercalado com pancadas de chuva acelera a proliferação do mosquito Aedes aegypti.

Ações Comunitárias Críticas:
1. Eliminar recipientes com água parada em quintais (pneus, garrafas, pratos de plantas).
2. Manter caixas d'água e cisternas hermeticamente fechadas.
3. Permitir a entrada dos agentes de endemias nas residências.
4. Procurar a UBS em caso de febre alta, dores nas articulações ou dor atrás dos olhos.

A prevenção é a melhor resposta. Vamos proteger nossos bairros!`
    },
    visa: {
        header: "📢 RECOMENDAÇÃO DE SAÚDE: CONSUMO DE ÁGUA",
        text: `A Vigilância Sanitária (DEVISA) e o CISC Belém orientam sobre cuidados com a água de consumo:

Após episódios de fortes chuvas, aumentam os riscos de contaminação de poços e reservatórios alternativos.

Instruções para Tratamento Domiciliar:
1. Filtre a água de consumo e, se possível, ferva antes do uso.
2. Adicione 2 gotas de cloro/hipoclorito de sódio (2,5%) para cada 1 litro de água. Misture e aguarde 30 minutos antes de consumir.
3. Lave e higienize os alimentos que serão consumidos crus.

Evite doenças diarreicas agudas. Proteja sua saúde!`
    },
    hidro: {
        header: "📢 ALERTA CISC: RISCO DE ALAGAMENTO E LEPTOSPIROSE",
        text: `O Centro de Informação em Saúde e Clima (CISC Belém) emite alerta epidemiológico preventivo:

Com a previsão de marés altas e chuvas intensas, há risco elevado de inundações em áreas baixas da cidade.

Cuidados Fundamentais:
1. Evite o contato direto com a água de alagamento.
2. Se precisar limpar lama de enchente, use botas e luvas de borracha (ou sacos plásticos resistentes nas mãos e pés).
3. Lave utensílios e pisos atingidos usando 1 copo de água sanitária para 20 litros de água.
4. Fique atento: febre, dor de cabeça e dor forte nas panturrilhas (batatas das pernas) até 40 dias após a enchente podem ser Leptospirose. Procure a UBS imediatamente.`
    }
};

let textoAlertaAtual = "";

function abrirPromocaoSaude(type) {
    const alerta = ALERTAS_PROMO_SAUDE[type];
    if (!alerta) return;
    
    document.getElementById('promo-bubble-header').innerText = alerta.header;
    document.getElementById('promo-bubble-text').innerText = alerta.text;
    textoAlertaAtual = `${alerta.header}\n\n${alerta.text}\n\nCISC Belém · SESMA`;
    
    document.getElementById('promo-saude-modal').classList.remove('hidden');
}

function fecharPromocaoSaude() {
    document.getElementById('promo-saude-modal').classList.add('hidden');
}

function copiarTextoAlerta() {
    if (!textoAlertaAtual) return;
    navigator.clipboard.writeText(textoAlertaAtual).then(() => {
        alert("Texto copiado com sucesso! Pronto para colar no WhatsApp.");
    }).catch(err => {
        console.error("Falha ao copiar texto: ", err);
    });
}

// --- THEME TOGGLE ---
const themeToggle = document.getElementById('theme-toggle');
const icon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');

    // Update Icon
    icon.className = isLight ? 'fas fa-sun text-sm' : 'fas fa-moon text-sm';

    // Update Map Tiles
    const tileUrl = isLight
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png';

    if (window.tiles) {
        window.tiles.setUrl(tileUrl);
    }

    // Update ApexCharts
    Object.values(window.charts || {}).forEach(chart => {
        if (chart && chart.updateOptions) {
            chart.updateOptions({
                theme: { mode: isLight ? 'light' : 'dark' }
            });
        }
    });

    // Update ECharts (if any)
    const echartsElements = document.querySelectorAll('[id$="-chart"]');
    echartsElements.forEach(el => {
        const chartInstance = echarts.getInstanceByDom(el);
        if (chartInstance) {
            // ECharts requires re-init for theme switch usually
            // but we can try to update some options or just wait for next data update
        }
    });
});

// --- MAPA ---
const CISC_COORDS = [-1.4476005, -48.4685418];
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.1,
    zoomDelta: 0.1
}).setView(CISC_COORDS, 13);

window.tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

const tileProviders = {
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    rivers: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
};

function toggleLayerMenu() {
    const menu = document.getElementById('layerMenu');
    const btn = document.getElementById('layerToggleBtn');
    menu.classList.toggle('show');
    btn.classList.toggle('active');
}

function setBaseLayer(key, el) {
    if (!tileProviders[key]) return;

    // Update UI (only for base layers)
    document.querySelectorAll('.layer-menu .layer-option').forEach(opt => {
        if (opt.getAttribute('onclick').includes('setBaseLayer')) opt.classList.remove('active');
    });
    el.classList.add('active');

    // Switch Layer
    map.removeLayer(window.tiles);
    window.tiles = L.tileLayer(tileProviders[key], {
        maxZoom: 19,
        attribution: '&copy; CISC Belém'
    }).addTo(map);

    // Re-apply filters if needed
    if (key === 'dark') {
        window.tiles.getContainer().style.filter = 'saturate(1.3) brightness(1.02)';
    } else {
        window.tiles.getContainer().style.filter = 'none';
    }

    // Close menu
    toggleLayerMenu();
}

window.overlays = {};
const overlayProviders = {
    rivers: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

function toggleOverlay(key, el) {
    if (!overlayProviders[key]) return;

    if (window.overlays[key]) {
        map.removeLayer(window.overlays[key]);
        window.overlays[key] = null;
        el.classList.remove('active');
    } else {
        window.overlays[key] = L.tileLayer(overlayProviders[key], {
            maxZoom: 19,
            opacity: 1,
            zIndex: 1000, // Garantir que fique no topo
            attribution: '&copy; Waymarked Trails'
        }).addTo(map);
        el.classList.add('active');
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        // Auto switch to Standard map if in light mode?
        // setBaseLayer('standard', document.querySelector('.layer-option:nth-child(3)'));
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}
document.addEventListener('click', (e) => {
    const menu = document.getElementById('layerMenu');
    const btn = document.getElementById('layerToggleBtn');
    if (!menu.contains(e.target) && !btn.contains(e.target) && menu.classList.contains('show')) {
        toggleLayerMenu();
    }
});

// Ajuste de vibração para destacar o azul da água
tiles.on('add', (e) => {
    if (document.querySelector('.layer-option.active span').innerText.includes('NOTURNO')) {
        e.target.getContainer().style.filter = 'saturate(1.3) brightness(1.02)';
    }
});

let geoJsonLayer;
const neighborhoodStats = {};
let currentMapPhenomenon = 'default';

function getBairroStyle(feature) {
    if (currentMapPhenomenon === 'default') {
        const colors = ['#ef4444', '#10b981', '#f97316', '#3b82f6'];
        const idx = feature.properties.name.length % 4;
        return { color: colors[idx], weight: 1.5, opacity: 0.4, fillColor: colors[idx], fillOpacity: 0.1 };
    }

    const name = feature.properties.name;
    const stats = neighborhoodStats[name] || { temp: 30, rain: 0, cases: 0, compliance: 90 };

    let color = '#94a3b8'; // Default gray
    let fillOpacity = 0.6;

    // Map visualization logic based on active phenomenon
    const phenomenon = currentMapPhenomenon;
    const epiSub = ['epi', 'dda', 'arbo', 'lepto', 'mort'];
    const visaSub = ['visa', 'lacen', 'vigiar', 'vigiagua', 'dta'];

    if (phenomenon === 'uv' || phenomenon === 'ic') {
        // Heat Map: Yellow -> Red
        const val = phenomenon === 'uv' ? stats.temp : stats.ic;
        if (val >= 40) color = '#ef4444';      // Emergency
        else if (val >= 37) color = '#f97316'; // Alerta
        else if (val >= 34) color = '#eab308'; // Atenção
        else color = '#22c55e';                // Normal
    } else if (phenomenon === 'precip' || phenomenon === 'precip72') {
        // Rain Map: Light Blue -> Dark Blue
        const val = stats.rain;
        if (val >= 80) color = '#1e3a8a';      // Extreme
        else if (val >= 50) color = '#2563eb'; // High
        else if (val >= 20) color = '#60a5fa'; // Moderate
        else color = '#bfdbfe';                // Low
    } else if (epiSub.includes(phenomenon)) {
        // Epi Map: Red shades based on specific phenomenon (dda, arbo, lepto, mort)
        const val = stats[phenomenon] || stats.dda || 0;
        if (val >= 20) color = '#7f1d1d';
        else if (val >= 15) color = '#b91c1c';
        else if (val >= 8) color = '#ef4444';
        else color = '#fca5a5';
    } else if (visaSub.includes(phenomenon)) {
        // Visa Map: Green/Yellow/Red based on specific phenomenon
        if (phenomenon === 'vigiagua') {
            const val = stats.vigiagua;
            if (val < 90) color = '#ef4444';
            else if (val < 95) color = '#f59e0b';
            else color = '#10b981';
        } else if (phenomenon === 'vigiar') {
            const val = stats.vigiar;
            if (val > 60) color = '#ef4444';
            else if (val > 40) color = '#f59e0b';
            else color = '#10b981';
        } else {
            const val = stats[phenomenon] || 0;
            if (val > 15) color = '#ef4444';
            else if (val > 10) color = '#f59e0b';
            else color = '#10b981';
        }
    } else if (phenomenon === 'hidro') {
        // Flood Risk Map: Blue shades based on rain/ic
        const val = stats.rain + (stats.ic - 32) * 2;
        if (val >= 100) color = '#1e3a8a';
        else if (val >= 70) color = '#2563eb';
        else if (val >= 40) color = '#60a5fa';
        else color = '#bfdbfe';
    } else {
        // Fallback / default
        color = feature.properties.name.length % 2 === 0 ? '#3b82f6' : '#60a5fa';
        fillOpacity = 0.2;
    }

    return {
        color: color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: fillOpacity
    };
}

async function loadBairros() {
    try {
        const response = await fetch('belem_pa_bairros.geojson');
        const data = await response.json();

        // Initialize stats for each neighborhood
        data.features.forEach(f => {
            const name = f.properties.name;
            neighborhoodStats[name] = {
                temp: 30 + Math.random() * 5,
                ic: 32 + Math.random() * 10,
                rain: Math.random() * 80,
                // Epi specific
                dda: Math.floor(Math.random() * 25),
                arbo: Math.floor(Math.random() * 15),
                lepto: Math.floor(Math.random() * 8),
                mort: Math.floor(Math.random() * 3),
                // Visa specific
                lacen: Math.floor(Math.random() * 30),
                vigiar: 20 + Math.random() * 60,
                vigiagua: 85 + Math.random() * 15,
                dta: Math.floor(Math.random() * 5)
            };
        });

        geoJsonLayer = L.geoJSON(data, {
            style: getBairroStyle,
            onEachFeature: (f, l) => {
                l.bindTooltip(f.properties.name, { sticky: true, className: 'text-[11px] bg-slate-800 border border-slate-200 text-white font-bold px-2 py-1 rounded shadow-sm' });

                l.on('click', (e) => {
                    // Reset styles and highlight selected
                    geoJsonLayer.setStyle({ fillOpacity: 0.05, opacity: 0.1 });
                    l.setStyle({ fillOpacity: 0.5, opacity: 1, weight: 2.5 });

                    const name = f.properties.name;
                    const stats = { temp: 30, ic: 32, rain: 0, cases: 0, compliance: 90, ...(neighborhoodStats[name] || {}) };

                    const popupContent = `
                            <div class="popup-container">
                                <div class="popup-header">
                                    <div class="text-[10px] text-blue-400 font-black uppercase tracking-tighter mb-0.5">Visão Situacional do Bairro</div>
                                    <div class="text-[15px] font-black text-white uppercase tracking-tight">${name}</div>
                                </div>
                                <div class="popup-body">
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-map-marker-alt text-slate-500"></i> Distrito:</div>
                                        <div class="popup-value text-slate-200">DABEL</div>
                                    </div>
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-users text-slate-500"></i> População:</div>
                                        <div class="popup-value text-slate-200">~${(Math.random() * 20000 + 5000).toFixed(0)} hab.</div>
                                    </div>
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-heart-pulse text-red-500"></i> Epidemiologia:</div>
                                        <div class="popup-value text-red-400">${stats.cases} casos</div>
                                    </div>
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-microscope text-emerald-500"></i> Sanitária:</div>
                                        <div class="popup-value text-emerald-400">${stats.compliance.toFixed(1)}% Conf.</div>
                                    </div>
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-cloud-sun-rain text-orange-500"></i> Meteo.:</div>
                                        <div class="popup-value text-orange-400">${stats.temp.toFixed(1)}°C (IC: ${stats.ic.toFixed(1)}°)</div>
                                    </div>
                                    <div class="popup-data-row">
                                        <div class="popup-label"><i class="fas fa-droplet text-blue-400"></i> Precipitação:</div>
                                        <div class="popup-value text-blue-300">${stats.rain.toFixed(1)}mm</div>
                                    </div>
                                    <button class="popup-btn" onclick="alert('Gerando relatório detalhado de ${name}...')">
                                        ABRIR RELATÓRIO COMPLETO
                                    </button>
                                </div>
                            </div>
                        `;
                    L.popup({ outline: 'none' })
                        .setLatLng(e.latlng)
                        .setContent(popupContent)
                        .on('remove', () => {
                            geoJsonLayer.resetStyle();
                        })
                        .openOn(map);
                });
            }
        }).addTo(map);

        // Adiciona o marcador fixo do CISC
        const ciscIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="map-pulse" style="background: var(--panel-bg); width: 14px; height: 14px; box-shadow: 0 0 15px rgba(255,255,255,0.8); border: 2px solid #0f172a;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        L.marker(CISC_COORDS, { icon: ciscIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindTooltip('<div class="text-[11px] font-bold">HUB CENTRAL CISC</div>', { permanent: true, direction: 'bottom', className: 'bg-slate-800 text-white border-none shadow-lg' });

        map.fitBounds(geoJsonLayer.getBounds(), { padding: [40, 40], maxZoom: 13 });
        setTimeout(() => {
            window.isInitialized = true;
            map.invalidateSize(); // Force refresh for grid layout
            filterMapLayers('epi');
        }, 1000);
    } catch (e) {
        console.warn('GeoJSON not found, using fallback initialization', e);
        // Create a dummy geoJsonLayer if file is missing to prevent errors
        geoJsonLayer = L.layerGroup().addTo(map);
        // Use a default view if bounds fail
        map.setView(CISC_COORDS, 13);
        setTimeout(() => filterMapLayers('epi'), 1000);
    }
}
loadBairros();

let activeMarkers = L.layerGroup();

function simulateNetworkMapping(type) {
    if (!map || !geoJsonLayer) return;
    activeMarkers.clearLayers();
    activeMarkers.addTo(map);

    const counts = { ubs: 86, upa: 5, hosp: 3, caps: 12 };
    let count = counts[type] || 20;

    function getUnitDynamicStatus() {
        const rnd = Math.random();
        if (rnd < 0.85) return { label: 'Operacional', color: '#10b981', pulse: 'pulse-green', update: Math.floor(Math.random() * 47) + 'h' };
        if (rnd < 0.90) return { label: 'Atenção (Delay)', color: '#f59e0b', pulse: 'pulse-yellow', update: (48 + Math.floor(Math.random() * 23)) + 'h' };
        return { label: 'Inativo (Falha)', color: '#ef4444', pulse: 'pulse-red', update: (72 + Math.floor(Math.random() * 24)) + 'h' };
    }

    // Unidades Reais (Mosqueiro, Outeiro, etc.)
    const realUnits = [
        { name: "UBS/ESF Maracajá", coords: [-1.155, -48.468], type: 'ubs' },
        { name: "UBS Carananduba", coords: [-1.135, -48.455], type: 'ubs' },
        { name: "UBS Baía do Sol", coords: [-1.090, -48.375], type: 'ubs' },
        { name: "UBS Aeroporto", coords: [-1.144410, -48.440260], type: 'ubs' },
        { name: "UBS Furo das Marinhas", coords: [-1.175, -48.385], type: 'ubs' },
        { name: "UBS Outeiro", coords: [-1.259711, -48.456440], type: 'ubs' },
        { name: "Hospital Geral de Mosqueiro", coords: [-1.154, -48.466], type: 'hosp' }
    ];

    // Adiciona unidades reais se o tipo coincidir
    realUnits.filter(u => u.type === type).forEach(u => {
        const status = getUnitDynamicStatus();
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="${status.pulse}" style="background: ${status.color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${status.color};"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });
        L.marker(u.coords, { icon: icon })
            .addTo(activeMarkers)
            .bindTooltip(`<div class="text-[13px]"><b>${u.name}</b><br><span style="color: ${status.color}; font-weight: bold;">● ${status.label}</span><br><span class="text-dim">Última Transmissão: ${status.update}</span></div>`, { direction: 'top' });

        // Linha para o CISC (Fluxo de Dados)
        L.polyline([u.coords, CISC_COORDS], {
            color: status.color,
            weight: 1.5,
            opacity: 0.35,
            className: 'dash-flow',
            interactive: false
        }).addTo(activeMarkers);

        count--;
    });

    const layers = [];
    geoJsonLayer.eachLayer(l => layers.push(l));
    if (layers.length === 0) return;

    // Embaralha para garantir cobertura randômica inicial
    const shuffledLayers = [...layers].sort(() => Math.random() - 0.5);
    const tacticalCenter = L.latLng(CISC_COORDS);

    for (let i = 0; i < count; i++) {
        let selectedLayer;

        // Estratégia de Cobertura Total:
        // Se i < total de bairros, garante 1 ponto por bairro/ilha
        if (i < layers.length && count >= 20) {
            selectedLayer = shuffledLayers[i];
        } else {
            // Sensores excedentes ou listas pequenas (UPA/Hosp) seguem o peso de densidade central
            for (let attempt = 0; attempt < 5; attempt++) {
                const candidate = layers[Math.floor(Math.random() * layers.length)];
                const dist = candidate.getBounds().getCenter().distanceTo(tacticalCenter);
                // Limite de 50km para não excluir Mosqueiro/Cotijuba do sorteio de densidade
                if (Math.random() > (dist / 50000)) {
                    selectedLayer = candidate;
                    break;
                }
                if (attempt === 4) selectedLayer = candidate;
            }
        }

        const bounds = selectedLayer.getBounds();
        const center = bounds.getCenter();

        // Jitter reduzido para 10% para garantir que os pontos fiquem em terra firme (perto do centro do bairro)
        const lat = center.lat + (Math.random() - 0.5) * (bounds.getNorth() - bounds.getSouth()) * 0.1;
        const lng = center.lng + (Math.random() - 0.5) * (bounds.getEast() - bounds.getWest()) * 0.1;

        const status = getUnitDynamicStatus();
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="${status.pulse}" style="background: ${status.color}; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${status.color};"></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        });

        L.marker([lat, lng], { icon: icon })
            .addTo(activeMarkers)
            .bindTooltip(`<div class="text-[14px]"><b>${type.toUpperCase()} #${i + 1}</b><br><span style="color: ${status.color}; font-weight: bold;">● ${status.label}</span><br><span class="text-dim">Última Transmissão: ${status.update}</span></div>`, { direction: 'top' });

        // Linha para o CISC (Fluxo de Dados)
        L.polyline([[lat, lng], CISC_COORDS], {
            color: status.color,
            weight: 1,
            opacity: 0.25,
            className: 'dash-flow',
            interactive: false
        }).addTo(activeMarkers);
    }

    if (geoJsonLayer) {
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [30, 30], animate: true });
    } else {
        const group = new L.featureGroup(activeMarkers.getLayers());
        if (activeMarkers.getLayers().length > 0) map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
}

function applyMapDynamicStyle(phenomenon) {
    currentMapPhenomenon = phenomenon;
    if (geoJsonLayer && geoJsonLayer.setStyle) {
        geoJsonLayer.setStyle(getBairroStyle);
    }
}

function filterMapLayers(type, subPhenomenon = null) {
    if (!map) return;
    activeMarkers.clearLayers();
    activeMarkers.addTo(map);

    // Update Global Selection State
    currentPanel = type;
    updateAIInsights(type, subPhenomenon);

    // Se for clima, epi ou visa, podemos ativar o estilo dinâmico na malha
    applyMapDynamicStyle(subPhenomenon || type);

    // Atualiza KPI Cards (Inteligência Bar)
    document.querySelectorAll('.kpi-stats-card').forEach(c => c.classList.remove('active'));
    const btn = document.getElementById(`btn-${type}`);
    if (btn) btn.classList.add('active');

    // Atualiza HUD Tags (Sobre o Mapa)
    document.querySelectorAll('.hud-tag').forEach(t => t.classList.remove('active'));
    const hud = document.getElementById(`hud-${type}`);
    if (hud) hud.classList.add('active');

    let data = [];
    let color = "#3b82f6";

    if (type === 'epi') {
        color = "#ef4444";
        data = [
            { name: 'HPSM Mário Pinotti', coords: [-1.445, -48.482], status: 'Operacional', update: '12s' },
            { name: 'HPSM Humberto Maradei', coords: [-1.458, -48.471], status: 'Operacional', update: '05s' },
            { name: 'UPA Sacramenta', coords: [-1.418, -48.484], status: 'Operacional', update: '1min' },
            { name: 'UPA Icoaraci', coords: [-1.298, -48.478], status: 'Operacional', update: '45s' },
            { name: 'UPA Terra Firme', coords: [-1.452, -48.453], status: 'Operacional', update: '30s' }
        ];
    } else if (type === 'visa') {
        color = "#10b981";
        data = [
            { name: 'Reservatório COSANPA', coords: [-1.432, -48.462], status: 'Em Coleta', update: '2h' },
            { name: 'Cluster Açaí (Batista Campos)', coords: [-1.461, -48.488], status: 'Inspeção Ativa', update: '15min' },
            { name: 'Monitoramento Ar (Bosque)', coords: [-1.444, -48.458], status: 'Operacional', update: '10s' }
        ];
    } else if (type === 'clima') {
        color = "#f97316";
        data = [
            { name: 'Estação INMET (Aeroporto)', coords: [-1.385, -48.478], status: 'Online', update: '1min' },
            { name: 'Sensor Censipam (Marco)', coords: [-1.442, -48.452], status: 'Online', update: '30s' }
        ];
    } else if (type === 'hidro') {
        color = "#3b82f6";
        data = [
            { name: 'Sensor GPRS (Preamar)', coords: [-1.464, -48.502], status: 'Online', update: '05s' },
            { name: 'Régua Hidrométrica (Guamá)', coords: [-1.465, -48.475], status: 'Operacional', update: '12s' }
        ];
    }

    data.forEach(p => {
        let iconClass = 'fa-broadcast-tower';
        if (type === 'epi') iconClass = 'fa-heart-pulse';
        else if (type === 'visa') iconClass = 'fa-microscope';
        else if (type === 'clima') iconClass = 'fa-cloud-sun-rain';

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="map-icon-pulse" style="color: ${color};"><i class="fas ${iconClass}"></i></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        L.marker(p.coords, { icon: icon })
            .addTo(activeMarkers)
            .bindTooltip(`
                <div class="text-[13px] leading-tight">
                    <span class="font-bold">${p.name}</span><br>
                    <span class="text-green-400 font-bold">● ${p.status}</span><br>
                    <span class="text-dim">Atualizado há: ${p.update}</span>
                </div>
            `, { permanent: false, direction: 'top' });

        // Linha para o CISC (Fluxo de Dados)
        L.polyline([p.coords, CISC_COORDS], {
            color: color,
            weight: 1.5,
            opacity: 0.4,
            className: 'dash-flow',
            interactive: false
        }).addTo(activeMarkers);
    });

    // Trigger Emergency Animation if active status is Alerta or Emergência
    let shouldTrigger = false;
    if (!subPhenomenon) {
        const statusEl = document.getElementById(`status-${type}`);
        if (statusEl && (statusEl.innerText.includes('EMERGÊNCIA') || statusEl.innerText.includes('ALERTA'))) {
            shouldTrigger = true;
        }
    } else {
        const subBadge = document.querySelector(`#val-${subPhenomenon} span.bg-red-600, #val-${subPhenomenon} span.bg-orange-500`);
        if (subBadge) shouldTrigger = true;
    }

    if (shouldTrigger && window.isInitialized) {
        triggerEmergencyAnimation(type, subPhenomenon);
    } else {
        clearEmergencyLayers();
    }
}

function clearEmergencyLayers() {
    if (window.emergencyLayers) {
        window.emergencyLayers.forEach(l => map.removeLayer(l));
        window.emergencyLayers = [];
    }
    if (map) map.closePopup();
}

window.emergencyLayers = [];
function triggerEmergencyAnimation(type, subPhenomenon) {
    if (!map) return;

    clearEmergencyLayers();

    // Tactical Scanner Effect
    const scanner = L.circle(CISC_COORDS, {
        radius: 100,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        weight: 1,
        interactive: false
    }).addTo(map);
    window.emergencyLayers.push(scanner);

    let r = 100;
    const scanInt = setInterval(() => {
        r += 800; // Dobro da velocidade
        scanner.setRadius(r);
        scanner.setStyle({ opacity: 1 - (r / 12000), fillOpacity: 0.15 - (r / 80000) });
        if (r > 12000) {
            clearInterval(scanInt);
            map.removeLayer(scanner);
        }
    }, 10);

    // Target Localities for Belem
    let targets = [];
    if (type === 'epi') {
        targets = [
            { coords: [-1.442, -48.452], name: 'MARCO' },
            { coords: [-1.418, -48.484], name: 'SACRAMENTA' },
            { coords: [-1.465, -48.475], name: 'GUAMÁ' }
        ];
    } else if (type === 'epi' && subPhenomenon === 'lepto') {
        targets = [
            { coords: [-1.465, -48.475], name: 'GUAMÁ (CANAL)' },
            { coords: [-1.482, -48.498], name: 'JURUNAS (ORLA)' },
            { coords: [-1.448, -48.455], name: 'TERRA FIRME' }
        ];
    } else if (type === 'visa') {
        targets = [
            { coords: [-1.461, -48.488], name: 'BATISTA CAMPOS' },
            { coords: [-1.305, -48.475], name: 'ICOARACI' }
        ];
    } else {
        targets = [{ coords: [-1.447, -48.468], name: 'ÁREA SOB VIGILÂNCIA' }];
    }

    targets.forEach((t, i) => {
        setTimeout(() => {
            // Geographical Radius Zone (Scales with Zoom)
            const area = L.circle(t.coords, {
                radius: 500, // 500 metros geográficos
                fillColor: '#ef4444',
                fillOpacity: 0.7,
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
                interactive: false,
                className: 'emergency-radius-geo'
            }).addTo(map);
            window.emergencyLayers.push(area);

            // Warning Marker Icon
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="map-emergency-marker animate-pulse"><i class="fas fa-triangle-exclamation"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            const marker = L.marker(t.coords, { icon: icon, zIndexOffset: 2000 }).addTo(map);
            window.emergencyLayers.push(marker);

            // Tactical Tooltip
            marker.bindTooltip(`ÁREA CRÍTICA: ${t.name}`, {
                permanent: true,
                direction: 'top',
                className: 'emergency-tooltip',
                offset: [0, -10]
            }).openTooltip();

            // Click to show details
            marker.on('click', () => showEmergencyDetails(type, t.name, subPhenomenon));

        }, 50 + (i * 150));
    });
}

function showEmergencyDetails(type, neighborhood, subPhenomenon) {
    const intelligence = {
        epi: {
            reason: "Surtos de DDA (Doenças Diarreicas) detectados.",
            correlation: "Cruzamento com baixa conformidade do VIGIAGUA (82%) e precipitação intensa (>50mm) nas últimas 48h.",
            metric: "+102% Notificações",
            action: "BLOQUEIO / COLETA"
        },
        lepto: {
            reason: "Risco Elevado de Leptospirose Pós-Inundação.",
            correlation: "Cruzamento com áreas de cota crítica (Guamá > 3.5m) e histórico de transbordamento de canais.",
            metric: "14 Casos (+40%)",
            action: "DESRATIZAÇÃO / MANEJO"
        },
        visa: {
            reason: "Contaminação de Alimentos (Açaí) identificada.",
            correlation: "Identificada falha térmica no protocolo de branqueamento em batedores do distrito.",
            metric: "Cluster Localizado",
            action: "INTERDIÇÃO"
        }
    };

    const info = intelligence[subPhenomenon] || intelligence[type] || intelligence.epi;

    const content = `
        <div class="emergency-report">
            <div class="report-header">
                <i class="fas fa-file-shield"></i>
                Informe Tático de Inteligência
            </div>
            <div class="report-body">
                <span class="report-label">Determinante do Surto</span>
                <div class="report-reason">${info.reason}</div>
                
                <span class="report-label">Correlação Multi-fatorial</span>
                <div class="report-text">${info.correlation}</div>

                <div class="report-footer">
                        <div>
                            <span class="report-label">Indicador</span>
                            <div class="report-stat-val">${info.metric}</div>
                        </div>
                        <div class="text-right">
                            <span class="report-label">Ação CISC</span>
                            <div class="report-action-val">${info.action}</div>
                        </div>
                </div>
            </div>
        </div>
    `;

    L.popup({
        maxWidth: 240,
        className: 'tactical-popup',
        offset: [0, -20]
    })
        .setLatLng(map.getCenter()) // Just a placeholder, will be opened by click
        .setContent(content)
        .openOn(map);
}

// --- SISTEMA DE DADOS REATIVOS ---
const charts = { epi: null, visa: null, clima: null, hidro: null };

// Cache de Dados para Manter Consistência (Single Source of Truth)
const mockDataCache = {
    epi: { dda: [], arbo: [], lepto: [], mort: [] },
    visa: { vigiagua: [], vigiar: [], lacen: [], dta: [] },
    clima: { uv: [], ic: [], precip: [], precip72: [] },
    hidro: { rio: [], mare: [] }
};

function generateHistoricalData(base, vari, isFloat = false) {
    return Array.from({ length: 30 }, () => {
        const val = base + Math.random() * vari;
        return isFloat ? parseFloat(val.toFixed(2)) : Math.floor(val);
    });
}

// Inicialização dos dados (valores base realistas para Belém)
mockDataCache.epi.dda = Array.from({ length: 30 }, () => 200 + Math.floor(Math.random() * 100)); // History: 200-300
mockDataCache.epi.dda[29] = 465; // Current day: Emergency
mockDataCache.epi.arbo = generateHistoricalData(30, 50);
mockDataCache.epi.lepto = [7, 8, 6, 9, 10, 11, 8, 7, 9, 10, 8, 7, 6, 9, 11, 10, 8, 7, 9, 10, 11, 8, 9, 10, 7, 8, 9, 11, 10, 14];

// Mortalidade por Calor - Estruturada para Decomposição por Faixa Etária
mockDataCache.epi.mort_idosos = generateHistoricalData(0, 3);
mockDataCache.epi.mort_outros = generateHistoricalData(0, 2);
mockDataCache.epi.mort = mockDataCache.epi.mort_idosos.map((v, i) => v + mockDataCache.epi.mort_outros[i]);

mockDataCache.visa.vigiagua = generateHistoricalData(95, 5); // Range [95, 100] -> Normal
mockDataCache.visa.vigiar = generateHistoricalData(10, 30);  // Range [10, 40] -> Normal
mockDataCache.visa.lacen = generateHistoricalData(5, 9);    // Range [5, 14] -> Normal
mockDataCache.visa.dta = generateHistoricalData(0, 0.9);   // Always 0 -> Normal

// Clima ajustado para cenário de alerta (Calor em subida e Chuva acumulada alta)
mockDataCache.clima.uv = [32, 33, 31, 34, 35, 36, 35, 34, 35, 36, 37, 38, 37, 38, 39, 38, 37, 38, 39, 38, 39, 38, 37, 38, 39, 38, 37, 38, 39, 38]; // Tmax (Range [37-39] at end -> N3)
mockDataCache.clima.ic = [38, 39, 40, 41, 40, 42, 43, 44, 45, 46, 45, 44, 43, 42, 43, 44, 45, 46, 47, 46, 45, 44, 43, 44, 45, 46, 47, 46, 45, 44]; // IC (Range [42-47] -> N3)
mockDataCache.clima.precip = [0, 5, 2, 0, 15, 30, 10, 5, 0, 0, 12, 45, 10, 8, 32, 42, 0, 5, 2, 0, 15, 30, 10, 5, 12, 45, 10, 8, 32, 42]; // Chuva 24h
mockDataCache.clima.precip72 = [5, 10, 15, 25, 40, 55, 60, 50, 40, 30, 50, 80, 110, 140, 150, 138, 10, 20, 30, 45, 70, 90, 110, 100, 80, 110, 140, 150, 160, 138]; // Chuva 72h

mockDataCache.hidro.rio = generateHistoricalData(2.0, 0.9, true); // Range [2.0, 2.9] -> N1
mockDataCache.hidro.mare = generateHistoricalData(1.5, 1.4, true); // Range [1.5, 2.9] -> N1

function getFromCache(panel, type, days) {
    const fullData = mockDataCache[panel][type];
    const observed = fullData.slice(-days);
    const lastPoint = observed[observed.length - 1];

    // Generate Forecast & Risk Envelope (P25, P75)
    const forecast = [lastPoint];
    const p25 = [lastPoint];
    const p75 = [lastPoint];

    const trend = (observed[observed.length - 1] - observed[observed.length - 7]) / 7;
    for (let i = 1; i <= 5; i++) {
        const noise = (Math.random() - 0.4) * (lastPoint * 0.1);
        let projectedVal = parseFloat((lastPoint + (trend * i) + noise).toFixed(1));
        
        // Capping hidro forecast to N1 (Normal < 3.0m)
        if (panel === 'hidro') {
            projectedVal = Math.min(projectedVal, 2.9);
        }

        forecast.push(projectedVal);
        // Envelope expands with uncertainty
        p25.push(parseFloat((projectedVal - (i * projectedVal * 0.05)).toFixed(1)));
        p75.push(parseFloat((projectedVal + (i * projectedVal * 0.08)).toFixed(1)));
    }

    const first = observed[0];
    const last = observed[observed.length - 1];

    // Lógica especial para tendência de chuva
    let trendLabel;
    if (panel === 'clima' && (type === 'precip' || type === 'precip72')) {
        const total = observed.reduce((a, b) => a + b, 0);
        trendLabel = `Total: ${total}mm`;
    } else {
        trendLabel = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
    }

    return { observed, forecast, p25, p75, last, trend: trendLabel };
}

// Helper to generate dates for x-axis (Historical + Forecast)
function getDates(days, forecastDays = 0) {
    const dates = [];
    const today = new Date();

    // Historical
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        dates.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }

    // Forecast
    for (let i = 1; i <= forecastDays; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' (P)');
    }
    return dates;
}

function getHistoricalDates(days) { return getDates(days, 0); }

// Helper to update badge text and trend safely
const updatePanelStatus = (panel, level) => {
    const el = document.getElementById('status-' + panel);
    if (!el) return;

    const levels = [
        { text: 'NORMAL', color: 'bg-green-600', border: 'border-green-700', textCol: 'text-white', statusClass: 'status-normal' },
        { text: 'ATENÇÃO', color: 'bg-yellow-500', border: 'border-yellow-600', textCol: 'text-slate-900', statusClass: 'status-attention' },
        { text: 'ALERTA', color: 'bg-orange-500', border: 'border-orange-600', textCol: 'text-white', statusClass: 'status-alert' },
        { text: 'EMERGÊNCIA', color: 'bg-red-600', border: 'border-red-700', textCol: 'text-white', statusClass: 'status-emergency' },
        { text: 'EMERGÊNCIA', color: 'bg-red-600', border: 'border-red-700', textCol: 'text-white', statusClass: 'status-emergency' }
    ];

    const config = levels[level] || levels[0];

    let flashClass = '';
    if (level >= 3) flashClass = 'flash-red';
    else if (level === 2) flashClass = 'radius-orange';

    el.innerText = config.text;
    el.className = `text-[15px] ${config.color} ${config.textCol} px-2 py-0.5 rounded font-bold border ${config.border} shadow-sm ${flashClass}`;

    // --- SYNC TOP STATUS ROW ---
    const cardEl = document.getElementById('btn-' + panel);
    const topBadge = document.getElementById('top-badge-' + panel);
    const topLevel = document.getElementById('top-level-' + panel);

    if (cardEl) {
        // Remove all possible status classes and apply the current one
        cardEl.classList.remove('status-normal', 'status-attention', 'status-alert', 'status-emergency', 'status-blue');
        
        // Special case for Hidro: if user wants Blue as "Normal" theme, but latest was "green"
        // Let's use status-normal for now as requested "pressão hidro verde"
        cardEl.classList.add(config.statusClass);
    }

    if (topBadge) {
        topBadge.innerText = config.text.charAt(0) + config.text.slice(1).toLowerCase(); // capitalize first letter
        if (config.text === 'EMERGÊNCIA') topBadge.innerText = 'Emergência';
    }

    if (topLevel) {
        const bars = topLevel.querySelectorAll('.level-bar');
        const levelText = topLevel.querySelector('.level-text');
        const safeLevel = Math.max(1, Math.min(4, level)); 
        bars.forEach((bar, idx) => {
            if (idx < safeLevel) bar.classList.add('active');
            else bar.classList.remove('active');
        });
        if (levelText) levelText.innerText = `${safeLevel}/4`;
    }

    // --- SYNC PROTOCOL CARD ---
    const protocolCard = document.getElementById('protocol-card-' + panel);
    const protocolTitle = document.getElementById('protocol-title-' + panel);
    if (protocolCard && protocolTitle) {
        const safeLevelUI = Math.max(1, Math.min(4, level + 1));
        protocolCard.className = `protocol-card level-${safeLevelUI}`;
        
        let protocolName = config.text === 'NORMAL' ? 'NORMALIDADE' : config.text;
        const icon = level >= 3 ? 'fa-exclamation-triangle animate-pulse' : (level === 2 ? 'fa-bullhorn' : (level === 1 ? 'fa-info-circle' : 'fa-check-circle'));
        protocolTitle.innerHTML = `<i class="fas ${icon}"></i> PROTOCOLO DE ${protocolName} (NÍVEL ${safeLevelUI})`;
        
        if (panel === 'hidro') {
            const dcVal = protocolCard.querySelector('.protocol-info-row:nth-child(1) .value');
            const bolVal = protocolCard.querySelector('.protocol-info-row:nth-child(2) .value');
            const riscVal = document.getElementById('val-risco-hidro');
            const trndVal = document.getElementById('trend-risco-hidro');
            
            if (level === 0) {
                if (dcVal) dcVal.innerText = 'ROTINA';
                if (bolVal) bolVal.innerText = 'ROTINA';
                if (riscVal) riscVal.innerText = 'BAIXO';
                if (trndVal) { trndVal.innerText = 'ESTÁVEL'; trndVal.className = 'text-[10px] font-black text-green-500'; }
            } else if (level === 1) {
                if (dcVal) dcVal.innerText = 'PRONTIDÃO';
                if (bolVal) bolVal.innerText = 'EXTRAORDINÁRIO';
                if (riscVal) riscVal.innerText = 'MÉDIO-BAIXO';
                if (trndVal) { trndVal.innerText = 'ESTÁVEL'; trndVal.className = 'text-[10px] font-black text-yellow-500'; }
            } else if (level === 2) {
                if (dcVal) dcVal.innerText = 'EM CURSO';
                if (bolVal) bolVal.innerText = 'PUBLICADO';
                if (riscVal) riscVal.innerText = 'MÉDIO';
                if (trndVal) { trndVal.innerText = 'SUBINDO'; trndVal.className = 'text-[10px] font-black text-orange-500'; }
            } else {
                if (dcVal) dcVal.innerText = 'EMERGÊNCIA';
                if (bolVal) bolVal.innerText = 'CRÍTICO';
                if (riscVal) riscVal.innerText = 'ALTO';
                if (trndVal) { trndVal.innerText = 'CRÍTICO'; trndVal.className = 'text-[10px] font-black text-red-500'; }
            }
        }
    }
};

const updateBadge = (id, val, suffix = '', trendPct = null) => {
    const el = document.getElementById(id);
    if (!el) return 0; // Return level
    const badge = el.querySelector('span:first-of-type');

    let level = 0;
    if (badge) {
        badge.innerText = val + suffix;

        if (trendPct !== null) {
            let bgColor = 'bg-green-600';

            const v = parseFloat(val);
            if (id.includes('val-lepto')) {
                if (v >= 12) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 8) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 5) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-dda')) {
                if (v >= 450) { bgColor = 'bg-red-600'; level = 4; }
                else if (v >= 400) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 300) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 200) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-arbo')) {
                if (v >= 110) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 80) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 50) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-mort')) {
                // Gatilhos de Diretriz: Severo (>5), Múltiplas Faixas (>3), Idosos (>1)
                if (v >= 5) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 3) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 1) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-uv') || id.includes('val-ic') || id.includes('val-precip')) {
                const v = parseFloat(val);
                if (id.includes('val-uv')) { // Tmax
                    if (v >= 40) { bgColor = 'bg-red-600'; level = 3; }
                    else if (v >= 37) { bgColor = 'bg-orange-500'; level = 2; }
                    else if (v >= 34) { bgColor = 'bg-yellow-500'; level = 1; }
                } else if (id.includes('val-ic')) { // IC
                    if (v >= 48) { bgColor = 'bg-red-600'; level = 3; }
                    else if (v >= 42) { bgColor = 'bg-orange-500'; level = 2; }
                    else if (v >= 38) { bgColor = 'bg-yellow-500'; level = 1; }
                } else if (id === 'val-precip') { // Chuva 24h
                    if (v >= 80) { bgColor = 'bg-red-600'; level = 3; }
                    else if (v >= 50) { bgColor = 'bg-orange-500'; level = 2; }
                    else if (v >= 30) { bgColor = 'bg-yellow-500'; level = 1; }
                } else if (id.includes('val-precip72')) { // Chuva 72h
                    if (v >= 180) { bgColor = 'bg-red-600'; level = 3; }
                    else if (v >= 120) { bgColor = 'bg-orange-500'; level = 2; }
                    else if (v >= 80) { bgColor = 'bg-yellow-500'; level = 1; }
                }
            } else if (id.includes('val-vigiar')) { // IQAr
                if (v >= 121) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 81) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 41) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-vigiagua')) { // Qualidade da Água
                if (v < 85) { bgColor = 'bg-red-600'; level = 3; }
                else if (v < 90) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v < 95) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-lacen')) { // Monitoramento Açaí
                if (v >= 26) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 21) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 15) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id === 'val-dta') {
                const v = parseInt(val);
                if (v >= 5) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 2) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 1) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-rio')) {
                if (v >= 3.8) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 3.5) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 3.0) { bgColor = 'bg-yellow-500'; level = 1; }
            } else if (id.includes('val-mare')) {
                if (v >= 3.8) { bgColor = 'bg-red-600'; level = 3; }
                else if (v >= 3.5) { bgColor = 'bg-orange-500'; level = 2; }
                else if (v >= 3.0) { bgColor = 'bg-yellow-500'; level = 1; }
            }

            const textCol = bgColor === 'bg-yellow-500' ? 'text-slate-900' : 'text-white';

            badge.className = `px-1.5 py-0.5 rounded text-[12px] font-bold ${bgColor} ${textCol}`;
        }
    }

    const trendSpan = el.querySelector('.kpi-trend');
    if (trendSpan && trendPct !== null) {
        if (typeof trendPct === 'string') {
            trendSpan.innerText = trendPct;
            trendSpan.className = 'kpi-trend text-[11px] text-slate-400 font-medium';
        } else {
            const absVal = Math.abs(trendPct);
            const arrow = trendPct > 0 ? '↑' : (trendPct < 0 ? '↓' : '-');

            const isPositiveMetric = id.includes('vigiagua') || id.includes('lacen');

            let colorClass = 'text-slate-500';
            if (trendPct !== 0) {
                const isImproving = isPositiveMetric ? trendPct > 0 : trendPct < 0;
                colorClass = isImproving ? 'text-green-400' : 'text-red-400';
            }

            trendSpan.innerHTML = `<span class="mr-0.5">${arrow}</span>${absVal}%`;
            trendSpan.className = `kpi-trend text-[11px] font-bold ${colorClass}`;
        }
    }

    return level;
};

function updateDataRange(days, btn, panel) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const dates = getHistoricalDates(days);
    let activeCard;

    if (panel === 'epi') {
        const dda = getFromCache('epi', 'dda', days);
        const arbo = getFromCache('epi', 'arbo', days);
        const lepto = getFromCache('epi', 'lepto', days);
        const mort = getFromCache('epi', 'mort', days);

        const l1 = updateBadge('val-dda', dda.last, '', dda.trend);
        const l2 = updateBadge('val-arbo', arbo.last, '', arbo.trend);
        const l3 = updateBadge('val-lepto', lepto.last, '', lepto.trend);
        const l4 = updateBadge('val-mort', (mort.last < 10 ? '0' : '') + mort.last, '', mort.trend);
        updatePanelStatus('epi', Math.max(l1, l2, l3, l4));

        // Detecta o card ativo no painel EPI para manter sincronia
        activeCard = document.querySelector('#val-dda.ring-2, #val-arbo.ring-2, #val-lepto.ring-2, #val-mort.ring-2');
        let currentType = 'dda';
        let currentData = dda;
        let currentUnit = 'Casos';

        if (activeCard) {
            currentType = activeCard.id.replace('val-', '');
            if (currentType === 'dda') { currentData = dda; currentUnit = ''; }
            else if (currentType === 'arbo') { currentData = arbo; currentUnit = 'Casos'; }
            else if (currentType === 'lepto') { currentData = lepto; currentUnit = 'Casos'; }
            else if (currentType === 'mort') { currentData = mort; currentUnit = 'Óbitos'; }
            updateEpiChart(currentType, days);
        } else {
            currentUnit = '';
            updateEpiChart('dda', days); // Default inicial
        }

        // Update Top Card Value
        document.getElementById('top-val-epi').innerText = currentData.last;
        document.getElementById('top-unit-epi').innerText = currentUnit;

    } else if (panel === 'visa') {
        const vigiagua = getFromCache('visa', 'vigiagua', days);
        const vigiar = getFromCache('visa', 'vigiar', days);
        const lacen = getFromCache('visa', 'lacen', days);
        const dta = getFromCache('visa', 'dta', days);

        const l1 = updateBadge('val-vigiagua', vigiagua.last, '%', vigiagua.trend);
        const l2 = updateBadge('val-vigiar', vigiar.last, '', vigiar.trend);
        const l3 = updateBadge('val-lacen', lacen.last, '', lacen.trend);
        const l4 = updateBadge('val-dta', (dta.last < 10 ? '0' : '') + dta.last, '', dta.trend);
        updatePanelStatus('visa', Math.max(l1, l2, l3, l4));

        // Detecta o card ativo no painel VISA
        activeCard = document.querySelector('#val-lacen.ring-2, #val-vigiar.ring-2, #val-vigiagua.ring-2, #val-dta.ring-2');
        let currentType = 'vigiagua';
        let currentData = vigiagua;
        let currentUnit = '%';

        if (activeCard) {
            currentType = activeCard.id.replace('val-', '');
            if (currentType === 'vigiar') { currentData = vigiar; currentUnit = 'IQAr'; }
            else if (currentType === 'lacen') { currentData = lacen; currentUnit = 'Açaí'; }
            else if (currentType === 'dta') { currentData = dta; currentUnit = 'Surtos'; }
            updateVisaChart(currentType, days);
        } else {
            updateVisaChart('vigiagua', days); // Default
        }

        // Update Top Card Value
        document.getElementById('top-val-visa').innerText = currentData.last;
        document.getElementById('top-unit-visa').innerText = currentUnit;

    } else if (panel === 'clima') {
        const uv = getFromCache('clima', 'uv', days);
        const ic = getFromCache('clima', 'ic', days);
        const precip = getFromCache('clima', 'precip', days);
        const precip72 = getFromCache('clima', 'precip72', days);

        const l1 = updateBadge('val-uv', uv.last, '°', uv.trend + '%');
        const l2 = updateBadge('val-ic', ic.last, '°', ic.trend + '%');
        const l3 = updateBadge('val-precip', precip.last, 'mm', precip.trend);
        const l4 = updateBadge('val-precip72', precip72.last, 'mm', precip72.trend);
        updatePanelStatus('clima', Math.max(l1, l2, l3, l4));

        // Detecta qual card está ativo para manter a visualização correta
        activeCard = document.querySelector('#val-uv.ring-2, #val-ic.ring-2, #val-precip.ring-2, #val-precip72.ring-2');
        let currentType = 'uv';
        let currentData = uv;
        let currentUnit = '°C';

        if (activeCard) {
            currentType = activeCard.id.replace('val-', '');
            if (currentType === 'ic') { currentData = ic; currentUnit = '°C'; }
            else if (currentType === 'precip') { currentData = precip; currentUnit = 'mm'; }
            else if (currentType === 'precip72') { currentData = precip72; currentUnit = '72h'; }
            updateClimaChart(currentType, days);
        } else {
            updateClimaChart('uv', days);
        }

        // Update Top Card Value
        document.getElementById('top-val-clima').innerText = currentData.last;
        document.getElementById('top-unit-clima').innerText = currentUnit;

    } else if (panel === 'hidro') {
        const rio = getFromCache('hidro', 'rio', days);
        const mare = getFromCache('hidro', 'mare', days);

        const l1 = updateBadge('val-rio', rio.last.toFixed(2), '', rio.trend);
        const l2 = updateBadge('val-mare', mare.last.toFixed(2), '', mare.trend);
        updatePanelStatus('hidro', Math.max(l1, l2));

        // Detecta o card ativo no painel HIDRO
        activeCard = document.querySelector('#val-rio.ring-2, #val-mare.ring-2');
        let currentType = 'rio';
        let currentData = rio;
        let currentUnit = 'm';

        if (activeCard) {
            currentType = activeCard.id.replace('val-', '');
            if (currentType === 'mare') { currentData = mare; currentUnit = 'm'; }
            updateHidroChart(currentType, days);
        } else {
            updateHidroChart('rio', days);
        }

        // Update Top Card Value
        document.getElementById('top-val-hidro').innerText = currentData.last.toFixed(2);
        document.getElementById('top-unit-hidro').innerText = currentUnit;
    }
}
// --- GRÁFICOS DETALHADOS ---
const commonOptions = {
    chart: {
        toolbar: {
            show: false,
            autoSelected: 'pan',
            tools: {
                download: false,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true
            }
        },
        sparkline: { enabled: false },
        background: 'transparent',
        zoom: {
            enabled: true,
            type: 'xy',
            autoScaleYaxis: true
        },
        parentHeightOffset: 0,
        fontFamily: 'JetBrains Mono, monospace'
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
    dataLabels: { enabled: false },
    grid: { 
        borderColor: 'rgba(255, 255, 255, 0.05)', 
        strokeDashArray: 4, 
        padding: { left: 30, right: 5, top: 0, bottom: 20 } 
    },
    xaxis: {
        labels: {
            show: true,
            style: { colors: '#8e9aaf', fontSize: '8px', fontFamily: 'JetBrains Mono, monospace' },
            rotate: -45,
            rotateAlways: true,
            offsetY: -5,
            hideOverlappingLabels: true
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        categories: getHistoricalDates(7) // Default to last 7 days
    },
    yaxis: {
        forceNiceScale: false,
        min: (min) => min,
        max: (max) => max,
        labels: {
            show: true,
            style: { fontSize: '8px', colors: ['#8e9aaf'], fontFamily: 'JetBrains Mono, monospace' },
            offsetX: -10,
            formatter: (val) => val.toFixed(1)
        }
    },
    tooltip: { 
        theme: 'dark', 
        x: { show: false },
        style: { fontFamily: 'JetBrains Mono, monospace' }
    },
    legend: { show: false }
};

// DEVS: SRAG vs Arboviroses vs Malária
charts.epi = new ApexCharts(document.querySelector("#arboviroses-chart"), {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: 'area', height: '100%' },
    series: [],
    colors: ['#FF4D4D'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.25, opacityTo: 0.0 } }
});
charts.epi.render();

// VISA: Área de Conformidade
charts.visa = new ApexCharts(document.querySelector("#visa-chart"), {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: 'area', height: '100%' },
    series: [],
    colors: ['#00E5C3'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.0 } }
});
charts.visa.render();

// CLIMA: Temperatura e Calor
charts.clima = new ApexCharts(document.querySelector("#heat-chart"), {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: 'area', height: '100%' },
    series: [],
    colors: ['#F59E0B'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.0 } }
});
charts.clima.render();

// HIDRO: Nível e Maré
charts.hidro = new ApexCharts(document.querySelector("#hydro-chart"), {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: 'area', height: '100%' },
    series: [],
    colors: ['#7B61FF'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.0 } }
});
charts.hidro.render();
// Update function for VISA charts
function updateVisaChart(type, days = null) {
    const activeCard = document.getElementById(`val-${type}`);
    if (!activeCard) return;
    const panel = activeCard.closest('.data-panel');

    if (!days) {
        const activeBtn = panel.querySelector('.range-btn.active');
        days = activeBtn ? parseInt(activeBtn.innerText) : 7;
    }

    filterMapLayers('visa', type);

    const chartData = {
        lacen: {
            name: 'Açaí', unit: '', color: '#10b981',
            title: 'Monitoramento de Açaí (PNMQSA/DVSA)',
            annotations: [
                { y: 15, borderColor: '#eab308', strokeDashArray: 3, desc: 'Não Conformidade', label: { show: true, text: 'Atenção (15)', style: { color: '#fff', background: '#eab308' } } },
                { y: 21, borderColor: '#f97316', strokeDashArray: 3, desc: 'Contaminação Lote', label: { show: true, text: 'Alerta (21)', style: { color: '#fff', background: '#f97316' } } },
                { y: 26, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Chagas Aguda', label: { show: true, text: 'Emergência (26)', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        vigiar: {
            name: 'IQAr', unit: '', color: '#f59e0b',
            title: 'Qualidade do Ar (VIGIAR/VISAMB)',
            annotations: [
                { y: 41, borderColor: '#eab308', strokeDashArray: 3, desc: 'Moderado', label: { show: true, text: 'Moderado (41)', style: { color: '#fff', background: '#eab308' } } },
                { y: 81, borderColor: '#f97316', strokeDashArray: 3, desc: 'Ruim', label: { show: true, text: 'Ruim (81)', style: { color: '#fff', background: '#f97316' } } },
                { y: 121, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Péssimo', label: { show: true, text: 'Péssimo (121)', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        vigiagua: {
            name: 'Conform.', unit: '%', color: '#10b981',
            title: 'Qualidade da Água (VIGIAGUA/VISAMB)',
            annotations: [
                { y: 95, borderColor: '#eab308', strokeDashArray: 3, desc: 'Ponto Isolado', label: { show: true, text: 'Atenção 95%', style: { color: '#fff', background: '#eab308' } } },
                { y: 90, borderColor: '#f97316', strokeDashArray: 3, desc: 'Setor Abast.', label: { show: true, text: 'Alerta 90%', style: { color: '#fff', background: '#f97316' } } },
                { y: 85, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Rede Pública', label: { show: true, text: 'Emergência 85%', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        dta: {
            name: 'DTA', unit: ' surtos', color: '#ef4444',
            title: 'DTA (Doença Transmitida por Alimento)',
            annotations: [
                { y: 1, borderColor: '#eab308', strokeDashArray: 0, desc: 'Aumento Pós-evento', label: { show: true, text: 'Atenção', style: { color: '#fff', background: '#eab308' } } },
                { y: 2, borderColor: '#f97316', strokeDashArray: 0, desc: 'Cluster Geo', label: { show: true, text: 'Alerta', style: { color: '#fff', background: '#f97316' } } },
                { y: 5, borderColor: '#ef4444', strokeDashArray: 0, desc: 'Surto 2+ Estab.', label: { show: true, text: 'Emergência', style: { color: '#fff', background: '#ef4444' } } }
            ]
        }
    };

    const info = chartData[type];
    if (!info || !charts.visa) return;

    const data = getFromCache('visa', type, days);
    const labels = isPredictiveMode ? getDates(days, 5) : getHistoricalDates(days);

    document.getElementById('visa-chart-title').innerText = info.title;

    const containers = ['val-lacen', 'val-vigiar', 'val-vigiagua', 'val-dta'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('ring-2', 'ring-green-500', 'bg-slate-700/50');
    });
    activeCard.classList.add('ring-2', 'ring-green-500', 'bg-slate-700/50');

    // Unified Sync: Update KPI badge and Panel/Top Status
    const level = updateBadge('val-' + type, data.last, info.unit, data.trend);
    updatePanelStatus('visa', level);

    // Update Top Indicator
    document.getElementById('top-val-visa').innerText = data.last;
    document.getElementById('top-unit-visa').innerText = info.unit === '' ? '' : (info.unit.includes('%') ? '%' : 'Casos');

    const observedLine = data.observed.concat(Array(5).fill(null));
    const forecastLine = Array(days - 1).fill(null).concat(data.forecast);

    charts.visa.updateOptions({
        chart: { type: 'area', stacked: false },
        xaxis: { 
            categories: labels,
            tickAmount: 5,
            labels: { style: { fontSize: '8px' }, offsetY: -5 }
        },
        series: [
            { name: info.name + ' (Real)', type: 'area', data: observedLine },
            ...(isPredictiveMode ? [{ name: info.name + ' (Proj AI)', type: 'line', data: forecastLine }] : [])
        ],
        stroke: { width: [3, 3], dashArray: [0, 8] },
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.3, opacityTo: 0.0 }
        },
        colors: [info.color, info.color],
        annotations: { yaxis: info.annotations || [] },
        yaxis: {
            ...commonOptions.yaxis,
            // title removed
            labels: { formatter: (v) => (v != null ? Math.round(v) : '') + info.unit }
        }
    });

    renderThresholdLegend('visa-footer', info.annotations);
    updateAIInsights('visa', type);
}

function updateHidroChart(type, days = null) {
    const activeCard = document.getElementById(`val-${type}`);
    if (!activeCard) return;
    const panel = activeCard.closest('.data-panel');

    if (!days) {
        const activeBtn = panel.querySelector('.range-btn.active');
        days = activeBtn ? parseInt(activeBtn.innerText) : 7;
    }

    filterMapLayers('hidro', type);

    const chartData = {
        rio: {
            name: 'Nível', unit: 'm', color: '#3b82f6',
            title: 'Nível do Rio (Sensor GPRS / Réguas)',
            annotations: [
                { y: 3.0, borderColor: '#eab308', strokeDashArray: 5, desc: 'Aprox. Cota Atenção', label: { show: true, text: '3.0m', style: { color: '#fff', background: '#eab308' } } },
                { y: 3.5, borderColor: '#f97316', strokeDashArray: 5, desc: 'Acima Cota Alerta', label: { show: true, text: '3.5m', style: { color: '#fff', background: '#f97316' } } },
                { y: 3.8, borderColor: '#ef4444', strokeDashArray: 5, desc: 'Inundação Iminente', label: { show: true, text: '3.8m', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        mare: {
            name: 'Maré', unit: 'm', color: '#3b82f6',
            title: 'Tábua de Marés (Preamar/Baixamar)',
            annotations: [
                { y: 3.5, borderColor: '#f97316', strokeDashArray: 2, desc: 'Preamar Crítica', label: { show: true, text: 'Preamar 3.5m', style: { color: '#fff', background: '#f97316' } } }
            ]
        }
    };

    const info = chartData[type];
    if (!info || !charts.hidro) return;

    const data = getFromCache('hidro', type, days);
    const labels = isPredictiveMode ? getDates(days, 5) : getHistoricalDates(days);

    document.getElementById('hydro-chart-title').innerText = info.title;

    const containers = ['val-rio', 'val-mare'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('ring-2', 'ring-blue-500', 'bg-slate-700/50');
    });
    activeCard.classList.add('ring-2', 'ring-blue-500', 'bg-slate-700/50');

    // Unified Sync: Update KPI badge and Panel/Top Status
    const level = updateBadge('val-' + type, data.last, info.unit, data.trend);
    updatePanelStatus('hidro', level);

    // Update Top Indicator
    document.getElementById('top-val-hidro').innerText = data.last;
    document.getElementById('top-unit-hidro').innerText = info.unit; // usually 'm'

    const observedLine = data.observed.concat(Array(5).fill(null));
    const forecastLine = Array(days - 1).fill(null).concat(data.forecast);

    charts.hidro.updateOptions({
        chart: { type: 'area', stacked: false },
        xaxis: { 
            categories: labels,
            tickAmount: 5,
            labels: { style: { fontSize: '8px' }, offsetY: -5 }
        },
        series: [
            { name: info.name + ' (Real)', type: 'area', data: observedLine },
            ...(isPredictiveMode ? [{ name: info.name + ' (Proj AI)', type: 'line', data: forecastLine }] : [])
        ],
        stroke: { width: [3, 3], dashArray: [0, 8] },
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.3, opacityTo: 0.0 }
        },
        colors: [info.color, info.color],
        annotations: { yaxis: info.annotations || [] },
        yaxis: {
            ...commonOptions.yaxis,
            min: 0,
            max: 4.0,
            labels: { formatter: (v) => (v != null ? v.toFixed(1) : '') + info.unit }
        }
    });

    renderThresholdLegend('hidro-footer', info.annotations);
    updateAIInsights('hidro', type);
}

function updateClimaChart(type, days = null) {
    const activeCard = document.getElementById(`val-${type}`);
    if (!activeCard) return;
    const panel = activeCard.closest('.data-panel');

    if (!days) {
        const activeBtn = panel.querySelector('.range-btn.active');
        days = activeBtn ? parseInt(activeBtn.innerText) : 7;
    }

    filterMapLayers('clima', type);

    const chartData = {
        uv: {
            name: 'Temp', unit: '°C', color: '#f97316', type: 'area',
            title: 'Temperatura Máxima (Tmax)',
            annotations: [
                { y: 34, borderColor: '#eab308', strokeDashArray: 3, desc: 'por 2+ dias', label: { show: true, text: '34°', style: { color: '#fff', background: '#eab308' } } },
                { y: 37, borderColor: '#f97316', strokeDashArray: 3, desc: 'por 3+ dias', label: { show: true, text: '37°', style: { color: '#fff', background: '#f97316' } } },
                { y: 40, borderColor: '#ef4444', strokeDashArray: 3, desc: 'ou 5+ dias >37°', label: { show: true, text: '40°', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        ic: {
            name: 'IC', unit: '°C', color: '#ef4444', type: 'area',
            title: 'Índice de Calor (IC)',
            annotations: [
                { y: 38, borderColor: '#eab308', strokeDashArray: 3, desc: '2 dias consec.', label: { show: true, text: '38°', style: { color: '#fff', background: '#eab308' } } },
                { y: 42, borderColor: '#f97316', strokeDashArray: 3, desc: '3 dias consec.', label: { show: true, text: '42°', style: { color: '#fff', background: '#f97316' } } },
                { y: 48, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Emergência NC4/5', label: { show: true, text: '48°', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        precip: {
            name: 'Chuva', unit: 'mm', color: '#3b82f6', type: 'bar',
            title: 'Precipitação Acumulada 24h',
            annotations: [
                { y: 30, borderColor: '#eab308', strokeDashArray: 3, desc: 'Moderada', label: { show: true, text: '30mm', style: { color: '#fff', background: '#eab308' } } },
                { y: 50, borderColor: '#f97316', strokeDashArray: 3, desc: 'Forte', label: { show: true, text: '50mm', style: { color: '#fff', background: '#f97316' } } },
                { y: 80, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Extrema', label: { show: true, text: '80mm', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        precip72: {
            name: 'Acum. 72h', unit: 'mm', color: '#3b82f6', type: 'bar',
            title: 'Precipitação Acumulada 72h (Risco Hidro)',
            annotations: [
                { y: 80, borderColor: '#eab308', strokeDashArray: 3, desc: 'Atenção', label: { show: true, text: '80mm', style: { color: '#fff', background: '#eab308' } } },
                { y: 120, borderColor: '#f97316', strokeDashArray: 3, desc: 'Risco Hidro', label: { show: true, text: '120mm', style: { color: '#fff', background: '#f97316' } } },
                { y: 180, borderColor: '#ef4444', strokeDashArray: 3, desc: 'Inundação', label: { show: true, text: '180mm', style: { color: '#fff', background: '#ef4444' } } }
            ]
        }
    };

    const info = chartData[type];
    if (!info || !charts.clima) return;

    const data = getFromCache('clima', type, days);
    const labels = isPredictiveMode ? getDates(days, 5) : getHistoricalDates(days);

    document.getElementById('clima-chart-title').innerText = info.title;

    const containers = ['val-uv', 'val-ic', 'val-precip', 'val-precip72'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('ring-2', 'ring-orange-500', 'bg-slate-700/50');
    });
    activeCard.classList.add('ring-2', 'ring-orange-500', 'bg-slate-700/50');

    // Unified Sync: Update KPI badge and Panel/Top Status
    const level = updateBadge('val-' + type, data.last, info.unit, data.trend);
    updatePanelStatus('clima', level);

    // Update Top Indicator
    document.getElementById('top-val-clima').innerText = data.last;
    document.getElementById('top-unit-clima').innerText = info.unit; // '°C' or 'mm'

    const observedLine = data.observed.concat(Array(5).fill(null));
    const forecastLine = Array(days - 1).fill(null).concat(data.forecast);

    charts.clima.updateOptions({
        chart: { type: info.type, stacked: false },
        xaxis: {
            categories: labels,
            tickAmount: 5,
            labels: { style: { fontSize: '8px' }, offsetY: -5 }
        },
        series: [
            { name: info.name + ' (Real)', type: info.type, data: observedLine },
            ...(isPredictiveMode ? [{ name: info.name + ' (Proj AI)', type: 'line', data: forecastLine }] : [])
        ],
        stroke: { width: [3, 3], dashArray: [0, 8] },
        fill: {
            type: info.type === 'bar' ? 'solid' : 'gradient',
            opacity: info.type === 'bar' ? (isPredictiveMode ? [1, 0.4] : [1]) : 0.3,
            gradient: info.type === 'area' ? { opacityFrom: 0.3, opacityTo: 0.0 } : undefined
        },
        colors: [info.color, info.color],
        annotations: { yaxis: info.annotations || [] },
        yaxis: {
            ...commonOptions.yaxis,
            labels: { formatter: (v) => (v != null ? Math.round(v) : '') + info.unit }
        }
    });

    renderThresholdLegend('clima-footer', info.annotations);
    updateAIInsights('clima', type);
}

function updateEpiChart(type, days = null) {
    const activeCard = document.getElementById(`val-${type}`);
    if (!activeCard) return;
    const panel = activeCard.closest('.data-panel');
    if (!days) {
        const activeBtn = panel.querySelector('.range-btn.active');
        days = activeBtn ? parseInt(activeBtn.innerText) : 7;
    }

    const chartConfigs = {
        dda: {
            name: 'DDA', unit: '', color: '#ef4444',
            title: 'DDA / SRAG (Sintomas)',
            annotations: [
                { y: 200, borderColor: '#eab308', strokeDashArray: 0, desc: '+20% base / 1 sem', label: { show: true, text: '+20%', style: { color: '#fff', background: '#eab308' } } },
                { y: 300, borderColor: '#f97316', strokeDashArray: 0, desc: '+50% base / 2 sem', label: { show: true, text: '+50%', style: { color: '#fff', background: '#f97316' } } },
                { y: 400, borderColor: '#ef4444', strokeDashArray: 0, desc: 'Surto Confirmado', label: { show: true, text: '+100%', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        arbo: {
            name: 'Arbo', unit: ' casos', color: '#f97316',
            title: 'Arboviroses (Dengue, Zika, Chik)',
            annotations: [
                { y: 50, borderColor: '#eab308', strokeDashArray: 0, desc: 'LIRAa Elevado', label: { show: true, text: 'Atenção (50)', style: { color: '#fff', background: '#eab308' } } },
                { y: 80, borderColor: '#f97316', strokeDashArray: 0, desc: '+50% Notif.', label: { show: true, text: 'Alerta (80)', style: { color: '#fff', background: '#f97316' } } },
                { y: 110, borderColor: '#ef4444', strokeDashArray: 0, desc: 'Epidemia Declarada', label: { show: true, text: 'Emergência (110)', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        lepto: {
            name: 'Lepto', unit: ' casos', color: '#ef4444',
            title: 'Leptospirose (Casos Confirmados)',
            annotations: [
                { y: 5, borderColor: '#eab308', strokeDashArray: 0, desc: 'Aumento Pós-alaga.', label: { show: true, text: 'Atenção (5)', style: { color: '#fff', background: '#eab308' } } },
                { y: 8, borderColor: '#f97316', strokeDashArray: 0, desc: 'Cluster Geográfico', label: { show: true, text: 'Alerta (8)', style: { color: '#fff', background: '#f97316' } } },
                { y: 12, borderColor: '#ef4444', strokeDashArray: 0, desc: 'Surto Confirmado', label: { show: true, text: 'Emergência (12)', style: { color: '#fff', background: '#ef4444' } } }
            ]
        },
        mort: {
            name: 'Mort', unit: ' ób.', color: '#ef4444',
            title: 'Excesso de Mortalidade (SIM/SIH)',
            annotations: [
                { y: 1.5, borderColor: '#eab308', strokeDashArray: 0, desc: 'Excesso Idosos', label: { show: true, text: 'Atenção', style: { color: '#fff', background: '#eab308' } } },
                { y: 3.5, borderColor: '#f97316', strokeDashArray: 0, desc: 'Multi-etária', label: { show: true, text: 'Alerta', style: { color: '#fff', background: '#f97316' } } },
                { y: 5.5, borderColor: '#ef4444', strokeDashArray: 0, desc: 'Severo / UTIs', label: { show: true, text: 'Emergência', style: { color: '#fff', background: '#ef4444' } } }
            ]
        }
    };

    const info = chartConfigs[type];
    if (!info || !charts.epi) return;

    document.getElementById('epi-chart-title').innerText = info.title;

    const containers = ['val-dda', 'val-arbo', 'val-lepto', 'val-mort'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('ring-2', 'ring-red-500', 'bg-slate-700/50');
    });
    activeCard.classList.add('ring-2', 'ring-red-500', 'bg-slate-700/50');

    const data = getFromCache('epi', type, days);
    const labels = isPredictiveMode ? getDates(days, 5) : getHistoricalDates(days);
    filterMapLayers('epi', type);

    // Unified Sync: Update KPI badge and Panel/Top Status
    const level = updateBadge('val-' + type, data.last, info.unit, data.trend);
    updatePanelStatus('epi', level);

    // Update Top Indicator
    document.getElementById('top-val-epi').innerText = data.last;
    document.getElementById('top-unit-epi').innerText = info.unit === '' ? '' : (info.unit.includes('ób') ? 'Óbitos' : 'Casos');

    if (type === 'mort') {
        const idososData = getFromCache('epi', 'mort_idosos', days);
        const outrosData = getFromCache('epi', 'mort_outros', days);
        const idososObs = idososData.observed.concat(Array(5).fill(null));
        const outrosObs = outrosData.observed.concat(Array(5).fill(null));

        const series = [
            { name: 'Idosos >70a', type: 'bar', data: idososObs },
            { name: 'Outras Faixas', type: 'bar', data: outrosObs }
        ];

        if (isPredictiveMode) {
            const combinedForecast = idososData.forecast.map((v, i) => Math.max(0, v + outrosData.forecast[i]));
            series.push({
                name: 'Proj AI (Total)',
                type: 'line',
                data: Array(days - 1).fill(null).concat(combinedForecast)
            });
        }

        charts.epi.updateOptions({
            chart: { type: 'line', stacked: true },
            xaxis: {
                categories: labels,
                tickAmount: 5,
                labels: { style: { fontSize: '8px' }, offsetY: -5 }
            },
            series: series,
            stroke: {
                width: isPredictiveMode ? [0, 0, 3] : [0, 0, 0],
                dashArray: isPredictiveMode ? [0, 0, 8] : [0, 0, 0]
            },
            fill: {
                type: 'solid',
                opacity: isPredictiveMode ? [1, 1, 0.5] : [1, 1]
            },
            colors: ['#a855f7', '#3b82f6', '#ef4444'], // Purple for Seniors, Blue for Others, Red for Projection
            annotations: { yaxis: info.annotations },
            yaxis: {
                ...commonOptions.yaxis,
                min: 0,
                forceNiceScale: true,
                // title removed
                labels: { formatter: (v) => (v != null ? Math.round(v) : '') + ' ób.' }
            }
        });
    } else {
        const observedLine = data.observed.concat(Array(5).fill(null));
        const forecastLine = Array(days - 1).fill(null).concat(data.forecast);

        charts.epi.updateOptions({
            chart: { type: 'area', stacked: false },
            xaxis: {
                categories: labels,
                tickAmount: 5,
                labels: { style: { fontSize: '8px' }, offsetY: -5 }
            },
            series: [
                { name: info.name + ' (Real)', type: 'area', data: observedLine },
                ...(isPredictiveMode ? [{ name: info.name + ' (Proj AI)', type: 'line', data: forecastLine }] : [])
            ],
            stroke: { width: [3, 3], dashArray: [0, 8] },
            fill: {
                type: 'gradient',
                gradient: { opacityFrom: 0.3, opacityTo: 0.0 }
            },
            colors: [info.color, info.color],
            annotations: { yaxis: info.annotations },
            yaxis: {
                ...commonOptions.yaxis,
                // yaxis title removed for space
                labels: { formatter: (v) => (v != null ? Math.round(v) : '') + info.unit }
            }
        });
    }
    renderThresholdLegend('epi-footer', info.annotations);
    updateAIInsights('epi', type);
}

// --- CAPTURA DE COORDENADAS ---
let isCapturingCoords = false;
function toggleCoordPicker() {
    isCapturingCoords = !isCapturingCoords;
    const btn = document.getElementById('coord-picker-btn');
    const display = document.getElementById('coord-display');
    if (isCapturingCoords) {
        btn.style.background = '#3b82f6';
        btn.style.borderColor = '#2563eb';
        btn.querySelector('svg').style.color = '#ffffff';
        map.getContainer().style.cursor = 'crosshair';
    } else {
        btn.style.background = 'rgba(255,255,255,0.8)';
        btn.style.borderColor = '#e2e8f0';
        btn.querySelector('svg').style.color = '#475569';
        map.getContainer().style.cursor = '';
        display.classList.add('hidden');
    }
}

map.on('click', (e) => {
    if (!isCapturingCoords) return;
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    const display = document.getElementById('coord-display');
    document.getElementById('coord-text').innerText = `${lat}, ${lng}`;
    display.classList.remove('hidden');
    console.log(`Coordenada capturada: [${lat}, ${lng}]`);
});

function copyCoords() {
    const text = document.getElementById('coord-text').innerText;
    navigator.clipboard.writeText(`[${text}]`).then(() => {
        const btn = document.querySelector('#coord-display button');
        const oldText = btn.innerText;
        btn.innerText = 'COPIADO!';
        setTimeout(() => btn.innerText = oldText, 2000);
    });
}
// --- INICIALIZAÇÃO FINAL ---
// Sincroniza os KPIs com o cache de dados inicial (7 dias)
updateDataRange(7, document.querySelector('.range-btn.active'), 'epi');
updateDataRange(7, document.querySelector('.data-panel:nth-of-type(2) .range-btn.active'), 'visa');
updateDataRange(7, document.querySelector('.data-panel:nth-of-type(3) .range-btn.active'), 'clima');
updateDataRange(7, document.querySelector('.data-panel:nth-of-type(4) .range-btn.active'), 'hidro');

// Marca como inicializado para permitir animações de emergência apenas em cliques manuais
window.isInitialized = true;

// --- REAL-TIME UPDATES (Clock & Uptime) ---
let uptimeSeconds = (124 * 86400) + 43925; // Fictício: 124 dias + algumas horas
setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('pt-BR', { hour12: false });

    uptimeSeconds++;
    const d = Math.floor(uptimeSeconds / 86400);
    const h = Math.floor((uptimeSeconds % 86400) / 3600);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = uptimeSeconds % 60;
    const uptimeEl = document.getElementById('airflow-uptime');
    if (uptimeEl) {
        uptimeEl.innerText = `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}, 1000);

function renderThresholdLegend(footerId, thresholds) {
    const footer = document.getElementById(footerId);
    if (!footer) return;

    if (!thresholds || thresholds.length === 0) {
        footer.innerHTML = '<span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Monitoramento de Rotina / Sem Gatilhos Críticos</span>';
        return;
    }

    let html = '';
    thresholds.forEach(t => {
        const color = t.borderColor || (t.style && t.style.background) || '#94a3b8';
        const rawLabel = t.label && t.label.text ? t.label.text : t.y;
        const description = t.desc ? `<span class="text-[9px] text-slate-500 lowercase italic ml-1 opacity-80">(${t.desc})</span>` : '';

        // Map colors to semantic protocol names
        let levelText = 'Alerta';
        if (color === '#eab308') levelText = 'Atenção';
        if (color === '#f97316') levelText = 'Alerta';
        if (color === '#ef4444') levelText = 'Emergência';

        html += `
            <div class="flex items-center gap-1.5 bg-slate-800/30 px-2 py-1 rounded border border-white/5 transition-all hover:bg-slate-800/50">
                <span class="w-2 h-2 rounded-full flex-shrink-0" style="background: ${color}; box-shadow: 0 0 8px ${color}"></span>
                <div class="flex items-baseline gap-1 overflow-hidden">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">${levelText}:</span>
                    <span class="text-[10px] font-black text-white whitespace-nowrap">${rawLabel}</span>
                    ${description}
                </div>
            </div>
        `;
    });

    footer.innerHTML = html;
}

// --- SYSTEM LIVE FEED (PUSH NOTIFICATIONS) ---
const pushEventsPool = [
    { type: 'DATA', title: 'Alerta INMET', message: 'Alerta AMARELO (Perigo Potencial) ativado para Belém e RMB até 06/05. Risco de alagamentos.', icon: 'fa-exclamation-triangle' },
    { type: 'ACTION', title: 'Defesa Civil', message: 'CISC notifica Defesa Civil Municipal via API sobre pico de maré previsto para 16h.', icon: 'fa-hard-hat' },
    { type: 'INSIGHT', title: 'Modelo PaliGemma', message: 'Identificada anomalia térmica (+2.5°C) cruzada com alta no LIRAa. Risco de arbovirose escalado.', icon: 'fa-robot' },
    { type: 'TASK', title: 'Pipeline OCR', message: 'Processamento de visão computacional concluído em 150 fichas do e-SUS. Matriz CUSUM atualizada.', icon: 'fa-file-medical-alt' },
    { type: 'DATA', title: 'Telemetria CEMADEN', message: 'Integração concluída. Acumulado de chuvas em 72h atingiu o limite crítico de 120mm.', icon: 'fa-satellite-dish' },
    { type: 'ACTION', title: 'Protocolo N3', message: 'Disparo de SMS preventivo realizado para a rede de Atenção Primária em Outeiro.', icon: 'fa-sms' },
    { type: 'INSIGHT', title: 'Florence-2-base', message: 'Detectada possível subnotificação de SRAG em 30% nas UPAs periféricas.', icon: 'fa-brain' },
    { type: 'DATA', title: 'Hidrologia Marinha', message: 'Sensores marégrafos sincronizados. Nível atual: 3.58m (Estável na última hora).', icon: 'fa-water' },
    { type: 'TASK', title: 'Data Ingestion', message: 'Rotina de ETL do DTA finalizada. 450 novos registros normalizados na base PostgreSQL.', icon: 'fa-database' },
    { type: 'ACTION', title: 'VIGIAR Acionado', message: 'Mobilização da equipe de campo do CCEVS para inspeção em área de risco mapeada.', icon: 'fa-truck-medical' },
    { type: 'INSIGHT', title: 'Alerta Cruzado', message: 'Convergência de vetores: Clima + Densidade Populacional indicam zona vermelha no Guamá.', icon: 'fa-map-marked-alt' }
];

let tickerEvents = [];
let nextRenderIndex = 0;
let tickerPos = 0;
let isTickerPaused = false;
let tickerSpeed = 0.5; // Smooth reading speed

function addTickerEvent(event) {
    tickerEvents.unshift({
        ...event,
        timestamp: Date.now()
    });
    
    if (tickerEvents.length > 20) {
        tickerEvents.pop();
    }
    
    // Inject the new event to be rendered next!
    nextRenderIndex = 0;
}

function createTickerElement(event) {
    const diffSec = Math.floor((Date.now() - event.timestamp) / 1000);
    let timeStr = 'agora';
    if (diffSec >= 60) timeStr = `há ${Math.floor(diffSec / 60)}min`;
    else if (diffSec >= 5) timeStr = `há ${diffSec}s`;

    let typeClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (event.type === 'ALERTA') typeClass = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    else if (event.type === 'EMERGÊNCIA') typeClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    else if (event.type === 'TASK') typeClass = 'bg-green-500/20 text-green-400 border border-green-500/30';

    const el = document.createElement('div');
    el.className = 'ticker-item';
    el.innerHTML = `
        <span class="ticker-badge ${typeClass}"><i class="fas ${event.icon}"></i> ${event.type}</span>
        <span class="ticker-message"><strong>${event.title}:</strong> ${event.message}</span>
        <span class="ticker-time" data-timestamp="${event.timestamp}">${timeStr}</span>
    `;
    return el;
}

function appendNextTickerItem() {
    const container = document.getElementById('news-ticker');
    if (!container || tickerEvents.length === 0) return;
    
    const event = tickerEvents[nextRenderIndex];
    if (!event) return;
    
    const el = createTickerElement(event);
    container.appendChild(el);
    
    nextRenderIndex = (nextRenderIndex + 1) % tickerEvents.length;
}

function animateTicker() {
    const container = document.getElementById('news-ticker');
    if (!container) {
        requestAnimationFrame(animateTicker);
        return;
    }
    
    // Ensure we have enough items appended to fill the screen buffer
    let lastChild = container.lastElementChild;
    if (!lastChild || lastChild.getBoundingClientRect().right < window.innerWidth + 500) {
        appendNextTickerItem();
    }
    
    if (!isTickerPaused && container.children.length > 0) {
        tickerPos += tickerSpeed;
        
        const firstChild = container.firstElementChild;
        // Check if the first child is completely out of view on the left
        // offsetWidth gives width including padding/border, +80 for our margin-right
        const firstChildWidth = firstChild.offsetWidth + 80; 
        
        if (tickerPos >= firstChildWidth) {
            tickerPos -= firstChildWidth;
            container.removeChild(firstChild);
        }
        
        container.style.transform = `translate3d(-${tickerPos.toFixed(2)}px, 0, 0)`;
    }
    
    requestAnimationFrame(animateTicker);
}

function updateTickerTimestamps() {
    document.querySelectorAll('.ticker-time').forEach(el => {
        const ts = parseInt(el.getAttribute('data-timestamp'));
        if (ts) {
            const diffSec = Math.floor((Date.now() - ts) / 1000);
            let timeStr = 'agora';
            if (diffSec >= 60) timeStr = `há ${Math.floor(diffSec / 60)}min`;
            else if (diffSec >= 5) timeStr = `há ${diffSec}s`;
            el.innerText = timeStr;
        }
    });
}

function initSystemLiveFeed() {
    const container = document.getElementById('news-ticker');
    if (!container) return;

    // Mouse listeners for pause/resume
    container.parentElement.addEventListener('mouseenter', () => isTickerPaused = true);
    container.parentElement.addEventListener('mouseleave', () => isTickerPaused = false);

    // Initial pool
    tickerEvents = [...pushEventsPool];

    // Seed initial items
    while(container.children.length < 5) {
        appendNextTickerItem();
    }

    function queueNextEvent() {
        const delay = Math.floor(Math.random() * 8000) + 7000;
        setTimeout(() => {
            const randomEvent = pushEventsPool[Math.floor(Math.random() * pushEventsPool.length)];
            addTickerEvent(randomEvent);
            queueNextEvent();
        }, delay);
    }
    
    setTimeout(queueNextEvent, 5000);
    
    // Start animation loop
    requestAnimationFrame(animateTicker);
    
    // Lightweight timestamp updates
    setInterval(updateTickerTimestamps, 5000);
}

// Start the feed
setTimeout(initSystemLiveFeed, 1500);
