import { useState, type ChangeEvent } from 'react';
import {
    Building2,
    MapPin,
    ShieldCheck,
    Edit3,
    Lock,
    User,
    Users,
    Activity,
    AlertCircle,
    FileCheck,
    Plus,
    ExternalLink,
    ChevronRight,
    Search,
    Phone,
    Mail,
    MessageSquare,
    ChevronDown as ChevronDownIcon,
    Shield
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useMode } from '../contexts/ModeContext';

interface InfoFieldProps {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    readOnly?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    verified?: boolean;
    isEditing?: boolean;
}

const InfoField = ({ label, value, icon: Icon, readOnly = true, onChange, verified, isEditing }: InfoFieldProps) => (
    <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            {Icon && <Icon className="w-3 h-3" />} {label}
            {readOnly && <Lock className="w-2.5 h-2.5 text-gray-300" />}
        </label>
        <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border border-transparent bg-gray-50/50",
            !readOnly && isEditing ? "bg-white border-blue-200 ring-2 ring-blue-500/5" : ""
        )}>
            {isEditing && !readOnly ? (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent border-none text-sm font-bold text-gray-900 outline-none"
                />
            ) : (
                <span className={cn("text-sm font-bold", readOnly ? "text-gray-500" : "text-gray-950")}>{value || '---'}</span>
            )}
            {verified && (
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    <FileCheck className="w-3 h-3 text-green-600" />
                    <span className="text-[9px] font-black text-green-700 uppercase tracking-tighter">Validado</span>
                </div>
            )}
        </div>
    </div>
);

export const CompanySettings = () => {
    const { userProfile, setActiveUnit } = useMode();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'units' | 'licenses' | 'access'>('info');

    // Mock company data (CNPJ based)
    const [companyInfo, setCompanyInfo] = useState({
        cnpjMatriz: "12.345.678/0001-90",
        razaoSocial: "EMPREENDIMENTOS PAGUE MENOS S/A",
        nomeFantasia: "ExtraFarma",
        website: "www.extrafarma.com.br",
        emailCnpj: "contato-oficial@extrafarma.com.br",
        emailContato: "operacional@extrafarma.com.br",
        telefoneCnpj: "(91) 3222-1010",
        telefoneContato: "(91) 98888-2020",
        contatoFinanceiro: "financeiro@extrafarma.com.br",
        responsavelTecnicoGeral: "Dra. Maria Oliveira (CRF/PA 4567)"
    });

    const qsa = [
        { name: "Mário Queirós", role: "Sócio-Administrador", since: "2010" },
        { name: "Patrícia Queirós", role: "Diretor", since: "2012" },
        { name: "Pague Menos Participações S/A", role: "Sócio", since: "2010" }
    ];

    const cnaesVisa = [
        {
            code: "4771-7/03",
            risk: "Alto Risco",
            description: "Comércio varejista de produtos farmacêuticos homeopáticos e fitoterápicos",
            questions: [
                { id: 1, text: "O estabelecimento realiza manipulação de fórmulas homeopáticas?", answer: "Sim", status: "Validado" },
                { id: 2, text: "Possui laboratório próprio de controle de qualidade?", answer: "Sim, equipado com espectrofotômetro e balanças de precisão", status: "Validado" }
            ]
        },
        {
            code: "4771-7/01",
            risk: "Alto Risco",
            description: "Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas",
            questions: [
                { id: 3, text: "Possui sistema de climatização com monitoramento de temperatura 24h?", answer: "Sim, via sensores Wi-Fi com log digital", status: "Em Revisão" }
            ]
        },
        { code: "4772-5/00", risk: "Baixo Risco", description: "Comércio varejista de cosméticos, produtos de perfumaria e de higiene pessoal" },
        { code: "4721-1/04", risk: "Baixo Risco", description: "Comércio varejista de doces, balas, bombons e semelhantes" },
        { code: "4729-6/02", risk: "Baixo Risco", description: "Comércio varejista de mercadorias em geral (Minimercados)" }
    ];

    const [expandedCnaes, setExpandedCnaes] = useState<string[]>([]);

    const toggleCnaeAccordion = (code: string) => {
        setExpandedCnaes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const representatives = [
        {
            id: 'PRO-2025-001',
            name: "Escritório de Contabilidade Belém Ltda",
            cnpj: "98.765.432/0001-10",
            role: "Responsável (Contabilidade)",
            units: ["ExtraFarma Nazaré", "ExtraFarma Umarizal", "ExtraFarma Batista Campos"],
            documentName: "Procuração_Geral_Belém_2025.pdf",
            status: "Ativo"
        },
        {
            id: 'PRO-2025-002',
            name: "Dr. Roberto Silva",
            cnpj: "123.456.789-00",
            role: "Procurador Jurídico",
            units: ["Todas as Unidades"],
            documentName: "Contrato_Assessoria_Juridica.pdf",
            status: "Ativo"
        }
    ];

    const licenses = [
        { id: 'LF-2025-001', type: 'Licença de Funcionamento', unit: 'Nazaré', status: 'Ativa', expiry: '15/12/2026' },
        { id: 'APA-2025-042', type: 'Aprovação de Projeto', unit: 'Umarizal', status: 'Em Análise', expiry: '--' },
        { id: 'LF-2024-198', type: 'Licença de Funcionamento', unit: 'Batista Campos', status: 'Expirada', expiry: '01/01/2025' },
    ];

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <main className="flex-1 space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 lowercase">
                        <Building2 className="w-7 h-7 text-blue-600" /> Gestão do Grupo Econômico
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold text-[10px]">Raiz CNPJ: {companyInfo.cnpjMatriz.substring(0, 10)} (Filtro: Município Belém + Escopo VISA)</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-[#102a43] text-white font-black text-xs px-6 hover:bg-[#243b53] gap-2">
                        <Plus className="w-4 h-4" /> Nova Unidade
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-px overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('info')}
                    className={cn(
                        "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative top-[1px]",
                        activeTab === 'info' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                >
                    Dados Jurídicos
                </button>
                <button
                    onClick={() => setActiveTab('units')}
                    className={cn(
                        "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative top-[1px] flex items-center gap-2",
                        activeTab === 'units' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                >
                    Unidades Reguladas <span className="bg-gray-100 text-gray-500 px-1.5 rounded text-[9px]">{userProfile.units?.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('licenses')}
                    className={cn(
                        "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative top-[1px]",
                        activeTab === 'licenses' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                >
                    Portfolio de Licenças
                </button>
                <button
                    onClick={() => setActiveTab('access')}
                    className={cn(
                        "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative top-[1px] flex items-center gap-2",
                        activeTab === 'access' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                >
                    Gestão de Acesso <Shield className="w-3 h-3 opacity-50" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Dados do Grupo (Raiz)</h3>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Informações consolidadas para estabelecimentos em Belém</p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                        Vigilância Sanitária
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <InfoField label="Razão Social" value={companyInfo.razaoSocial} verified isEditing={isEditing} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InfoField label="Nome Fantasia" value={companyInfo.nomeFantasia} verified isEditing={isEditing} />
                                    </div>
                                    <InfoField label="CNPJ Raiz" value={companyInfo.cnpjMatriz} isEditing={isEditing} />
                                    <InfoField label="Responsável Geral" value={companyInfo.responsavelTecnicoGeral} verified isEditing={isEditing} />

                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-100">
                                        <InfoField label="Telefone (Receita Federal)" value={companyInfo.telefoneCnpj} icon={Phone} isEditing={isEditing} />
                                        <InfoField
                                            label="Telefone Adicional / Contato"
                                            value={companyInfo.telefoneContato}
                                            icon={Phone}
                                            readOnly={false}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyInfo({ ...companyInfo, telefoneContato: e.target.value })}
                                            isEditing={isEditing}
                                        />
                                        <InfoField label="E-mail (Receita Federal)" value={companyInfo.emailCnpj} icon={Mail} isEditing={isEditing} />
                                        <InfoField
                                            label="E-mail de Contato"
                                            value={companyInfo.emailContato}
                                            icon={Mail}
                                            readOnly={false}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyInfo({ ...companyInfo, emailContato: e.target.value })}
                                            isEditing={isEditing}
                                        />
                                        <InfoField
                                            label="Faturamento / Financeiro"
                                            value={companyInfo.contatoFinanceiro}
                                            readOnly={false}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyInfo({ ...companyInfo, contatoFinanceiro: e.target.value })}
                                            isEditing={isEditing}
                                        />
                                        <InfoField
                                            label="Website Institutional"
                                            value={companyInfo.website}
                                            readOnly={false}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                                            isEditing={isEditing}
                                        />
                                    </div>
                                </div>
                                {isEditing ? (
                                    <div className="mt-8 flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                        <Button onClick={handleSave} className="bg-blue-600 text-white px-8">Salvar</Button>
                                    </div>
                                ) : (
                                    <div className="mt-8 flex justify-end">
                                        <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                                            <Edit3 className="w-4 h-4" /> Editar Informações
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* QSA Section */}
                                <Card className="p-6 flex flex-col">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Quadro Societário (QSA)</div>
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[8px]">{qsa.length}</span>
                                    </h3>
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        {qsa.map((socio, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{socio.name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{socio.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {qsa.length > 5 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 text-center">
                                            <button className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700">Ver lista completa</button>
                                        </div>
                                    )}
                                </Card>

                                {/* CNAEs Section */}
                                <Card className="p-6 flex flex-col">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Atividades Reguladas (VISA)</div>
                                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px]">{cnaesVisa.length}</span>
                                    </h3>
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-100 scrollbar-track-transparent">
                                        {cnaesVisa.map((cnae, idx) => (
                                            <div key={idx} className={cn(
                                                "p-3 rounded-xl border transition-all duration-300",
                                                cnae.risk === "Alto Risco" ? "bg-red-50/30 border-red-100/50" : "bg-blue-50/30 border-blue-100/50"
                                            )}>
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-mono font-black px-1.5 py-0.5 rounded leading-none",
                                                            cnae.risk === "Alto Risco" ? "text-red-600 bg-red-100" : "text-blue-600 bg-blue-100"
                                                        )}>{cnae.code}</span>
                                                        <p className={cn(
                                                            "text-[9px] font-black uppercase tracking-tighter",
                                                            cnae.risk === "Alto Risco" ? "text-red-700" : "text-blue-700"
                                                        )}>{cnae.risk}</p>
                                                    </div>
                                                    {cnae.questions && (
                                                        <button
                                                            onClick={() => toggleCnaeAccordion(cnae.code)}
                                                            className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors"
                                                        >
                                                            {expandedCnaes.includes(cnae.code) ? 'Recolher' : 'Ver Perguntas'}
                                                            <ChevronDownIcon className={cn("w-3 h-3 transition-transform", expandedCnaes.includes(cnae.code) ? 'rotate-180' : '')} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-700 leading-tight mb-2">{cnae.description}</p>

                                                {/* Questions Accordion */}
                                                {expandedCnaes.includes(cnae.code) && cnae.questions && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        {cnae.questions.map((q) => (
                                                            <div key={q.id} className="space-y-1.5 p-2 rounded-lg bg-white/50 border border-white">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase leading-none">{q.text}</p>
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{q.answer}</p>
                                                                    <span className={cn(
                                                                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0",
                                                                        q.status === 'Validado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                                    )}>{q.status}</span>
                                                                </div>
                                                                <div className="flex justify-end pt-1">
                                                                    <button className="text-[9px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1">
                                                                        <MessageSquare className="w-2.5 h-2.5" /> Solicitar Revisão
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Card className="p-5 bg-blue-50/50 border-blue-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">Selo de Integridade</h4>
                                    <p className="text-[10px] text-gray-500 leading-tight">Dados fiscais 100% validados pela Receita Federal.</p>
                                </div>
                            </Card>

                            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" /> Atenção ao Cadastro
                                </h4>
                                <p className="text-[10px] text-amber-800 leading-relaxed">
                                    Campos marcados com o cadeado são extraídos diretamente do CNPJ e não permitem alteração manual.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'units' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userProfile.units?.map((unit) => (
                            <Card key={unit.id} className="p-6 flex flex-col group hover:shadow-xl transition-all duration-500 border-gray-100 hover:border-blue-200">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                        unit.status === 'Regular' ? "bg-green-50 text-green-600" : unit.status === 'Pendente' ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"
                                    )}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                        unit.status === 'Regular' ? "bg-green-100 text-green-700" : unit.status === 'Pendente' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {unit.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase leading-tight mb-1">{unit.name}</h3>
                                <p className="text-[10px] font-mono text-gray-400">{unit.cnpj}</p>
                                <p className="text-[11px] text-gray-500 mt-3 line-clamp-1 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" /> {unit.address}
                                </p>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        onClick={() => setActiveUnit(unit.id)}
                                        className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        Selecionar <ChevronRight className="w-3 h-3" />
                                    </button>
                                    <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'licenses' && (
                    <Card className="overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Portfolio de Alvarás e Licenças</h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Filtrar licença..." className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/10 outline-none w-64" />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                                        <th className="px-6 py-4">Tipo de Documento</th>
                                        <th className="px-6 py-4">Unidade</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Vencimento</th>
                                        <th className="px-6 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {licenses.map((license) => (
                                        <tr key={license.id} className="hover:bg-blue-50/20 transition-colors group text-left">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <FileCheck className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 leading-none">{license.type}</p>
                                                        <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">#{license.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded uppercase">{license.unit}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                                                    license.status === 'Ativa' ? "bg-green-100 text-green-700" : license.status === 'Expirada' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {license.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-gray-600">{license.expiry}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-100 shadow-sm">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'access' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-black text-blue-900 uppercase tracking-tight text-lg leading-tight">Responsável pelo Grupo Econômico</h3>
                                <p className="text-sm text-blue-700 mt-1 max-w-2xl font-medium">
                                    A gestão é baseada na raiz do CNPJ. Você pode atribuir a responsabilidade da gestão de processos da Vigilância Sanitária de unidades específicas localizadas em Belém para terceiros. Apenas estabelecimentos com CNAEs passíveis de fiscalização são listados.
                                </p>
                            </div>
                            <Button className="bg-[#102a43] text-white font-black text-xs px-6 hover:bg-[#243b53] gap-2">
                                <Plus className="w-4 h-4" /> Novo Responsável / Procurador
                            </Button>
                        </div>

                        <Card className="overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Responsáveis e Procuradores Cadastrados</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                                            <th className="px-6 py-4">Responsável / Procurador</th>
                                            <th className="px-6 py-4">Unidades Sob Gestão</th>
                                            <th className="px-6 py-4">Respaldo Jurídico</th>
                                            <th className="px-6 py-4 text-right">Controle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {representatives.map((representative) => (
                                            <tr key={representative.id} className="hover:bg-blue-50/20 transition-colors group text-left">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent">
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 leading-none">{representative.name}</p>
                                                            <p className="text-[10px] font-mono text-gray-500 mt-1">{representative.cnpj}</p>
                                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{representative.role}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                        {representative.units.map((unit, i) => (
                                                            <span key={i} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                                                                {unit}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()}
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group/link p-2 bg-blue-50 rounded-xl border border-blue-100 w-fit"
                                                        title="Visualizar Procuração / Contrato PDF"
                                                    >
                                                        <FileCheck className="w-4 h-4 text-blue-500 group-hover/link:scale-110 transition-transform" />
                                                        <div className="text-left">
                                                            <p className="text-[9px] font-bold text-blue-800 leading-none">{representative.documentName}</p>
                                                            <p className="text-[8px] font-black uppercase text-blue-400 mt-0.5 tracking-widest">Documento Válido</p>
                                                        </div>
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="Revogar Procuração">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
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
            </div>
        </main>
    );
};
