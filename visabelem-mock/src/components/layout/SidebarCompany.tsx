import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Files,
    PlusCircle,
    ClipboardList,
    ChevronDown,
    ChevronRight,
    History,
    ShieldCheck,
    X,
    HelpCircle,
    Bell,
    Settings,
    Building2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMode } from '../../contexts/ModeContext';

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
                <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md ml-auto bg-emerald-100 text-emerald-800 border border-emerald-250/30">
                    {badge}
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
    isOpen: boolean;
    isMobile: boolean;
}

const SubMenuItem = ({ to, icon: Icon, label, isOpen, isMobile }: SubMenuItemProps) => (
    <NavLink
        to={to}
        className={({ isActive: active }) => cn(
            "w-full flex items-center px-4 py-2 text-xs rounded-xl transition-colors",
            active
                ? "text-emerald-700 bg-emerald-50/50 font-bold"
                : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50",
            !isOpen && !isMobile ? 'justify-center px-2 gap-0' : 'gap-2'
        )}
        title={!isOpen && !isMobile ? label : undefined}
    >
        <div className={cn("flex items-center min-w-0", !isOpen && !isMobile ? 'gap-0 justify-center' : 'flex-1 gap-3')}>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span className={cn(!isOpen && !isMobile ? 'hidden' : '', "truncate")}>{label}</span>
        </div>
    </NavLink>
);

export const SidebarCompany = ({ isOpen, toggleSidebar, isMobile }: SidebarProps) => {
    const { userProfile, setActiveUnit } = useMode();
    // Submenu states
    const [isMyProcessesOpen, setIsMyProcessesOpen] = useState(true);

    const sidebarClasses = cn(
        "flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-slate-100 text-slate-600",
        isMobile
            ? `fixed inset-y-0 left-0 z-50 shadow-xl transform h-screen ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`
            : `${isOpen ? 'w-64 min-w-[256px] max-w-[256px]' : 'w-20 min-w-[80px] max-w-[80px]'} sticky top-0 h-screen`
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
                    <NavLink to="/empresa" className={cn("flex items-center gap-3 transition-all duration-200", !isOpen && !isMobile ? 'justify-center w-full' : '')}>
                        <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-emerald-400">
                            <ShieldCheck className={cn("transition-all duration-300", !isOpen && !isMobile ? 'w-6 h-6' : 'w-5 h-5')} />
                        </div>
                        <span className={cn(
                            "text-base font-black tracking-tight text-slate-800 transition-opacity duration-200 uppercase",
                            !isOpen && !isMobile ? 'opacity-0 hidden w-0 overflow-hidden' : 'opacity-100 w-auto'
                        )}>
                            Portal Empresa
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

                {/* Units Switcher (Multifilias) */}
                <div className={cn(
                    "px-4 pt-4 transition-all duration-300",
                    !isOpen && !isMobile ? 'px-2' : ''
                )}>
                    <div className={cn(
                        "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between px-2",
                        !isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'
                    )}>
                        <span>Filiais</span>
                        <Settings className="w-2.5 h-2.5 opacity-30" />
                    </div>
                    <div className="space-y-1.5">
                        {userProfile.units?.map((unit) => {
                            const isActive = userProfile.activeUnitId === unit.id;
                            return (
                                <button
                                    key={unit.id}
                                    onClick={() => setActiveUnit(unit.id)}
                                    className={cn(
                                        "w-full flex items-center p-2 rounded-xl border transition-all duration-300 text-left",
                                        isActive
                                            ? "bg-slate-950 border-slate-900 shadow-md shadow-slate-950/10 text-white"
                                            : "bg-white border-slate-100 hover:border-emerald-200 text-slate-500 hover:text-emerald-600 shadow-sm",
                                        !isOpen && !isMobile ? 'justify-center p-2 gap-0' : 'gap-3'
                                    )}
                                    title={unit.name}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 relative",
                                        isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-50 text-slate-400 border border-slate-100"
                                    )}>
                                        <Building2 className="w-3.5 h-3.5" />
                                        {unit.status === 'Pendente' && !isActive && (!isOpen && !isMobile) && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white animate-pulse"></div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "flex-1 min-w-0 transition-opacity",
                                        !isOpen && !isMobile ? 'hidden' : 'opacity-100'
                                    )}>
                                        <p className="text-[10px] font-black truncate uppercase leading-none">{unit.name.split(' ').pop()}</p>
                                        <p className={cn("text-[8px] font-mono leading-none mt-1", isActive ? 'text-emerald-400' : 'text-slate-400')}>{unit.cnpj.slice(-7)}</p>
                                    </div>
                                    {unit.status === 'Pendente' && !isActive && (isOpen || isMobile) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest mb-3 text-slate-400 px-3",
                        !isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'
                    )}>
                        Gestão
                    </div>

                    <nav className="space-y-1">
                        <NavItem to={`/empresa/${userProfile.companyId}`} icon={LayoutDashboard} label="Painel Geral" isOpen={isOpen} isMobile={isMobile} />
                        <NavItem to={`/empresa/${userProfile.companyId}/novo-processo`} icon={PlusCircle} label="Novo Processo" isOpen={isOpen} isMobile={isMobile} />

                        {/* My Processes Submenu */}
                        <div>
                            <button
                                onClick={() => setIsMyProcessesOpen(!isMyProcessesOpen)}
                                className={cn(
                                    "w-full flex items-center justify-between py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider",
                                    !isOpen && !isMobile ? 'justify-center px-2' : 'px-4',
                                    "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn("flex items-center", !isOpen && !isMobile ? 'gap-0' : 'gap-3')}>
                                    <ClipboardList className="w-5 h-5 flex-shrink-0" />
                                    <span className={cn(!isOpen && !isMobile ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100 font-bold')}>Meus Processos</span>
                                </div>
                                {(isOpen || isMobile) && (
                                    <div className="transition-transform duration-200">
                                        {isMyProcessesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </div>
                                )}
                            </button>
                            <div className={cn(
                                "overflow-hidden transition-all duration-300",
                                isMyProcessesOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                            )}>
                                <div className={cn("mt-1 space-y-1", !isOpen && !isMobile ? 'pl-0' : 'pl-4')}>
                                    <SubMenuItem to={`/empresa/${userProfile.companyId}/ativos`} icon={Files} label="Ativos" isOpen={isOpen} isMobile={isMobile} />
                                    <SubMenuItem to={`/empresa/${userProfile.companyId}/pendentes`} icon={Bell} label="Pendências Técnicas" isOpen={isOpen} isMobile={isMobile} />
                                    <SubMenuItem to={`/empresa/${userProfile.companyId}/historico`} icon={History} label="Histórico de Alvarás" isOpen={isOpen} isMobile={isMobile} />
                                </div>
                            </div>
                        </div>

                        <div className={cn("pt-4 pb-2 mt-4 border-t border-slate-100", !isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100')}>
                            <div className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-400 px-3">Suporte</div>
                        </div>

                        <NavItem to={`/empresa/${userProfile.companyId}/mensagens`} icon={Bell} label="Notificações" badge={2} isOpen={isOpen} isMobile={isMobile} />
                        <NavItem to={`/empresa/${userProfile.companyId}/configuracoes`} icon={Settings} label="Configurações" isOpen={isOpen} isMobile={isMobile} />
                        <NavItem to={`/empresa/${userProfile.companyId}/ajuda`} icon={HelpCircle} label="Ajuda e Manuais" isOpen={isOpen} isMobile={isMobile} />
                    </nav>
                </div>

                {/* Account Summary (Mini) */}
                <div className={cn("p-4 border-t border-slate-100 transition-all bg-slate-50/50", !isOpen && !isMobile ? 'px-2' : '')}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-emerald-400 font-black text-[10px] shadow-sm">
                            {(userProfile.units?.find(u => u.id === userProfile.activeUnitId)?.name || 'EF').substring(0, 2).toUpperCase()}
                        </div>
                        {(isOpen || isMobile) && (
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight">
                                    {userProfile.units?.find(u => u.id === userProfile.activeUnitId)?.name}
                                </p>
                                <p className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">
                                    {userProfile.units?.find(u => u.id === userProfile.activeUnitId)?.cnpj}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
