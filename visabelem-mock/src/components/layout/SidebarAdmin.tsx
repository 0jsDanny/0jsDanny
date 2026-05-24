import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Files,
    Users,
    Settings,
    ShieldCheck,
    ClipboardList,
    ChevronDown,
    ChevronRight,
    Layers,
    Archive,
    FileCheck,
    FolderOpen,
    Grid,
    BarChart3,
    MessageSquare,
    Ticket,
    ChefHat,
    X,
    Utensils,
    Stethoscope,
    Pill,
    Building,
    CreditCard,
    FileX,
    Scale,
    Droplet,
    ShieldAlert,
    Ban,
    FlaskConical,
    FileWarning,
    Calendar,
    Award,
    Map,
    MapPin,
    Briefcase
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
}

interface NavItemProps {
    to?: string;
    icon: LucideIcon;
    label: string;
    badge?: number;
    onClick?: () => void;
    isOpen: boolean;
    isMobile: boolean;
}

const NavItem = ({ to, icon: Icon, label, badge, onClick, isOpen, isMobile }: NavItemProps) => {
    const content = (
        <>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className={cn(
                "whitespace-nowrap font-bold transition-all duration-200",
                !isOpen && !isMobile ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            )}>
                {label}
            </span>
            {badge && badge > 0 && (isOpen || isMobile) && (
                <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md ml-auto bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </>
    );

    const baseClasses = cn(
        "flex items-center px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider",
        !isOpen && !isMobile ? 'gap-0 justify-center px-2' : 'gap-3'
    );

    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive: active }) => cn(
                    baseClasses,
                    active
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-100/50"
                        : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                )}
                title={!isOpen && !isMobile ? label : undefined}
            >
                {content}
            </NavLink>
        );
    }

    return (
        <button onClick={onClick} className={cn(baseClasses, "w-full text-slate-600 hover:text-emerald-600 hover:bg-slate-50")} title={!isOpen && !isMobile ? label : undefined}>
            {content}
        </button>
    );
};

interface SubMenuItemProps {
    to: string;
    icon?: LucideIcon;
    label: string;
    badge?: number;
    isOpen: boolean;
    isMobile: boolean;
}

const SubMenuItem = ({ to, icon: Icon, label, badge, isOpen, isMobile }: SubMenuItemProps) => (
    <NavLink
        to={to}
        className={({ isActive: active }) => cn(
            "w-full flex items-center px-4 py-2 text-xs rounded-xl transition-colors",
            active
                ? "text-emerald-700 bg-emerald-50/50 font-bold"
                : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50",
            !isOpen && !isMobile ? 'justify-center px-2 gap-0' : 'justify-between gap-2'
        )}
        title={!isOpen && !isMobile ? label : undefined}
    >
        <div className={cn("flex items-center min-w-0", !isOpen && !isMobile ? 'gap-0 justify-center' : 'flex-1 gap-3')}>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span className={cn(!isOpen && !isMobile ? 'hidden' : '', "truncate")}>{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (isOpen || isMobile) && (
            <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                {badge}
            </span>
        )}
    </NavLink>
);

interface MenuSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    isMobile: boolean;
}

const MenuSection = ({ title, children, isOpen, isMobile }: MenuSectionProps) => (
    <div className={cn("pt-4 pb-2", !isOpen && !isMobile ? 'mt-4 pt-4 border-t border-slate-100' : '')}>
        <div className={cn(
            "text-[9px] font-black uppercase tracking-widest mb-2 text-slate-400 px-3",
            !isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'
        )}>
            {title}
        </div>
        {children}
    </div>
);

interface ExpandableMenuProps {
    icon: LucideIcon;
    label: string;
    isExpanded: boolean;
    setIsExpanded: (v: boolean) => void;
    isActiveParent: boolean;
    badge?: number;
    children: React.ReactNode;
    isOpen: boolean;
    isMobile: boolean;
}

const ExpandableMenu = ({
    icon: Icon,
    label,
    isExpanded,
    setIsExpanded,
    isActiveParent,
    badge,
    children,
    isOpen,
    isMobile
}: ExpandableMenuProps) => (
    <div>
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "w-full flex items-center py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider",
                !isOpen && !isMobile ? 'justify-center px-2' : 'justify-between px-4',
                isActiveParent
                    ? "text-emerald-700 bg-emerald-50 border border-emerald-100/50"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
            )}
            title={!isOpen && !isMobile ? label : undefined}
        >
            <div className={cn("flex items-center", !isOpen && !isMobile ? 'gap-0' : 'gap-3')}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn(
                    "whitespace-nowrap transition-all duration-200 font-bold",
                    !isOpen && !isMobile ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                )}>
                    {label}
                </span>
                {!isExpanded && badge && badge > 0 && (isOpen || isMobile) && (
                    <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md ml-2 bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                        {badge}
                    </span>
                )}
            </div>
            {(isOpen || isMobile) && (
                <div className="transition-transform duration-200">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
            )}
        </button>
        <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}>
            <div className={cn("mt-1 space-y-1", !isOpen && !isMobile ? 'pl-0' : 'pl-4')}>
                {children}
            </div>
        </div>
    </div>
);

export const SidebarAdmin = ({ isOpen, toggleSidebar, isMobile }: SidebarProps) => {
    const location = useLocation();

    // Submenu states
    const [isTriageOpen, setIsTriageOpen] = useState(() => location.pathname.includes('/admin/triagem'));
    const [isSetoresOpen, setIsSetoresOpen] = useState(() => location.pathname.includes('/admin/setores'));
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(() => location.pathname.includes('/admin/documentos'));
    const [isFiscalizacaoOpen, setIsFiscalizacaoOpen] = useState(() => location.pathname.includes('/admin/fiscalizacao'));
    const [isManipuladoresOpen, setIsManipuladoresOpen] = useState(() => location.pathname.includes('/admin/manipuladores'));
    const [isMapeamentoOpen, setIsMapeamentoOpen] = useState(() => location.pathname.includes('/admin/mapeamento'));
    const [isPrescritoresOpen, setIsPrescritoresOpen] = useState(() => location.pathname.includes('/admin/prescritores'));
    const [isRHOpen, setIsRHOpen] = useState(() => location.pathname.includes('/admin/rh'));

    const isTriageActive = location.pathname.includes('/admin/triagem');
    const isSetoresActive = location.pathname.includes('/admin/setores');
    const isDocumentsActive = location.pathname.includes('/admin/documentos');
    const isFiscalizacaoActive = location.pathname.includes('/admin/fiscalizacao');
    const isManipuladoresActive = location.pathname.includes('/admin/manipuladores');
    const isMapeamentoActive = location.pathname.includes('/admin/mapeamento');
    const isPrescritoresActive = location.pathname.includes('/admin/prescritores');
    const isRHActive = location.pathname.includes('/admin/rh');

    // Mock badges
    const triageCounts = { licenciamento: 10, diversos: 7 };
    const totalTriageBadge = triageCounts.licenciamento + triageCounts.diversos;
    const chatBadge = 2;
    const ticketBadge = 1;

    const sidebarClasses = cn(
        "flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-slate-100 text-slate-600",
        isMobile
            ? `fixed inset-y-0 left-0 z-50 shadow-xl transform h-screen ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}`
            : `${isOpen ? 'w-72 min-w-[288px] max-w-[288px]' : 'w-20 min-w-[80px] max-w-[80px]'} sticky top-0 h-screen`
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <div className={sidebarClasses}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-center relative border-b border-slate-100">
                    <NavLink to="/admin" className={cn("flex items-center gap-3 transition-all duration-200", !isOpen && !isMobile ? 'justify-center w-full' : '')}>
                        <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-emerald-400">
                            <ShieldCheck className={cn("transition-all duration-300", !isOpen && !isMobile ? 'w-6 h-6' : 'w-5 h-5')} />
                        </div>
                        <span className={cn(
                            "text-base font-black tracking-tight text-slate-850 transition-opacity duration-200 uppercase",
                            !isOpen && !isMobile ? 'opacity-0 hidden w-0 overflow-hidden' : 'opacity-100 w-auto'
                        )}>
                            Visabelem
                        </span>
                    </NavLink>

                    {isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-750"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest mb-3 text-slate-400 px-3",
                        !isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'
                    )}>
                        Menu Principal
                    </div>

                    <nav className="space-y-1">
                        <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" isOpen={isOpen} isMobile={isMobile} />

                        <MenuSection title="Apps" isOpen={isOpen} isMobile={isMobile}>
                            <NavItem to="/admin/chat" icon={MessageSquare} label="Chat" badge={chatBadge} isOpen={isOpen} isMobile={isMobile} />
                            <NavItem to="/admin/relatorios" icon={Files} label="Relatórios" isOpen={isOpen} isMobile={isMobile} />
                            <NavItem to="/admin/analiticos" icon={BarChart3} label="Analíticos" isOpen={isOpen} isMobile={isMobile} />

                            {/* Processos Submenu */}
                            <ExpandableMenu
                                icon={Users}
                                label="Processos"
                                isExpanded={isTriageOpen}
                                setIsExpanded={setIsTriageOpen}
                                isActiveParent={isTriageActive}
                                badge={totalTriageBadge}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/triagem/licenciamento" icon={ClipboardList} label="Licenciamento" badge={triageCounts.licenciamento} isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/triagem/diversos" icon={Layers} label="Diversos" badge={triageCounts.diversos} isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            {/* Arquivo */}
                            <NavItem to="/admin/arquivo" icon={Archive} label="Arquivo" isOpen={isOpen} isMobile={isMobile} />

                            {/* Setores Submenu */}
                            <ExpandableMenu
                                icon={Grid}
                                label="Setores"
                                isExpanded={isSetoresOpen}
                                setIsExpanded={setIsSetoresOpen}
                                isActiveParent={isSetoresActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/setores/alimentos" icon={Utensils} label="Alimentos" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/setores/engenharia" icon={Building} label="Engenharia" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/setores/saude" icon={Stethoscope} label="Saúde" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/setores/medicamentos" icon={Pill} label="Medicamentos" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            {/* Documentos Submenu */}
                            <ExpandableMenu
                                icon={FolderOpen}
                                label="Documentos"
                                isExpanded={isDocumentsOpen}
                                setIsExpanded={setIsDocumentsOpen}
                                isActiveParent={isDocumentsActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/documentos/licenca-funcionamento" icon={FileCheck} label="LF Licença de Funcionamento" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/projeto" icon={Layers} label="APA Aprovação de Projeto Arq." isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/carta-credito" icon={CreditCard} label="CC Carta de Crédito" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/relatorio-inspecao" icon={ClipboardList} label="RI Relatório de Inspeção" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/auto-infracao" icon={Scale} label="AI Auto de Infração" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/autorizacao-ambiental" icon={Droplet} label="SAC/SAA Água para Consumo" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/documentos/dispensa-licenca" icon={FileX} label="DLF Dispensa da Licença de Func." isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            {/* Fiscalização Submenu */}
                            <ExpandableMenu
                                icon={ShieldAlert}
                                label="Fiscalização"
                                isExpanded={isFiscalizacaoOpen}
                                setIsExpanded={setIsFiscalizacaoOpen}
                                isActiveParent={isFiscalizacaoActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/fiscalizacao/tis" icon={ClipboardList} label="TIS Termo de Inspeção Sanitária" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/fiscalizacao/ti" icon={FileWarning} label="TI Termo de Intimação" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/fiscalizacao/aap" icon={Archive} label="AAP Auto de Apreensão" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/fiscalizacao/tic" icon={Ban} label="TIC Termo Interdição Cautelar" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/fiscalizacao/tca" icon={FlaskConical} label="TCA Termo Colheita de Amostra" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>
                        </MenuSection>

                        {/* FUTURE FEATURES - SIMULATED */}
                        <MenuSection title="Diversos" isOpen={isOpen} isMobile={isMobile}>
                            <ExpandableMenu
                                icon={ChefHat}
                                label="Manip. Alimentos"
                                isExpanded={isManipuladoresOpen}
                                setIsExpanded={setIsManipuladoresOpen}
                                isActiveParent={isManipuladoresActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/manipuladores/inicio" icon={ChefHat} label="Início" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/manipuladores/analiticos" icon={BarChart3} label="Analíticos" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/manipuladores/triagem" icon={ClipboardList} label="Triagem" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/manipuladores/agendamento" icon={Calendar} label="Agendamento" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/manipuladores/certificados" icon={Award} label="Certificados" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            <ExpandableMenu
                                icon={Map}
                                label="Geomapeamento"
                                isExpanded={isMapeamentoOpen}
                                setIsExpanded={setIsMapeamentoOpen}
                                isActiveParent={isMapeamentoActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/mapeamento/empresas" icon={Building} label="Empresas" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/mapeamento/acai" icon={MapPin} label="Pontos de Açaí" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/mapeamento/acai-app" icon={MapPin} label="App Açaí (ACS)" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/mapeamento/sac" icon={Droplet} label="Pontos de SAC" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            <ExpandableMenu
                                icon={Stethoscope}
                                label="Prescritores"
                                isExpanded={isPrescritoresOpen}
                                setIsExpanded={setIsPrescritoresOpen}
                                isActiveParent={isPrescritoresActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/prescritores/talonarios" icon={ClipboardList} label="Controle de Talonários" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/prescritores/cadastro-pf" icon={Users} label="Cadastro Pessoa Física" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/prescritores/instituicoes" icon={Building} label="Instituições e Unidades" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/prescritores/talidomida" icon={Pill} label="Protocolos Talidomida" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/prescritores/base" icon={BarChart3} label="Base de Prescritores" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>

                            <ExpandableMenu
                                icon={Briefcase}
                                label="Recursos Humanos"
                                isExpanded={isRHOpen}
                                setIsExpanded={setIsRHOpen}
                                isActiveParent={isRHActive}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            >
                                <SubMenuItem to="/admin/rh/servidores" icon={Users} label="Gestão de Servidores" isOpen={isOpen} isMobile={isMobile} />
                                <SubMenuItem to="/admin/rh/frequencia" icon={ClipboardList} label="Frequência" isOpen={isOpen} isMobile={isMobile} />
                            </ExpandableMenu>
                        </MenuSection>

                        <MenuSection title="Sistema" isOpen={isOpen} isMobile={isMobile}>
                            <NavItem to="/admin/chamados" icon={Ticket} label="Chamados" badge={ticketBadge} isOpen={isOpen} isMobile={isMobile} />
                            <NavItem to="/admin/configuracoes" icon={Settings} label="Configurações" isOpen={isOpen} isMobile={isMobile} />
                        </MenuSection>
                    </nav>
                </div>
            </div>
        </>
    );
};
