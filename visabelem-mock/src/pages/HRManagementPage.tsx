
import { useState } from 'react';
import {
    Users,
    FileText,
    Calendar,
    Printer,
    BriefcaseMedical,
    Search,
    Filter,
    Plus,
    Download,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileCheck,
    Building2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// --- MOCK DATA ---

const SERVERS_DATA = [
    { id: 1, matricula: '012345-6', nome: 'ANA CLAUDIA SILVA', cargo: 'Fiscal Sanitário', setor: 'Alimentos (DVSA)', status: 'Ativo', vinculo: 'Efetivo' },
    { id: 2, matricula: '023456-7', nome: 'ROBERTO ALMEIDA SANTOS', cargo: 'Agente Administrativo', setor: 'Protocolo', status: 'Ativo', vinculo: 'Temporário' },
    { id: 3, matricula: '034567-8', nome: 'MARIA FERNANDA COSTA', cargo: 'Farmacêutico Bioquímico', setor: 'Medicamentos (DVSDM)', status: 'Licença Médica', vinculo: 'Efetivo' },
    { id: 4, matricula: '045678-9', nome: 'JOAO PEDRO OLIVEIRA', cargo: 'Engenheiro Civil', setor: 'Engenharia', status: 'Férias', vinculo: 'Efetivo' },
    { id: 5, matricula: '056789-0', nome: 'LUCIA MENDES PEREIRA', cargo: 'Médico Veterinário', setor: 'Alimentos (DVSA)', status: 'Ativo', vinculo: 'Efetivo' },
    { id: 6, matricula: '067890-1', nome: 'CARLOS EDUARDO LIMA', cargo: 'Motorista', setor: 'Transporte', status: 'Ativo', vinculo: 'Terceirizado' },
];

const LEAVES_DATA = [
    { id: 1, servidor: 'MARIA FERNANDA COSTA', tipo: 'Licença Médica', inicio: '10/01/2026', fim: '25/01/2026', dias: 15, status: 'Aprovado', documento: 'Atestado_Medical.pdf' },
    { id: 2, servidor: 'JOAO PEDRO OLIVEIRA', tipo: 'Férias', inicio: '02/01/2026', fim: '31/01/2026', dias: 30, status: 'Em andamento', documento: 'Solicitacao_Ferias.pdf' },
    { id: 3, servidor: 'ANA CLAUDIA SILVA', tipo: 'Declaração de Comparecimento', inicio: '12/01/2026', fim: '12/01/2026', dias: 1, status: 'Pendente', documento: 'Declaracao_Consulta.pdf' },
];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'Ativo': 'bg-green-100 text-green-700 border-green-200',
        'Licença Médica': 'bg-amber-100 text-amber-700 border-amber-200',
        'Férias': 'bg-blue-100 text-blue-700 border-blue-200',
        'Aprovado': 'bg-green-100 text-green-700 border-green-200',
        'Em andamento': 'bg-blue-100 text-blue-700 border-blue-200',
        'Pendente': 'bg-orange-100 text-orange-700 border-orange-200',
    };

    const defaultStyle = 'bg-gray-100 text-gray-700 border-gray-200';
    const chosenStyle = styles[status] || defaultStyle;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${chosenStyle}`}>
            {status}
        </span>
    );
};

export const HRManagementPage = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'frequency' | 'leaves'>('overview');
    const [selectedMonth, setSelectedMonth] = useState('Janeiro/2026');

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Pessoas (RH)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gerenciamento de servidores, frequências e afastamentos - DEVISA
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-white">
                        <FileCheck className="w-4 h-4" /> Relatórios
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                        <Plus className="w-4 h-4" /> Novo Servidor
                    </Button>
                </div>
            </div>

            {/* Stats Cards (Overview) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-gray-500">Total de Servidores</p>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">48</p>
                        <span className="text-xs text-green-600 font-medium">+2 este mês</span>
                    </div>
                </Card>
                <Card className="p-4 border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-gray-500">Em Férias</p>
                        <Calendar className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">4</p>
                        <span className="text-xs text-gray-500">Retornam em 15 dias</span>
                    </div>
                </Card>
                <Card className="p-4 border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-gray-500">Licenças Médicas</p>
                        <BriefcaseMedical className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">2</p>
                        <span className="text-xs text-gray-500">Atestados ativos</span>
                    </div>
                </Card>
                <Card className="p-4 border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-gray-500">Folhas Pendentes</p>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <span className="text-xs text-amber-600 font-medium">Jan/2026</span>
                    </div>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('servers')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'servers'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Servidores
                    </button>
                    <button
                        onClick={() => setActiveTab('frequency')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'frequency'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Controle de Frequência
                    </button>
                    <button
                        onClick={() => setActiveTab('leaves')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaves'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Atestados e Licenças
                    </button>
                </nav>
            </div>

            {/* Content Areas */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* SERVERS TAB */}
                {activeTab === 'servers' && (
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar servidor..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="w-4 h-4" /> Filtros
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" /> Exportar Lista
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Matrícula</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Nome</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Cargo / Função</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Setor</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Vínculo</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {SERVERS_DATA.map((server) => (
                                        <tr key={server.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{server.matricula}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{server.nome}</td>
                                            <td className="px-4 py-3 text-gray-600">{server.cargo}</td>
                                            <td className="px-4 py-3 text-gray-600">{server.setor}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                    {server.vinculo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={server.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* FREQUENCY TAB */}
                {activeTab === 'frequency' && (
                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm p-6 bg-gradient-to-br from-indigo-50 to-white">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                        <Printer className="w-5 h-5" />
                                        Gerador de Folha de Frequência
                                    </h3>
                                    <p className="text-sm text-indigo-700 mt-1 max-w-xl">
                                        Gere as folhas de ponto individuais para assinatura manual. O sistema preenche automaticamente os dias úteis, feriados e ocorrências lançadas.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm">
                                    <Calendar className="w-5 h-5 text-gray-500 ml-2" />
                                    <select
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 cursor-pointer"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        <option>Janeiro/2026</option>
                                        <option>Fevereiro/2026</option>
                                        <option>Março/2026</option>
                                    </select>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                        Gerar PDF em Lote
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-gray-200 shadow-sm p-4">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    Pendências de Assinatura (Mês Anterior)
                                </h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                    AS
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Ana Claudia Silva</p>
                                                    <p className="text-xs text-gray-500">Dezembro/2025</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 text-xs">
                                                Notificar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="border-gray-200 shadow-sm p-4">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-gray-500" />
                                    Ocorrências do Mês Atual
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="mt-0.5">
                                            <BriefcaseMedical className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Maria Fernanda Costa</p>
                                            <p className="text-xs text-blue-700">Licença Médica (10/01 - 25/01)</p>
                                            <p className="text-[10px] text-blue-600 mt-1">Lançado automaticamente na folha</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <div className="mt-0.5">
                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-amber-900">Roberto Almeida</p>
                                            <p className="text-xs text-amber-700">Falta não justificada (05/01)</p>
                                            <p className="text-[10px] text-amber-600 mt-1">Aguardando justificativa</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* LEAVES TAB */}
                {activeTab === 'leaves' && (
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Histórico de Afastamentos</h3>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" /> Filtrar Status
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Servidor</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Tipo</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Período</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Dias</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Documento</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {LEAVES_DATA.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{leave.servidor}</td>
                                            <td className="px-4 py-3 text-gray-600">{leave.tipo}</td>
                                            <td className="px-4 py-3 text-gray-600">{leave.inicio} até {leave.fim}</td>
                                            <td className="px-4 py-3 font-mono text-gray-600">{leave.dias} dias</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                                                    <FileText className="w-3 h-3" />
                                                    <span className="text-xs">{leave.documento}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={leave.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* OVERVIEW TAB CONTENT (Extra Dashboard Widgets) */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Card className="p-6 border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Lembretes do RH</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                                    <p className="text-sm text-gray-600">Enviar prévia da frequência de Fevereiro até dia 25/01.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                    <p className="text-sm text-gray-600">Avaliação de desempenho dos estagiários pendente.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                    <p className="text-sm text-gray-600">Revisão de laudos de insalubridade agendada para sexta-feira.</p>
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6 border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Acesso Rápido</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 items-center justify-center text-center">
                                    <Building2 className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs font-medium">Lotação e Setores</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 items-center justify-center text-center">
                                    <FileText className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs font-medium">Modelos de Declaração</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 items-center justify-center text-center">
                                    <Clock className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs font-medium">Banco de Horas</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 items-center justify-center text-center">
                                    <CheckCircle2 className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs font-medium">Validação de Folha</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
