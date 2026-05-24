import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, useLocation } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import { cn } from '../lib/utils';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    ArrowUpDown,
    Download,
    Building2,
    Clock,
    LayoutGrid,
    List,
    Lock,
    FileText,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

// Mock data - expanded with sector and category information
const allTriageData = [
    // Medicamentos sector (shown first for manager) - LICENCIAMENTO
    { id: '2026.01.0042', company: 'Farmácia Vida Nova Ltda', type: 'Renovação', division: 'DVSDM', sector: 'Medicamentos', category: 'licenciamento', date: 'Hoje, 14:32', status: 'pending', priority: 'high' },
    { id: '2026.01.0039', company: 'Farmácia ExtraFarma', type: 'Primeira Licença', division: 'DVSDM', sector: 'Medicamentos', category: 'licenciamento', date: 'Hoje, 09:15', status: 'review', priority: 'high' },
    { id: '2026.01.0035', company: 'Farmácia do Bairro ME', type: 'Renovação', division: 'DVSDM', sector: 'Medicamentos', category: 'licenciamento', date: 'Ontem, 16:20', status: 'pending', priority: 'medium' },
    { id: '2026.01.0031', company: 'Distribuidora Farma Norte', type: 'Renovação', division: 'DVSDM', sector: 'Medicamentos', category: 'licenciamento', date: '08/01/2026', status: 'approved', priority: 'low' },
    { id: '2026.01.0028', company: 'Drogaria Saúde & Vida', type: 'Renovação', division: 'DVSDM', sector: 'Medicamentos', category: 'licenciamento', date: '07/01/2026', status: 'pending', priority: 'medium' },

    // Other sectors - LICENCIAMENTO
    { id: '2026.01.0041', company: 'Restaurante Sabor do Pará', type: 'Primeira Licença', division: 'DVSA', sector: 'Alimentos', category: 'licenciamento', date: 'Hoje, 10:15', status: 'review', priority: 'medium' },
    { id: '2026.01.0040', company: 'Clínica Saúde Total', type: 'Primeira Licença', division: 'DVSCEP', sector: 'Saúde', category: 'licenciamento', date: 'Ontem, 16:45', status: 'pending', priority: 'low' },
    { id: '2026.01.0038', company: 'Escola Aprender ME', type: 'Primeira Licença', division: 'DVSE', sector: 'Engenharia', category: 'licenciamento', date: '06/01/2026', status: 'rejected', priority: 'high' },
    { id: '2026.01.0037', company: 'Padaria Pão Quente', type: 'Renovação', division: 'DVSA', sector: 'Alimentos', category: 'licenciamento', date: '05/01/2026', status: 'approved', priority: 'medium' },
    { id: '2026.01.0036', company: 'Hospital Veterinário Pet', type: 'Primeira Licença', division: 'DVSCEP', sector: 'Saúde', category: 'licenciamento', date: '04/01/2026', status: 'review', priority: 'high' },

    // DIVERSOS - From user image and requests
    { id: '2026.01.0045', company: 'Farmácia Popular Belém', type: '2ª via de Licença', division: 'DVSDM', sector: 'Medicamentos', category: 'diversos', date: 'Hoje, 16:20', status: 'pending', priority: 'low' },
    { id: '2026.01.0046', company: 'Hospital da Cidade', type: 'Carta de Crédito', division: 'DVSCEP', sector: 'Saúde', category: 'diversos', date: 'Ontem, 09:30', status: 'review', priority: 'medium' },
    { id: '2026.01.0047', company: 'Drogaria Central', type: 'Cadastro de Base Misoprostol', division: 'DVSDM', sector: 'Medicamentos', category: 'diversos', date: 'Hoje, 11:15', status: 'pending', priority: 'high' },
    { id: '2025.08.0156', company: 'Restaurante Sabor do Pará', type: 'Auto de Infração', division: 'DVSA', sector: 'Alimentos', category: 'diversos', date: '20/09/2025', status: 'rejected', priority: 'high' },
    { id: '2025.10.0198', company: 'Clínica Saúde Total', type: 'Desinterdição de Estabelecimento', division: 'DVSCEP', sector: 'Saúde', category: 'diversos', date: '05/11/2025', status: 'approved', priority: 'medium' },
    { id: '2025.11.0289', company: 'Laboratório Bio', type: 'Aprovação de Projeto Arquitetônico', division: 'DVSE', sector: 'Engenharia', category: 'diversos', date: '15/12/2025', status: 'approved', priority: 'medium' },
    { id: '2025.12.0412', company: 'Indústria Alimenta', type: 'Inspeção para Início de Atividade', division: 'DVSA', sector: 'Alimentos', category: 'diversos', date: '28/12/2025', status: 'approved', priority: 'high' },
];

export const TriageQueue = () => {
    const { role, userProfile } = useMode();
    const location = useLocation();
    const isProtocol = role === 'admin_protocol';
    const isManager = role === 'admin_manager_medicamentos';
    const isDiversos = location.pathname.includes('/diversos');

    // Toggle to show all sectors or only user's sector
    const [showAllSectors, setShowAllSectors] = useState(false);

    // Filter data based on role, toggle and category
    const getFilteredData = () => {
        const baseData = allTriageData.filter(item => isDiversos ? item.category === 'diversos' : item.category === 'licenciamento');

        if (isProtocol) {
            // Protocol sees everything in the category
            return baseData;
        }

        if (isManager && !showAllSectors) {
            // Manager sees only their sector by default
            return baseData.filter(item => item.sector === userProfile.sector);
        }

        // Manager with toggle ON sees all in the category
        return baseData;
    };

    const filteredData = getFilteredData();

    // Pagination info
    const totalProcessesSector = 127; // Mock: processes in manager's sector
    const totalProcessesAll = 842; // Mock: all processes
    const currentTotal = isManager && !showAllSectors ? totalProcessesSector : totalProcessesAll;

    // Check if user can edit a process
    const canEdit = (item: typeof allTriageData[0]) => {
        if (isProtocol) return true;
        if (isManager && item.sector === userProfile.sector) return true;
        return false;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {isDiversos ? 'Processos Diversos' : (isProtocol ? 'Triagem de Protocolo' : 'Processos de Licenciamento')}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isManager
                            ? `Gerenciamento de ${isDiversos ? 'processos diversos' : 'licenciamento sanitário'} - Setor: ${userProfile.sector}`
                            : `Gerenciamento de solicitações de ${isDiversos ? 'processos diversos' : 'licenciamento sanitário'}.`
                        }
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm"><List className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><LayoutGrid className="w-4 h-4" /></Button>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-white text-xs font-bold uppercase tracking-widest border-gray-200">
                        <Download className="w-4 h-4" /> Relatório
                    </Button>
                </div>
            </div>

            {/* Manager Sector Filter Toggle */}
            {isManager && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">Filtro de Setor</p>
                            <p className="text-xs text-blue-600">
                                {showAllSectors
                                    ? `Exibindo todos os ${totalProcessesAll} processos de todos os setores`
                                    : `Exibindo ${totalProcessesSector} processos do setor ${userProfile.sector}`
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAllSectors(!showAllSectors)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                        {showAllSectors ? (
                            <ToggleRight className="w-6 h-6 text-blue-600" />
                        ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                            {showAllSectors ? 'Todos os Setores' : 'Somente Meu Setor'}
                        </span>
                    </button>
                </div>
            )}

            <Card noPadding className="overflow-hidden border-gray-200 shadow-sm bg-white rounded-xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-white">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar por protocolo, contribuinte ou documento..."
                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 border-gray-200 text-gray-600">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Filtros</span>
                        </Button>
                        <div className="h-10 w-px bg-gray-100 mx-1"></div>
                        <select className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-wide rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>Status: Todos</option>
                            <option>Pendente</option>
                            <option>Em Análise</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Protocolo <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estabelecimento</div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assunto</div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Setor</div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entrada</div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
                                </th>
                                <th className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ações</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.map((row) => {
                                const isReadOnly = !canEdit(row);
                                return (
                                    <tr key={row.id} className={`transition-all group ${isReadOnly ? 'bg-gray-50/30' : 'hover:bg-blue-50/30'}`}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {isReadOnly ? (
                                                    <span title="Somente leitura">
                                                        <Lock className="w-3 h-3 text-gray-400 opacity-60" />
                                                    </span>
                                                ) : (
                                                    <FileText className="w-3 h-3 text-blue-500/50" />
                                                )}
                                                <Link to={row.company === 'Distribuidora Farma Norte' ? '/admin/processo/concluido' : `/admin/processo/${row.id.replace(/\./g, '')}`} className={`font-mono text-xs font-bold transition-colors ${isReadOnly ? 'text-gray-400 hover:text-gray-600' : 'text-gray-900 hover:text-blue-600'}`}>
                                                    {row.id}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${isReadOnly ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`font-bold tracking-tight leading-none ${isReadOnly ? 'text-gray-500' : 'text-gray-800'}`}>{row.company}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold mt-1">{row.division}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`font-medium ${isReadOnly ? 'text-gray-400' : 'text-gray-600'}`}>{row.type}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.sector === userProfile.sector
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {row.sector}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center gap-1.5 font-medium ${isReadOnly ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                {row.date}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center">
                                                <StatusBadge status={row.status} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={row.company === 'Distribuidora Farma Norte' ? '/admin/processo/concluido' : `/admin/processo/${row.id.replace(/\./g, '')}`}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {!isReadOnly && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>
                        Exibindo {filteredData.length} de {currentTotal} processos
                        {isManager && !showAllSectors && (
                            <span className="ml-2 text-blue-600 normal-case">• Setor {userProfile.sector}</span>
                        )}
                    </span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500 normal-case text-xs">
                            <span>Página</span>
                            <select className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>...</option>
                                <option>{Math.ceil(currentTotal / 5)}</option>
                            </select>
                            <span>de {Math.ceil(currentTotal / 5)}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-8 text-[10px] px-3 font-bold border-gray-200">Anterior</Button>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] px-3 font-bold border-gray-200">Próximo</Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Legend for Manager */}
            {isManager && showAllSectors && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>Processos de outros setores são <strong>somente leitura</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></span>
                        <span>Processos do seu setor ({userProfile.sector})</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        pending: { label: 'Aguardando', className: 'bg-amber-400 hover:bg-amber-500' },
        review: { label: 'Em Análise', className: 'bg-blue-500 hover:bg-blue-600' },
        approved: { label: 'Deferido', className: 'bg-emerald-500 hover:bg-emerald-600' },
        rejected: { label: 'Indeferido', className: 'bg-red-500 hover:bg-red-600' },
    };
    const config = styles[status as keyof typeof styles] || styles.pending;

    return (
        <Badge
            className={cn(
                "text-white font-medium px-3 py-0.5 rounded-full border-none transition-colors",
                config.className
            )}
        >
            {config.label}
        </Badge>
    );
};
