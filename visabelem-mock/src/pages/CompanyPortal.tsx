import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    ChevronRight,
    Calendar,
    Building2,
    History as HistoryIcon,
    ArrowUpRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useMode } from '../contexts/ModeContext';

// Mock data for company processes
const companyProcesses = [
    {
        id: '2026.01.0042',
        type: 'Primeira Licença',
        status: 'Em Análise',
        lastUpdate: '12/01/2026',
        description: 'Processo principal para licenciamento 2026.',
        pendingDocs: 2,
        step: 'Análise de Documentação',
        history: [
            { date: '12/01/2026', status: 'Em Análise', description: 'Documentação enviada para análise técnica.' },
            { date: '10/01/2026', status: 'Aguardando Envio', description: 'Processo iniciado pelo requerente.' }
        ]
    },
    {
        id: '2026.01.0015',
        type: 'Renovação Simplificada',
        status: 'Deferido',
        lastUpdate: '08/01/2026',
        description: 'Renovação anual da Licença Sanitária.',
        pendingDocs: 0,
        step: 'Deferido',
        history: [
            { date: '08/01/2026', status: 'Deferido', description: 'Licença sanitária deferida e emitida.' },
            { date: '05/01/2026', status: 'Em Análise', description: 'Análise documental concluída.' }
        ]
    }
];

const pendingActions = [
    {
        id: 1,
        title: 'Enviar Laudo de Potabilidade da Água',
        origin: 'TI-2026/042-GVDM',
        deadline: '25/01/2026',
        daysLeft: 6,
        urgency: 'high'
    },
    {
        id: 2,
        title: 'Apresentar PGRSS Atualizado',
        origin: 'TI-2026/042-GVDM',
        deadline: '27/01/2026',
        daysLeft: 15,
        urgency: 'medium'
    }
];

export const CompanyPortal = () => {
    const navigate = useNavigate();
    const { userProfile } = useMode();
    
    const activeUnit = userProfile.units?.find(u => u.id === userProfile.activeUnitId) || userProfile.units?.[0];
    const unitName = activeUnit?.name || 'ExtraFarma Nazaré';
    const unitCnpj = activeUnit?.cnpj || '12.345.678/0001-90';
    const unitStatus = activeUnit?.status || 'Regular';

    return (
        <main className="flex-1 space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Boas vindas */}
            <div className="bg-gradient-to-r from-slate-950 via-[#0a192f] to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-950/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Tech glowing background effect */}
                <div className="absolute top-0 right-0 w-[300px] h-[150px] bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
                
                <div className="space-y-2 z-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                            Painel do Estabelecimento
                        </span>
                        {unitStatus === 'Regular' ? (
                            <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Regularizado
                            </span>
                        ) : (
                            <span className="text-[10px] font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Pendências
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Olá, {unitName}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 max-w-xl font-medium">
                        CNPJ: <span className="font-mono text-slate-300">{unitCnpj}</span> • Acompanhe o licenciamento sanitário da sua filial em tempo real.
                    </p>
                </div>
                
                <button
                    onClick={() => navigate('novo-processo')}
                    className="z-10 group relative flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" /> 
                    <span>Iniciar Novo Processo</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden p-6 border border-slate-100 hover:border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Andamento</p>
                                <h3 className="text-2xl font-black text-slate-800">01</h3>
                            </div>
                        </div>
                        
                        {/* Mini circular progress indicator in SVG */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="18" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                                <circle cx="24" cy="24" r="18" stroke="#10b981" strokeWidth="3" fill="transparent"
                                    strokeDasharray="113" strokeDashoffset="75" className="transition-all duration-500" />
                            </svg>
                            <span className="absolute text-[10px] font-bold text-emerald-600">33%</span>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden p-6 border border-slate-100 hover:border-amber-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendências Técnicas</p>
                                <h3 className="text-2xl font-black text-slate-800">02</h3>
                            </div>
                        </div>
                        
                        <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            Ação Exigida
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden p-6 border border-slate-100 hover:border-teal-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Licenças Ativas</p>
                                <h3 className="text-2xl font-black text-slate-800">01</h3>
                            </div>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Active Processes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-slate-400" /> Meus Processos
                        </h2>
                        <button className="text-xs font-bold text-emerald-600 hover:underline">Ver Histórico Completo</button>
                    </div>

                    <div className="space-y-4">
                        {companyProcesses.map((process) => (
                            <Card
                                key={process.id}
                                className="group border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden bg-white hover:shadow-md relative"
                                onClick={() => navigate(`/admin/processo/${process.id.replace(/\./g, '')}`)}
                            >
                                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                                            process.status === 'Deferido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            process.status === 'Arquivado' ? 'bg-slate-50 text-slate-400 border border-slate-100' :
                                            'bg-teal-50/50 text-teal-600 border border-teal-100/50'
                                        } group-hover:scale-105`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-mono font-bold text-slate-400">#{process.id}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border ${
                                                    process.status === 'Deferido' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    process.status === 'Arquivado' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                                                    'bg-teal-50 text-teal-700 border-teal-100'
                                                }`}>
                                                    {process.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{process.type}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{process.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-50 md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Etapa Atual</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">{process.step}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atualização</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">{process.lastUpdate}</p>
                                        </div>
                                        <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300 group-hover:translate-x-0.5">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                {process.pendingDocs > 0 && (
                                    <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-t border-amber-500/10 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-amber-700 flex items-center gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> 
                                            <span>EXISTEM {process.pendingDocs} EXIGÊNCIAS PENDENTES NESTE PROCESSO</span>
                                        </p>
                                        <span className="text-[10px] font-black text-amber-800 underline uppercase tracking-wider group-hover:text-amber-900 transition-colors">Responder Agora</span>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right: Pending Actions & Support */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            Pendências <span className="text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded-full">2</span>
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {pendingActions.map((action) => (
                            <Card key={action.id} className="p-4 border border-slate-100 border-l-4 border-l-amber-500 hover:border-amber-500/20 hover:shadow-md transition-all duration-300 cursor-pointer group bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{action.origin}</span>
                                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-wider">URGENTE</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 group-hover:text-amber-600 transition-colors">{action.title}</h4>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                        <Calendar className="w-3 h-3 text-slate-400" /> 
                                        <span>Prazo: {action.deadline}</span>
                                        <span className="bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md ml-1 animate-pulse whitespace-nowrap">
                                            Faltam {action.daysLeft} dias
                                        </span>
                                    </div>
                                    <div className="p-1 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-300">
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Chat Support Card */}
                    <Card className="flex flex-col h-[380px] overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/50 p-0 bg-white">
                        {/* Header Chat */}
                        <div className="bg-gradient-to-r from-slate-950 to-[#102a43] p-4 flex items-center justify-between border-b border-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white leading-none tracking-wide">Suporte VisaBelém</h3>
                                    <p className="text-[9px] font-bold text-emerald-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                                        <span>Analista de Vigilância</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 p-4 bg-slate-50/50 space-y-4 overflow-y-auto">
                            <div className="flex flex-col items-center mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-slate-100">Hoje</span>
                            </div>

                            <div className="flex items-start gap-2.5 max-w-[85%] animate-in slide-in-from-left-2 duration-300">
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <HistoryIcon className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                        Olá! Como podemos ajudar com seu processo hoje?
                                    </p>
                                    <span className="text-[9px] text-slate-400 mt-1 block">11:30</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                                <div className="bg-gradient-to-br from-slate-950 to-[#102a43] p-3 rounded-2xl rounded-tr-none shadow-md text-white max-w-[85%] animate-in slide-in-from-right-2 duration-300">
                                    <p className="text-xs leading-relaxed font-medium">
                                        Gostaria de saber sobre o prazo do meu alvará.
                                    </p>
                                    <span className="text-[9px] text-slate-400 mt-1 block text-right">11:32</span>
                                </div>
                            </div>
                        </div>

                        {/* Chat Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Digite sua dúvida..."
                                    disabled
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm shadow-emerald-500/10">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                <button className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors">Ver Manuais</button>
                                <button className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors">Legislação</button>
                                <button className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors">Falar com Humano</button>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Access to History */}
                    <Card className="border border-slate-100 bg-white p-5">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <HistoryIcon className="w-4 h-4 text-slate-400" /> Atividade Recente
                        </h3>
                        <div className="space-y-4">
                            {[
                                { date: 'Hoje, 10:45', action: 'Processo #2026.01.0042 atualizado pela GVDM.' },
                                { date: 'Ontem', action: 'Termo de Inspeção recebido por João Silva.' },
                                { date: '08 Jan', action: 'Taxa de Licenciamento confirmada pelo portal.' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-700 leading-tight">{event.action}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
};
