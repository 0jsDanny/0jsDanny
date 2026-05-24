
import { useState } from 'react';
import {
    Users,
    Building2,
    FileText,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Download,
    CheckCircle2,
    Ban
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// --- MOCK DATA ---

const DATA_TALONARIOS = [
    {
        data: '18/03/2026',
        numInicial: '000.061',
        numFinal: '000.110',
        liberado: 50,
        procurador: 'FELIPE COSTA LIMA',
        pj: 'CENTRO DE SAUDE ESCOLA DO MARCO',
        atividade: 'UNIDADE DE SAUDE',
        prescritor: 'EMANUEL J. S. SOUSA',
        conselho: 'CRM',
        numero: '4296',
        especialidade: 'NEUROLOGIA',
        servidor: 'JACILEIA COSTA'
    },
    {
        data: '08/09/2026',
        numInicial: '000.111',
        numFinal: '000.210',
        liberado: 100,
        procurador: 'EVALDO J. C. BARROS',
        pj: 'HOSPITAL UNIVERSITÁRIO - HUJBB',
        atividade: 'AMBULATORIO',
        prescritor: 'MARILIA B. XAVIER',
        conselho: 'CRM',
        numero: '3710',
        especialidade: 'DERMATOLOGIA',
        servidor: 'ALEXANDRE ALMEIDA'
    }
];

const DATA_PF = [
    {
        id: 1,
        dataCad: '14/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'ARTUR SILVA SOARES',
        conselho: 'CRM',
        numero: '17109',
        especialidade: 'Generalista',
        rqe: 'Não',
        email: 'artur.silva@email.com',
        servidor: 'Janaína Maia'
    },
    {
        id: 2,
        dataCad: '15/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '',
        prescritor: 'FLAVIA S. CUNHA',
        conselho: 'CRM',
        numero: '14200',
        especialidade: 'Endocrinologia e metabologia',
        rqe: '4800',
        email: 'flavia.med@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 3,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'UBIRAJARA SALGADO JR',
        conselho: 'CRM',
        numero: '1450',
        especialidade: 'Generalista',
        rqe: 'Não se aplica',
        email: 'ubi.salgado@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 4,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'CRISTINA BRAGA LIMA',
        conselho: 'CRM',
        numero: '8100',
        especialidade: 'Medicina do trabalho',
        rqe: '5300',
        email: 'cristina.braga@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 5,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'SUZANNA B. VIANNA',
        conselho: 'CRM',
        numero: '13500',
        especialidade: 'Generalista',
        rqe: 'Não',
        email: 'suzanna.med@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 6,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'VIVIAN G. CUNHA',
        conselho: 'CRM',
        numero: '14100',
        especialidade: 'Generalista',
        rqe: 'Não',
        email: 'vivian.cunha@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 7,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'MICHELL D. G. LIMA',
        conselho: 'CRM',
        numero: '12900',
        especialidade: 'Ortopedia e traumatologia',
        rqe: '7600',
        email: 'michell.lima@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 8,
        dataCad: '16/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        prescritor: 'VICTOR J. F. RAMOS',
        conselho: 'CRM',
        numero: '11222',
        especialidade: 'Ortopedia e traumatologia',
        rqe: '5100',
        email: 'victor.ramos@email.com',
        servidor: 'Ana Lima'
    },
    {
        id: 9,
        dataCad: '16/12/2024',
        situacao: 'Regular (atualizado)',
        atualizado: '10/06/2026',
        prescritor: 'MARCELO B. S. BRITO',
        conselho: 'CRM',
        numero: '9800',
        especialidade: 'Ortopedia e traumatologia',
        rqe: '4500',
        email: 'marcelo.brito@email.com',
        servidor: 'Ana Lima'
    },
];

const DATA_PJ = [
    {
        id: 1,
        dataCad: '15/12/2024',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        cnpj: '26.183.107/0001-99',
        razaoSocial: 'CLÍNICA MÉDICA SAÚDE TOTAL LTDA',
        fantasia: 'CLÍNICA SAÚDE TOTAL',
        atividade: 'Clínica',
        endereco: 'Av. Governador José Malcher, 1500',
        bairro: 'Nazaré',
        natureza: 'Instituição Privada',
        cadDevisa: '005',
        rt: 'Flávia S. Cunha',
        conselho: 'CRM',
        numero: '14200',
        situacaoRt: 'Cadastro',
        servidor: 'Ana Lima'
    },
    {
        id: 2,
        dataCad: '17/12/2024',
        situacao: 'Regular (atualizado)',
        atualizado: '10/06/2026',
        cnpj: '83.367.342/0002-88',
        razaoSocial: 'HOSPITAL SÃO LUCAS S.A.',
        fantasia: 'HOSPITAL SÃO LUCAS',
        atividade: 'Hospital',
        endereco: 'Tv. Mauriti, 2000',
        bairro: 'Marco',
        natureza: 'Instituição Privada',
        cadDevisa: '018',
        rt: 'Markus B. Albuquerque',
        conselho: 'CRM',
        numero: '4600',
        situacaoRt: 'Cadastro',
        servidor: 'Ana Lima'
    },
    {
        id: 3,
        dataCad: '18/01/2025',
        situacao: 'Regular (atualizado)',
        atualizado: '14/05/2026',
        cnpj: '23.453.830/0017-55',
        razaoSocial: 'ASSOCIAÇÃO DE REABILITAÇÃO DO PARÁ',
        fantasia: 'CENTRO DE REABILITAÇÃO INTEGRADA',
        atividade: 'Ambulatório',
        endereco: 'Av. Almirante Barroso, 500',
        bairro: 'Marco',
        natureza: 'Instituição Pública',
        cadDevisa: '042',
        rt: 'Fabricia D. Maciel',
        conselho: 'CRM',
        numero: '7300',
        situacaoRt: 'Bloqueado',
        servidor: 'Alexandre Almeida'
    },
    {
        id: 4,
        dataCad: '26/01/2025',
        situacao: 'Regular (atualizado)',
        atualizado: '25/09/2026',
        cnpj: '63.554.067/0184-11',
        razaoSocial: 'HAPVIDA ASSISTENCIA MEDICA S.A.',
        fantasia: 'HAPCLINICA MARCO',
        atividade: 'Hospital',
        endereco: 'Tv. Enéas Pinheiro, 100',
        bairro: 'Marco',
        natureza: 'Instituição Privada',
        cadDevisa: '055',
        rt: 'Rodrigo B. Cardoso',
        conselho: 'CRM',
        numero: '15800',
        situacaoRt: 'Cadastro',
        servidor: 'Gleize Fernandes'
    },
    {
        id: 5,
        dataCad: '11/02/2025',
        situacao: 'Regular (atualizado)',
        atualizado: '18/07/2026',
        cnpj: '29.540.265/0001-22',
        razaoSocial: 'CONSULTORIO DR RUBENS JR',
        fantasia: 'CONSULTORIO DR RUBENS',
        atividade: 'Consultório Médico',
        endereco: 'Av. Nazaré, 800 - Sala 102',
        bairro: 'Nazaré',
        natureza: 'Instituição Privada',
        cadDevisa: '033',
        rt: 'Rubens Tofolo Jr',
        conselho: 'CRM',
        numero: '6500',
        situacaoRt: 'Cadastro',
        servidor: 'Luana Castro'
    },
    {
        id: 6,
        dataCad: '22/03/2025',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        cnpj: '01.976.172/0001-33',
        razaoSocial: 'CLINICA BEM ESTAR LTDA',
        fantasia: 'CLINICA BEM ESTAR',
        atividade: 'Clínica',
        endereco: 'Rua Antônio Barreto, 400',
        bairro: 'Umarizal',
        natureza: 'Instituição Privada',
        cadDevisa: '215',
        rt: 'Virginia C. P. Silva',
        conselho: 'CRM',
        numero: '16500',
        situacaoRt: 'Cadastro',
        servidor: 'Ana Lima'
    },
    {
        id: 7,
        dataCad: '21/02/2025',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        cnpj: '34.860.833/0001-77',
        razaoSocial: 'UNIVERSIDADE ESTADUAL DO PARÁ',
        fantasia: 'CENTRO SAÚDE ESCOLA',
        atividade: 'Clínica',
        endereco: 'Tv. Perebebuí, 200',
        bairro: 'Marco',
        natureza: 'Instituição Pública',
        cadDevisa: '060',
        rt: 'Valdilene M. P. Souza',
        conselho: 'CRM',
        numero: '7600',
        situacaoRt: 'Cadastro',
        servidor: 'André Figueiredo'
    },
    {
        id: 8,
        dataCad: '10/03/2025',
        situacao: 'Bloqueado Cadastro',
        atualizado: '19/02/2026',
        cnpj: '07.917.818/0001-55',
        razaoSocial: 'SEC. MUNICIPAL DE SAUDE - BELÉM',
        fantasia: 'CAPS AD CA',
        atividade: 'Centro de Saúde',
        endereco: 'Av. João Paulo II, 500',
        bairro: 'Curió-Utinga',
        natureza: 'Instituição Pública',
        cadDevisa: '290',
        rt: 'Maria N. P. G. Lima',
        conselho: 'CRM',
        numero: '3100',
        situacaoRt: 'Cadastro',
        servidor: 'Gleize Fernandes'
    },
    {
        id: 9,
        dataCad: '16/03/2025',
        situacao: 'Bloqueado Cadastro',
        atualizado: '-',
        cnpj: '04.204.285/0003-11',
        razaoSocial: 'CASF - SAÚDE SUPLEMENTAR',
        fantasia: 'CASF SAÚDE',
        atividade: 'Clínica',
        endereco: 'Tv. 14 de Março, 1500',
        bairro: 'Umarizal',
        natureza: 'Instituição Privada',
        cadDevisa: '075',
        rt: 'Francisco B. Cardoso',
        conselho: 'CRM',
        numero: '6100',
        situacaoRt: 'Cadastro',
        servidor: 'Ana Lima'
    }
];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
    if (status.includes('Regular')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <CheckCircle2 className="w-3 h-3" />
                {status}
            </span>
        );
    }
    if (status.includes('Bloqueado')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                <Ban className="w-3 h-3" />
                {status}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {status}
        </span>
    );
};

export const PrescribersPage = () => {
    const [activeTab, setActiveTab] = useState<'talonarios' | 'pf' | 'pj'>('talonarios');
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cadastro de Prescritores</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gerenciamento de médicos, instituições e controle de numeração de receitas (RDC 11/2011)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-white">
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4" /> Novo Cadastro
                    </Button>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-0">
                <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('talonarios')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'talonarios'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Controle de Talonários
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('pf')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pf'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Pessoa Física (Prescritores)
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('pj')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pj'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Pessoa Jurídica (Instituições)
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'talonarios' && (
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Num. Inicial</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Num. Final</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Qtd.</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Instituição (PJ)</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Prescritor RT</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Conselho</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {DATA_TALONARIOS.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600">{item.data}</td>
                                            <td className="px-4 py-3 font-mono font-medium text-blue-600">{item.numInicial}</td>
                                            <td className="px-4 py-3 font-mono font-medium text-blue-600">{item.numFinal}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {item.liberado} blocos
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.pj}</span>
                                                    <span className="text-xs text-gray-500">{item.atividade}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.prescritor}</span>
                                                    <span className="text-xs text-gray-500">{item.especialidade}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-gray-700">{item.conselho}</span>
                                                    <span className="text-gray-400">/</span>
                                                    <span className="text-gray-600">{item.numero}</span>
                                                </div>
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

                {activeTab === 'pf' && (
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700 w-16">ID</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Prescritor</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Conselho</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Especialidade</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Situação</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Data Cad.</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {DATA_PF.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500">#{item.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.prescritor}</span>
                                                    <span className="text-xs text-gray-500">{item.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className="font-bold text-gray-700">{item.conselho}</span>
                                                    <span className="text-gray-500 ml-1">{item.numero}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {item.especialidade}
                                                {item.rqe !== 'Não' && item.rqe !== 'Não se aplica' && (
                                                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                        RQE {item.rqe}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.situacao} />
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{item.dataCad}</td>
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

                {activeTab === 'pj' && (
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Estabelecimento</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">CNPJ</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Responsável Técnico</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Natureza</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Endereço</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Situação</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {DATA_PJ.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col max-w-[250px]">
                                                    <span className="font-medium text-gray-900 truncate" title={item.razaoSocial}>
                                                        {item.fantasia || item.razaoSocial}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate">{item.atividade}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.cnpj}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900">{item.rt}</span>
                                                    <span className="text-xs text-gray-500">{item.conselho} {item.numero}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded border ${item.natureza.includes('Pública')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {item.natureza}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={`${item.endereco}, ${item.bairro}`}>
                                                {item.endereco}, {item.bairro}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.situacao} />
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
            </div>
        </div>
    );
};
