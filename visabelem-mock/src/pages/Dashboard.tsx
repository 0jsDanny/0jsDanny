import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    FileCheck,
    Users,
    ArrowUp,
    Activity,
    BarChart2,
    ChevronRight,
    Briefcase,
    FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon: LucideIcon;
    color: string;
}

interface StatusBoxProps {
    label: string;
    count: number;
    color: string;
    total: number;
}

// Mock recent triage data
const recentTriage = [
    { id: '1', protocol: '2026.01.0042', requester: 'Farmácia Vida Nova Ltda', type: 'Primeira Licença', date: '2026-01-10', status: 'Pendente' },
    { id: '2', protocol: '2026.01.0041', requester: 'Restaurante Sabor do Pará', type: 'Renovação', date: '2026-01-10', status: 'Deferido' },
    { id: '3', protocol: '2026.01.0040', requester: 'Clínica Saúde Total', type: 'Renovação', date: '2026-01-09', status: 'Pendente' },
    { id: '4', protocol: '2026.01.0039', requester: 'Mercadinho do Bairro', type: 'Renovação', date: '2026-01-08', status: 'Deferido' },
    { id: '5', protocol: '2026.01.0038', requester: 'Escola Aprender ME', type: 'Primeira Licença', date: '2026-01-07', status: 'Indeferido' },
];

// Status Stats Mock
const statusStats = {
    deferidos: 856,
    indeferidos: 42,
    pendentes: 128,
    emAnalise: 258,
};

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }: StatCardProps) => {
    // Generate simple SVG path values for sparklines based on title
    const getSparklinePath = () => {
        if (title.includes("Aprovação")) return "M 0,25 Q 15,10 30,22 T 60,8 T 90,5 T 120,2";
        if (title.includes("Triagem")) return "M 0,10 Q 15,30 30,12 T 60,25 T 90,8 T 120,18";
        if (title.includes("Pendentes")) return "M 0,28 Q 15,20 30,10 T 60,18 T 90,30 T 120,26";
        return "M 0,20 Q 15,15 30,25 T 60,10 T 90,12 T 120,5";
    };

    return (
        <div className="relative overflow-hidden p-5 rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white group h-full flex flex-col justify-between">
            {/* Sparkline Graphic Background */}
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 120 30" preserveAspectRatio="none">
                    <path
                        d={getSparklinePath()}
                        fill="none"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <div className="flex justify-between items-start z-10">
                <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mb-1" title={title}>
                        {title}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110 ${
                    color === 'bg-blue-500' ? 'bg-slate-50 text-slate-700 border-slate-100' :
                    color === 'bg-indigo-500' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                    color === 'bg-orange-500' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="mt-4 flex items-center text-xs z-10">
                <span className={`flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {change}
                </span>
                <span className="ml-2 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Últ. semana</span>
            </div>
        </div>
    );
};

const StatusBox = ({ label, count, color, total }: StatusBoxProps) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    // Map standard color class names to custom styles
    const getProgressColors = () => {
        if (color === 'bg-green-500') return 'from-emerald-400 to-teal-500 shadow-emerald-500/10';
        if (color === 'bg-red-500') return 'from-rose-400 to-red-500 shadow-red-500/10';
        if (color === 'bg-blue-500') return 'from-sky-400 to-slate-600 shadow-sky-500/10';
        return 'from-amber-400 to-orange-500 shadow-amber-500/10';
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">({count})</span>
                    <span className="font-black text-slate-800">{percentage}%</span>
                </div>
            </div>
            <div className="w-full rounded-lg h-2.5 bg-slate-50 border border-slate-100 p-0.5 overflow-hidden">
                <div 
                    className={`bg-gradient-to-r ${getProgressColors()} h-full rounded-md shadow-sm transition-all duration-1000 ease-out`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const navigate = useNavigate();
    const statusTotal = statusStats.deferidos + statusStats.indeferidos + statusStats.pendentes + statusStats.emAnalise;

    return (
        <main className="flex-1 overflow-y-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md uppercase">
                        Painel de Controle
                    </span>
                    <h1 className="text-2xl font-black text-slate-800 mt-1.5">Dashboard Geral</h1>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    <span>VisaBelém</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-700">Dashboard</span>
                </div>
            </div>

            {/* Stats Section */}
            <div>
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Visão Geral Operacional</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Solic. Respondidas"
                        value="1,284"
                        change="+12"
                        isPositive={true}
                        icon={FileCheck}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Em Triagem"
                        value="42"
                        change="-5"
                        isPositive={true}
                        icon={Briefcase}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Pendentes"
                        value="128"
                        change="+8"
                        isPositive={false}
                        icon={Users}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Taxa de Aprovação"
                        value="94.2%"
                        change="+2.1pp"
                        isPositive={true}
                        icon={TrendingUp}
                        color="bg-green-500"
                    />
                </div>
            </div>

            {/* Monitoramento de Produção */}
            <div>
                <div className="flex items-center gap-2.5 mb-6 border-t pt-8 border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Monitoramento de Produção</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status das Solicitações */}
                    <div className="p-6 rounded-2xl shadow-sm bg-white border border-slate-100 flex flex-col h-full">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Status das Solicitações</h3>
                        <div className="space-y-5">
                            <StatusBox label="Aprovados" count={statusStats.deferidos} total={statusTotal} color="bg-green-500" />
                            <StatusBox label="Indeferidos" count={statusStats.indeferidos} total={statusTotal} color="bg-red-500" />
                            <StatusBox label="Em Análise" count={statusStats.emAnalise} total={statusTotal} color="bg-blue-500" />
                            <StatusBox label="Pendentes" count={statusStats.pendentes} total={statusTotal} color="bg-orange-500" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Relatório Mensal</h4>
                                        <p className="text-xs text-slate-400">Referente a Janeiro/2026</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled
                                className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-50 text-slate-400 border border-slate-200/50 cursor-not-allowed"
                                title="Download disponível em breve"
                            >
                                <ArrowUp className="w-4 h-4 rotate-45" />
                                Baixar Relatório PDF
                            </button>
                        </div>
                    </div>

                    {/* Triagem Recente */}
                    <div className="lg:col-span-2 rounded-2xl shadow-sm overflow-hidden bg-white border border-slate-100 flex flex-col justify-between">
                        <div>
                            <div className="p-6 flex justify-between items-center border-b border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Triagem Recente</h3>
                                <button onClick={() => navigate('/admin/triagem/licenciamento')} className="text-xs font-bold text-emerald-600 hover:underline">Ver Todos</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-wider">Protocolo</th>
                                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-wider">Requerente</th>
                                            <th className="hidden sm:table-cell px-6 py-4 font-black text-[9px] uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentTriage.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700">#{item.protocol}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col max-w-[120px] md:max-w-[280px]">
                                                        <span className="font-bold text-slate-800 text-xs truncate">{item.requester}</span>
                                                        <span className="text-[10px] text-slate-400 mt-0.5 truncate">{item.type}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                                                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                                                        item.status === 'Deferido' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        item.status === 'Indeferido' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/processo/${item.protocol.replace(/\./g, '')}`)}
                                                        className="font-black text-[10px] uppercase tracking-wider inline-flex items-center justify-end gap-1 ml-auto text-emerald-600 hover:text-emerald-700 transition-colors"
                                                    >
                                                        <span>Detalhes</span> 
                                                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics CTA */}
            <div>
                <button
                    onClick={() => navigate('/admin/analiticos')}
                    className="w-full p-6 rounded-2xl border border-dashed border-slate-200 hover:border-emerald-500/30 hover:bg-slate-50/50 flex items-center justify-between group transition-all duration-300 bg-white"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform duration-300">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ver Análises Detalhadas</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Explore gráficos de arrecadação, volume de processos e produtividade dos fiscais.</p>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-50 group-hover:text-emerald-600 bg-slate-50 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </button>
            </div>
        </main>
    );
};
