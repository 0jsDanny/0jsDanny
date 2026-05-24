/**
 * ============================================================================
 * ProcessDetail.tsx - Página de Análise de Processo de Licenciamento Sanitário
 * ============================================================================
 * 
 * ESTRUTURA DO ARQUIVO (~1750 linhas):
 * ------------------------------------
 * 
 * 1. IMPORTS (linhas ~77-115)
 *    - React, react-router-dom, componentes UI (Card, Button)
 *    - Ícones do lucide-react
 *    - useMode context
 * 
 * 2. MOCK DATA - processData (linhas ~115-420)
 *    - Dados do processo: id, company, cnpj, status, riskLevel, etc.
 *    - verificacoes: receitaFederal, cnaes, dam (pagamento)
 *    - vinculos: processos vinculados obrigatórios/acessórios
 *    - cnaesAtividades[]: CNAEs com divisão responsável (GVDM, GALE/A, etc.)
 *    - divisionInspections[]: NOVO! Inspeções por divisão - cada CNAE tem:
 *      • divisao, divisaoNome, divisaoColor (blue/emerald/etc)
 *      • cnae, cnaeDescricao, risco
 *      • dispatchedBy, dispatchedByRole, dispatchedAt
 *      • fiscal: { name, avatar }, fiscalRole
 *      • team[]: { name, role, avatar }
 *      • activeInspection: { termNumber, deadline, daysRemaining, checklist[] }
 *    - docsGerais, docsTecnicos: listas de documentos
 *    - history: histórico de ações por divisão
 *    - license: dados da licença (validity, number, hash)
 * 
 * 3. ProcessTimeline COMPONENT (linhas ~420-490)
 *    - Timeline horizontal clicável com 4 steps:
 *      'protocolo' | 'triagem' | 'inspecao' | 'licenciamento'
 *    - Props: activeStep, setActiveStep
 *    - Função getComputedStatus para calcular status visual dos steps
 * 
 * 4. ProcessDetail COMPONENT (linhas ~490-1700)
 *    - Estado: activeStep (default: 'inspecao'), parecer (textarea)
 *    - canTakeAction: baseado no userRole e sector do processo
 *    - Funções helper: getStatusColor, getDocIcon, getDocStatus
 * 
 *    4.1 MOBILE LAYOUT - className="md:hidden"
 *        - Renderização condicional por activeStep
 *        - Histórico: sempre visível
 * 
 *    4.2 DESKTOP LAYOUT - className="hidden md:grid md:grid-cols-3"
 *        - LEFT COLUMN (md:col-span-2): Cards principais por activeStep
 *          • protocolo: Company Card (expandido) + Validação de Protocolo
 *          • triagem: Vínculos (tabela) + Documents (tabelas gerais/técnicos)
 *          • inspecao: NOVO! Fiscalização por Divisão - cada divisão tem:
 *            - Card com cor da divisão (blue/emerald)
 *            - Header: nome da divisão, CNAE, nível de risco
 *            - Info de despacho: quem despachou, quando
 *            - Equipe: fiscal responsável + agentes
 *            - Termo de inspeção com checklist próprio
 *          • licenciamento: (a implementar)
 *        
 *        - RIGHT COLUMN (sidebar): Sempre visível
 *          • LicensePreviewCard
 *          • Histórico Timeline
 *          • Ações Rápidas
 * 
 * 5. LicensePreviewCard COMPONENT (linhas ~1700+)
 *    - Componente separado para preview da licença
 * 
 * CONCEITO DE NEGÓCIO:
 * --------------------
 * O processo NÃO é transferido para um único setor. A responsabilidade é
 * distribuída por CNAEs: cada CNAE pertence a uma divisão (GVDM, GALE/A, etc.)
 * e cada divisão designa sua própria equipe de fiscalização.
 * Todas as divisões trabalham SIMULTANEAMENTE no mesmo processo.
 * 
 * PADRÕES DE ESTILIZAÇÃO:
 * -----------------------
 * - Tailwind CSS com cores: gray, blue, emerald, red, amber
 * - Cards com border-{color}-200 e bg-gradient-to-br
 * - Divisões têm cores próprias: GVDM=blue, GALE/A=emerald
 * - Responsive: md:hidden / hidden md:block
 * ============================================================================
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMode } from '../contexts/ModeContext';
import { DispatchModal, type DispatchConfirmData } from '../components/DispatchModal';

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
import {
    ArrowLeft,
    MoreVertical,
    CheckCircle2,
    MapPin,
    Building2,
    FileText,
    Eye,
    QrCode,
    X,
    AlertTriangle,
    Check,
    Clock,
    Calendar,
    FileType,
    Image as ImageIcon,
    Download,
    Printer,
    History,
    MessageSquare,
    User,
    Phone,
    Mail,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Shield,
    Database,
    Globe,
    Link2,
    Minus,
    Plus,
    RefreshCw,
    Users,
    ClipboardList,
    Scale,
    UserPlus
} from 'lucide-react';
import LegislationModal, { type LegislationModalProps } from '../components/LegislationModal';

// Mock process data
const processData = {
    id: '2026.01.0042',
    analysisNumber: '4102',
    company: 'Farmácia ExtraFarma',
    tradeName: 'ExtraFarma Nazaré',
    cnpj: '04.899.316/0016-02',
    status: 'Em Análise',
    requestDate: '10/01/2026',
    type: 'Primeira Licença',
    address: 'Av. Nazaré, 1234 - Belém, PA',
    cep: '66035-170',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Nazaré,+1234+-+Belém,+PA',
    activity: 'Comércio Varejista de Produtos Farmacêuticos, sem manipulação de fórmulas',
    cnae: '4771-7/01',
    sector: 'Medicamentos',
    division: 'GVDM',
    responsibleTech: 'Carlos Mendes Garcia',
    responsibleRole: 'farmacêutico',
    crf: 'CRF-PA 12345',
    crfCertificadoUrl: '/documentos/certidao-crf-12345.pdf',
    contact: {
        name: 'Maria da Silva',
        phones: ['(91) 98765-4321', '(91) 3222-4455'],
        emails: ['contato@extrafarma.com.br', 'financeiro@extrafarma.com.br']
    },
    // Linked processes (mandatory prerequisites + ancillary related processes)
    vinculos: [
        {
            id: '2025.08.0156',
            tipo: 'Auto de Infração',
            status: 'Arquivado',
            dataDeferimento: '20/09/2025',
            documento: {
                nome: 'Auto de Infração Sanitária',
                numero: 'GVDM/AIS/2025/0156',
                url: '/documentos/auto-infracao-0156.pdf'
            },
            docLabel: 'Auto',
            processUrl: '/admin/processo/2025080156',
            natureza: 'acessorio'
        },
        {
            id: '2025.10.0198',
            tipo: 'Desinterdição de Estabelecimento',
            status: 'Deferido',
            dataDeferimento: '05/11/2025',
            documento: {
                nome: 'Termo de Desinterdição',
                numero: 'GVDM/TDI/2025/0198',
                url: '/documentos/termo-desinterdicao-0198.pdf'
            },
            docLabel: 'Desinterdito',
            processUrl: '/admin/processo/2025100198',
            natureza: 'obrigatorio'
        },
        {
            id: '2025.11.0289',
            tipo: 'Aprovação de Projeto Arquitetônico',
            status: 'Deferido',
            dataDeferimento: '15/12/2025',
            documento: {
                nome: 'Parecer Técnico de Aprovação',
                numero: 'GVDM/PAA/2025/0289',
                url: '/documentos/parecer-paa-0289.pdf'
            },
            docLabel: 'Parecer',
            processUrl: '/admin/processo/2025110289',
            natureza: 'obrigatorio'
        },
        {
            id: '2025.12.0412',
            tipo: 'Inspeção para Início de Atividade',
            status: 'Deferido',
            dataDeferimento: '28/12/2025',
            documento: {
                nome: 'Relatório de Inspeção Sanitária',
                numero: 'GVDM/RIS/2025/0412',
                url: '/documentos/relatorio-inspecao-0412.pdf'
            },
            docLabel: 'Parecer',
            processUrl: '/admin/processo/2025120412',
            natureza: 'obrigatorio'
        }
    ],
    // Automatic verifications (cross-referenced with Receita Federal + SIAT)
    verificacoes: {
        receitaFederal: {
            status: 'verified', // 'verified' | 'pending' | 'error'
            lastCheck: '10/01/2026 14:35',
            cnpjAtivo: true,
            razaoSocial: 'EXTRAFARMA LTDA',
            situacaoCadastral: 'ATIVA',
            dataAbertura: '15/03/2010'
        },
        cnaes: {
            status: 'verified',
            principal: '4771-7/01',
            descricao: 'Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas',
            compativel: true, // Compatible with DEVISA requirements
            cnaesSecundarios: ['4771-7/02', '4773-3/00']
        },
        dam: {
            status: 'paid', // 'paid' | 'pending' | 'not_found'
            numero: '2026.307.00042',
            valor: 999.99,
            dataEmissao: '08/01/2026',
            dataPagamento: '09/01/2026',
            banco: 'Banco do Brasil',
            codigoReceita: '307',
            exercicio: '2026'
        }
    },
    // CNAEs do estabelecimento - cada um associado a uma divisão responsável
    cnaesAtividades: [
        {
            cnae: '4771-7/01',
            descricao: 'Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas',
            divisao: 'GVDM',
            divisaoNome: 'Divisão de Medicamentos',
            risco: 'Alto Risco',
            status: 'verified'
        },
        {
            cnae: '4721-1/04',
            descricao: 'Comércio varejista de doces, balas, bombons e semelhantes',
            divisao: 'GALE/A',
            divisaoNome: 'Divisão de Alimentos',
            risco: 'Médio Risco',
            status: 'verified'
        }
    ],
    docsGerais: [
        { id: 1, name: 'Contrato Social', type: 'PDF', size: '2.1 MB', icon: 'pdf', status: 'approved' },
        { id: 2, name: 'RG Responsável', type: 'PDF', size: '856 KB', icon: 'pdf', status: 'approved' },
        { id: 3, name: 'Fotos do Local', type: 'JPG', size: '4 arquivos', icon: 'image', status: 'approved' },
    ],
    docsTecnicos: [
        { id: 7, name: 'Anotação de Responsabilidade Técnica', type: 'PDF', size: '456 KB', icon: 'pdf', status: 'approved' },
        { id: 8, name: 'Espelho AFE/AE (ANVISA)', type: 'LINK', size: '', icon: 'link', status: 'approved' },
        { id: 9, name: 'Laudo de Controle de Pragas', type: 'PDF', size: '1.2 MB', icon: 'pdf', status: 'pending' },
        { id: 10, name: 'Habite-se / Auto de Vistoria Bombeiros', type: 'PDF', size: '2.4 MB', icon: 'pdf', status: 'approved' },
        { id: 11, name: 'Laudo de Limpeza de Reservatório', type: 'PDF', size: '890 KB', icon: 'pdf', status: 'pending' },
        { id: 12, name: 'PMOC - Plano de Manutenção Climatização', type: 'PDF', size: '1.1 MB', icon: 'pdf', status: 'approved' },
        { id: 13, name: 'Petição de Serviços Farmacêuticos', type: 'PDF', size: '234 KB', icon: 'pdf', status: 'approved' },
        { id: 14, name: 'CNES - Cadastro de Estabelecimento', type: 'PDF', size: '156 KB', icon: 'pdf', status: 'not_required' },
    ],
    license: {
        number: '2026/58492',
        validity: '31/03/2027',
        hash: '8f92...a1b2'
    },
    history: [
        { date: '10/01/2026 14:36', action: 'Vínculos verificados (4 processos)', user: 'Sistema' },
        { date: '10/01/2026 15:10', action: 'Triagem iniciada', user: 'João Silva' },
        { date: '10/01/2026 16:45', action: 'Documentação verificada', user: 'João Silva' },
        { date: '11/01/2026 09:30', action: 'Processo classificado - 2 CNAEs de Risco', user: 'Triagem' },
        { date: '11/01/2026 10:15', action: 'GVDM: Equipe de fiscalização designada', user: 'Roberto (Gerente GVDM)' },
        { date: '11/01/2026 10:45', action: 'GALE/A: Equipe de fiscalização designada', user: 'Luciana (Gerente GALE/A)' },
    ],
    // Indica que há inspeção presencial (qualquer divisão com Alto Risco ou critério específico)
    riskLevel: 'Alto Risco',

    // NOVA ESTRUTURA: Inspeções por Divisão - cada divisão trabalha independentemente no seu CNAE
    divisionInspections: [
        {
            // Divisão de Medicamentos - 1 CNAE, 1 equipe
            divisao: 'GVDM',
            divisaoNome: 'Gerência de Vigilância de Medicamentos',
            divisaoColor: 'blue',
            cnaeDispatches: [
                {
                    cnaes: [{ codigo: '4771-7/03', descricao: 'Comércio varejista de produtos farmacêuticos homeopáticos e fitoterápicos', risco: 'Alto Risco' }],
                    status: 'Aguardando Despacho',
                    dispatchedBy: null,
                    dispatchedByRole: null,
                    dispatchedAt: null,
                    fiscal: null,
                    fiscalRole: null,
                    team: [],
                    activeInspection: null
                },
                {
                    cnaes: [
                        { codigo: '4771-7/01', descricao: 'Comércio varejista de produtos farmacêuticos', risco: 'Alto Risco' },
                        { codigo: '4772-5/00', descricao: 'Comércio varejista de cosméticos, produtos de perfumaria e de higiene pessoal', risco: 'Baixo Risco' }
                    ],
                    status: 'Em Monitoramento',
                    dispatchedBy: 'Roberto Almeida',
                    dispatchedByRole: 'Gerente',
                    dispatchedAt: '11/01/2026 10:15',
                    fiscal: { name: 'Ana Souza', avatar: '/woman-avatar-1.jpg' },
                    fiscalRole: 'Técnico em VISA',
                    team: [
                        { name: 'Pedro Santos', role: 'Agente em VISA', avatar: '/man-avatar-1.jpg' }
                    ],
                    activeInspection: {
                        termNumber: 'TI-2026/042-GVDM',
                        status: 'Aguardando Adequação',
                        issueDate: '12/01/2026',
                        deadline: '27/01/2026',
                        daysRemaining: 15,
                        details: {
                            inspectionDate: '12/01/2026',
                            reports: [
                                { date: '12/01/2026', author: 'Ana Souza', text: 'Realizada inspeção para verificação das condições sanitárias e adequação estrutural na área de manipulação de alimentos. Identificadas não conformidades pontuais na documentação técnica pendente.' },
                                { date: '12/01/2026', author: 'Pedro Santos', text: 'Observou-se acúmulo de sujidade em zonas de difícil acesso, necessitando de um cronograma de higienização mais rigoroso.' }
                            ],
                            inspectors: ['Ana Souza', 'Pedro Santos'],
                            receivedBy: { name: 'João Silva', cpf: '***.456.789-**' },
                            issuedDocuments: ['Termo de Inspeção TI-2026/042-GVDM', 'Notificação N-2026/105']
                        },
                        checklist: [
                            { id: 1, item: 'Instalação de telas milimétricas nas janelas', status: 'pending', deadline: '27/01/2026', requestedBy: 'Ana Souza', requestedAt: '08/01/2026', legislation: [{ name: 'RDC nº 216/2004 - ANVISA', url: '#' }] },
                            { id: 2, item: 'Apresentação do PMOC atualizado', status: 'completed', completedAt: '11/01/2026', verifiedBy: 'Ana Souza', requestedBy: 'Ana Souza', requestedAt: '08/01/2026', evidenceDocs: [{ name: 'PMOC.pdf', type: 'doc' }], legislation: [{ name: 'Lei 13.589/2018', url: '#' }] }
                        ]
                    }
                }
            ]
        },
        {
            // Divisão de Alimentos - 2 CNAEs, equipes diferentes
            divisao: 'GALE/A',
            divisaoNome: 'Gerência de Vigilância de Alimentos',
            divisaoColor: 'emerald',
            cnaeDispatches: [
                {
                    cnaes: [{ codigo: '4721-1/04', descricao: 'Comércio varejista de doces, balas, bombons', risco: 'Médio Risco' }],
                    status: 'Em Monitoramento',
                    dispatchedBy: 'Luciana Martins',
                    dispatchedByRole: 'Gerente GALE/A',
                    dispatchedAt: '11/01/2026 10:45',
                    fiscal: { name: 'Carlos Ferreira', avatar: '/man-avatar-2.jpg' },
                    fiscalRole: 'Técnico em VISA',
                    team: [{ name: 'Juliana Costa', role: 'Agente em VISA', avatar: '/woman-avatar-2.jpg' }],
                    activeInspection: {
                        termNumber: 'TI-2026/043-GALE/A',
                        status: 'Aguardando Adequação',
                        issueDate: '12/01/2026',
                        deadline: '20/01/2026',
                        daysRemaining: 8,
                        details: {
                            inspectionDate: '12/01/2026',
                            reports: [{ date: '12/01/2026', author: 'Carlos Ferreira', text: 'Vistoria técnica para análise de fluxo e armazenamento. Constatada necessidade de ajustes na cadeia de frio.' }],
                            inspectors: ['Carlos Ferreira', 'Juliana Costa'],
                            receivedBy: { name: 'Maria Oliveira', cpf: '***.123.456-**' },
                            issuedDocuments: ['Termo de Inspeção TI-2026/043-GALE/A']
                        },
                        checklist: [
                            { id: 1, item: 'Adequação da temperatura do balcão refrigerado', status: 'pending', deadline: '20/01/2026', requestedBy: 'Carlos Ferreira', requestedAt: '12/01/2026', legislation: [{ name: 'RDC nº 216/2004', url: '#' }] }
                        ]
                    }
                },
                {
                    cnaes: [{ codigo: '4729-6/02', descricao: 'Comércio varejista de mercadorias em loja de conveniência', risco: 'Baixo Risco' }],
                    status: 'Aguardando Despacho',
                    dispatchedBy: null,
                    dispatchedByRole: null,
                    dispatchedAt: null,
                    fiscal: null,
                    fiscalRole: null,
                    team: [],
                    activeInspection: null
                }
            ]
        }
    ],

    // Campos legados para compatibilidade (pode ser removido depois)
    inspectionTeam: {
        dispatchedBy: 'Roberto Almeida',
        dispatchedAt: '11/01/2026 10:15',
        fiscal: { name: 'Ana Souza', avatar: '/woman-avatar-1.jpg' },
        fiscalRole: 'Técnico em VISA',
        team: [
            { name: 'Pedro Santos (Agente)', avatar: '/man-avatar-1.jpg' }
        ]
    },
    activeInspection: {
        termNumber: 'TI-2026/042',
        status: 'Aguardando Adequação',
        issueDate: '12/01/2026',
        deadline: '27/01/2026',
        daysRemaining: 15,
        checklist: [
            {
                id: 1,
                item: 'Instalação de telas milimétricas nas janelas da área de manipulação',
                status: 'pending',
                deadline: '27/01/2026',
                requestedBy: 'Ana Souza',
                requestedAt: '12/01/2026'
            },
            {
                id: 2,
                item: 'Adequação do revestimento do piso (trincas identificadas)',
                status: 'pending',
                deadline: '27/01/2026',
                requestedBy: 'Pedro Santos',
                requestedAt: '12/01/2026'
            },
            {
                id: 3,
                item: 'Apresentação do PMOC atualizado e assinado',
                status: 'completed',
                completedAt: '13/01/2026',
                verifiedBy: 'Ana Souza',
                requestedBy: 'Ana Souza',
                requestedAt: '12/01/2026',
                evidenceDocs: [
                    { name: 'PMOC_2026_Assinado.pdf', type: 'doc' },
                    { name: 'ART_Eng_Mecanico.pdf', type: 'doc' }
                ]
            },
            {
                id: 4,
                item: 'Organização do depósito de resíduos',
                status: 'pending',
                deadline: '27/01/2026',
                requestedBy: 'Ana Souza',
                requestedAt: '12/01/2026'
            }
        ],
        attachments: [
            { name: 'Foto_Adequacao_PMOC.jpg', size: '2.4 MB', date: '13/01/2026', type: 'image' }
        ]
    }
};

const ProcessTimeline = ({ activeStep, setActiveStep }: { activeStep: string, setActiveStep: (id: string) => void }) => {
    const steps = [
        { id: 'protocolo', label: 'Protocolo', sublabel: '10/01/2026', status: 'completed' },
        { id: 'triagem', label: 'Triagem', sublabel: '11/01/2026', status: 'completed' },
        { id: 'inspecao', label: 'Inspeção', sublabel: 'Em andamento', status: 'active' },
        { id: 'licenciamento', label: 'Licenciamento', sublabel: 'Aguardando', status: 'pending' },
    ];

    const getComputedStatus = (stepId: string, baseStatus: string) => {
        if (stepId === activeStep) return 'active';
        return baseStatus;
    };

    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl p-4 pb-14 mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between min-w-[420px] md:min-w-0 md:px-8">
                {steps.map((step, idx) => {
                    const status = getComputedStatus(step.id, step.status);
                    const isClickable = true;
                    return (
                        <div key={step.id} className="flex-1 flex items-center last:flex-none">
                            <button
                                onClick={() => setActiveStep(step.id)}
                                className={`relative flex flex-col items-center group outline-none ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                {/* Circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${status === 'completed'
                                    ? 'bg-gray-800 border-gray-800 text-white'
                                    : status === 'active'
                                        ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                                        : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:border-gray-300'
                                    }`}>
                                    {step.status === 'completed' ? (
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    ) : status === 'active' ? (
                                        <Clock className="w-4 h-4" />
                                    ) : (
                                        <span className="text-xs font-bold">{idx + 1}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="absolute top-10 whitespace-nowrap text-center">
                                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${status === 'pending' ? 'text-gray-400' : status === 'active' ? 'text-blue-600' : 'text-gray-700'
                                        }`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                        {step.sublabel}
                                    </p>
                                </div>
                            </button>

                            {/* Connector */}
                            {idx < steps.length - 1 && (
                                <div className="flex-1 mx-3 h-0.5 bg-gray-100 rounded-full relative overflow-hidden">
                                    <div
                                        className={`absolute inset-0 bg-gray-800 transition-transform duration-500 ${step.status === 'completed' ? 'translate-x-0' : '-translate-x-full'
                                            }`}
                                    />
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
    const [reportsExpanded, setReportsExpanded] = useState(false);
    const [fiscaisExpanded, setFiscaisExpanded] = useState(false);
    const [docsExpanded, setDocsExpanded] = useState(false);

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
                            Relatório da Inspeção ({reports.length} relato{reports.length !== 1 ? 's' : ''})
                        </h5>
                        {reports.length > 1 && (
                            <button onClick={() => setReportsExpanded(!reportsExpanded)} className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                                {reportsExpanded ? <>Ver menos <ChevronUp className="w-3 h-3" /></> : <>Ver todos <ChevronDown className="w-3 h-3" /></>}
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {(reportsExpanded ? reports : reports.slice(0, 1)).map((report: Report, i: number) => (
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
                        {!reportsExpanded && reports.length > 1 && (
                            <span className="text-[10px] text-gray-400 block">+{reports.length - 1} relato(s) de outros fiscais</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-2 border-t border-gray-50">
                    {/* Fiscais - Collapsible */}
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 mt-0.5 shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Fiscais ({inspectors.length})</span>
                                {inspectors.length > 2 && (
                                    <button onClick={() => setFiscaisExpanded(!fiscaisExpanded)} className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                                        {fiscaisExpanded ? <><ChevronUp className="w-3 h-3" /></> : <><ChevronDown className="w-3 h-3" /></>}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {(fiscaisExpanded ? inspectors : inspectors.slice(0, 2)).map((inspector: string, i: number) => (
                                    <span key={i} className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                        {inspector}
                                    </span>
                                ))}
                            </div>
                            {!fiscaisExpanded && inspectors.length > 2 && (
                                <span className="text-[10px] text-gray-400 mt-0.5 block">+{inspectors.length - 2} mais</span>
                            )}
                        </div>
                    </div>

                    {/* Recebido por */}
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Recebido por</span>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-900 font-semibold truncate">{details.receivedBy?.name || "-"}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{details.receivedBy?.cpf || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data */}
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 mt-0.5 shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Data</span>
                            <span className="text-sm text-gray-900 font-semibold">{details.inspectionDate || "-"}</span>
                        </div>
                    </div>

                    {/* Documentos - Collapsible & Clickable */}
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 mt-0.5 shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Documentos ({documents.length})</span>
                                {documents.length > 1 && (
                                    <button onClick={() => setDocsExpanded(!docsExpanded)} className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                                        {docsExpanded ? <><ChevronUp className="w-3 h-3" /></> : <><ChevronDown className="w-3 h-3" /></>}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                {(docsExpanded ? documents : documents.slice(0, 1)).map((doc: string, i: number) => (
                                    <button key={i} className="text-[11px] text-left text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-medium truncate w-full px-1 py-0.5 rounded transition-colors" title={doc}>
                                        • {doc.split(' ').pop()}
                                    </button>
                                ))}
                            </div>
                            {!docsExpanded && documents.length > 1 && (
                                <span className="text-[10px] text-gray-400 mt-0.5 block">+{documents.length - 1} mais</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};





// Componente para exibir Dispatch por CNAE
const CnaeDispatchCard = ({ dispatch, divisionCode, divisionColor, isFirst, onViewLegislation, onViewEvidence, onDispatch }: { dispatch: Dispatch, divisionCode: string, divisionColor: string, isFirst: boolean, onViewLegislation?: (item: ChecklistItem) => void, onViewEvidence?: (item: ChecklistItem) => void, onDispatch?: () => void }) => {
    const { role } = useMode();
    const isManager = role === 'admin_manager_medicamentos';
    const [isExpanded, setIsExpanded] = useState(dispatch.status !== 'Aguardando Despacho' && isFirst);

    // Helper para status
    const getStatusStyle = (status: string) => {
        if (status === 'Aguardando Despacho') return 'text-white bg-amber-400';
        if (status === 'Em Andamento') return 'text-white bg-blue-500';
        if (status === 'Concluído') return 'text-white bg-emerald-500';
        return 'text-white bg-gray-400';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header Collapsible */}
            {/* Header Collapsible */}
            <div
                className={`p-3 bg-gray-50 flex items-center justify-between transition-colors ${dispatch.status === 'Aguardando Despacho' ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'
                    }`}
                onClick={() => dispatch.status !== 'Aguardando Despacho' && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${dispatch.status === 'Aguardando Despacho' ? 'bg-gray-100 text-gray-400' :
                        divisionColor === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {dispatch.status === 'Aguardando Despacho' ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {dispatch.cnaes.map((cnae: DispatchCnae, idx: number) => (
                                <span key={idx} className={`text-[10px] font-black px-2 py-0.5 rounded border-0 text-white shadow-sm flex items-center gap-1.5 ${cnae.risco === 'Alto Risco' ? 'bg-red-500' :
                                    cnae.risco === 'Médio Risco' ? 'bg-amber-500' :
                                        'bg-emerald-500'
                                    }`} title={`${cnae.codigo} - ${cnae.descricao} (${cnae.risco})`}>
                                    {cnae.codigo}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 truncate hidden sm:block">
                            {dispatch.cnaes.map((c: DispatchCnae) => c.descricao).join(' • ')}
                        </p>
                    </div>
                </div>

                {dispatch.status === 'Aguardando Despacho' && divisionColor === 'blue' ? (
                    <Button
                        size="sm"
                        className="ml-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs h-8 px-3 gap-1.5"
                        onClick={(e) => { e.stopPropagation(); onDispatch?.(); }}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Despachar Equipe
                    </Button>
                ) : (
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0 ${getStatusStyle(dispatch.status)}`}>
                        {dispatch.status}
                    </span>
                )}
            </div>

            {/* Body */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="sm:hidden mb-4 space-y-2">
                        {dispatch.cnaes.map((c: DispatchCnae, i: number) => (
                            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-100">
                                <p className="text-xs font-bold text-gray-900">{c.codigo}</p>
                                <p className="text-xs text-gray-600 italic">{c.descricao}</p>
                            </div>
                        ))}
                    </div>

                    {dispatch.status === 'Aguardando Despacho' ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                                <Clock className="w-6 h-6 text-amber-400" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Aguardando Equipe</h4>
                            <p className="text-xs text-gray-500 max-w-[250px] mb-4">
                                Este CNAE necessita de fiscalização mas ainda não possui equipe designada.
                            </p>
                            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                <UserPlus className="w-4 h-4" />
                                Despachar Equipe
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Info de Despacho */}
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

                            {/* Equipe */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Fiscal */}
                                <div className="border border-gray-100 rounded-xl p-3 relative hover:border-blue-200 transition-all bg-white shadow-sm ring-1 ring-gray-900/5">
                                    <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold text-blue-600/70 uppercase tracking-widest bg-white">
                                        Fiscal Responsável
                                    </span>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={dispatch.fiscal?.avatar} alt={dispatch.fiscal?.name} className="w-10 h-10 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Online"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{dispatch.fiscal?.name}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">{dispatch.fiscalRole}</p>
                                            </div>
                                        </div>

                                        {/* Botão de Troca/Adição para Medicamentos (GVDM / DVSDM) */}
                                        {(divisionCode === 'GVDM' || divisionCode === 'DVSDM') && (
                                            <button
                                                onClick={onDispatch}
                                                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group shrink-0 ml-4 shadow-sm"
                                                title="Alterar/Adicionar Fiscal"
                                            >
                                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Apoio */}
                                <div className="border border-gray-100 rounded-xl p-3 relative hover:border-blue-200 transition-all bg-white shadow-sm ring-1 ring-gray-900/5">
                                    <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">
                                        Equipe de Apoio
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 min-h-[48px]">
                                        {dispatch.team?.map((member: TeamMember, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-1 pr-4 py-1.5 shadow-sm hover:border-blue-200 transition-colors h-11" title={`${member.name} - ${member.role}`}>
                                                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full bg-gray-100 object-cover shadow-xs" />
                                                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{member.name.split(' ')[0]}</span>
                                            </div>
                                        ))}

                                        {/* Botão de Adição no Apoio para Medicamentos */}
                                        {(divisionCode === 'GVDM' || divisionCode === 'DVSDM') && (
                                            <button
                                                onClick={onDispatch}
                                                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group shadow-sm"
                                                title="Adicionar Membro de Apoio"
                                            >
                                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}

                                        {(!dispatch.team || dispatch.team.length === 0) && !isManager && (
                                            <span className="text-[10px] text-gray-400 italic">Nenhum apoio designado</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detalhes da Inspeção */}
                            {dispatch.activeInspection && (
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" />
                                            Termo {dispatch.activeInspection.termNumber}
                                        </h5>
                                        {dispatch.activeInspection.daysRemaining && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dispatch.activeInspection.daysRemaining <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {dispatch.activeInspection.daysRemaining} dias restantes
                                            </span>
                                        )}
                                    </div>
                                    {/* Componente InspectionDetails básico */}
                                    <InspectionDetails details={dispatch.activeInspection.details} />

                                    {/* Checklist Section - RESTAURADO */}
                                    {dispatch.activeInspection.checklist && dispatch.activeInspection.checklist.length > 0 && (
                                        <div className="mt-4 border-t border-gray-100 pt-3">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                Checklist ({dispatch.activeInspection.checklist.filter((i: ChecklistItem) => i.status === 'pending').length} pendentes)
                                            </p>
                                            <div className="space-y-2">
                                                {dispatch.activeInspection.checklist.map((item: ChecklistItem) => (
                                                    <div key={item.id} className="p-2.5 bg-gray-50/50 rounded-lg border border-gray-100 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${item.status === 'completed' ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                                                            {item.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-medium ${item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.item}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                {item.legislation && item.legislation.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onViewLegislation?.(item); }}
                                                                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors border border-blue-100 max-w-[200px]"
                                                                        title={item.legislation.map((l: LegislationDoc) => l.name).join('\n')}
                                                                    >
                                                                        <Scale className="w-3 h-3 flex-shrink-0" />
                                                                        <span className="truncate">
                                                                            {item.legislation.length === 1 ? item.legislation[0].name : `${item.legislation.length} Normas`}
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                {item.status === 'completed' ? (
                                                                    <span className="text-[10px] text-green-600 font-medium flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                                        <CheckCircle2 className="w-3 h-3" /> Cumprido
                                                                    </span>
                                                                ) : item.deadline && (
                                                                    <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                                                        Prazo: {item.deadline}
                                                                    </span>
                                                                )}

                                                                {item.evidenceDocs && item.evidenceDocs.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onViewEvidence?.(item); }}
                                                                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors font-bold bg-gray-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                        {item.evidenceDocs.length === 1 ? 'Ver Evidência' : `${item.evidenceDocs.length} Evidências`}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export const ProcessDetail = () => {
    const { role, userProfile } = useMode();
    const [parecer, setParecer] = useState('');
    const [activeStep, setActiveStep] = useState('inspecao');
    const [legislationModal, setLegislationModal] = useState<Omit<LegislationModalProps, 'onClose'> | null>(null);
    const [dispatchModal, setDispatchModal] = useState<{ isOpen: boolean; availableCnaes: DispatchCnae[]; preSelectedCnae?: string }>({ isOpen: false, availableCnaes: [] });

    const handleOpenDispatch = (dispatchItem: Dispatch) => {
        setDispatchModal({
            isOpen: true,
            availableCnaes: dispatchItem.cnaes,
            preSelectedCnae: dispatchItem.cnaes[0]?.codigo
        });
    };

    const handleConfirmDispatch = (data: DispatchConfirmData) => {
        console.log('Dados do Despacho:', data);
        setDispatchModal(prev => ({ ...prev, isOpen: false }));
    };

    const isProtocol = role === 'admin_protocol';
    const isManager = role === 'admin_manager_medicamentos';

    const canTakeAction = isProtocol || (isManager && processData.sector === userProfile.sector);

    const handleViewLegislation = (item: ChecklistItem) => {
        if (item.legislation && item.legislation.length > 0) {
            setLegislationModal({
                isOpen: true,
                title: 'Legislação Relacionada',
                documents: item.legislation
            });
        }
    };

    const handleViewEvidence = (item: ChecklistItem) => {
        if (item.evidenceDocs && item.evidenceDocs.length > 0) {
            setLegislationModal({
                isOpen: true,
                title: 'Evidências da Adequação',
                documents: item.evidenceDocs.map((doc: EvidenceDoc) => ({
                    name: doc.name,
                    url: doc.url || '#', // Placeholder URL
                    description: doc.type === 'image' ? 'Registro fotográfico' : 'Documento comprobatório'
                }))
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Em Análise': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Deferido': return 'bg-green-100 text-green-700 border-green-200';
            case 'Indeferido': return 'bg-red-100 text-red-700 border-red-200';
            case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
            case 'link': return <Link2 className="w-5 h-5 text-blue-600" />;
            default: return <FileType className="w-5 h-5 text-gray-500" />;
        }
    };

    const getDocStatus = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'not_required': return <Minus className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    return (
        <div className="pb-32 md:pb-8">
            {/* Header - Same for mobile and desktop */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/admin/triagem/licenciamento">
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Análise #{processData.analysisNumber}</h1>
                        <p className="text-xs md:text-sm text-gray-500">Licenciamento Sanitário • Protocolo {processData.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Printer className="w-4 h-4" /> Imprimir
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Download className="w-4 h-4" /> Exportar
                        </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
            </div>

            <ProcessTimeline activeStep={activeStep} setActiveStep={setActiveStep} />

            {/* MOBILE LAYOUT - Single column */}
            <div className="md:hidden space-y-4">
                {/* PROTOCOLO STEP - MOBILE */}
                {activeStep === 'protocolo' && (
                    <>
                        {/* Company Card - Mobile */}
                        <Card className="border-gray-200 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h2 className="text-base font-bold text-gray-900 truncate">{processData.company}</h2>
                                            <p className="text-xs text-gray-500">CNPJ: {processData.cnpj}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusColor(processData.status)}`}>
                                            {processData.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data Solicitação</p>
                                    <p className="text-sm font-bold text-gray-900">{processData.requestDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</p>
                                    <p className="text-sm font-bold text-gray-900">{processData.type}</p>
                                </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-600">{processData.address}</p>
                                        </div>
                                        <a href={processData.mapUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-50 gap-1 px-2 border border-blue-100">
                                                <ExternalLink className="w-3 h-3" /> MAPA
                                            </Button>
                                        </a>
                                    </div>
                                    <p className="text-[10px] text-gray-400 ml-6">CEP: {processData.cep}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 line-clamp-2">{processData.activity}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-bold text-gray-900">{processData.responsibleTech}</p>
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-100/50">
                                                    {processData.responsibleRole}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{processData.crf}</p>
                                        </div>
                                    </div>
                                    <a href={processData.crfCertificadoUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1 px-2">
                                            <FileText className="w-3 h-3" /> CERTIDÃO
                                        </Button>
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-bold text-gray-900">{processData.contact.name}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        {processData.contact.phones.map((phone, idx) => (
                                            <span key={idx} className="text-sm text-gray-600">
                                                {phone}{idx < processData.contact.phones.length - 1 && <span className="ml-2 text-gray-300">|</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Mail className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        {processData.contact.emails.map((email, idx) => (
                                            <span key={idx} className="text-sm text-blue-600 font-medium">
                                                {email}{idx < processData.contact.emails.length - 1 && <span className="ml-2 text-gray-300">|</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Validação de Protocolo - Mobile */}
                        <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Validação de Protocolo</h3>
                                    <p className="text-[10px] text-gray-500">Dados confirmados na abertura do processo</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* CNPJ Verification */}
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-medium text-gray-700">CNPJ Ativo</span>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{processData.cnpj}</span>
                                </div>

                                {/* CNAE Verification */}
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-medium text-gray-700">CNAE Compatível</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{processData.verificacoes.cnaes.principal}</span>
                                </div>

                                {/* DAM Status */}
                                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-bold text-gray-900">DAM Pago</span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Confirmado</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-400">Nº DAM:</span>
                                            <span className="ml-1 font-mono text-gray-700">{processData.verificacoes.dam.numero}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Valor:</span>
                                            <span className="ml-1 font-bold text-gray-900">R$ {processData.verificacoes.dam.valor.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Pago em:</span>
                                            <span className="ml-1 text-gray-700">{processData.verificacoes.dam.dataPagamento}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Banco:</span>
                                            <span className="ml-1 text-gray-700">{processData.verificacoes.dam.banco}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                {/* TRIAGEM STEP - MOBILE */}
                {activeStep === 'triagem' && (
                    <>
                        {/* Vínculos (Related Processes) - Mobile */}
                        {processData.vinculos && processData.vinculos.length > 0 && (
                            <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Link2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Processos Vinculados</h3>
                                            <p className="text-[10px] text-gray-500">{processData.vinculos.length} processos relacionados</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {processData.vinculos.map((vinculo) => (
                                        <div key={vinculo.id} className={`p-3 bg-white rounded-lg border ${vinculo.natureza === 'obrigatorio' ? 'border-red-200' : 'border-gray-100'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{vinculo.tipo}</p>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${vinculo.natureza === 'obrigatorio' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
                                                            {vinculo.natureza === 'obrigatorio' ? 'Obrigatório' : 'Acessório'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Protocolo {vinculo.id}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${vinculo.status === 'Deferido' ? 'text-green-600 bg-green-100' :
                                                    vinculo.status === 'Arquivado' ? 'text-gray-600 bg-gray-100' :
                                                        'text-amber-600 bg-amber-100'
                                                    }`}>
                                                    {vinculo.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                {vinculo.status === 'Deferido' ? 'Deferido' : vinculo.status === 'Arquivado' ? 'Arquivado' : 'Finalizado'} em {vinculo.dataDeferimento}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link to={vinculo.processUrl} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-8">
                                                        <ExternalLink className="w-3 h-3" /> Ver Processo
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="sm" className="flex-1 text-xs gap-1 h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                                                    <Download className="w-3 h-3" /> {vinculo.docLabel}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Documents - Mobile */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Documentos Gerais</h3>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {processData.docsGerais.filter(d => d.status === 'approved').length}/{processData.docsGerais.length}
                                </span>
                            </div>
                            <div className="space-y-2 mb-4">
                                {processData.docsGerais.slice(0, 3).map((doc) => (
                                    <Card key={doc.id} className="border-gray-200 shadow-sm !p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    {getDocIcon(doc.icon)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-full">
                                                <Eye className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Documentos Técnicos</h3>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {processData.docsTecnicos.filter(d => d.status === 'approved').length}/{processData.docsTecnicos.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {processData.docsTecnicos.slice(0, 3).map((doc) => (
                                    <Card key={doc.id} className="border-gray-200 shadow-sm !p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    {getDocIcon(doc.icon)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.type}{doc.size && ` • ${doc.size}`}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-full">
                                                {doc.icon === 'link' ? <ExternalLink className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* INSPECAO STEP - MOBILE */}
                {activeStep === 'inspecao' && (
                    <>
                        {/* Fiscalização Sanitária - Alto Risco - Mobile */}
                        {processData.riskLevel === 'Alto Risco' && processData.inspectionTeam && (
                            <Card className="border-red-100 shadow-sm bg-gradient-to-br from-red-50/50 to-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Monitoramento</h3>
                                            <p className="text-[10px] text-gray-500">Fiscal: {processData.inspectionTeam.fiscal.name}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 animate-pulse">EM CURSO</span>
                                </div>
                                {processData.activeInspection && (
                                    <div className="bg-white border border-gray-100 rounded-xl p-3">
                                        <p className="text-xs font-bold text-gray-900 mb-2">Termo {processData.activeInspection.termNumber}</p>
                                        <p className="text-[11px] text-gray-500 mb-1">Prazo: <span className="text-red-600 font-bold">{processData.activeInspection.deadline}</span></p>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3">
                                            <div className="bg-blue-600 h-full rounded-full w-1/3 shadow-sm"></div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Technical Opinion - Mobile */}
                        {canTakeAction && (
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-3">Parecer Técnico</h3>
                                <Card className="border-gray-200 shadow-sm !p-0">
                                    <textarea
                                        value={parecer}
                                        onChange={(e) => setParecer(e.target.value)}
                                        placeholder="Insira observações sobre a análise..."
                                        className="w-full h-32 p-4 text-sm text-gray-700 placeholder-gray-400 resize-none border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-inset outline-none"
                                    />
                                </Card>
                            </div>
                        )}
                    </>
                )}

                {/* LICENCIAMENTO STEP - MOBILE */}
                {activeStep === 'licenciamento' && (
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-3">Alvará Sanitário</h3>
                        <LicensePreviewCard processData={processData} />
                    </div>
                )}

                {/* HISTORY (Always visible in mobile at the bottom) */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <History className="w-4 h-4 text-gray-400" /> Histórico do Processo
                        </h3>
                    </div>
                    <Card className="border-gray-200 shadow-sm">
                        <div className="space-y-4">
                            {processData.history.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                        {i < 2 && <div className="absolute top-3 left-[3px] w-0.5 h-full bg-gray-100"></div>}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.action}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{item.date} • {item.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-600 font-bold text-xs hover:bg-blue-50 border border-blue-100/50 rounded-xl">
                            VER HISTÓRICO COMPLETO
                        </Button>
                    </Card>
                </div>
            </div>

            {/* DESKTOP LAYOUT - Multi-column */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* PROTOCOLO STEP - Desktop */}
                    {activeStep === 'protocolo' && (
                        <>
                            {/* Company Card - Desktop (expanded) */}
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
                                        <span className={`text-sm font-bold px-4 py-2 rounded-full border ${getStatusColor(processData.status)}`}>
                                            {processData.status}
                                        </span>
                                        {processData.riskLevel === 'Alto Risco' && (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                <AlertTriangle className="w-3 h-3" /> Alto Risco Sanitário
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Request Info Grid - Desktop */}
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

                                {/* Detail Sections Grid - Desktop */}
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
                                                            {processData.responsibleRole}
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
                                                <Building2 className="w-4 h-4 text-amber-500" />
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

                            {/* Validação de Protocolo - Desktop */}
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
                                        <p className="text-lg font-bold text-gray-900 font-mono">{processData.verificacoes.cnaes.principal}</p>
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
                                        <p className="text-lg font-bold text-gray-900">R$ {processData.verificacoes.dam.valor.toFixed(2)}</p>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                                            <p>Nº <span className="font-mono text-gray-700">{processData.verificacoes.dam.numero}</span></p>
                                            <p>Pago em <span className="font-medium text-gray-700">{processData.verificacoes.dam.dataPagamento}</span> via {processData.verificacoes.dam.banco}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* INSPEÇÃO STEP - Desktop */}
                    {activeStep === 'inspecao' && (
                        <>
                            {/* Fiscalização por Divisão - Cada CNAE tem sua equipe */}
                            {processData.divisionInspections && processData.divisionInspections.length > 0 && (
                                <div className="space-y-6">
                                    {/* Header geral */}
                                    <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                        <AlertTriangle className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">Fiscalização Sanitária por Atividade</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {processData.divisionInspections.length} setores trabalhando simultaneamente neste processo
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {processData.divisionInspections.map((div: DivisionInspection, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${div.divisaoColor === 'blue' ? 'text-blue-600 bg-blue-100' :
                                                                div.divisaoColor === 'emerald' ? 'text-emerald-600 bg-emerald-100' :
                                                                    'text-gray-600 bg-gray-100'
                                                                }`}
                                                        >
                                                            {div.divisao}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 pl-[52px]">
                                                {processData.divisionInspections?.flatMap((div: DivisionInspection) =>
                                                    div.cnaeDispatches?.flatMap((dispatch: Dispatch) =>
                                                        dispatch.cnaes?.map((cnae: DispatchCnae) => ({
                                                            codigo: cnae.codigo,
                                                            status: dispatch.status
                                                        })) || []
                                                    ) || []
                                                ).map((item: { codigo: string; status: string }, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className={`text-[10px] font-bold px-2 py-1 rounded border ${item.status === 'Aguardando Despacho'
                                                            ? 'bg-gray-100 text-gray-500 border-gray-200'
                                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                                            }`}
                                                    >
                                                        {item.codigo}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Integrações Card */}
                                    <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                        <Database className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">Integrações</h3>
                                                        <p className="text-xs text-gray-500">
                                                            Dados sincronizados com bases nacionais e regionais
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                                                    <RefreshCw className="w-3 h-3" /> Sincronizado agora
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* ANVISA Card */}
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                            <Globe className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">AFE Anvisa</p>
                                                            <p className="text-[10px] text-gray-500">Agência Nacional de Vig. Sanitária</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Ativa</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Autorização</span>
                                                        <span className="font-mono font-bold text-gray-900">AFE 1.23.456-7</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Publicação</span>
                                                        <span className="font-medium text-gray-900">DOU 15/03/2024</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Atividades</span>
                                                        <span className="font-medium text-gray-900 truncate max-w-[150px]" title="Dispensação de medicamentos sujeitos a controle especial">Dispensação de controlados</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CRF-PA Card */}
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                            <Shield className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">CRF-PA</p>
                                                            <p className="text-[10px] text-gray-500">Conselho Regional de Farmácia</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Regular</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Responsável Técnico</span>
                                                        <span className="font-bold text-gray-900 truncate max-w-[120px]">{processData.responsibleTech}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Registro</span>
                                                        <span className="font-mono font-medium text-gray-900">{processData.crf}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Certidão de Regularidade</span>
                                                        <a href={processData.crfCertificadoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                            Visualizar <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Cards por Divisão (NOVO MODULARIZADO) */}
                                    {processData.divisionInspections.map((division: DivisionInspection, divIdx: number) => (
                                        <Card
                                            key={divIdx}
                                            className={`shadow-sm ${division.divisaoColor === 'blue' ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-white' :
                                                division.divisaoColor === 'emerald' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white' :
                                                    'border-gray-200 bg-gradient-to-br from-gray-50/50 to-white'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${division.divisaoColor === 'blue' ? 'bg-blue-100' :
                                                        division.divisaoColor === 'emerald' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                        <Building2 className={`w-5 h-5 ${division.divisaoColor === 'blue' ? 'text-blue-600' :
                                                            division.divisaoColor === 'emerald' ? 'text-emerald-600' : 'text-gray-600'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-900">{division.divisaoNome}</h3>
                                                        <p className="text-xs text-gray-500">{division.cnaeDispatches?.length || 0} atividade(s) sob fiscalização</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${division.divisaoColor === 'blue' ? 'text-blue-600 bg-blue-100' :
                                                    division.divisaoColor === 'emerald' ? 'text-emerald-600 bg-emerald-100' : 'text-gray-600 bg-gray-100'
                                                    }`}>
                                                    {division.divisao}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {division.cnaeDispatches?.map((dispatch: Dispatch, dispatchIdx: number) => (
                                                    <CnaeDispatchCard
                                                        key={dispatchIdx}
                                                        dispatch={dispatch}
                                                        divisionCode={division.divisao}
                                                        divisionColor={division.divisaoColor}
                                                        isFirst={division.divisao !== 'GALE/A' && dispatchIdx === 0}
                                                        onViewLegislation={handleViewLegislation}
                                                        onViewEvidence={handleViewEvidence}
                                                        onDispatch={() => handleOpenDispatch(dispatch)}
                                                    />
                                                ))}
                                            </div>
                                        </Card>
                                    ))}

                                    {/* Integrações Card */}
                                    <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-purple-50 to-white mt-6">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                        <Database className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">Integrações</h3>
                                                        <p className="text-xs text-gray-500">
                                                            Dados sincronizados com bases nacionais e regionais
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                                                    <RefreshCw className="w-3 h-3" /> Sincronizado agora
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* ANVISA Card */}
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                            <Globe className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">AFE Anvisa</p>
                                                            <p className="text-[10px] text-gray-500">Agência Nacional de Vig. Sanitária</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Ativa</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Autorização</span>
                                                        <span className="font-mono font-bold text-gray-900">AFE 1.23.456-7</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Publicação</span>
                                                        <span className="font-medium text-gray-900">DOU 15/03/2024</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Atividades</span>
                                                        <span className="font-medium text-gray-900 truncate max-w-[150px]" title="Dispensação de medicamentos sujeitos a controle especial">Dispensação de controlados</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CRF-PA Card */}
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                            <Shield className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">CRF-PA</p>
                                                            <p className="text-[10px] text-gray-500">Conselho Regional de Farmácia</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Regular</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Responsável Técnico</span>
                                                        <span className="font-bold text-gray-900 truncate max-w-[120px]">{processData.responsibleTech}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Registro</span>
                                                        <span className="font-mono font-medium text-gray-900">{processData.crf}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Certidão de Regularidade</span>
                                                        <a href={processData.crfCertificadoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                            Visualizar <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    {/* Implementação antiga desabilitada */}
                                    {/* Código antigo desabilitado removido */}
                                </div>
                            )}
                        </>
                    )}

                    {/* TRIAGEM STEP - Desktop */}
                    {activeStep === 'triagem' && (
                        <>
                            {/* Vínculos (Related Processes) - Desktop */}
                            {processData.vinculos && processData.vinculos.length > 0 && (
                                <Card className="border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <Link2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Processos Vinculados</h3>
                                                <p className="text-xs text-gray-500">{processData.vinculos.length} processos relacionados a este licenciamento</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                                {processData.vinculos.filter(v => v.natureza === 'obrigatorio').length} Obrigatórios
                                            </span>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {processData.vinculos.filter(v => v.natureza === 'acessorio').length} Acessórios
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 border-b border-gray-100">
                                                        <div className="flex items-center min-h-[32px] text-[10px] font-bold text-gray-400 uppercase tracking-wider">Processo Vinculado</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center min-h-[32px] text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documento Emitido</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-center min-h-[32px] text-[10px] font-bold text-gray-400 uppercase tracking-wider">Natureza</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-center min-h-[32px] text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-end min-h-[32px] text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Ações</div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {processData.vinculos.map((vinculo) => (
                                                    <tr key={vinculo.id} className={`hover:bg-gray-50 transition-colors ${vinculo.natureza === 'obrigatorio' ? 'bg-red-50/30' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-bold text-gray-900">{vinculo.tipo}</p>
                                                                <p className="text-xs text-gray-500">Protocolo {vinculo.id} • {vinculo.status === 'Deferido' ? 'Deferido' : vinculo.status === 'Arquivado' ? 'Arquivado' : 'Finalizado'} em {vinculo.dataDeferimento}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{vinculo.documento.nome}</p>
                                                                <p className="text-xs text-gray-500 font-mono">{vinculo.documento.numero}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col justify-center min-h-[40px]">
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center justify-center ${vinculo.natureza === 'obrigatorio' ? 'text-red-600 bg-red-100' : 'text-gray-500 bg-gray-100'}`}>
                                                                    {vinculo.natureza === 'obrigatorio' ? 'Obrigatório' : 'Acessório'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center min-h-[40px]">
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center justify-center ${vinculo.status === 'Deferido' ? 'text-green-600 bg-green-100' :
                                                                    vinculo.status === 'Arquivado' ? 'text-gray-600 bg-gray-100' :
                                                                        'text-amber-600 bg-amber-100'
                                                                    }`}>
                                                                    {vinculo.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2 h-full min-h-[40px]">
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                                                                    title={vinculo.docLabel}
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                </Button>
                                                                <Link to={vinculo.processUrl}>
                                                                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2.5">
                                                                        <ExternalLink className="w-4 h-4" /> Processo
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}

                            {/* Documents - Desktop (expanded tables) */}
                            <Card className="border-gray-200 shadow-sm">
                                {/* Documentos Gerais */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Documentos Gerais</h3>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                            {processData.docsGerais.filter(d => d.status === 'approved').length}/{processData.docsGerais.length}
                                        </span>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documento</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tamanho</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ações</div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {processData.docsGerais.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {getDocIcon(doc.icon)}
                                                                <span className="font-medium text-gray-900">{doc.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">{doc.type}</td>
                                                        <td className="px-4 py-3 text-gray-500">{doc.size}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center min-h-[32px]">
                                                                {getDocStatus(doc.status)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1.5 h-full min-h-[32px]">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                                    <Eye className="w-4.5 h-4.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-100">
                                                                    <Download className="w-4.5 h-4.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Documentos Técnicos */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Documentos Técnicos</h3>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                            {processData.docsTecnicos.filter(d => d.status === 'approved').length}/{processData.docsTecnicos.length}
                                        </span>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documento</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tamanho</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
                                                    </th>
                                                    <th className="px-4 py-3 border-b border-gray-100">
                                                        <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ações</div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {processData.docsTecnicos.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {getDocIcon(doc.icon)}
                                                                <span className="font-medium text-gray-900">{doc.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">{doc.type}</td>
                                                        <td className="px-4 py-3 text-gray-500">{doc.size || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center min-h-[32px]">
                                                                {getDocStatus(doc.status)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1.5 h-full min-h-[32px]">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                                    {doc.icon === 'link' ? <ExternalLink className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                                                </Button>
                                                                {doc.icon !== 'link' && (
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-100">
                                                                        <Download className="w-4.5 h-4.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* INSPEÇÃO STEP - Desktop */}
                    {activeStep === 'inspecao' && (
                        <>
                            {/* Technical Opinion - Desktop */}
                            {canTakeAction && (
                                <Card className="border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Parecer Técnico</h3>

                                    {/* Alert for pending fiscal inspections */}
                                    {processData.riskLevel === 'Alto Risco' && (
                                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-amber-800">Aguardando Parecer Fiscal</p>
                                                <p className="text-xs text-amber-700 mt-0.5">
                                                    Este processo é classificado como <strong>Alto Risco</strong>. A emissão da licença requer parecer favorável da equipe técnica de fiscalização.
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {processData.divisionInspections.map((div) => {
                                                        const pendingDispatches = div.cnaeDispatches.filter(d =>
                                                            d.status === 'Aguardando Despacho' ||
                                                            (d.activeInspection && d.activeInspection.status !== 'Aprovado')
                                                        );
                                                        if (pendingDispatches.length === 0) return null;
                                                        return (
                                                            <span
                                                                key={div.divisao}
                                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${div.divisaoColor === 'blue'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    }`}
                                                            >
                                                                {div.divisaoNome}: {pendingDispatches.length} pendência(s)
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        value={parecer}
                                        onChange={(e) => setParecer(e.target.value)}
                                        placeholder="Insira observações técnicas sobre a análise do processo..."
                                        className="w-full h-40 p-4 text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />

                                    {/* Desktop Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                        <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                                            <X className="w-4 h-4" /> Indeferir
                                        </Button>
                                        <Button variant="outline" className="gap-2 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300">
                                            <AlertTriangle className="w-4 h-4" /> Solicitar Pendência
                                        </Button>
                                        <Button
                                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={processData.riskLevel === 'Alto Risco'}
                                            title={processData.riskLevel === 'Alto Risco' ? 'Aguardando parecer da equipe técnica' : ''}
                                        >
                                            <Check className="w-4 h-4" /> Deferir Licença
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* License Preview - Desktop */}
                    <LicensePreviewCard processData={processData} />

                    {/* History Timeline - Desktop only */}
                    <Card className="border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-500" /> Histórico
                            </h3>
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                        <div className="space-y-0 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[5.5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                            {processData.history.map((item, i) => {
                                const isLast = i === processData.history.length - 1;
                                return (
                                    <div key={i} className="flex gap-4 group relative">
                                        <div className="flex flex-col items-center">
                                            <div className={`z-10 w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${isLast
                                                ? 'bg-blue-600 ring-4 ring-blue-50 scale-110'
                                                : 'bg-blue-400'
                                                }`}>
                                                {isLast && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                            </div>
                                        </div>
                                        <div className={`pb-6 ${isLast ? 'pb-2' : ''}`}>
                                            <p className={`text-xs font-bold leading-tight transition-colors ${isLast ? 'text-blue-700' : 'text-gray-700'
                                                }`}>
                                                {item.action}
                                            </p>
                                            <div className="flex flex-col mt-1 gap-0.5">
                                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5 opacity-60" /> {item.date}
                                                </p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <User className="w-2.5 h-2.5 opacity-60" /> {item.user}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <p className="text-[10px] text-blue-700 font-medium flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Próxima etapa: Vistoria In Loco
                            </p>
                        </div>
                    </Card>

                    {/* Quick Actions - Desktop only */}
                    <Card className="border-gray-200 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-3">Ações Rápidas</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Enviar Mensagem</p>
                                    <p className="text-xs text-gray-500">Contatar o requerente</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <ExternalLink className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Consultar CNPJ</p>
                                    <p className="text-xs text-gray-500">Verificar na Receita Federal</p>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Read-only notice */}


            {/* Fixed Action Bar - Mobile Only */}
            {canTakeAction && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 gap-2 border-red-200 text-red-600 hover:bg-red-50 font-bold">
                            <X className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 gap-2 border-amber-200 text-amber-600 hover:bg-amber-50 font-bold">
                            <AlertTriangle className="w-4 h-4" />
                        </Button>
                        <Button className="flex-[2] h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/25">
                            <Check className="w-4 h-4" /> Deferir
                        </Button>
                    </div>
                </div>
            )}
            {/* Modal de Legislação */}
            {legislationModal && (
                <LegislationModal
                    isOpen={legislationModal.isOpen}
                    onClose={() => setLegislationModal(null)}
                    title={legislationModal.title}
                    documents={legislationModal.documents}
                />
            )}

            {dispatchModal.isOpen && (
                <DispatchModal
                    isOpen={dispatchModal.isOpen}
                    onClose={() => setDispatchModal(prev => ({ ...prev, isOpen: false }))}
                    availableCnaes={dispatchModal.availableCnaes}
                    preSelectedCnae={dispatchModal.preSelectedCnae}
                    onConfirm={handleConfirmDispatch}
                />
            )}
        </div>
    );
};

// License Preview Card Component
interface LicenseData {
    company: string;
    license: { validity: string; number: string; hash: string };
}

const LicensePreviewCard = ({ processData }: { processData: LicenseData }) => (
    <Card className="border-gray-200 shadow-lg bg-white relative overflow-hidden group">
        {/* Background Decorative Element */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

        {/* Draft/Preview Ribbon */}
        <div className="absolute -left-12 top-6 -rotate-45 bg-amber-500 text-white text-[8px] font-black py-1 w-40 text-center shadow-sm z-20">
            EM ANÁLISE • PRÉVIA
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Município de Belém</p>
                </div>
                <p className="text-base font-bold text-gray-900 leading-tight">Licença Sanitária Digital</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm transform group-hover:rotate-6 transition-transform">
                <QrCode className="w-6 h-6 text-gray-400" />
            </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 relative z-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Estabelecimento</p>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-blue-50/30 transition-colors">
                <p className="text-xs font-black text-gray-900 leading-snug">{processData.company.toUpperCase()} LTDA</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 relative z-10">
            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Calendar className="w-2.5 h-2.5" /> Validade
                </p>
                <p className="text-xs font-black text-gray-900 opacity-40">{processData.license.validity}</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FileText className="w-2.5 h-2.5" /> Nº Licença
                </p>
                <p className="text-xs font-black text-blue-600 font-mono tracking-tighter opacity-40">{processData.license.number}</p>
            </div>
        </div>

        <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></div>
                    AGUARDANDO EMISSÃO
                </div>
                <span className="font-mono text-gray-300 italic">Pendente Deferimento</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            </div>
        </div>
    </Card>
);
