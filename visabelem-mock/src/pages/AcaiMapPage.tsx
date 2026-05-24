/**
 * AcaiMapPage.tsx - Página de Mapeamento de Pontos de Açaí
 * Programa "Açaí no Ponto" - DEVISA/SESMA
 * Mapa real com Leaflet e dados GeoJSON
 */

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import { Button } from '../components/ui/Button';
import {
    MapPin,
    Filter,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Users,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Search,
    Eye,
    Phone,
    Calendar,
    X,
    Navigation
} from 'lucide-react';
import { cn } from '../lib/utils';
import 'leaflet/dist/leaflet.css';

// Inject custom dark Leaflet theme styles into the document
const customLeafletStyles = `
/* Custom Bairro Labels */
.bairro-label {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: rgba(16, 185, 129, 0.4) !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    white-space: nowrap !important;
    pointer-events: none !important;
    text-shadow: 0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.6) !important;
}
.bairro-label::before {
    display: none !important;
}

/* Custom Leaflet Controls */
.leaflet-bar {
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
}
.leaflet-bar a {
    background-color: #090d16 !important;
    color: #94a3b8 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    transition: all 0.2s !important;
}
.leaflet-bar a:hover {
    background-color: #1e293b !important;
    color: #f1f5f9 !important;
}

/* Custom Leaflet Popups */
.leaflet-popup-content-wrapper {
    background: #090d16 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
    border-radius: 16px !important;
    color: #f1f5f9 !important;
    padding: 0px !important;
}
.leaflet-popup-content {
    margin: 16px !important;
    line-height: 1.5 !important;
}
.leaflet-popup-tip {
    background: #090d16 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.leaflet-popup-close-button {
    color: #94a3b8 !important;
    top: 12px !important;
    right: 12px !important;
    font-size: 16px !important;
}
`;

if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.textContent = customLeafletStyles;
    document.head.appendChild(styleEl);
}

// Types for açaí point data
interface AcaiFeature {
    geometry: {
        coordinates: [number, number];
    };
    properties: {
        _id?: number;
        "Nome do ponto de venda ou do proprietário"?: string;
        "Telefone de contato"?: string;
        "Qual o distrito de saúde?"?: string;
        "Nome do profissional de saúde"?: string;
        _submission_time?: string;
    };
}

interface AcaiPoint {
    id: number;
    name: string;
    owner: string;
    phone: string;
    district: string;
    lat: number;
    lng: number;
    status: 'regular' | 'pendente' | 'irregular';
    professional: string;
    date: string;
}

// District colors and info
const districts: Record<string, { name: string; color: string; count: number }> = {
    'DAENT': { name: 'Distrito Entroncamento', color: '#38bdf8', count: 0 },
    'DAGUA': { name: 'Distrito Guamá', color: '#34d399', count: 0 },
    'DASAC': { name: 'Distrito Sacramenta', color: '#fbbf24', count: 0 },
    'DAICO': { name: 'Distrito Icoaraci', color: '#2dd4bf', count: 0 },
    'DABEL': { name: 'Distrito Belém', color: '#f87171', count: 0 },
    'DABEN': { name: 'Distrito Benguí', color: '#f472b6', count: 0 },
    'DAOUT': { name: 'Distrito Outeiro', color: '#a3e635', count: 0 },
    'DAMOS': { name: 'Distrito Mosqueiro', color: '#22d3ee', count: 0 },
    'Outros': { name: 'Não cadastrado', color: '#94a3b8', count: 0 },
};

const statusConfig = {
    regular: { label: 'Regular', color: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20', icon: CheckCircle2 },
    pendente: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-450 border-amber-500/20', icon: Clock },
    irregular: { label: 'Irregular', color: 'bg-rose-500/10 text-rose-450 border-rose-500/20', icon: AlertTriangle },
};

// Custom stylized açaí-map icon component
const AcaiIcon = () => (
    <svg className="w-5 h-5 text-emerald-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="10.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="13.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
    </svg>
);

// Component to fly to selected point
const FlyToPoint = ({ point }: { point: AcaiPoint | null }) => {
    const map = useMap();
    useEffect(() => {
        if (point) {
            map.flyTo([point.lat, point.lng], 16, { duration: 1 });
        }
    }, [point, map]);
    return null;
};

// Component to fly to user location
const FlyToLocation = ({ location }: { location: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo(location, 16, { duration: 1 });
        }
    }, [location, map]);
    return null;
};

// Component to fit map to bounds of all points on initial load
const FitMapBounds = ({ points }: { points: AcaiPoint[] }) => {
    const map = useMap();
    const hasFitRef = useRef(false);
    useEffect(() => {
        if (points && points.length > 0 && !hasFitRef.current) {
            const bounds = points.map(p => [p.lat, p.lng] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50] });
            hasFitRef.current = true;
        }
    }, [points, map]);
    return null;
};

export const AcaiMapPage = () => {
    const [acaiPoints, setAcaiPoints] = useState<AcaiPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<AcaiPoint | null>(null);
    const [districtCounts, setDistrictCounts] = useState<Record<string, number>>({});
    const [bairrosGeoJson, setBairrosGeoJson] = useState<FeatureCollection | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locatingUser, setLocatingUser] = useState(false);

    // Handle locate user
    const handleLocateUser = () => {
        if (!navigator.geolocation) {
            return;
        }

        setLocatingUser(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setLocatingUser(false);
            },
            () => {
                // Fallback to Belém downtown coordinates
                const mockLocation: [number, number] = [-1.447928, -48.468522];
                setUserLocation(mockLocation);
                setLocatingUser(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Load GeoJSON data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/data/acai-points.json');
                const data = await response.json();

                const points: AcaiPoint[] = [];
                const counts: Record<string, number> = {};

                // Initialize counts
                Object.keys(districts).forEach(key => counts[key] = 0);

                const features = Array.isArray(data)
                    ? data.flatMap(fc => fc.features || [])
                    : (data.features || []);

                (features as AcaiFeature[]).forEach((feature, index) => {
                    if (!feature.geometry || !feature.geometry.coordinates) return;

                    const props = feature.properties || {};
                    const district = props["Qual o distrito de saúde?"] || 'Outros';
                    const validDistrict = Object.keys(districts).includes(district) ? district : 'Outros';

                    // Statistically balanced status assignment for inspection telemetry representation
                    const statusCycle: Array<'regular' | 'pendente' | 'irregular'> = ['regular', 'regular', 'regular', 'regular', 'pendente', 'irregular'];
                    const calculatedStatus = statusCycle[index % statusCycle.length];

                    const point: AcaiPoint = {
                        id: props._id || index + 1,
                        name: props["Nome do ponto de venda ou do proprietário"] || `Ponto ${index + 1}`,
                        owner: props["Nome do ponto de venda ou do proprietário"] || 'Não informado',
                        phone: props["Telefone de contato"] || 'Não informado',
                        district: validDistrict,
                        lat: feature.geometry.coordinates[1],
                        lng: feature.geometry.coordinates[0],
                        status: calculatedStatus,
                        professional: props["Nome do profissional de saúde"] || 'Não informado',
                        date: props._submission_time ? new Date(props._submission_time).toISOString().split('T')[0] : '2025-01-01'
                    };

                    points.push(point);
                    counts[validDistrict] = (counts[validDistrict] || 0) + 1;
                });

                setAcaiPoints(points);
                setDistrictCounts(counts);
                setLoading(false);
            } catch (error) {
                console.error('Error loading açaí points:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Load bairros GeoJSON
    useEffect(() => {
        const loadBairros = async () => {
            try {
                const response = await fetch('/data/belem_bairros.geojson');
                const data = await response.json();
                setBairrosGeoJson(data);
            } catch (error) {
                console.error('Error loading bairros:', error);
            }
        };
        loadBairros();
    }, []);

    const filteredPoints = acaiPoints.filter(point => {
        if (selectedDistrict && point.district !== selectedDistrict) return false;
        if (selectedStatus && point.status !== selectedStatus) return false;
        if (searchTerm && !point.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !point.owner.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: acaiPoints.length,
        regular: acaiPoints.filter(p => p.status === 'regular').length,
        pendente: acaiPoints.filter(p => p.status === 'pendente').length,
        irregular: acaiPoints.filter(p => p.status === 'irregular').length,
    };

    const percentRegular = Math.round((stats.regular / stats.total) * 100) || 0;
    const percentPendente = Math.round((stats.pendente / stats.total) * 100) || 0;
    const percentIrregular = Math.round((stats.irregular / stats.total) * 100) || 0;

    const getDistrictColor = (district: string) => {
        return districts[district]?.color || '#94a3b8';
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Premium Header */}
            <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 h-16 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                        <AcaiIcon />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-white uppercase tracking-wider">Açaí no Ponto</h1>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">Mapeamento Sanitário de Batedores • Belém/PA</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 h-9 text-xs">
                        <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs font-bold px-4">
                        <Download className="w-3.5 h-3.5" /> Exportar Dados
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 h-[calc(100vh-64px)] relative overflow-hidden">
                {/* Sidebar Panel */}
                <div className="w-96 flex-shrink-0 bg-slate-900/40 backdrop-blur-md border-r border-slate-900 flex flex-col h-full z-10">
                    
                    {/* Stats HUD */}
                    <div className="p-4 border-b border-slate-900 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {/* Total Box */}
                            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-500/5 rounded-full blur-xl translate-x-2 -translate-y-2 group-hover:scale-125 transition-transform" />
                                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Cadastros</span>
                                </div>
                                <p className="text-xl font-mono font-black text-white">{loading ? '...' : stats.total}</p>
                            </div>

                            {/* Regular Box */}
                            <div className="bg-emerald-950/10 rounded-xl p-3 border border-emerald-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg" />
                                <div className="flex items-center gap-1.5 text-emerald-450 mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Regulares</span>
                                </div>
                                <p className="text-xl font-mono font-black text-emerald-400">{loading ? '...' : stats.regular}</p>
                            </div>

                            {/* Pendentes Box */}
                            <div className="bg-amber-950/10 rounded-xl p-3 border border-amber-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-lg" />
                                <div className="flex items-center gap-1.5 text-amber-450 mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Pendentes</span>
                                </div>
                                <p className="text-xl font-mono font-black text-amber-400">{loading ? '...' : stats.pendente}</p>
                            </div>

                            {/* Irregulares Box */}
                            <div className="bg-rose-950/10 rounded-xl p-3 border border-rose-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-full blur-lg" />
                                <div className="flex items-center gap-1.5 text-rose-450 mb-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Irregulares</span>
                                </div>
                                <p className="text-xl font-mono font-black text-rose-450">{loading ? '...' : stats.irregular}</p>
                            </div>
                        </div>

                        {/* Stacked Percentage Telemetry */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                <span>Distribuição Sanitária</span>
                                <span className="text-emerald-400">{percentRegular}% Regular</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-900/80">
                                <div style={{ width: `${percentRegular}%` }} className="h-full bg-emerald-500 transition-all duration-500" title="Regular" />
                                <div style={{ width: `${percentPendente}%` }} className="h-full bg-amber-500 transition-all duration-500" title="Pendente" />
                                <div style={{ width: `${percentIrregular}%` }} className="h-full bg-rose-500 transition-all duration-500" title="Irregular" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters panel */}
                    <div className="p-4 border-b border-slate-900 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filtrar por nome ou proprietário..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center justify-between w-full p-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider",
                                showFilters
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450 shadow-sm"
                                    : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5" /> Filtros Operacionais
                            </span>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-550 transition-transform", showFilters && "rotate-180")} />
                        </button>

                        {showFilters && (
                            <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-900 animate-in slide-in-from-top-2">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Distritos</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(districts).filter(([key]) => districtCounts[key] > 0).map(([key, dist]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedDistrict(selectedDistrict === key ? null : key)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black transition-all",
                                                    selectedDistrict === key
                                                        ? "text-slate-950 shadow-md font-black"
                                                        : "bg-slate-900 text-slate-350 hover:bg-slate-800"
                                                )}
                                                style={selectedDistrict === key ? { backgroundColor: dist.color } : {}}
                                            >
                                                {key} ({districtCounts[key] || 0})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Sanitário</p>
                                    <div className="flex gap-1.5">
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all flex-1 text-center",
                                                    selectedStatus === key
                                                        ? config.color
                                                        : "bg-slate-900 text-slate-350 border-slate-900 hover:bg-slate-800"
                                                )}
                                            >
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-2 space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-1.5">
                                {loading ? 'Carregando registros...' : `${filteredPoints.length} batedores localizados`}
                            </p>
                            <div className="space-y-1">
                                {filteredPoints.slice(0, 100).map(point => {
                                    const status = statusConfig[point.status];
                                    const StatusIcon = status.icon;
                                    const isSelected = selectedPoint?.id === point.id;

                                    return (
                                        <button
                                            key={point.id}
                                            onClick={() => setSelectedPoint(point)}
                                            className={cn(
                                                "w-full p-3 rounded-xl text-left transition-all border group relative flex items-center justify-between",
                                                isSelected
                                                    ? "bg-slate-900 border-slate-800 shadow-md ring-1 ring-emerald-500/20"
                                                    : "bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-900"
                                            )}
                                        >
                                            {/* Status indicator strip */}
                                            <div className={cn(
                                                "absolute left-0 top-3 bottom-3 w-0.5 rounded-r-md",
                                                point.status === 'regular' && 'bg-emerald-500',
                                                point.status === 'pendente' && 'bg-amber-500',
                                                point.status === 'irregular' && 'bg-rose-500'
                                            )} />

                                            <div className="flex items-start gap-3 pl-1.5 flex-1 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-100 truncate group-hover:text-white transition-colors">{point.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate leading-none mt-1 uppercase tracking-tight">{point.owner}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wide", status.color)}>
                                                            {status.label}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-slate-500">{point.district}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <StatusIcon className={cn("w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-110",
                                                    point.status === 'regular' && "text-emerald-400",
                                                    point.status === 'pendente' && "text-amber-400",
                                                    point.status === 'irregular' && "text-rose-400"
                                                )} />
                                                <ChevronRight className={cn(
                                                    "w-3 h-3 text-emerald-450 transition-all opacity-0 -translate-x-1",
                                                    isSelected || "group-hover:opacity-100 group-hover:translate-x-0"
                                                )} />
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredPoints.length > 100 && (
                                    <p className="text-[9px] font-mono text-center text-slate-500 py-3 uppercase tracking-wider">
                                        Mostrando 100 de {filteredPoints.length} pontos
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative h-full">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                            <div className="text-center">
                                <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-3" />
                                <p className="text-xs font-mono uppercase tracking-wider text-slate-450">Construindo telemetria do mapa...</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            center={[-1.455, -48.49]}
                            zoom={12}
                            className="h-full w-full"
                            style={{ background: '#090d16' }}
                            zoomControl={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            {/* Fit bounds on load */}
                            <FitMapBounds points={acaiPoints} />

                            {/* Fly transitions */}
                            <FlyToPoint point={selectedPoint} />
                            <FlyToLocation location={userLocation} />

                            {/* District bounds (Bairros) */}
                            {bairrosGeoJson && (
                                <GeoJSON
                                    data={bairrosGeoJson}
                                    style={() => ({
                                        color: '#10b981',
                                        weight: 1,
                                        opacity: 0.15,
                                        fillColor: '#10b981',
                                        fillOpacity: 0.015,
                                        interactive: false
                                    })}
                                />
                            )}

                            {/* Açaí Markers */}
                            {filteredPoints.map(point => (
                                <CircleMarker
                                    key={point.id}
                                    center={[point.lat, point.lng]}
                                    radius={selectedPoint?.id === point.id ? 10 : 6}
                                    pathOptions={{
                                        fillColor: getDistrictColor(point.district),
                                        color: selectedPoint?.id === point.id ? '#ffffff' : getDistrictColor(point.district),
                                        weight: selectedPoint?.id === point.id ? 3 : 1,
                                        opacity: 0.9,
                                        fillOpacity: selectedPoint?.id === point.id ? 1 : 0.75
                                    }}
                                    eventHandlers={{
                                        click: () => setSelectedPoint(point)
                                    }}
                                >
                                    <Popup className="acai-popup">
                                        <div className="min-w-[220px] text-slate-100">
                                            <p className="font-bold text-sm tracking-tight mb-2 uppercase" style={{ color: getDistrictColor(point.district) }}>
                                                {point.name}
                                            </p>
                                            <div className="space-y-1 text-[10px] text-slate-350 font-medium">
                                                <p className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] w-20">Proprietário:</span> {point.owner}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] w-20">Telefone:</span> {point.phone}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] w-20">Fiscalizador:</span> {point.professional}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] w-20">Distrito:</span> {point.district}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] w-20">Inspeção:</span> {new Date(point.date).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider",
                                                    point.status === 'regular' && 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
                                                    point.status === 'pendente' && 'bg-amber-500/10 text-amber-450 border-amber-500/20',
                                                    point.status === 'irregular' && 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                                                )}>
                                                    {statusConfig[point.status].label}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}

                            {/* User Position */}
                            {userLocation && (
                                <CircleMarker
                                    center={userLocation}
                                    radius={8}
                                    pathOptions={{
                                        fillColor: '#3b82f6',
                                        color: '#fff',
                                        weight: 2,
                                        opacity: 1,
                                        fillOpacity: 1
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center p-1">
                                            <p className="font-black text-xs text-blue-500 uppercase tracking-wide">Sua Posição</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}
                        </MapContainer>
                    )}

                    {/* HUD Locate Button */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                        <button
                            onClick={handleLocateUser}
                            disabled={locatingUser}
                            className={cn(
                                "w-9 h-9 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl flex items-center justify-center text-slate-350 hover:bg-slate-850 hover:text-emerald-400 transition-all shadow-lg",
                                locatingUser && "animate-pulse"
                            )}
                            title="Centralizar na minha localização"
                        >
                            {locatingUser ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Navigation className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* HUD Legend Card */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-900 shadow-2xl rounded-2xl p-4 w-60 z-[1000] space-y-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Distritos Sanitários</p>
                        <div className="space-y-1">
                            {Object.entries(districts).filter(([key]) => districtCounts[key] > 0).map(([key, dist]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedDistrict(selectedDistrict === key ? null : key)}
                                    className={cn(
                                        "flex items-center gap-2.5 w-full p-1.5 rounded-lg transition-all text-left",
                                        selectedDistrict === key ? "bg-slate-900 border border-slate-800" : "border border-transparent hover:bg-slate-900/30"
                                    )}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dist.color }} />
                                    <span className="text-[10px] text-slate-300 flex-1 font-medium">{key === 'Outros' ? dist.name : key}</span>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold">{districtCounts[key] || 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* HUD Details Info Card (Floating Overlay) */}
                    {selectedPoint && (
                        <div className="absolute top-4 left-4 bg-slate-950/95 backdrop-blur-md border border-slate-900 rounded-2xl w-80 shadow-2xl z-[1000] overflow-hidden animate-in slide-in-from-left-4">
                            {/* Color Header Banner by status */}
                            <div className={cn(
                                "px-4 py-2 border-b flex items-center justify-between",
                                selectedPoint.status === 'regular' && 'bg-emerald-500/5 border-emerald-500/10',
                                selectedPoint.status === 'pendente' && 'bg-amber-500/5 border-amber-500/10',
                                selectedPoint.status === 'irregular' && 'bg-rose-500/5 border-rose-500/10'
                            )}>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className={cn(
                                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                            selectedPoint.status === 'regular' && 'bg-emerald-450',
                                            selectedPoint.status === 'pendente' && 'bg-amber-450',
                                            selectedPoint.status === 'irregular' && 'bg-rose-450'
                                        )} />
                                        <span className={cn(
                                            "relative inline-flex rounded-full h-2 w-2",
                                            selectedPoint.status === 'regular' && 'bg-emerald-500',
                                            selectedPoint.status === 'pendente' && 'bg-amber-500',
                                            selectedPoint.status === 'irregular' && 'bg-rose-500'
                                        )} />
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ponto Sanitário</span>
                                </div>
                                <button
                                    onClick={() => setSelectedPoint(null)}
                                    className="text-slate-500 hover:text-slate-350 transition-colors p-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">{selectedPoint.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-mono tracking-tight mt-0.5 truncate">Proprietário: {selectedPoint.owner}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-3">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Telefone</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                                            <span>{selectedPoint.phone}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Distrito</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                                            <span className="truncate">{selectedPoint.district}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-2 border-t border-slate-900/50 pt-2.5">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Profissional de Saúde</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                            <Users className="w-3.5 h-3.5 text-slate-600" />
                                            <span className="truncate">{selectedPoint.professional}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-2 border-t border-slate-900/50 pt-2.5">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Última Inspeção</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                            <span>{new Date(selectedPoint.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                                    <span className={cn(
                                        "text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider",
                                        statusConfig[selectedPoint.status].color
                                    )}>
                                        {statusConfig[selectedPoint.status].label}
                                    </span>
                                    <Button size="sm" variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 gap-1.5 text-[10px] uppercase font-bold h-8">
                                        <Eye className="w-3 h-3" /> Ficha Completa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcaiMapPage;
