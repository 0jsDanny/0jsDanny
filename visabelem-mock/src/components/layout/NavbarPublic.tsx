import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useMode, type AppRole } from '../../contexts/ModeContext';
import { ShieldCheck, User, ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const NavbarPublic = () => {
    const { setRole } = useMode();
    const navigate = useNavigate();
    const location = useLocation();
    const [showRoles, setShowRoles] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const rolesRef = useRef<HTMLDivElement>(null);

    const roles: { id: AppRole; label: string }[] = [
        { id: 'public', label: 'Cidadão (Público)' },
        { id: 'company', label: 'Empresa: ExtraFarma' },
        { id: 'admin_manager_medicamentos', label: 'Gerente: Setor Medicamentos' },
    ];

    const isActive = (path: string) => location.pathname === path;

    // Close roles dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (rolesRef.current && !rolesRef.current.contains(e.target as Node)) {
                setShowRoles(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    const [prevPathname, setPrevPathname] = useState(location.pathname);
    if (location.pathname !== prevPathname) {
        setPrevPathname(location.pathname);
        setIsOpen(false);
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06192e]/65 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo & Branding */}
                    <div className="flex items-center gap-3 select-none">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/10 border border-emerald-400/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-none bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">VisaBelém</h1>
                            <p className="text-[9px] text-emerald-400/90 uppercase tracking-widest font-black mt-0.5">Prefeitura de Belém</p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/"
                            className={`text-sm font-semibold tracking-tight transition-all py-1.5 px-4 rounded-xl ${
                                isActive('/')
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            Início
                        </Link>
                        <Link
                            to="/servicos"
                            className={`text-sm font-semibold tracking-tight transition-all py-1.5 px-4 rounded-xl ${
                                isActive('/servicos')
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            Serviços
                        </Link>
                        <Link
                            to="/consulta"
                            className={`text-sm font-semibold tracking-tight transition-all py-1.5 px-4 rounded-xl ${
                                isActive('/consulta')
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            Consultar Processo
                        </Link>
                    </div>

                    {/* Desktop Action Buttons & Dropdown */}
                    <div className="hidden md:flex items-center gap-3 relative">
                        <div className="relative" ref={rolesRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRoles(!showRoles)}
                                className={`text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 gap-2 border transition-all duration-200 px-4 py-2 h-10 rounded-xl ${
                                    showRoles ? 'border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20 bg-white/10' : 'border-white/10'
                                }`}
                            >
                                <span className="font-semibold text-xs tracking-tight">Simular Acesso</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showRoles ? 'rotate-180 text-emerald-400' : ''}`} />
                            </Button>

                            <AnimatePresence>
                                {showRoles && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-3 w-64 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl py-2.5 z-[100] border border-white/10 overflow-hidden"
                                    >
                                        <div className="px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1.5">
                                            Simular Visão
                                        </div>
                                        {roles.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setRole(r.id);
                                                    setShowRoles(false);
                                                    if (r.id === 'public') navigate('/');
                                                    else if (r.id === 'company') navigate('/empresa/2026010042');
                                                    else if (r.id === 'admin_manager_medicamentos') navigate('/admin');
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:text-emerald-400 hover:bg-white/5 transition-all flex items-center justify-between group border-b border-white/5 last:border-0"
                                            >
                                                <span className="font-semibold">{r.label}</span>
                                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button className="gap-2 h-10 px-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/10 font-bold border-0 rounded-xl">
                            <User className="w-4 h-4" />
                            Entrar
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
                            aria-label="Toggle Menu"
                        >
                            {isOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-5 space-y-5">
                            {/* Navigation Links */}
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/"
                                    className={`text-sm font-semibold tracking-tight transition-all py-2.5 px-4 rounded-xl flex items-center justify-between ${
                                        isActive('/')
                                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <span>Início</span>
                                    {isActive('/') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                </Link>
                                <Link
                                    to="/servicos"
                                    className={`text-sm font-semibold tracking-tight transition-all py-2.5 px-4 rounded-xl flex items-center justify-between ${
                                        isActive('/servicos')
                                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <span>Serviços</span>
                                    {isActive('/servicos') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                </Link>
                                <Link
                                    to="/consulta"
                                    className={`text-sm font-semibold tracking-tight transition-all py-2.5 px-4 rounded-xl flex items-center justify-between ${
                                        isActive('/consulta')
                                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <span>Consultar Processo</span>
                                    {isActive('/consulta') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                </Link>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/10" />

                            {/* Simulation & Actions */}
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Simular Acesso
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {roles.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setRole(r.id);
                                                    setIsOpen(false);
                                                    if (r.id === 'public') navigate('/');
                                                    else if (r.id === 'company') navigate('/empresa/2026010042');
                                                    else if (r.id === 'admin_manager_medicamentos') navigate('/admin');
                                                }}
                                                className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 hover:text-emerald-400 hover:bg-white/5 transition-all flex items-center justify-between rounded-xl group"
                                            >
                                                <span className="font-semibold">{r.label}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full gap-2 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/10 font-bold border-0 rounded-xl justify-center">
                                    <User className="w-4 h-4" />
                                    Entrar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
