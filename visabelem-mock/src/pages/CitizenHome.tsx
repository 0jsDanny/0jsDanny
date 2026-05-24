import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Building2,
    FileText,
    Search,
    ChefHat,
    ClipboardCheck,
    AlertTriangle,
    ArrowRight,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
    { icon: Building2, title: 'Primeira Licença', desc: 'Solicite o licenciamento inicial para novos estabelecimentos e atividades.', link: '/novo' },
    { icon: FileText, title: 'Renovação Anual', desc: 'Mantenha sua regularidade sanitária renovando sua licença todo ano.', link: '/novo' },
    { icon: ClipboardCheck, title: 'Boleto de Taxas (DAM)', desc: 'Emissão de documento de arrecadação municipal para taxas VISA.', link: '#' },
    { icon: ChefHat, title: 'Manipuladores de Alimentos', desc: 'Cursos de capacitação e emissão de certificados obrigatórios.', link: '#' },
    { icon: AlertTriangle, title: 'Ouvidoria e Denúncias', desc: 'Canal direto para denúncias de irregularidades sanitárias.', link: '#' },
    { icon: ShieldCheck, title: 'Autenticidade de Licença', desc: 'Verifique a validade de uma licença emitida pela VISA Belém.', link: '#' },
];

const suggestions = [
    { title: 'Primeira Licença Sanitária', category: 'Licenciamento', link: '/novo', keywords: 'licença inicial nova primeiro alvará' },
    { title: 'Renovação de Alvará Anual', category: 'Licenciamento', link: '/novo', keywords: 'renovar renovação anual vencido validade' },
    { title: 'Emitir DAM (Taxas)', category: 'Financeiro', link: '#', keywords: 'taxa boleto pagar pagamento custo valor dam' },
    { title: 'Curso de Manipuladores de Alimentos', category: 'Capacitação', link: '/admin/manipuladores/inicio', keywords: 'curso manipulação alimentos aula certificado palestra' },
    { title: 'Consultar Prescritores', category: 'Profissionais', link: '/admin/prescritores', keywords: 'médico dentista receita talonário prescrever cadastrar' },
    { title: 'Mapeamento de Pontos de Açaí', category: 'Geolocalização', link: '/admin/mapeamento/acai', keywords: 'açaí mapa pontos batedor fiscalização vigilância' },
    { title: 'Autenticidade de Licença', category: 'Validação', link: '#', keywords: 'autenticar validar qr code código licença verificar' },
];

export const CitizenHome = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);



    // Keyboard shortcut (Ctrl + K) to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.querySelector('input')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close search panel on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search query patterns
    const isProtocol = /^\d{4}\.\d{2}\.\d{4}$|^\d{10}$|^\d{4}\d{2}\d{4}$/.test(searchQuery.trim());
    const isCNPJ = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$|^\d{14}$/.test(searchQuery.trim());

    const filteredSuggestions = suggestions.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.title.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.keywords.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-12 sm:space-y-16 pb-0 bg-[#f8fafc] selection:bg-[#10b981]/30">
            {/* Hero Section - Production Look */}
            <section className="relative pt-28 sm:pt-36 pb-36 sm:pb-44 px-4 sm:px-6 overflow-hidden bg-[#06192e] text-white">
                {/* CSS grid overlay pattern with fade out mask */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                
                {/* Ambient lights glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full blur-[120px] -z-0 opacity-45 pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Text and Search */}
                    <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, type: 'spring', damping: 25 }}
                            className="space-y-4 sm:space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/25 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] select-none">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Portal de Serviços Digitais
                            </div>
                            
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white">
                                Vigilância <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent italic font-light">Sanitária</span> <br />
                                <span className="text-white">de Belém</span>
                            </h1>
                            
                            <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-xl font-medium tracking-tight leading-relaxed">
                                Sua empresa regularizada de forma rápida e inteligente. 
                                Acesso consolidado a licenças, certificados e serviços 100% digitais.
                            </p>
                        </motion.div>

                        {/* Intelligent Search Container */}
                        <motion.div
                            ref={searchRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.6, type: 'spring', damping: 25 }}
                            className="w-full max-w-2xl relative"
                        >
                            <div className={`w-full bg-slate-900/60 backdrop-blur-2xl p-2.5 sm:p-2 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row gap-2.5 sm:gap-0 items-stretch sm:items-center shadow-2xl relative group ${
                                isSearchFocused ? 'border-emerald-500/40 ring-1 ring-emerald-500/30' : 'border-white/10 hover:border-white/20'
                            }`}>
                                <div className="flex-1 flex items-center min-w-0">
                                    <div className="flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsSearchFocused(true);
                                        }}
                                        onFocus={() => setIsSearchFocused(true)}
                                        placeholder="Buscar serviços, CNPJ ou Protocolo..."
                                        className="w-full bg-transparent border-0 text-white placeholder:text-slate-500 focus:outline-none px-3 h-12 sm:h-14 text-sm sm:text-base font-medium"
                                    />
                                </div>
                                <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex-shrink-0 w-full sm:w-auto">
                                    Consultar
                                </Button>
                            </div>

                            {/* Dropdown suggestions list */}
                            <AnimatePresence>
                                {isSearchFocused && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                                        transition={{ duration: 0.2, type: 'spring', damping: 20 }}
                                        className="absolute top-full left-0 right-0 mt-3 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left p-2 max-h-[300px] sm:max-h-[350px] overflow-y-auto"
                                    >
                                        {/* Dynamic search shortcuts */}
                                        {isProtocol && (
                                            <div className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer rounded-xl flex items-center gap-3 transition-colors">
                                                <Search className="w-5 h-5 text-emerald-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Protocolo Sanitário Detectado</p>
                                                    <p className="text-xs sm:text-sm font-semibold text-white">Consultar andamento do Protocolo: {searchQuery}</p>
                                                </div>
                                            </div>
                                        )}
                                        {isCNPJ && (
                                            <div className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer rounded-xl flex items-center gap-3 transition-colors">
                                                <Search className="w-5 h-5 text-amber-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CNPJ Detectado</p>
                                                    <p className="text-xs sm:text-sm font-semibold text-white">Listar processos cadastrados para: {searchQuery}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                                            {searchQuery ? 'Serviços Correspondentes' : 'Serviços Recomendados'}
                                        </div>

                                        <div className="mt-1 space-y-1">
                                            {filteredSuggestions.length > 0 ? (
                                                filteredSuggestions.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        to={item.link}
                                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-white/5 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs sm:text-sm font-semibold text-white">{item.title}</p>
                                                                <p className="text-[10px] sm:text-xs text-slate-400">{item.category}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-xs sm:text-sm text-slate-500">
                                                    Nenhum serviço ou documento encontrado para "{searchQuery}"
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Keyboard Tip */}
                            <div className="text-slate-400 text-xs mt-3 hidden sm:flex items-center gap-1.5 justify-start pl-2 select-none pointer-events-none">
                                <span>Pressione</span>
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[10px] font-mono text-slate-300">Ctrl</kbd>
                                <span>+</span>
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[10px] font-mono text-slate-300">K</kbd>
                                <span>para buscar</span>
                            </div>
                        </motion.div>

                        {/* Quick Trust Checks */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-slate-400 pt-2 select-none text-[10px] sm:text-xs">
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem Papel</div>
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem Filas</div>
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparência Total</div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Productivity 3D Widget */}
                    <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                        <style>{`
                            /* Neo-Brutalist 3D Card */
                            .brutalist-parent {
                                width: 100%;
                                max-width: 440px;
                                padding: 10px;
                                perspective: 2000px;
                                overflow: visible;
                            }

                            .brutalist-card {
                                padding-top: 60px;
                                border: 3px solid #0f172a;
                                transform-style: preserve-3d;
                                background: linear-gradient(135deg, #0000 18.75%, #1e293b 0 31.25%, #0000 0),
                                    repeating-linear-gradient(45deg, #1e293b -6.25% 6.25%, #0f172a 0 18.75%);
                                background-size: 60px 60px;
                                background-color: #0f172a;
                                width: 100%;
                                box-shadow: rgba(0, 0, 0, 0.4) 0px 30px 40px -10px;
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                                overflow: visible;
                            }

                            .brutalist-card:hover {
                                background-position: -100px 100px, -100px 100px;
                                transform: rotate3d(0.5, -0.8, 0, 10deg);
                                box-shadow: rgba(16, 185, 129, 0.15) -15px 30px 40px -10px, rgba(0, 0, 0, 0.6) -30px 50px 60px -15px;
                            }

                            .brutalist-content-box {
                                background: #10b981; /* Emerald */
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                                padding: 40px 42px 32px 42px;
                                transform-style: preserve-3d;
                                border-top: 3px solid #0f172a;
                                overflow: visible;
                            }

                            .brutalist-title {
                                display: block;
                                color: #0f172a;
                                font-weight: 900;
                                transition: all 0.5s ease-in-out;
                                transform: translate3d(0px, 0px, 8px);
                            }

                            .brutalist-card:hover .brutalist-title {
                                transform: translate3d(0px, 0px, 15px);
                            }

                            .brutalist-stat-card-1 {
                                background: #0f172a;
                                border: 1px solid #0f172a;
                                padding: 12px;
                                transform: translate3d(0px, 0px, 8px);
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.08s;
                            }

                            .brutalist-stat-card-2 {
                                background: #0f172a;
                                border: 1px solid #0f172a;
                                padding: 12px;
                                transform: translate3d(0px, 0px, 8px);
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.16s;
                            }

                            .brutalist-card:hover .brutalist-stat-card-1 {
                                transform: translate3d(0px, 0px, 15px);
                            }

                            .brutalist-card:hover .brutalist-stat-card-2 {
                                transform: translate3d(0px, 0px, 15px);
                            }

                            .brutalist-chart-container {
                                transform: translate3d(0px, 0px, 6px);
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.24s;
                            }

                            .brutalist-card:hover .brutalist-chart-container {
                                transform: translate3d(0px, 0px, 12px);
                            }

                            .brutalist-seal-container {
                                background: #0f172a;
                                border: 1px solid #1e293b;
                                padding: 10px;
                                color: #e2e8f0;
                                transform: translate3d(0px, 0px, 4px);
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.32s;
                            }

                            .brutalist-card:hover .brutalist-seal-container {
                                transform: translate3d(0px, 0px, 8px);
                            }

                            .brutalist-date-box {
                                position: absolute;
                                top: 28px;
                                right: 28px;
                                height: 55px;
                                width: 55px;
                                background: #0f172a;
                                border: 2px solid #10b981;
                                padding: 6px;
                                transform: translate3d(0px, 0px, 12px);
                                box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 15px -5px;
                                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                            }

                            .brutalist-card:hover .brutalist-date-box {
                                transform: translate3d(0px, 0px, 20px);
                                border-color: #34d399; /* emerald-400 */
                            }

                            .brutalist-date-box span {
                                display: block;
                                text-align: center;
                            }

                            .brutalist-date-box .month {
                                color: #10b981;
                                font-size: 8px;
                                font-weight: 900;
                                letter-spacing: 1px;
                            }

                            .brutalist-date-box .date {
                                font-size: 18px;
                                font-weight: 900;
                                color: #fff;
                                line-height: 1.2;
                            }
                        `}</style>
                        <div className="brutalist-parent">
                            <div className="brutalist-card">
                                {/* Calendar Date Box (Floating Layer 2) */}
                                <div className="brutalist-date-box">
                                    <span className="month">{new Date().toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')}</span>
                                    <span className="date">{new Date().getDate()}</span>
                                </div>

                                {/* Content Box (Floating Layer 3) */}
                                <div className="brutalist-content-box">
                                    {/* Widget Title */}
                                    <div className="brutalist-title text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]/60">Métricas em Tempo Real</span>
                                        <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight leading-none">Produtividade VISA</h3>
                                    </div>

                                    {/* Dynamic Stats */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6" style={{ transformStyle: 'preserve-3d' }}>
                                        {/* Stat 1 */}
                                        <div className="brutalist-stat-card-1 text-left">
                                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Emitidas Hoje</p>
                                            <div className="flex items-baseline gap-1.5 mt-1">
                                                <span className="text-2xl sm:text-3xl font-black text-white">87</span>
                                                <span className="text-[10px] sm:text-xs text-emerald-400 font-bold">+14%</span>
                                            </div>
                                        </div>
                                        
                                        {/* Stat 2 */}
                                        <div className="brutalist-stat-card-2 text-left">
                                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Tempo de Resposta</p>
                                            <div className="flex items-baseline gap-1.5 mt-1">
                                                <span className="text-2xl sm:text-3xl font-black text-white">3.2d</span>
                                                <span className="text-[10px] sm:text-xs text-emerald-400 font-bold">-2.1d</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Area Chart representing performance improvement */}
                                    <div className="space-y-3 brutalist-chart-container mt-6" style={{ transformStyle: 'preserve-3d' }}>
                                        <div className="flex justify-between text-[11px] sm:text-xs font-black text-[#0f172a]">
                                            <span>Tempo Médio de Análise</span>
                                            <span className="text-emerald-800">Eficiência +73%</span>
                                        </div>
                                        <div className="h-24 sm:h-28 w-full relative">
                                            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="chartGradBrutalist" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" />
                                                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Area fill */}
                                                <path
                                                    d="M 0 32 Q 20 28, 40 22 T 80 8 T 100 4 L 100 35 L 0 35 Z"
                                                    fill="url(#chartGradBrutalist)"
                                                />
                                                {/* Line stroke */}
                                                <path
                                                    d="M 0 32 Q 20 28, 40 22 T 80 8 T 100 4"
                                                    fill="none"
                                                    stroke="#0f172a"
                                                    strokeWidth="2"
                                                    strokeLinecap="square"
                                                />
                                                {/* Data points */}
                                                <rect x="0" y="31" width="2" height="2" fill="#0f172a" />
                                                <rect x="39" y="21" width="2" height="2" fill="#0f172a" />
                                                <rect x="79" y="7" width="2" height="2" fill="#0f172a" />
                                                <rect x="99" y="3" width="2" height="2" fill="#0f172a" />
                                            </svg>
                                            <div className="absolute inset-0 flex justify-between items-end text-[7.5px] sm:text-[8.5px] font-black text-[#0f172a]/70 pt-16 sm:pt-20 px-3 pointer-events-none">
                                                <span>Mês Passado (12d)</span>
                                                <span className="hidden sm:inline">Em Evolução</span>
                                                <span className="text-[#0f172a]">Hoje (3.2d)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certification Seal */}
                                    <div className="brutalist-seal-container flex items-center gap-3 mt-6 text-[10px] sm:text-[11px] text-left">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span className="font-bold leading-snug">Dados consolidados pela Secretaria Municipal de Saúde de Belém (SESMA).</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 md:-mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                        >
                            <Link to={service.link}>
                                <Card className="h-full group hover:border-emerald-500/50 transition-all duration-300 bg-white/80 backdrop-blur shadow-xl border-slate-100 flex flex-col p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem]">
                                    <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 translate-x-0 group-hover:-translate-y-2 shadow-sm">
                                        <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-brand-900 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-brand-950 mb-2 sm:mb-3 tracking-tighter group-hover:text-emerald-600 transition-colors">{service.title}</h3>
                                    <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-6 sm:mb-8 flex-1">{service.desc}</p>

                                    <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] transform transition-all group-hover:translate-x-2">
                                        Acessar <ArrowRight className="ml-2 w-4 h-4 text-emerald-600" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Trust Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-20 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10 md:gap-16 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-0 opacity-20 translate-x-1/2 -translate-y-1/2" />

                    <div className="flex-1 space-y-6 sm:space-y-8 relative z-10 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tighter leading-none">
                            Gestão Moderna, <br /><span className="text-emerald-500">Cidade Inteligente</span>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                            O Sistema de Vigilância Sanitária de Belém foi projetado para servir você com a máxima eficiência. Integramos todos os processos internos para que o seu licenciamento ocorra no menor tempo possível.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center md:justify-start">
                            <Button className="h-12 px-8 bg-brand-950 hover:bg-brand-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest group w-full sm:w-auto">
                                Sobre o Sistema <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" className="h-12 px-8 border-slate-200 text-slate-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 w-full sm:w-auto">
                                Ajuda & Suporte
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full mt-8 md:mt-0 group cursor-pointer">
                        <div className="relative z-10 bg-[#06192e] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl rotate-2 border border-white/5 w-full max-w-sm mx-auto md:max-w-none transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-105 group-hover:-translate-y-2 group-hover:border-emerald-500/30">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-1 bg-emerald-500 rounded-full transition-all duration-500 group-hover:w-20 group-hover:bg-emerald-400" />
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border group-hover:border-emerald-500/30" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-white/5 rounded-full w-full transition-all duration-500 group-hover:bg-white/10" />
                                <div className="h-4 bg-white/5 rounded-full w-4/5 transition-all duration-500 group-hover:bg-white/10" />
                                <div className="h-4 bg-white/5 rounded-full w-3/4 transition-all duration-500 group-hover:bg-white/10" />
                                <div className="h-12 bg-emerald-500 rounded-xl w-full mt-6 shadow-xl shadow-emerald-500/20 transition-all duration-500 group-hover:bg-emerald-400 group-hover:shadow-emerald-400/40 group-hover:scale-[1.02] flex items-center justify-center text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                    Acessar Painel
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-3xl opacity-10 -rotate-3 scale-95 pointer-events-none transition-all duration-500 ease-out group-hover:opacity-25 group-hover:-rotate-6 group-hover:scale-110" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#06192e] text-slate-300 border-t-4 border-[#0f172a] relative overflow-hidden select-none">
                {/* CSS grid overlay pattern with fade out mask */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/10">
                        {/* Column 1: Info */}
                        <div className="md:col-span-5 space-y-4 text-left">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3.5 py-1 rounded-full border border-emerald-500/25 text-[10px] font-bold uppercase tracking-[0.2em]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> VISA Belém
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                Departamento de Vigilância Sanitária
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
                                Promovendo e protegendo a saúde da população de Belém por meio de ações integradas, fiscalização preventiva e simplificação de processos digitais.
                            </p>
                        </div>

                        {/* Column 2: Links */}
                        <div className="md:col-span-3 space-y-4 text-left">
                            <h4 className="text-xs font-black uppercase text-white tracking-widest">Serviços Rápidos</h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
                                <li>
                                    <Link to="/novo" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                                        Licenciamento Inicial
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/novo" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                                        Renovação de Alvará
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                                        Emissão de DAM (Taxas)
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                                        Capacitação de Manipuladores
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Contact */}
                        <div className="md:col-span-4 space-y-4 text-left">
                            <h4 className="text-xs font-black uppercase text-white tracking-widest">Contato e Localização</h4>
                            <div className="space-y-3 text-xs sm:text-sm text-slate-400 font-medium">
                                <p className="leading-relaxed">
                                    <strong className="text-slate-300">Endereço:</strong> Av. Governador José Malcher, 2821 - São Brás, Belém - PA
                                </p>
                                <p>
                                    <strong className="text-slate-300">Horário:</strong> Segunda a Sexta, 8h às 14h
                                </p>
                                <p>
                                    <strong className="text-slate-300">E-mail:</strong> gvisabelem@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-bold text-slate-500">
                        <p>© {new Date().getFullYear()} Vigilância Sanitária de Belém - SESMA. Todos os direitos reservados.</p>
                        <div className="flex items-center gap-1">
                            <span>Desenvolvido para a</span>
                            <span className="text-slate-300 font-bold">Secretaria Municipal de Saúde de Belém (SESMA)</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
