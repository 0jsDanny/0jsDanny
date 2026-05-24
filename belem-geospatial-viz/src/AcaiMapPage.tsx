/**
 * AcaiMapPage.tsx - Página de Mapeamento de Pontos de Açaí
 * Programa "Açaí no Ponto" - DEVISA/SESMA
 * Mapa real com Leaflet e dados GeoJSON
 */

import { useState, useEffect, memo, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { FeatureCollection } from 'geojson';

import {
    MapPin,
    Filter,
    RefreshCw,
    ChevronDown,
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
import { cn } from './lib/utils';
import 'leaflet/dist/leaflet.css';

// Custom styles for bairro labels
const bairroLabelStyles = `
.bairro-label {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: rgba(168, 85, 247, 0.5) !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    white-space: nowrap !important;
    pointer-events: none !important;
    text-shadow: 0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5) !important;
}
.bairro-label::before {
    display: none !important;
}

/* Pulsing selection animation */
@keyframes leaflet-pulsate {
    0% { transform: scale(0.1, 0.1); opacity: 0.0; }
    50% { opacity: 1.0; }
    100% { transform: scale(1.2, 1.2); opacity: 0.0; }
}
.selection-pulse {
    border: 3px solid #fff;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    position: absolute;
    /* Center it relative to the 0,0 anchor */
    margin-left: -20px;
    margin-top: -20px;
    animation: leaflet-pulsate 1.5s ease-out;
    animation-iteration-count: infinite;
    pointer-events: none;
    box-shadow: 0 0 15px #fff;
}
.selection-pulse-container {
    background: transparent !important;
    border: none !important;
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.textContent = bairroLabelStyles;
    document.head.appendChild(styleEl);
}

// Types for açaí point data
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
    'DAENT': { name: 'Distrito Entroncamento', color: '#3b82f6', count: 0 },
    'DAGUA': { name: 'Distrito Guamá', color: '#10b981', count: 0 },
    'DASAC': { name: 'Distrito Sacramenta', color: '#f59e0b', count: 0 },
    'DAICO': { name: 'Distrito Icoaraci', color: '#8b5cf6', count: 0 },
    'DABEL': { name: 'Distrito Belém', color: '#ef4444', count: 0 },
    'DABEN': { name: 'Distrito Benguí', color: '#ec4899', count: 0 },
    'DAOUT': { name: 'Distrito Outeiro', color: '#84cc16', count: 0 },
    'DAMOS': { name: 'Distrito Mosqueiro', color: '#06b6d4', count: 0 },
    'Outros': { name: 'Não cadastrado', color: '#6b7280', count: 0 },
};

const statusConfig = {
    regular: { label: 'Regular', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    irregular: { label: 'Irregular', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
};

// Memoized Marker Component for better performance with thousands of points
const MemoizedAcaiMarker = memo(({
    point,
    isSelected,
    anySelected,
    onClick,
    districtColor
}: {
    point: AcaiPoint;
    isSelected: boolean;
    anySelected: boolean;
    onClick: () => void;
    districtColor: string;
}) => {
    return (
        <CircleMarker
            center={[point.lat, point.lng]}
            radius={isSelected ? 12 : 8}
            pathOptions={{
                fillColor: districtColor,
                color: '#fff',
                weight: isSelected ? 3 : 1,
                opacity: anySelected ? (isSelected ? 1 : 0.1) : 1,
                fillOpacity: anySelected ? (isSelected ? 0.9 : 0.05) : 0.8
            }}
            eventHandlers={{
                click: onClick
            }}
        >
            <Popup className="acai-popup">
                <div className="min-w-[200px]">
                    <p className="font-bold text-base" style={{ color: districtColor }}>
                        {point.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">📞 {point.phone}</p>
                    <p className="text-sm text-gray-600">👤 {point.professional}</p>
                    <p className="text-sm text-gray-600">📍 {point.district}</p>
                    <p className="text-sm text-gray-600">📅 {new Date(point.date).toLocaleDateString('pt-BR')}</p>
                </div>
            </Popup>
        </CircleMarker>
    );
}, (prev, next) => {
    // Only re-render if selection state or specific point data changed
    return (
        prev.isSelected === next.isSelected &&
        prev.anySelected === next.anySelected &&
        prev.point.id === next.point.id
    );
});

// Component to show a pulsing ring on selection
const SelectedPointPulse = ({ point }: { point: AcaiPoint | null }) => {
    if (!point) return null;
    
    const icon = L.divIcon({
        className: 'selection-pulse-container',
        html: '<div class="selection-pulse"></div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });

    return (
        <Marker 
            position={[point.lat, point.lng]} 
            icon={icon} 
            interactive={false}
            zIndexOffset={1000}
        />
    );
};

// Component to handle map clicks (clear selection)
const MapEvents = ({ onMapClick }: { onMapClick: () => void }) => {
    useMapEvents({
        click: () => {
            onMapClick();
        },
    });
    return null;
};

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

// Component to fit map to municipality extent
const FitMunicipalityBounds = ({ geojson }: { geojson: FeatureCollection | null }) => {
    const map = useMap();
    const [hasFitted, setHasFitted] = useState(false);

    useEffect(() => {
        if (geojson && !hasFitted) {
            const bounds = L.geoJSON(geojson).getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 1.5 });
                setHasFitted(true);
            }
        }
    }, [geojson, map, hasFitted]);

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
                // Falha silenciosa para fallback específico solicitado (coord de teste)
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
                const response = await fetch(`${import.meta.env.BASE_URL}data/acai-points.json`);
                const data = await response.json();

                // Parse GeoJSON - the data structure is an array of FeatureCollections
                const points: AcaiPoint[] = [];
                const counts: Record<string, number> = {};

                // Initialize counts
                Object.keys(districts).forEach(key => counts[key] = 0);

                // If it's the window.mapData format (array of FeatureCollections)
                const features = Array.isArray(data)
                    ? data.flatMap(fc => fc.features || [])
                    : (data.features || []);

                features.forEach((feature: any, index: number) => {
                    if (!feature.geometry || !feature.geometry.coordinates) return;

                    const props = feature.properties || {};
                    const district = props["Qual o distrito de saúde?"] || 'Outros';
                    const validDistrict = Object.keys(districts).includes(district) ? district : 'Outros';

                    // Randomly assign status for demo (in production this would come from backend)
                    const statuses: Array<'regular' | 'pendente' | 'irregular'> = ['regular', 'regular', 'regular', 'regular', 'pendente', 'irregular'];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                    const point: AcaiPoint = {
                        id: props._id || index + 1,
                        name: props["Nome do ponto de venda ou do proprietário"] || `Ponto ${index + 1}`,
                        owner: props["Nome do ponto de venda ou do proprietário"] || 'Não informado',
                        phone: props["Telefone de contato"] || 'Não informado',
                        district: validDistrict,
                        lat: feature.geometry.coordinates[1],
                        lng: feature.geometry.coordinates[0],
                        status: randomStatus,
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
                const response = await fetch(`${import.meta.env.BASE_URL}data/belem_bairros.geojson`);
                const data = await response.json();
                setBairrosGeoJson(data);
            } catch (error) {
                console.error('Error loading bairros:', error);
            }
        };
        loadBairros();
    }, []);

    const filteredPoints = useMemo(() => {
        return acaiPoints.filter(point => {
            if (selectedDistrict && point.district !== selectedDistrict) return false;
            if (selectedStatus && point.status !== selectedStatus) return false;
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return point.name.toLowerCase().includes(search) || 
                       point.owner.toLowerCase().includes(search) ||
                       point.professional.toLowerCase().includes(search);
            }
            return true;
        });
    }, [acaiPoints, selectedDistrict, selectedStatus, searchTerm]);

    const stats = useMemo(() => ({
        total: acaiPoints.length,
        regular: acaiPoints.filter(p => p.status === 'regular').length,
        pendente: acaiPoints.filter(p => p.status === 'pendente').length,
        irregular: acaiPoints.filter(p => p.status === 'irregular').length,
    }), [acaiPoints]);

    const getDistrictColor = (district: string) => {
        return districts[district]?.color || '#6b7280';
    };

    return (
        <div className="h-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-96 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
                    {/* Stats Cards */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-xs font-medium">Total Cadastrados</span>
                                </div>
                                <p className="text-2xl font-black text-white">{loading ? '...' : stats.total}</p>
                            </div>
                            <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/30">
                                <div className="flex items-center gap-2 text-green-400 mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Regulares</span>
                                </div>
                                <p className="text-2xl font-black text-green-400">{loading ? '...' : stats.regular}</p>
                            </div>
                            <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30">
                                <div className="flex items-center gap-2 text-amber-400 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium">Pendentes</span>
                                </div>
                                <p className="text-2xl font-black text-amber-400">{loading ? '...' : stats.pendente}</p>
                            </div>
                            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/30">
                                <div className="flex items-center gap-2 text-red-400 mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Irregulares</span>
                                </div>
                                <p className="text-2xl font-black text-red-400">{loading ? '...' : stats.irregular}</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-4 border-b border-slate-700 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou proprietário..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-between w-full p-2.5 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Filter className="w-4 h-4" /> Filtros
                            </span>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showFilters && "rotate-180")} />
                        </button>

                        {showFilters && (
                            <div className="space-y-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600 animate-in slide-in-from-top-2">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Distrito</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(districts).filter(([key]) => districtCounts[key] > 0).map(([key, dist]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedDistrict(selectedDistrict === key ? null : key)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                                                    selectedDistrict === key
                                                        ? "text-white shadow-lg"
                                                        : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                                                )}
                                                style={selectedDistrict === key ? { backgroundColor: dist.color } : {}}
                                            >
                                                {key} ({districtCounts[key] || 0})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Status</p>
                                    <div className="flex gap-2">
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                    selectedStatus === key
                                                        ? config.color
                                                        : "bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500"
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

                    {/* Points List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-2">
                                {loading ? 'Carregando...' : `${filteredPoints.length} pontos encontrados`}
                            </p>
                            <div className="space-y-1">
                                {filteredPoints.slice(0, 100).map(point => {
                                    const status = statusConfig[point.status];
                                    const StatusIcon = status.icon;
                                    const districtColor = getDistrictColor(point.district);

                                    return (
                                        <button
                                            key={point.id}
                                            onClick={() => setSelectedPoint(point)}
                                            className={cn(
                                                "w-full p-3 rounded-lg text-left transition-all hover:bg-slate-700/50",
                                                selectedPoint?.id === point.id && "bg-slate-700 ring-2 ring-purple-500"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                                                    style={{ backgroundColor: districtColor }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-100 truncate">{point.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{point.professional}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", status.color)}>
                                                            {status.label}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">{point.district}</span>
                                                    </div>
                                                </div>
                                                <StatusIcon className={cn("w-4 h-4 flex-shrink-0",
                                                    point.status === 'regular' && "text-green-400",
                                                    point.status === 'pendente' && "text-amber-400",
                                                    point.status === 'irregular' && "text-red-400"
                                                )} />
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredPoints.length > 100 && (
                                    <p className="text-xs text-center text-slate-500 py-2">
                                        Mostrando 100 de {filteredPoints.length} pontos
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                            <div className="text-center">
                                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-400">Carregando mapa...</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            center={[-1.455, -48.49]}
                            zoom={12}
                            className="h-full w-full"
                            style={{ background: '#1e293b' }}
                            preferCanvas={true}
                        >
                            {/* Dark theme tile layer */}
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            {/* Fly to selected point */}
                            <FlyToPoint point={selectedPoint} />

                            {/* Handle map clicks */}
                            <MapEvents onMapClick={() => setSelectedPoint(null)} />

                             {/* Animated pulse for selection */}
                             <SelectedPointPulse point={selectedPoint} />

                             {/* Auto-fit municipality bounds on load */}
                             <FitMunicipalityBounds geojson={bairrosGeoJson} />

                            {/* Bairros layer - subtle boundaries behind points */}
                            {bairrosGeoJson && (
                                <GeoJSON
                                    data={bairrosGeoJson}
                                    style={() => ({
                                        color: '#a855f7',
                                        weight: 1,
                                        opacity: 0.4,
                                        fillColor: '#a855f7',
                                        fillOpacity: 0.03,
                                        interactive: false
                                    })}
                                    onEachFeature={() => { }} // Nomes dos bairros removidos por redundância
                                />
                            )}

                            {/* Açaí point markers - Optimized with Memoization and Canvas */}
                            {filteredPoints.map(point => (
                                <MemoizedAcaiMarker
                                    key={point.id}
                                    point={point}
                                    isSelected={selectedPoint?.id === point.id}
                                    anySelected={!!selectedPoint}
                                    onClick={() => setSelectedPoint(point)}
                                    districtColor={getDistrictColor(point.district)}
                                />
                            ))}

                            {/* User location marker */}
                            {userLocation && (
                                <CircleMarker
                                    center={userLocation}
                                    radius={10}
                                    pathOptions={{
                                        fillColor: '#3b82f6',
                                        color: '#fff',
                                        weight: 3,
                                        opacity: 1,
                                        fillOpacity: 1
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-bold text-blue-600">Sua localização</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}

                            {/* Fly to user location */}
                            <FlyToLocation location={userLocation} />
                        </MapContainer>
                    )}

                    {/* Map controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                        <button
                            onClick={handleLocateUser}
                            disabled={locatingUser}
                            className={cn(
                                "w-10 h-10 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-blue-400 transition-all",
                                locatingUser && "animate-pulse"
                            )}
                            title="Centralizar na minha localização"
                        >
                            {locatingUser ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Navigation className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Legend overlay */}
                    <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 min-w-[220px] z-[1000]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distritos Sanitários</p>
                        <div className="space-y-2">
                            {Object.entries(districts).filter(([key]) => districtCounts[key] > 0).map(([key, dist]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedDistrict(selectedDistrict === key ? null : key)}
                                    className={cn(
                                        "flex items-center gap-2 w-full p-1.5 rounded-lg transition-colors",
                                        selectedDistrict === key ? "bg-slate-700" : "hover:bg-slate-700/50"
                                    )}
                                >
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dist.color }} />
                                    <span className="text-xs text-slate-300 flex-1 text-left">{key === 'Outros' ? dist.name : key}</span>
                                    <span className="text-xs font-bold text-slate-400">{districtCounts[key] || 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected point info card */}
                    {selectedPoint && (
                        <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 w-80 shadow-2xl z-[1000] animate-in slide-in-from-left-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-bold text-white truncate">{selectedPoint.name}</p>
                                    <p className="text-sm text-slate-400 truncate">{selectedPoint.owner}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPoint(null)}
                                    className="text-slate-500 hover:text-slate-300 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-300">{selectedPoint.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-300">{districts[selectedPoint.district]?.name || selectedPoint.district}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-300 truncate">Cadastrado por: {selectedPoint.professional}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-300">{new Date(selectedPoint.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded-full border",
                                    statusConfig[selectedPoint.status].color
                                )}>
                                    {statusConfig[selectedPoint.status].label}
                                </span>
                                <button className="flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 gap-1.5">
                                    <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcaiMapPage;
