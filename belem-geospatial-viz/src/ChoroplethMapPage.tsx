import { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { MapPin, BarChart3, Info } from 'lucide-react';

import mockBelemGeoJson from './assets/belem_bairros.json';

// Registra o mapa no ECharts
echarts.registerMap('belem_map', mockBelemGeoJson as any);

// Lista de bairros baseada no GeoJSON mockado
const NEIGHBORHOODS = mockBelemGeoJson.features.map((f: any) => f.properties.name);

interface DataItem {
    name: string;
    value: number;
}

export default function ChoroplethMapPage() {
    const [data, setData] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBairro, setSelectedBairro] = useState<DataItem | null>(null);

    // Função para gerar dados aleatórios (simulando API)
    const generateData = () => {
        setLoading(true);
        // Simula delay de rede
        setTimeout(() => {
            const newData = NEIGHBORHOODS.map((name: string) => ({
                name: name,
                value: Math.floor(Math.random() * 500) + 50 // Valor aleatório entre 50 e 550
            }));
            setData(newData);
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        // Carregar dados iniciais ao montar
        generateData();
    }, []);

    // Configuração do Gráfico (ECharts Option)
    const chartOption = useMemo(() => {
        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} licenciamentos',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: '#334155',
                borderWidth: 1,
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                padding: [10, 15],
                extraCssText: 'box-shadow: 0 0 20px rgba(0,0,0,0.5); border-radius: 8px;'
            },
            visualMap: {
                min: 0,
                max: 600,
                left: '20px',
                bottom: '20px',
                text: ['Alto', 'Baixo'],
                calculable: true,
                inRange: {
                    color: ['#334155', '#f97316', '#ef4444']
                },
                textStyle: {
                    color: '#94a3b8',
                    fontSize: 10,
                    fontWeight: 'bold'
                }
            },
            series: [
                {
                    name: 'Licenciamentos',
                    type: 'map',
                    map: 'belem_map',
                    roam: true,
                    emphasis: {
                        label: {
                            show: true,
                            color: '#fff'
                        },
                        itemStyle: {
                            areaColor: '#6366f1',
                            shadowBlur: 10,
                            shadowColor: 'rgba(99, 102, 241, 0.5)'
                        }
                    },
                    select: {
                        itemStyle: {
                            areaColor: '#4f46e5',
                            borderColor: '#fff',
                            borderWidth: 2
                        }
                    },
                    data: data,
                    itemStyle: {
                        borderColor: '#1e293b',
                        borderWidth: 1,
                        areaColor: '#1e293b'
                    },
                    label: {
                        show: false,
                        fontSize: 9,
                        color: '#94a3b8'
                    }
                }
            ]
        };
    }, [data]);

    const onChartClick = (params: any) => {
        setSelectedBairro({
            name: params.name,
            value: params.value || 0
        });
    };

    const totalLicenciamentos = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="h-full bg-slate-900 text-slate-100 p-4 md:p-8 font-sans overflow-y-auto">

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Map */}
                <div
                    className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 min-h-[600px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                            <h2 className="font-bold text-xl text-white">Mapa de Calor Municipal</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                            <Info size={14} className="text-orange-400" />
                            <span>Use o scroll para zoom e arraste para mover</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-full min-h-[450px] relative z-10">
                        {loading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-800/40 backdrop-blur-sm rounded-xl">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                    <p className="text-orange-400 font-medium text-sm animate-pulse">Processando GeoJSON...</p>
                                </div>
                            </div>
                        )}
                        <ReactECharts
                            option={chartOption}
                            style={{ height: '100%', width: '100%' }}
                            onEvents={{ 'click': onChartClick }}
                            opts={{ renderer: 'canvas' }}
                        />
                    </div>

                    {/* Aviso sobre GeoJSON */}
                    <div className="mt-6 p-4 bg-slate-900/50 text-slate-400 text-xs rounded-xl border border-slate-700/50 flex items-start gap-3 relative z-10">
                        <Info size={18} className="mt-0.5 shrink-0 text-orange-500" />
                        <div className="leading-relaxed">
                            <strong className="text-slate-200">Nota Técnica:</strong> O mapa renderiza <code className="text-orange-400 bg-orange-400/10 px-1 rounded">{NEIGHBORHOODS.length}</code> polígonos extraídos diretamente da Overpass API (OSM).
                            A renderização utiliza aceleração por hardware via <code className="text-slate-200">Canvas 2D</code> para garantir 60fps durante interações.
                        </div>
                    </div>
                </div>

                {/* Right Col: Stats */}
                <div className="flex flex-col gap-6">

                    {/* Summary Card */}
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart3 size={120} className="text-orange-500 -mb-8 -mr-8" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Volume de Operações</h3>
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white tracking-tighter">
                                    {loading ? "---" : totalLicenciamentos.toLocaleString()}
                                </span>
                                <span className="text-slate-500 font-medium">Unidades</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                                    +12.4%
                                </span>
                                <span className="text-slate-500 text-xs">Crescimento vs Q4 2024</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 flex-1 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700">
                                <MapPin size={18} className="text-orange-500" />
                            </div>
                            <h3 className="text-white font-bold text-lg">Análise Local</h3>
                        </div>

                        {selectedBairro ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <div className="mb-6">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bairro Selecionado</span>
                                    <p className="text-3xl font-black text-white mt-1 leading-none">{selectedBairro.name}</p>
                                </div>

                                <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Licenciamentos Ativos</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-4xl font-black text-orange-500">{selectedBairro.value}</p>
                                        <p className="text-slate-500 text-sm font-medium">estabelecimentos</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-slate-400 font-medium">Percentual da Carga Municipal</span>
                                        <span className="text-sm font-bold text-white">{Math.round((selectedBairro.value / totalLicenciamentos) * 100)}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                            style={{ width: `${(selectedBairro.value / 600) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10 opacity-60">
                                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-700">
                                    <MapPin size={32} className="animate-bounce" />
                                </div>
                                <p className="text-sm font-medium max-w-[200px]">Interaja com o mapa para visualizar dados específicos de cada bairro</p>
                            </div>
                        )}
                    </div>

                    {/* Top Bairros List */}
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                        <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                            <BarChart3 size={16} className="text-orange-500" />
                            Zonas de Alta Densidade
                        </h3>
                        <div className="space-y-2">
                            {[...data].sort((a, b) => b.value - a.value).slice(0, 5).map((item, idx) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-transparent hover:border-slate-700 hover:bg-slate-900/50 transition-all cursor-pointer group"
                                    onClick={() => setSelectedBairro(item)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center bg-slate-900 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-700 group-hover:border-orange-500/50 group-hover:text-orange-500 transition-colors">
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm">{item.value}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}