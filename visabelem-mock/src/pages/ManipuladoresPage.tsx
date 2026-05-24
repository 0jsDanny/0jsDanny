import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    ChefHat,
    Search,
    Plus,
    Download,
    Filter,
    Calendar,
    Users,
    Award,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Eye,
    FileText,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    MapPin
} from 'lucide-react';

import { cn } from '../lib/utils';

// Mock data for food handlers
const manipuladores = [
    { id: 'MAN-2026-0001', nome: 'Maria Silva Santos', cpf: '***.***.***-01', curso: 'Boas Práticas de Manipulação', dataEmissao: '08/01/2026', validade: '31/03/2027', status: 'valid', empresa: 'Restaurante Sabor do Pará' },
    { id: 'MAN-2026-0002', nome: 'João Pedro Oliveira', cpf: '***.***.***-02', curso: 'Boas Práticas de Manipulação', dataEmissao: '07/01/2026', validade: '07/01/2027', status: 'valid', empresa: 'Padaria Belém' },
    { id: 'MAN-2026-0003', nome: 'Ana Clara Costa', cpf: '***.***.***-03', curso: 'Boas Práticas de Manipulação', dataEmissao: '05/01/2026', validade: '05/01/2027', status: 'valid', empresa: 'Supermercado Central' },
    { id: 'MAN-2025-0845', nome: 'Carlos Eduardo Lima', cpf: '***.***.***-04', curso: 'Boas Práticas de Manipulação', dataEmissao: '10/01/2025', validade: '10/01/2026', status: 'expiring', empresa: 'Açaiteria Tropical' },
    { id: 'MAN-2024-0321', nome: 'Fernanda Rodrigues', cpf: '***.***.***-05', curso: 'Boas Práticas de Manipulação', dataEmissao: '15/06/2024', validade: '15/06/2025', status: 'expired', empresa: 'Lanchonete do Porto' },
];

const estatisticas = [
    { label: 'Certificados Ativos', value: '8.432', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Emitidos este Mês', value: '156', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Próximos a Vencer', value: '89', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Turmas Agendadas', value: '12', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export const ManipuladoresPage = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <ChefHat className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manipuladores de Alimentos</h1>
                            <p className="text-gray-500 text-sm">Gestão de certificados de capacitação em boas práticas</p>
                        </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        🚧 Fase de Migração / Refatoração
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 text-xs">
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                        <Plus className="w-4 h-4" /> Nova Turma
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {estatisticas.map((stat, i) => (
                    <Card key={i} className="border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Upcoming Classes */}
            <Card className="border-gray-200 shadow-sm relative group/carousel">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Próximas Turmas Curadas</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Capacitação Presencial</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 mr-4">
                            <button
                                onClick={() => {
                                    const container = document.getElementById('turmas-carousel');
                                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-400 hover:text-blue-600"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button
                                onClick={() => {
                                    const container = document.getElementById('turmas-carousel');
                                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-400 hover:text-blue-600"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <Button variant="ghost" className="text-xs font-black uppercase text-blue-600 tracking-widest hover:bg-blue-50">Ver todas</Button>
                    </div>
                </div>

                <div
                    id="turmas-carousel"
                    className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {[
                        { id: 1, titulo: 'Boas Práticas de Manipulação', data: '15/01/2026', horario: '08:00 - 12:00', vagas: 25, inscritos: 18, local: 'Auditório SESMA' },
                        { id: 2, titulo: 'Manipulação de Alimentos', data: '22/01/2026', horario: '14:00 - 18:00', vagas: 30, inscritos: 30, local: 'SEST SENAT' },
                        { id: 3, titulo: 'Curso para Batedor de Açaí', data: '25/01/2026', horario: '08:00 - 12:00', vagas: 40, inscritos: 35, local: 'Casa do Açaí' },
                        { id: 4, titulo: 'Boas Práticas de Manipulação', data: '29/01/2026', horario: '08:00 - 12:00', vagas: 25, inscritos: 5, local: 'Auditório SESMA' },
                        { id: 5, titulo: 'Ação Externa / Boas Práticas', data: '05/02/2026', horario: '09:00 - 13:00', vagas: 100, inscritos: 42, local: 'Feira do Ver-o-Peso' },
                    ].map((turma) => (
                        <div
                            key={turma.id}
                            className={cn(
                                "min-w-[300px] md:min-w-[320px] p-5 rounded-2xl border transition-all duration-300 snap-start shrink-0 relative overflow-hidden",
                                turma.inscritos === turma.vagas
                                    ? 'bg-red-50/50 border-red-100 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{turma.data}</p>
                                    <h4 className="font-bold text-gray-900 leading-tight">{turma.titulo}</h4>
                                </div>
                                {turma.inscritos === turma.vagas ? (
                                    <span className="bg-red-100 text-red-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Lotada</span>
                                ) : (
                                    <span className="bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Aberta</span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-medium">{turma.horario}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700 truncate">{turma.local}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                                <Users className="w-2.5 h-2.5 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase ml-1">
                                        {turma.inscritos}/{turma.vagas} Inscritos
                                    </span>
                                </div>

                                <button className={cn(
                                    "text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all",
                                    turma.inscritos === turma.vagas
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-600 hover:bg-blue-50"
                                )}>
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Certificate List */}
            <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-white">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar por nome, CPF ou empresa..."
                            className="pl-10 bg-gray-50 border-gray-200"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Filtros</span>
                        </Button>
                        <select className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-wide rounded-lg px-4">
                            <option>Status: Todos</option>
                            <option>Válido</option>
                            <option>A Vencer</option>
                            <option>Vencido</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Certificado</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manipulador</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Empresa</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Emissão</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Validade</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {manipuladores.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-xs font-bold text-gray-900">{m.id}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-bold text-gray-800">{m.nome}</p>
                                            <p className="text-[10px] text-gray-400">CPF: {m.cpf}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-gray-600">{m.empresa}</span>
                                    </td>
                                    <td className="px-4 py-4 text-gray-500">{m.dataEmissao}</td>
                                    <td className="px-4 py-4 text-gray-500">{m.validade}</td>
                                    <td className="px-4 py-4 text-center">
                                        <StatusBadge status={m.status} />
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Mostrando 5 de 8.432 certificados</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 text-[10px] px-3">Anterior</Button>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] px-3">Próximo</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        valid: { label: 'Válido', icon: CheckCircle, className: 'bg-emerald-500' },
        expiring: { label: 'A Vencer', icon: Clock, className: 'bg-amber-400' },
        expired: { label: 'Vencido', icon: AlertCircle, className: 'bg-red-500' },
    };
    const config = styles[status as keyof typeof styles] || styles.valid;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-medium text-white ${config.className}`}>
            <config.icon className="w-3 h-3 text-white/90" />
            {config.label}
        </span>
    );
};
