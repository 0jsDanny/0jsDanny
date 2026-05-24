import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Moon, LogOut, Lock, ChevronDown } from 'lucide-react';
import { useMode } from '../../contexts/ModeContext';
import { cn } from '../../lib/utils';

interface AdminHeaderProps {
    toggleSidebar: () => void;
}

export const HeaderAdmin = ({ toggleSidebar }: AdminHeaderProps) => {
    const { setRole, userProfile } = useMode();
    const [isDark] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <header className={cn(
            "h-16 flex items-center justify-between px-3 md:px-6 transition-colors duration-300",
            isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'
        )}>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
                    )}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="relative hidden md:block">
                    <Search className={cn(
                        "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2",
                        isDark ? 'text-slate-600' : 'text-gray-300'
                    )} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className={cn(
                            "pl-10 pr-4 py-2 border-none rounded-lg text-sm w-64",
                            isDark ? 'bg-slate-700 text-slate-400 placeholder-slate-500' : 'bg-gray-100 text-gray-600 placeholder-gray-400'
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Version Badge */}
                <div className={cn(
                    "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Protótipo v1.0
                </div>

                {/* Theme Toggle - Não clicável no Mock */}
                <button
                    disabled
                    className={cn(
                        "p-2 rounded-full opacity-40 cursor-not-allowed",
                        isDark ? 'text-slate-500' : 'text-gray-300'
                    )}
                    title="Mudar de tema (Desativado no protótipo)"
                >
                    <Moon className="w-5 h-5" />
                </button>

                {/* Notifications - Sem função no Mock */}
                <div 
                    className={cn(
                        "relative p-2 rounded-full cursor-default text-gray-400"
                    )}
                    title="Notificações (Sem função no protótipo)"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                        5
                    </span>
                </div>

                {/* User Menu */}
                <div className={cn("relative pl-4", isDark ? 'border-l border-slate-700' : 'border-l border-gray-200')} ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 focus:outline-none group"
                    >
                        <div className="text-right hidden sm:block">
                            <div className={cn("text-sm font-bold", isDark ? 'text-slate-200' : 'text-gray-700')}>
                                {userProfile.name}
                            </div>
                            {userProfile.sector !== 'Empresa' && (
                                <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? 'text-slate-500' : 'text-gray-500')}>
                                    {userProfile.sector === 'Medicamentos' ? 'Gerente / GVDM' : (userProfile.sector || userProfile.role)}
                                </div>
                            )}
                        </div>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-transparent transition-all",
                            isDark ? 'bg-blue-900 text-blue-300 group-hover:ring-blue-800' : 'bg-blue-100 text-blue-600 group-hover:ring-blue-100'
                        )}>
                            {userProfile.avatar && !userProfile.avatar.includes('company-avatar') ? (
                                <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-[10px] font-black">{userProfile.name.substring(0, 2).toUpperCase()}</div>
                            )}
                        </div>
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isMenuOpen ? 'rotate-180' : '',
                            isDark ? 'text-slate-500' : 'text-gray-500'
                        )} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className={cn(
                            "absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100",
                            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'
                        )}>
                            <button
                                className={cn(
                                    "w-full px-4 py-2 text-sm flex items-center gap-2 text-left transition-colors",
                                    isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                                )}
                            >
                                <User className="w-4 h-4" />
                                Meu Perfil
                            </button>
                            <button
                                className={cn(
                                    "w-full px-4 py-2 text-sm flex items-center gap-2 text-left transition-colors",
                                    isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                                )}
                            >
                                <Lock className="w-4 h-4" />
                                Bloquear Tela
                            </button>
                            <div className={cn("h-px my-1", isDark ? 'bg-slate-700' : 'bg-gray-100')} />
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setRole('public');
                                }}
                                className={cn(
                                    "w-full px-4 py-2 text-sm flex items-center gap-2 text-left transition-colors",
                                    isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                                )}
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
