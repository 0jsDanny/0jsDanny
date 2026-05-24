import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    ArrowLeft,
    CheckCircle2,
    Building2,
    FileText,
    QrCode,
    Check,
    Clock,
    Calendar,
    Download,
    Printer,
    History,
    User,
    ChevronDown,
    ChevronUp,
    Users,
    ClipboardList,
    Shield,
    ExternalLink,
    Eye,
    MapPin,
    Activity,
    Phone,
    Mail,
    ShieldAlert,
    Gavel,
    AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import LegislationModal, { type LegislationModalProps } from '../components/LegislationModal';

export interface TeamMember {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
}

export interface Report {
    author: string;
    date: string;
    text: string;
}

export interface ReceivedBy {
    name: string;
    cpf: string;
}

export interface InspectionDetailsData {
    reports?: Report[];
    inspectors?: string[];
    receivedBy?: ReceivedBy;
    inspectionDate?: string;
    issuedDocuments?: string[];
}

export interface DispatchCnae {
    codigo: string;
    descricao: string;
    risco: string;
}

export interface EvidenceDoc {
    name: string;
    url?: string;
    type?: string;
}

export interface LegislationDoc {
    name: string;
    url: string;
}

export interface ChecklistItem {
    id: number | string;
    item: string;
    status: string;
    deadline?: string;
    completedAt?: string;
    verifiedBy?: string;
    requestedBy?: string;
    requestedAt?: string;
    evidenceDocs?: EvidenceDoc[];
    legislation?: LegislationDoc[];
}

export interface ActiveInspection {
    termNumber: string;
    status?: string;
    issueDate?: string;
    deadline?: string;
    daysRemaining?: number;
    details: InspectionDetailsData;
    checklist?: ChecklistItem[];
}

export interface Dispatch {
    status: string;
    cnaes: DispatchCnae[];
    dispatchedBy?: string | null;
    dispatchedByRole?: string | null;
    dispatchedAt?: string | null;
    fiscal?: TeamMember | null;
    fiscalRole?: string | null;
    team?: TeamMember[];
    activeInspection?: ActiveInspection | null;
}

export interface DivisionInspection {
    divisao: string;
    divisaoNome: string;
    divisaoColor: string;
    cnaeDispatches: Dispatch[];
}

// Mock process data for Distribuidora Farma Norte - CONCLUÍDO
const processData = {
    id: '2026.01.0031',
    analysisNumber: '3982',
    company: 'Distribuidora Farma Norte',
    tradeName: 'Farma Norte Distribuidora Belém',
    cnpj: '12.345.678/0001-90',
    status: 'Deferido',
    requestDate: '05/01/2026',
    type: 'Renovação',
    address: 'Rodovia BR-316, KM 02 - Belém, PA',
    cep: '66645-001',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rodovia+BR-316,+Belém,+PA',
    activity: 'Distribuição e comércio atacadista de produtos farmacêuticos',
    cnae: '4644-3/01',
    sector: 'Medicamentos',
    division: 'GVDM',
    responsibleTech: 'Marcos Oliveira Lima',
    responsibleRole: 'farmacêutico responsável',
    crf: 'CRF-PA 8765',
    crfCertificadoUrl: '#',
    contact: {
        name: 'Ana Cláudia Mendes',
        phones: ['(91) 98877-6655'],
        emails: ['diretoria@farmanorte.com.br']
    },
    vinculos: [
        {
            id: '2025.11.0289',
            tipo: 'Aprovação de Projeto Arquitetônico',
            status: 'Deferido',
            statusColor: 'green',
            dataDeferimento: '15/12/2025',
            documento: {
                nome: 'Parecer Técnico de Aprovação',
                numero: 'GVDM/PAA/2025/0289',
                url: '#'
            },
            docLabel: 'Parecer PAA',
            processUrl: '#',
            natureza: 'obrigatorio'
        }
    ],
    verificacoes: {
        receitaFederal: {
            status: 'verified',
            lastCheck: '05/01/2026 10:15',
            cnpjAtivo: true,
            razaoSocial: 'FARMA NORTE DISTRIBUIDORA LTDA',
            situacaoCadastral: 'ATIVA',
            dataAbertura: '20/05/1998'
        },
        cnaes: {
            status: 'verified',
            principal: '4644-3/01',
            descricao: 'Comércio atacadista de medicamentos e drogas de uso humano',
            compativel: true,
            cnaesSecundarios: []
        },
        dam: {
            status: 'paid',
            numero: '2026.307.00031',
            valor: 999.99,
            dataEmissao: '05/01/2026',
            dataPagamento: '06/01/2026',
            banco: 'Banco do Estado do Pará (BANPARA)',
            codigoReceita: '307',
            exercicio: '2026'
        }
    },
    cnaesAtividades: [
        { cnae: '4646-0/01', descricao: 'Comércio atacadista de cosméticos, perfumes e produtos de higiene pessoal', divisao: 'GVDM', divisaoNome: 'Divisão de Medicamentos', risco: 'Alto Risco', status: 'verified' },
        { cnae: '4644-3/01', descricao: 'Comércio atacadista de medicamentos e drogas de uso humano', divisao: 'GVDM', divisaoNome: 'Divisão de Medicamentos', risco: 'Alto Risco', status: 'verified' },
        { cnae: '4645-1/01', descricao: 'Comércio atacadista de instrumentos e materiais para uso médico', divisao: 'GVDM', divisaoNome: 'Divisão de Medicamentos', risco: 'Alto Risco', status: 'verified' },
        { cnae: '4649-4/08', descricao: 'Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar', divisao: 'GVDM', divisaoNome: 'Divisão de Medicamentos', risco: 'Alto Risco', status: 'verified' }
    ],
    docsGerais: [
        { id: 1, name: 'Constituição/Alteração Contratual (Social)', type: 'PDF', size: '3.4 MB', icon: 'pdf', status: 'approved' },
        { id: 2, name: 'Cartão CNPJ e Quadro de Sócios (QSA)', type: 'PDF', size: '450 KB', icon: 'pdf', status: 'approved' },
        { id: 3, name: 'RG/CPF dos Sócios Administradores', type: 'PDF', size: '1.2 MB', icon: 'pdf', status: 'approved' },
        { id: 4, name: 'Comprovante de Endereço do Estabelecimento', type: 'PDF', size: '890 KB', icon: 'pdf', status: 'approved' },
    ],
    docsTecnicos: [
        { id: 7, name: 'ART/CRT - Anotação de Responsabilidade Técnica', type: 'PDF', size: '512 KB', icon: 'pdf', status: 'approved' },
        { id: 8, name: 'AFE e Autorização Especial (ANVISA)', type: 'LINK', size: '', icon: 'link', status: 'approved' },
        { id: 9, name: 'PGRSS - Gerenciamento de Resíduos de Saúde', type: 'PDF', size: '2.2 MB', icon: 'pdf', status: 'approved' },
        { id: 10, name: 'Manual de Boas Práticas de Armazenagem', type: 'PDF', size: '4.8 MB', icon: 'pdf', status: 'approved' },
        { id: 11, name: 'Certificado de Controle de Pragas (Vetores)', type: 'PDF', size: '1.1 MB', icon: 'pdf', status: 'approved' },
        { id: 12, name: 'Procedimentos Operacionais Padrão (POPs)', type: 'PDF', size: '8.5 MB', icon: 'pdf', status: 'approved' },
    ],
    license: {
        number: '2026/00031',
        validity: '31/03/2027',
        hash: 'a7b8...c9d0',
        issuedAt: '08/01/2026',
        cnaes: ['4646-0/01', '4644-3/01', '4645-1/01', '4649-4/08'],
        tipo: 'COMÉRCIO ATACADISTA (DISTRIBUIDORA)',
        autorizacoes: [
            { id: 1, label: 'COSMÉTICOS, PERFUMES, PRODUTOS DE HIGIENE PESSOAL', afee: 'AFE: 4.05846-9' },
            { id: 2, label: 'MEDICAMENTOS NÃO SUJEITOS A CONTROLE ESPECIAL', afee: 'AFE: 1.29478-3' },
            { id: 3, label: 'MEDICAMENTOS SUJEITOS A CONTROLE ESPECIAL (PORTARIA 344/98)', afee: 'AE: 1.29479-7' },
            { id: 4, label: 'PRODUTOS PARA SAÚDE (CORRELATOS)', afee: 'AFE: 8.27236-1 (XWX29WM947X3)' },
            { id: 5, label: 'SANEANTES DOMISSANITÁRIOS', afee: 'AFE: 3.12319-9' }
        ]
    },
    history: [
        { date: '05/01/2026 09:15', action: 'Processo Protocolado', user: 'Portal do Cidadão' },
        { date: '05/01/2026 14:20', action: 'Triagem Finalizada - Processo Válido', user: 'Silvia (Triagem)' },
        { date: '06/01/2026 10:45', action: 'GVDM: Fiscalização designada', user: 'Roberto (Gerente GVDM)' },
        { date: '07/01/2026 16:30', action: 'Inspeção Sanitária Concluída - Relatório Favorável', user: 'Ana Souza' },
        { date: '08/01/2026 11:20', action: 'Licença Sanitária Emitida', user: 'Diretoria DEVISA' },
    ],
    riskLevel: 'Alto Risco',
    divisionInspections: [
        {
            divisao: 'GVDM',
            divisaoNome: 'Gerência de Vigilância de Medicamentos',
            divisaoColor: 'blue',
            cnaeDispatches: [
                {
                    cnaes: [
                        { codigo: '4646-0/01', descricao: 'Atacadista de Cosméticos e Higiene', risco: 'Alto Risco' },
                        { codigo: '4644-3/01', descricao: 'Atacadista de Medicamentos', risco: 'Alto Risco' },
                        { codigo: '4645-1/01', descricao: 'Atacadista de Instrumentos Médicos', risco: 'Alto Risco' },
                        { codigo: '4649-4/08', descricao: 'Atacadista de Saneantes/Limpeza', risco: 'Alto Risco' }
                    ],
                    status: 'Concluído',
                    dispatchedBy: 'Roberto Almeida',
                    dispatchedByRole: 'Gerente',
                    dispatchedAt: '06/01/2026 10:45',
                    fiscal: { name: 'Ana Souza', avatar: '/woman-avatar-1.jpg' },
                    fiscalRole: 'Técnico em VISA',
                    team: [
                        { name: 'Pedro Santos', role: 'Agente em VISA', avatar: '/man-avatar-1.jpg' }
                    ],
                    activeInspection: {
                        termNumber: 'TI-2026/031-GVDM',
                        status: 'Concluído',
                        issueDate: '07/01/2026',
                        deadline: '07/01/2026',
                        daysRemaining: 0,
                        details: {
                            inspectionDate: '07/01/2026',
                            reports: [
                                { date: '07/01/2026', author: 'Ana Souza', text: 'Realizada inspeção para verificação das boas práticas de armazenamento e distribuição. Estabelecimento em conformidade total com a legislação vigente.' }
                            ],
                            inspectors: ['Ana Souza', 'Pedro Santos'],
                            receivedBy: { name: 'Marcos Oliveira Lima', cpf: '***.456.789-**' },
                            issuedDocuments: ['Relatório de Inspeção RI-2026/031-GVDM', 'Certificado de Conformidade']
                        },
                        checklist: [
                            { id: 1, item: 'Controle de temperatura e umidade da área de armazenamento', status: 'completed', completedAt: '07/01/2026', verifiedBy: 'Ana Souza', requestedBy: 'Ana Souza', requestedAt: '06/01/2026', legislation: [{ name: 'RDC nº 430/2020', url: '#' }] },
                            { id: 2, item: 'Verificação da validade e segregação de produtos avariados', status: 'completed', completedAt: '07/01/2026', verifiedBy: 'Ana Souza', requestedBy: 'Ana Souza', requestedAt: '06/01/2026', legislation: [{ name: 'Portaria SVS/MS nº 344/98', url: '#' }] }
                        ]
                    }
                }
            ]
        }
    ]
};

const ProcessTimeline = ({ activeStep, setActiveStep }: { activeStep: string, setActiveStep: (id: string) => void }) => {
    const steps = [
        { id: 'protocolo', label: 'Protocolo', sublabel: '05/01/2026', status: 'completed' },
        { id: 'triagem', label: 'Triagem', sublabel: '05/01/2026', status: 'completed' },
        { id: 'inspecao', label: 'Inspeção', sublabel: '07/01/2026', status: 'completed' },
        { id: 'licenciamento', label: 'Licenciamento', sublabel: '08/01/2026', status: 'completed' },
    ];


    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl p-4 pb-14 mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between min-w-[420px] md:min-w-0 md:px-8">
                {steps.map((step, idx) => {
                    return (
                        <div key={step.id} className="flex-1 flex items-center last:flex-none">
                            <button
                                onClick={() => setActiveStep(step.id)}
                                className={`relative flex flex-col items-center group outline-none cursor-pointer`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.id === activeStep
                                    ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                                    : 'bg-green-500 border-green-500 text-white'
                                    }`}>
                                    {step.id === activeStep && step.id !== 'licenciamento' ? (
                                        <Clock className="w-4 h-4" />
                                    ) : (
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    )}
                                </div>

                                <div className="absolute top-10 whitespace-nowrap text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${step.id === activeStep ? 'text-blue-600' : 'text-green-600'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                        {step.sublabel}
                                    </p>
                                </div>
                            </button>

                            {idx < steps.length - 1 && (
                                <div className="flex-1 mx-3 h-0.5 bg-gray-100 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-500 transition-transform duration-500 translate-x-0" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const InspectionDetails = ({ details }: { details: InspectionDetailsData }) => {
    if (!details) return null;

    const reports = details.reports || [];
    const inspectors = details.inspectors || [];
    const documents = details.issuedDocuments || [];

    return (
        <div className="p-5 border-b border-gray-200 bg-white">
            <div className="space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5" />
                            Relatório da Inspeção ({reports.length})
                        </h5>
                    </div>
                    <div className="space-y-3">
                        {reports.map((report: Report, i: number) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                                        {report.author}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                        {report.date}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    "{report.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-2 border-t border-gray-50">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 mt-0.5 shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Fiscais</span>
                            <div className="flex flex-wrap gap-1">
                                {inspectors.map((inspector: string, i: number) => (
                                    <span key={i} className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                        {inspector}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Recebido por</span>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-900 font-semibold truncate">{details.receivedBy?.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{details.receivedBy?.cpf}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 mt-0.5 shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Data</span>
                            <span className="text-sm text-gray-900 font-semibold">{details.inspectionDate}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 mt-0.5 shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Documentos</span>
                            <div className="flex flex-col gap-1">
                                {documents.map((doc: string, i: number) => (
                                    <span key={i} className="text-[11px] text-purple-700 font-medium truncate" title={doc}>
                                        • {doc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CnaeDispatchCard = ({ dispatch, divisionColor }: { dispatch: Dispatch, divisionColor: string }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div
                className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${divisionColor === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {dispatch.cnaes.map((cnae: DispatchCnae, idx: number) => (
                                <span key={idx} className={`text-[10px] font-black px-2 py-0.5 rounded border-0 text-white shadow-sm flex items-center gap-1.5 ${cnae.risco === 'Alto Risco' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                    {cnae.codigo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <span className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0 bg-emerald-500 text-white">
                    Concluído
                </span>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-3">
                        <div className="p-1 bg-white rounded-md border border-blue-100 shadow-sm">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                Despachado por <strong className="text-gray-900">{dispatch.dispatchedBy}</strong> ({dispatch.dispatchedByRole})
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {dispatch.dispatchedAt}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="border border-gray-100 rounded-xl p-3 relative bg-white shadow-sm ring-1 ring-gray-900/5">
                            <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">
                                Fiscal Responsável
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                                <img src={dispatch.fiscal?.avatar} alt={dispatch.fiscal?.name} className="w-10 h-10 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{dispatch.fiscal?.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">{dispatch.fiscalRole}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-3 relative bg-white shadow-sm ring-1 ring-gray-900/5">
                            <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">
                                Equipe de Apoio
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1 min-h-[48px]">
                                {dispatch.team?.map((member: TeamMember, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-1 pr-4 py-1.5 shadow-sm h-11" title={`${member.name} - ${member.role}`}>
                                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                                        <span className="text-xs font-bold text-gray-700">{member.name.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {dispatch.activeInspection && (
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Termo {dispatch.activeInspection.termNumber}
                                </h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                    Finalizado em {dispatch.activeInspection.issueDate}
                                </span>
                            </div>
                            <InspectionDetails details={dispatch.activeInspection.details} />

                            {dispatch.activeInspection.checklist && (
                                <div className="mt-4 border-t border-gray-100 pt-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Checklist de Verificação
                                    </p>
                                    <div className="space-y-2">
                                        {dispatch.activeInspection.checklist.map((item: ChecklistItem) => (
                                            <div key={item.id} className="p-2.5 bg-gray-50/50 rounded-lg border border-gray-100 flex items-start gap-3">
                                                <div className="mt-0.5 w-4 h-4 rounded border bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-700">{item.item}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                            CUMPRIDO
                                                        </span>
                                                        <span className="text-[9px] text-gray-400">Verificado por {item.verifiedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ProcessDetailCompleted = () => {
    const [activeStep, setActiveStep] = useState('licenciamento');
    const [legislationModal, setLegislationModal] = useState<Omit<LegislationModalProps, 'onClose'> | null>(null);
    const [isCassado, setIsCassado] = useState(false);
    const [showCassacaoDialog, setShowCassacaoDialog] = useState(false);
    const [cassacaoMotivo, setCassacaoMotivo] = useState('');
    const [tempMotivo, setTempMotivo] = useState('');

    const handleCassar = () => {
        setIsCassado(true);
        setCassacaoMotivo(tempMotivo);
        setShowCassacaoDialog(false);
    };

    return (
        <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/admin/triagem/licenciamento">
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Análise #{processData.analysisNumber}</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs md:text-sm text-gray-500">Licenciamento Sanitário • Protocolo {processData.id}</p>
                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-tighter">Licença Emitida</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <Printer className="w-4 h-4" /> Imprimir Alvará
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                        <Download className="w-4 h-4" /> Baixar PDF
                    </Button>
                </div>
            </div>

            <ProcessTimeline activeStep={activeStep} setActiveStep={setActiveStep} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Exibição condicional baseada no step ativo */}
                    {activeStep === 'licenciamento' && (
                        <Card className={cn(
                            "shadow-lg overflow-hidden transition-all duration-500",
                            isCassado
                                ? "border-red-300 bg-gradient-to-br from-red-50/30 to-white"
                                : "border-green-200 bg-gradient-to-br from-green-50/30 to-white"
                        )}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-500",
                                        isCassado
                                            ? "bg-red-100 border-red-200"
                                            : "bg-green-100 border-green-200"
                                    )}>
                                        {isCassado ? (
                                            <ShieldAlert className="w-8 h-8 text-red-600" />
                                        ) : (
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {isCassado ? 'Licença Cassada' : 'Licenciamento Concluído'}
                                            </h2>
                                            {isCassado && (
                                                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded animate-pulse">
                                                    INVÁLIDO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {isCassado
                                                ? 'Este alvará foi invalidado administrativamente.'
                                                : 'O estabelecimento está regularizado perante a Vigilância Sanitária.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Botão de Cassação - discreto no canto */}
                                    {!isCassado && !showCassacaoDialog && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider gap-1.5 h-8 px-3 border border-transparent hover:border-red-200 transition-all"
                                            onClick={() => setShowCassacaoDialog(true)}
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5" /> Cassar
                                        </Button>
                                    )}
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Final</p>
                                        <p className={cn(
                                            "text-lg font-black",
                                            isCassado ? "text-red-600" : "text-green-600"
                                        )}>
                                            {isCassado ? 'CASSADO' : 'DEFERIDO'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dialog de Cassação */}
                            {showCassacaoDialog && (
                                <div className="mb-6 p-5 bg-white border-2 border-dashed border-red-200 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-md">
                                            <Gavel className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-gray-900">Despacho de Cassação</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Informe o embasamento legal</p>
                                        </div>
                                    </div>
                                    <textarea
                                        className="w-full p-4 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-300 outline-none min-h-[100px] bg-gray-50/50 placeholder:text-gray-400 resize-none"
                                        placeholder="Ex: Com base no Art. 45 da Lei Municipal, tendo em vista a infração sanitária identificada no Auto de Infração nº..."
                                        value={tempMotivo}
                                        onChange={(e) => setTempMotivo(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Ação reversível
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:bg-gray-100 text-xs"
                                                onClick={() => { setShowCassacaoDialog(false); setTempMotivo(''); }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 gap-1.5"
                                                onClick={handleCassar}
                                                disabled={!tempMotivo.trim()}
                                            >
                                                <Gavel className="w-3.5 h-3.5" /> Confirmar Cassação
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Exibição do motivo quando cassado */}
                            {isCassado && cassacaoMotivo && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-red-100 rounded-lg text-red-600 mt-0.5">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Motivo da Cassação</p>
                                            <p className="text-sm text-red-900 italic leading-relaxed">"{cassacaoMotivo}"</p>
                                            <p className="text-[10px] text-red-400 mt-2">Cassado em {new Date().toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={cn(
                                "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500",
                                isCassado && "opacity-50 grayscale-[0.3]"
                            )}>
                                <div className="p-4 bg-white border border-gray-100 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">Alvará Sanitário</span>
                                    </div>
                                    <div className="space-y-1.5 pl-11">
                                        <p className="text-xs text-gray-500">Número: <strong className="text-gray-900 font-mono tracking-tighter text-sm">{processData.license.number}</strong></p>
                                        <p className="text-xs text-gray-500">Validade: <strong className="text-gray-900">{processData.license.validity}</strong></p>
                                        <p className="text-xs text-gray-500">Emitido em: <strong className="text-gray-900">{processData.license.issuedAt}</strong></p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white border border-gray-100 rounded-xl relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                            <QrCode className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">Autenticidade Digital</span>
                                    </div>
                                    <div className="space-y-1 pl-11">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Código de Validação</p>
                                        <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded border border-gray-100">{processData.license.hash}.8f92.a1b2</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeStep === 'triagem' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Processos Vinculados Estilo Tabela */}
                            <Card className="border-gray-200 shadow-sm p-0 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <History className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Processos Vinculados</h3>
                                            <p className="text-[10px] text-gray-500">1 processo relacionado a este licenciamento</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">1 Obrigatório</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white">
                                            <tr className="border-b border-gray-50">
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Processo Vinculado</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Documento Emitido</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Natureza</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {processData.vinculos.map((vinc, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-900 leading-snug">{vinc.tipo}</p>
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Protocolo {vinc.id} • {vinc.status} em {vinc.dataDeferimento}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-700 leading-snug">{vinc.documento.nome}</p>
                                                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">{vinc.documento.numero}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn(
                                                            "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase",
                                                            vinc.natureza === 'obrigatorio' ? "bg-red-50 text-red-500 border border-red-100" : "bg-gray-50 text-gray-400 border border-gray-100"
                                                        )}>
                                                            {vinc.natureza === 'obrigatorio' ? 'Obrigatório' : 'Acessório'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn(
                                                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center gap-1 mx-auto w-fit",
                                                            vinc.statusColor === 'green' ? "bg-green-50 text-green-600 border border-green-100" : "bg-gray-50 text-gray-500 border border-gray-100"
                                                        )}>
                                                            {vinc.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 bg-blue-50/30 rounded-lg shadow-sm">
                                                                <FileText className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[10px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">
                                                                <ExternalLink className="w-3.5 h-3.5" /> Processo
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Documentos Gerais Estilo Tabela */}
                            <Card className="border-gray-200 shadow-sm p-0 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900">Documentos Gerais</h3>
                                    <span className="text-[10px] font-black bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">4/4</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100">
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Documento</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Tamanho</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {processData.docsGerais.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-3 flex items-center gap-3">
                                                        <div className="p-1.5 bg-red-50 text-red-500 rounded border border-red-100">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{doc.name}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-center text-xs text-gray-500 uppercase font-bold">{doc.type}</td>
                                                    <td className="px-6 py-3 text-center text-xs text-gray-500">{doc.size}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-100 rounded-lg">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Documentos Técnicos Estilo Tabela */}
                            <Card className="border-gray-200 shadow-sm p-0 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900">Documentos Técnicos</h3>
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">6/8</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100">
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Documento</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Tamanho</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {processData.docsTecnicos.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-3 flex items-center gap-3">
                                                        <div className="p-1.5 bg-blue-50 text-blue-500 rounded border border-blue-100">
                                                            {doc.icon === 'link' ? <ExternalLink className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{doc.name}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-center text-xs text-gray-500 uppercase font-bold">{doc.type}</td>
                                                    <td className="px-6 py-3 text-center text-xs text-gray-500">{doc.size || 'Vínculo'}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-100 rounded-lg">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeStep === 'protocolo' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Card de Cabeçalho da Empresa */}
                            <Card className="border-gray-200 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0 border border-green-200">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{processData.company}</h2>
                                            <p className="text-sm text-gray-500">{processData.tradeName}</p>
                                            <p className="text-xs text-gray-400 mt-1">CNPJ: {processData.cnpj}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-sm font-bold px-4 py-2 rounded-full border bg-green-50 text-green-600 border-green-200">
                                            {processData.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                            <AlertTriangle className="w-3 h-3" /> Alto Risco Sanitário
                                        </span>
                                    </div>
                                </div>

                                {/* Request Info Grid */}
                                <div className="grid grid-cols-4 gap-6 p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data Solicitação</p>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {processData.requestDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</p>
                                        <p className="text-sm font-bold text-gray-900">{processData.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Setor</p>
                                        <p className="text-sm font-bold text-gray-900">{processData.division}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CNAE</p>
                                        <p className="text-sm font-bold text-gray-900">{processData.cnae}</p>
                                    </div>
                                </div>

                                {/* Detail Sections Grid */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    {/* Address Card */}
                                    <div className="p-4 bg-gray-50/30 border border-gray-100/80 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Endereço</p>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50/50 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{processData.address}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium">CEP: {processData.cep}</p>
                                                </div>
                                            </div>
                                            <a href={processData.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-100/50 gap-1 px-2 border border-blue-100">
                                                    <ExternalLink className="w-3 h-3" /> MAPA
                                                </Button>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Responsible Tech Card */}
                                    <div className="p-4 bg-gray-50/30 border border-gray-100/80 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Responsável Técnico</p>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-50/50 flex items-center justify-center flex-shrink-0">
                                                    <Shield className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-sm font-semibold text-gray-900 leading-tight">{processData.responsibleTech}</p>
                                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-100/50">
                                                            {processData.responsibleRole.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium">{processData.crf}</p>
                                                </div>
                                            </div>
                                            <a href={processData.crfCertificadoUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1 px-2">
                                                    <FileText className="w-3 h-3" /> CERTIDÃO
                                                </Button>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Activity Card */}
                                    <div className="p-4 bg-gray-50/30 border border-gray-100/80 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Atividade Econômica</p>
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-amber-50/50 flex items-center justify-center flex-shrink-0">
                                                <Activity className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed pt-0.5 line-clamp-2">{processData.activity}</p>
                                        </div>
                                    </div>

                                    {/* Contact Card */}
                                    <div className="p-4 bg-gray-50/30 border border-gray-100/80 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Contato do Estabelecimento</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1.5 min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Telefones</p>
                                                <div className="flex flex-col gap-1">
                                                    {processData.contact.phones.map((phone, idx) => (
                                                        <span key={idx} className="text-xs text-gray-700 font-semibold flex items-center gap-1.5 truncate">
                                                            <Phone className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" /> {phone}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">E-mails</p>
                                                <div className="flex flex-col gap-1">
                                                    {processData.contact.emails.map((email, idx) => (
                                                        <span key={idx} title={email} className="text-xs text-gray-700 font-semibold flex items-center gap-1.5 truncate">
                                                            <Mail className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" /> {email}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Validação de Protocolo */}
                            <Card className="border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Validação de Protocolo</h3>
                                            <p className="text-xs text-gray-500">Dados certificados na abertura via Receita Federal e SIAT em {processData.verificacoes.receitaFederal.lastCheck}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                        <ExternalLink className="w-3 h-3" /> Revalidar
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* CNPJ Card */}
                                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CNPJ</span>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 font-mono">{processData.cnpj}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                {processData.verificacoes.receitaFederal.situacaoCadastral}
                                            </span>
                                            <span className="text-xs text-gray-400">desde {processData.verificacoes.receitaFederal.dataAbertura}</span>
                                        </div>
                                    </div>

                                    {/* CNAE Card */}
                                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CNAE vinculado</span>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 font-mono">{processData.cnae}</p>
                                        <div className="mt-2">
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                Compatível com VISA
                                            </span>
                                        </div>
                                    </div>

                                    {/* DAM Card */}
                                    <div className="p-4 bg-white rounded-xl border border-emerald-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DAM SESMA 307</span>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">PAGO</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">R$ {processData.verificacoes.dam.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                                            <p>Nº <span className="font-mono text-gray-700">{processData.verificacoes.dam.numero}</span></p>
                                            <p>Pago em <span className="font-medium text-gray-700">{processData.verificacoes.dam.dataPagamento}</span> via {processData.verificacoes.dam.banco}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeStep === 'inspecao' && (
                        <div className="space-y-6">
                            {processData.divisionInspections.map((division: DivisionInspection, idx: number) => (
                                <Card key={idx} className="border-blue-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{division.divisaoNome}</h3>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500 text-white">CONCLUÍDO</span>
                                    </div>
                                    <div className="space-y-4">
                                        {division.cnaeDispatches.map((dispatch: Dispatch, dIdx: number) => (
                                            <CnaeDispatchCard key={dIdx} dispatch={dispatch} divisionColor={division.divisaoColor} />
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Dados da Empresa - Sempre visível se for protocolo ou triagem, ou em card menor aqui */}
                    <Card className="border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{processData.company}</h2>
                                    <p className="text-xs text-gray-500">CNPJ: {processData.cnpj}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-wider h-8">Ver Detalhes</Button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tipo do Processo</p>
                                <p className="text-sm font-bold text-gray-700">{processData.type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Setor Responsável</p>
                                <p className="text-sm font-bold text-gray-700">{processData.sector}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Data de Início</p>
                                <p className="text-sm font-bold text-gray-700">{processData.requestDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Protocolo de Triagem</p>
                                <p className="text-sm font-bold text-gray-700">Lucivaldo Amorim</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Preview do Alvará na Lateral */}
                    <LicensePreviewCard processData={processData} />

                    <Card className="border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-500" /> Histórico Operacional
                            </h3>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {processData.history.length} Eventos
                            </span>
                        </div>
                        <div className="space-y-0">
                            {processData.history.map((item, i) => {
                                const isLast = i === processData.history.length - 1;
                                return (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`z-10 w-3 h-3 rounded-full flex items-center justify-center transition-all duration-500 ${isLast
                                                ? 'bg-green-500 ring-4 ring-green-100 scale-125'
                                                : 'bg-green-400'
                                                }`}>
                                                {isLast && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                            </div>
                                            {!isLast && (
                                                <div className="w-0.5 h-full bg-gradient-to-b from-green-400 to-green-400 my-1 opacity-40"></div>
                                            )}
                                        </div>
                                        <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                                            <p className={`text-xs font-bold leading-tight transition-colors ${isLast ? 'text-green-700 text-sm' : 'text-gray-700'
                                                }`}>
                                                {item.action}
                                            </p>
                                            <div className="flex flex-col mt-1 gap-0.5">
                                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3 opacity-70" /> {item.date}
                                                </p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <User className="w-3 h-3 opacity-70" /> {item.user}
                                                </p>
                                            </div>
                                            {isLast && (
                                                <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Processo Finalizado com Sucesso</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-blue-700">
                        <h4 className="text-sm font-bold mb-2">Suporte Técnico</h4>
                        <p className="text-xs text-blue-100 mb-4">Caso haja dúvidas sobre esta licença ou alteração de dados do estabelecimento.</p>
                        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold">Abrir Chamado Interno</Button>
                    </Card>
                </div>
            </div>

            {legislationModal && (
                <LegislationModal
                    isOpen={legislationModal.isOpen}
                    onClose={() => setLegislationModal(null)}
                    title={legislationModal.title}
                    documents={legislationModal.documents}
                />
            )}
        </div>
    );
};

// Componente de Preview simplificado (reutilizado do original)
interface LicenseData {
    company: string;
    license: {
        validity: string;
        number: string;
        hash: string;
        cnaes: string[];
        tipo: string;
        autorizacoes: Array<{ id: number; label: string; afee: string }>;
    };
}

const LicensePreviewCard = ({ processData }: { processData: LicenseData }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={cn(
            "border-gray-200 shadow-xl bg-white relative overflow-hidden group transition-all duration-500",
            isExpanded ? "ring-2 ring-blue-500/20" : ""
        )}>
            {/* Símbolo de Fundo */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Município de Belém</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 leading-tight">Licença Sanitária Digital</p>
                </div>
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                    <QrCode className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Estabelecimento Regularizado</p>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-blue-50/30 transition-colors">
                    <p className="text-xs font-black text-gray-900 leading-snug">{processData.company.toUpperCase()}</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Calendar className="w-2.5 h-2.5" /> Validade
                    </p>
                    <p className="text-xs font-black text-gray-900">{processData.license.validity}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <FileText className="w-2.5 h-2.5" /> Nº Alvará
                    </p>
                    <p className="text-xs font-black text-blue-600 font-mono tracking-tighter">{processData.license.number}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 space-y-4">
                <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">CNAEs Licenciados</p>
                    <div className="flex flex-wrap gap-1">
                        {processData.license.cnaes.map(c => (
                            <span key={c} className="text-[9px] font-mono font-bold bg-blue-50/50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100/50">{c}</span>
                        ))}
                    </div>
                </div>

                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Atividades licenciadas</p>
                        <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-[7px] font-black text-blue-600 uppercase">Anvisa Sync</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {(isExpanded ? processData.license.autorizacoes : processData.license.autorizacoes.slice(0, 3)).map(auth => (
                            <div key={auth.id} className="min-w-0 bg-gray-50/50 p-2 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                <p className="text-[9px] font-bold text-gray-700 leading-tight">{auth.label}</p>
                                <p className="text-[8px] font-mono text-blue-600 font-bold mt-1 inline-flex items-center gap-1">
                                    <Shield className="w-2.5 h-2.5 opacity-70" /> {auth.afee}
                                </p>
                            </div>
                        ))}
                    </div>

                    {processData.license.autorizacoes.length > 3 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full mt-3 py-2 text-[8px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isExpanded ? (
                                <>Recolher detalhes <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>+ {processData.license.autorizacoes.length - 3} atividades sincronizadas <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5 text-green-600 font-bold">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                        AUTENTICADO
                    </div>
                    <span className="font-mono text-gray-400">{processData.license.hash}</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                </div>
            </div>
        </Card>
    );
};

export default ProcessDetailCompleted;
