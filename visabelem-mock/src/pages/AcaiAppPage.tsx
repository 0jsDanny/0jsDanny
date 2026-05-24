/**
 * AcaiAppPage.tsx - Versão Integrada e Fiel aos Originais
 * Unifica os designs da pasta 'exclua-me' em uma aplicação React fluida.
 * Customização cromática para paleta Slate e Emerald (DEVISA).
 */

import { useState, useEffect } from 'react';
import {
    MapPin, ArrowLeft, User, Phone, Mail, Store,
    Calendar, Camera, Plus, Users, CheckCircle,
    Navigation, Layers, Cloud, X, ArrowRight,
    Home, UserCircle, BadgeCheck,
    Info, TrendingUp, Settings,
    HelpCircle, LogOut, ChevronRight, Check,
    Map as MapIcon, Target, Loader2, Trash2, Sparkles, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

// Tipos
type RegistrationStep = 'dashboard' | 'step1_location' | 'step2_owner' | 'step3_details' | 'step4_employees' | 'success' | 'profile';

interface Employee {
    name: string;
    cpf: string;
    role: string;
}

const ScrollbarStyles = () => (
    <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.15);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 185, 129, 0.3);
        }
        /* Mobile scrollbar hiding */
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(16, 185, 129, 0.15) transparent;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pulse-ring {
            animation: pulse-ring 2s infinite ease-in-out;
        }
    `}} />
);

interface FormData {
    nomeCompleto: string;
    cpf: string;
    email: string;
    whatsapp: string;
    nomePonto: string;
    dataAbertura: string;
    distrito: string;
    latitude: string;
    longitude: string;
    endereco: string;
}

// --- Sub-Componentes de Estilo ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
        "bg-[#0e162666] backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl overflow-hidden",
        className
    )}>
        {children}
    </div>
);

const StepIndicator = ({ current, total }: { current: number, total: number }) => (
    <div className="flex flex-col mb-8 px-1">
        <div className="flex justify-between items-end mb-2">
            <span className="text-emerald-400 font-black text-[10px] tracking-wider uppercase">Passo {current} de {total}</span>
            <span className="text-slate-400 text-[10px]">{Math.round((current / total) * 100)}% completo</span>
        </div>
        <div className="flex w-full gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                        i < current ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-800/80"
                    )}
                />
            ))}
        </div>
    </div>
);

// Custom stylized açaí-app logo component
const AcaiAppLogo = () => (
    <svg className="w-5 h-5 text-emerald-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="10.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="13.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
    </svg>
);

// --- Views ---

const DashboardView = ({ onNavigate }: { onNavigate: (step: RegistrationStep) => void }) => (
    <div className="relative h-full bg-[#030712] text-white overflow-hidden">
        {/* Mapa de Fundo Simulado (Light Theme style) */}
        <div className="absolute inset-0 bg-[url('/map_belem_light.png')] bg-cover bg-center scale-105" />
        {/* Subtle vignette gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/35 via-transparent to-[#030712]/45 pointer-events-none" />

        {/* Marcadores de Mapa Simulados */}
        <div className="absolute top-[32%] left-[82%] w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030712] shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
        <div className="absolute top-[60%] left-[85%] w-4 h-4 bg-rose-500 rounded-full border-2 border-[#030712] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        <div className="absolute top-[48%] left-[76%] w-4 h-4 bg-amber-500 rounded-full border-2 border-[#030712] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

        <div className="relative z-10 flex flex-col h-full p-4 pb-8">
            {/* Header */}
            <header className="pt-8 mb-4">
                <div className="bg-[#090d16]/90 backdrop-blur-md border border-white/5 rounded-full p-1.5 pr-5 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
                            <AcaiAppLogo />
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-wider text-white">Açaí no Ponto</h1>
                    </div>
                    <button onClick={() => onNavigate('profile')} className="text-slate-400 hover:text-slate-200 transition-colors">
                        <UserCircle className="w-8 h-8" />
                    </button>
                </div>
            </header>

            {/* Status Chip */}
            <div className="flex justify-end mb-auto">
                <div className="bg-[#090d16]/90 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
                    <Navigation className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">GPS: Sinal Ativo</span>
                </div>
            </div>

            {/* Bottom Stats & FAB */}
            <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                {/* Map Controls */}
                <div className="flex flex-col gap-2 self-end">
                    <button className="bg-[#090d16]/95 backdrop-blur-md border border-white/5 w-11 h-11 rounded-xl flex items-center justify-center text-slate-300 shadow-lg active:scale-95 transition-all hover:bg-slate-900">
                        <Navigation className="w-4 h-4 -rotate-45" />
                    </button>
                    <button className="bg-[#090d16]/95 backdrop-blur-md border border-white/5 w-11 h-11 rounded-xl flex items-center justify-center text-slate-300 shadow-lg active:scale-95 transition-all hover:bg-slate-900">
                        <Layers className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-end gap-3">
                    {/* Stats Card */}
                    <GlassCard className="flex-1 p-5 min-h-[140px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-1">Mapeamento Geral</span>
                                <span className="text-3xl font-black font-mono tracking-tight text-white">1.766</span>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Store className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-2" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-ring" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-350">Hoje</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-base font-bold font-mono">+18</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* FAB */}
                    <button
                        onClick={() => onNavigate('step1_location')}
                        className="bg-emerald-600 active:scale-95 hover:bg-emerald-700 transition-all duration-200 text-white rounded-2xl w-16 h-[140px] flex flex-col items-center justify-center shadow-lg shadow-emerald-950/20 border border-white/5"
                    >
                        <Plus className="w-7 h-7 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            Novo Ponto
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const Step1Location = ({ onNavigate, formData, onGPSLocate, locating }: { onNavigate: (step: RegistrationStep) => void, formData: FormData, onGPSLocate: () => void, locating: boolean }) => (
    <div className="relative h-full bg-[#030712] text-white flex flex-col">
        <header className="sticky top-0 z-50 p-4 h-16 flex items-center bg-[#090d16]/95 backdrop-blur-md border-b border-white/5 justify-between">
            <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-200">Localização</h1>
            <div className="w-9 h-9" />
        </header>

        <main className="flex-1 p-5 max-w-md mx-auto w-full pb-32 overflow-y-auto custom-scrollbar">
            <StepIndicator current={1} total={4} />

            <div className="mb-6">
                <h2 className="text-xl font-black tracking-tight text-white mb-1 uppercase">Geolocalização</h2>
                <p className="text-xs text-slate-400">Capture a coordenada exata do ponto usando o GPS do smartphone.</p>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-white/5 mb-5 bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/map_belem_light.png')] bg-cover bg-center" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 rounded-full bg-emerald-500/25 animate-ping" />
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border border-white/20">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-1">Latitude</span>
                    <span className="text-xs font-mono font-bold text-white">{formData.latitude || 'Não capturada'}</span>
                </div>
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-1">Longitude</span>
                    <span className="text-xs font-mono font-bold text-white">{formData.longitude || 'Não capturada'}</span>
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Endereço Estimado (Geocoding)</label>
                <div className="relative">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <textarea
                        className="bg-[#090d16] w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-18 custom-scrollbar"
                        value={formData.endereco}
                        readOnly
                    />
                </div>
            </div>

            <button
                onClick={onGPSLocate}
                disabled={locating}
                className="w-full bg-emerald-600 disabled:bg-emerald-950/40 disabled:text-slate-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-[0.98] hover:bg-emerald-700 transition-all text-xs uppercase tracking-wider text-white"
            >
                {locating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Buscando Satélites GPS...
                    </>
                ) : (
                    <>
                        <Navigation className="w-4 h-4 animate-pulse" />
                        Obter Localização via GPS
                    </>
                )}
            </button>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#030712]/95 backdrop-blur-xl border-t border-white/5 z-20">
            <div className="max-w-md mx-auto flex justify-end">
                <button
                    onClick={() => onNavigate('step2_owner')}
                    disabled={!formData.latitude}
                    className="w-full bg-white disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                    Próximo Passo
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </footer>
    </div>
);

const Step2Owner = ({ onNavigate, formData, onChange }: { onNavigate: (step: RegistrationStep) => void, formData: FormData, onChange: (newData: Partial<FormData>) => void }) => {
    const isStepValid = formData.nomeCompleto.trim().length > 3 && formData.cpf.trim().length >= 11 && formData.whatsapp.trim().length >= 9;

    return (
        <div className="relative h-full bg-[#030712] text-white flex flex-col">
            <header className="sticky top-0 z-50 p-4 h-16 flex items-center bg-[#090d16]/95 backdrop-blur-md border-b border-white/5 justify-between">
                <button onClick={() => onNavigate('step1_location')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-sm font-black uppercase tracking-wider text-slate-200">Responsável</h1>
                <button onClick={() => onNavigate('dashboard')} className="text-[10px] font-black uppercase text-slate-500 hover:text-rose-400 transition-colors">Cancelar</button>
            </header>

            <main className="flex-1 p-5 max-w-md mx-auto w-full pb-32 pt-6 overflow-y-auto custom-scrollbar">
                <StepIndicator current={2} total={4} />

                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight uppercase text-white mb-1">Contato e Identificação</h2>
                    <p className="text-xs text-slate-400">Insira os dados cadastrais do proprietário/batedor responsável pelo ponto.</p>
                </div>

                <GlassCard className="p-5 flex flex-col gap-5">
                    <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Nome Completo do Proprietário</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                            <input
                                placeholder="Ex: Maria José de Sousa"
                                className="w-full bg-[#030712]/50 border border-white/5 text-xs rounded-xl pl-10 pr-4 py-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                value={formData.nomeCompleto}
                                onChange={e => onChange({ nomeCompleto: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">CPF do Proprietário</label>
                        <div className="relative">
                            <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                            <input
                                placeholder="000.000.000-00"
                                className="w-full bg-[#030712]/50 border border-white/5 text-xs rounded-xl pl-10 pr-4 py-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono placeholder:text-slate-600"
                                value={formData.cpf}
                                onChange={e => onChange({ cpf: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">E-mail para Contato (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                            <input
                                placeholder="exemplo@devisa.com"
                                className="w-full bg-[#030712]/50 border border-white/5 text-xs rounded-xl pl-10 pr-4 py-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                value={formData.email}
                                onChange={e => onChange({ email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">WhatsApp / Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                            <input
                                placeholder="(91) 99999-0000"
                                className="w-full bg-[#030712]/50 border border-white/5 text-xs rounded-xl pl-10 pr-4 py-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                value={formData.whatsapp}
                                onChange={e => onChange({ whatsapp: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 ml-1 text-slate-500">
                            <Info className="w-3 h-3" />
                            <span className="text-[9px] font-medium tracking-tight">Utilizado para enviar notificações de inspeção.</span>
                        </div>
                    </div>
                </GlassCard>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#030712]/95 backdrop-blur-md border-t border-white/5 z-20">
                <div className="max-w-md mx-auto flex gap-4">
                    <button
                        onClick={() => onNavigate('step1_location')}
                        className="flex-1 border border-slate-800 text-slate-400 text-xs font-black uppercase py-4 rounded-xl hover:bg-slate-900 transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={() => onNavigate('step3_details')}
                        disabled={!isStepValid}
                        className="flex-[2] bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs uppercase py-4 rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const Step3Details = ({ onNavigate, formData, onChange, onOpenCamera, photo }: { onNavigate: (step: RegistrationStep) => void, formData: FormData, onChange: (newData: Partial<FormData>) => void, onOpenCamera: () => void, photo: string | null }) => {
    const isStepValid = formData.nomePonto.trim().length > 3 && formData.dataAbertura.trim().length > 0 && formData.distrito.trim().length > 0;

    return (
        <div className="relative h-full bg-[#030712] text-white flex flex-col">
            <header className="sticky top-0 z-50 p-4 h-16 flex items-center bg-[#090d16]/95 backdrop-blur-md border-b border-white/5 justify-between">
                <button onClick={() => onNavigate('step2_owner')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-sm font-black uppercase tracking-wider text-slate-200">Detalhes</h1>
                <div className="w-9 h-9" />
            </header>

            <main className="flex-1 p-5 max-w-md mx-auto w-full pb-32 overflow-y-auto custom-scrollbar">
                <StepIndicator current={3} total={4} />

                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight uppercase text-white mb-1">Informações do Ponto</h2>
                    <p className="text-xs text-slate-400">Dados do estabelecimento e captura de evidência visual do local.</p>
                </div>

                <div className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-[9px] font-black uppercase tracking-wider ml-1">Nome do Estabelecimento / Fantasia</label>
                        <div className="relative">
                            <input
                                className="w-full bg-[#090d16] border border-white/5 text-xs rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="Ex: Açaí do Lala"
                                value={formData.nomePonto}
                                onChange={e => onChange({ nomePonto: e.target.value })}
                            />
                            <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-[9px] font-black uppercase tracking-wider ml-1">Data de Abertura / Início das Atividades</label>
                        <input
                            type="date"
                            className="w-full bg-[#090d16] border border-white/5 text-xs rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-200"
                            value={formData.dataAbertura}
                            onChange={e => onChange({ dataAbertura: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-[9px] font-black uppercase tracking-wider ml-1">Distrito Administrativo</label>
                        <select
                            className="w-full bg-[#090d16] border border-white/5 text-xs rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-200"
                            value={formData.distrito}
                            onChange={e => onChange({ distrito: e.target.value })}
                        >
                            <option value="">Selecione o distrito correspondente</option>
                            <option value="DABEL">DABEL (Distrito Belém)</option>
                            <option value="DABEN">DABEN (Distrito Benguí)</option>
                            <option value="DAENT">DAENT (Distrito Entroncamento)</option>
                            <option value="DAGUA">DAGUA (Distrito Guamá)</option>
                            <option value="DAICO">DAICO (Distrito Icoaraci)</option>
                            <option value="DAMOS">DAMOS (Distrito Mosqueiro)</option>
                            <option value="DAOUT">DAOUT (Distrito Outeiro)</option>
                            <option value="DASAC">DASAC (Distrito Sacramenta)</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="text-slate-400 text-[9px] font-black uppercase tracking-wider ml-1 mb-2 block">Foto da Fachada (Registro Visual)</label>
                        
                        {photo ? (
                            <div className="relative w-full h-36 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 overflow-hidden flex flex-col items-center justify-center gap-2 group">
                                <img src={photo} className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" alt="Fachada" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-400 mb-1" />
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Foto Capturada</span>
                                </div>
                                <button
                                    onClick={onOpenCamera}
                                    className="absolute bottom-2 right-2 bg-slate-900/90 text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-slate-800 transition-colors z-10"
                                >
                                    Refazer
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenCamera}
                                className="group relative w-full h-32 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center justify-center gap-3 transition-all hover:bg-emerald-500/10"
                            >
                                <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center shadow-md group-active:scale-95 transition-transform">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">Capturar Imagem da Fachada</span>
                            </button>
                        )}
                        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-slate-500">
                            <Info className="w-3.5 h-3.5" />
                            <span className="text-[9px] tracking-tight">Necessário que a fachada e número estejam nítidos.</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#030712]/95 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-md mx-auto flex gap-4">
                    <button
                        onClick={() => onNavigate('step2_owner')}
                        className="flex-1 border border-slate-800 text-slate-400 text-xs font-black uppercase py-4 rounded-xl hover:bg-slate-900 transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={() => onNavigate('step4_employees')}
                        disabled={!isStepValid || !photo}
                        className="flex-1 bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs uppercase py-4 rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const Step4Employees = ({ onNavigate, onShowModal, employees, onRemoveEmployee, onSubmitRegistration }: { onNavigate: (step: RegistrationStep) => void, onShowModal: () => void, employees: Employee[], onRemoveEmployee: (index: number) => void, onSubmitRegistration: () => void }) => (
    <div className="relative h-full bg-[#030712] text-white flex flex-col overflow-hidden">
        <header className="sticky top-0 z-50 p-4 h-16 flex items-center bg-[#090d16]/95 backdrop-blur-md border-b border-white/5 justify-between">
            <button onClick={() => onNavigate('step3_details')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-200">Equipe</h1>
            <div className="w-9 h-9" />
        </header>

        <main className="flex-1 p-5 max-w-md mx-auto w-full pb-32 overflow-y-auto custom-scrollbar">
            <StepIndicator current={4} total={4} />

            <div className="mb-6">
                <h2 className="text-xl font-black tracking-tight uppercase text-white mb-1">Funcionários e Manipuladores</h2>
                <p className="text-xs text-slate-400">Cadastre os profissionais vinculados a este ponto para controle sanitário.</p>
            </div>

            <div className="relative rounded-2xl bg-[#090d16] border border-white/5 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden min-h-[160px]">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-450">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Equipe de Manipulação</p>
                            <p className="text-[10px] text-slate-500">{employees.length} batedor(es)/atendente(s)</p>
                        </div>
                    </div>
                    <button
                        onClick={onShowModal}
                        className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-450 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                    >
                        Adicionar
                    </button>
                </div>

                <div className="h-px w-full bg-white/5" />

                {employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-slate-650">
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-wider">Nenhum funcionário cadastrado</p>
                        <p className="text-[9px] text-slate-500 mt-1 max-w-[200px]">É recomendado cadastrar ao menos um batedor manipulador.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {employees.map((emp, i) => (
                            <div key={i} className="bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center group animate-in fade-in duration-200">
                                <div>
                                    <p className="text-xs font-bold text-white">{emp.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-mono text-slate-500">CPF: {emp.cpf}</span>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 uppercase tracking-wide">
                                            {emp.role}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveEmployee(i)}
                                    className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#030712]/95 backdrop-blur-md border-t border-white/5 z-20">
            <button
                onClick={onSubmitRegistration}
                className="w-full max-w-md mx-auto block h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
            >
                Finalizar Cadastro e Emitir Selo
            </button>
        </footer>
    </div>
);

const SuccessView = ({ onNavigate, formData, seloNumber }: { onNavigate: (step: RegistrationStep) => void, formData: FormData, seloNumber: number }) => (
    <div className="relative h-full bg-[#030712] text-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 pb-2 z-10">
            <button
                onClick={() => onNavigate('dashboard')}
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors"
            >
                <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white text-sm font-black uppercase tracking-wider">Sucesso</h2>
            <div className="size-12"></div> {/* Spacer for centering */}
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-4 py-3 flex flex-col items-center gap-6 z-10 custom-scrollbar">
            {/* Success Animation / Icon */}
            <div className="flex flex-col items-center justify-center pt-4">
                <div className="relative flex items-center justify-center size-20 rounded-full bg-emerald-500/20 mb-5 ring-4 ring-emerald-500/10">
                    <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-white text-xl font-black leading-tight tracking-tight text-center uppercase">
                    Ponto Cadastrado!
                </h1>
                <p className="text-slate-400 text-xs mt-2 text-center max-w-[280px]">
                    As coordenadas sanitárias e informações do batedor foram integradas ao VisaBelém.
                </p>
            </div>

            {/* Summary Card */}
            <div className="w-full">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-white/5 bg-[#090d16]">
                    {/* Card Background Image with overlay */}
                    <div className="h-28 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsfAJl4XkvYjuIVOB1D5CHpQB1okzBrXGmmgk0vpmHQa6p88FkKA-BlhbzkBRSYul3gEPFiAYkEGvB1Ps866NBSxFHMF_7eyqp3QBdyHPBQD6caQjH2kyl4SS4DaH5aQwjCI1AZTyM-3NZjbJIl4jvYhvCXJ5z7otAWB8sVMi1BVB9_Vu4bVSdt44wu-dYcOiYY1XA67qq_LZ17-SkSKzolgnkPM1lF-4yfZ2V65-Es7KtXIrrSbdSjdslDkJNJ9E24DtmOpxtZus")' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] to-transparent opacity-95"></div>
                        {/* Map Pin Icon Overlay */}
                        <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-sm p-2 rounded-lg border border-emerald-500/35">
                            <MapPin className="w-4 h-4 text-emerald-450" />
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="px-5 pb-5 -mt-8 relative z-10">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-emerald-450 text-[8px] font-black uppercase tracking-[0.15em] mb-1">Evidência Cadastrada</p>
                                <h3 className="text-white text-lg font-bold tracking-tight">{formData.nomePonto || 'Ponto de Açaí'}</h3>
                            </div>

                            <div className="flex flex-col gap-3 bg-[#030712]/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-tight">Proprietário</p>
                                        <p className="text-xs text-white font-medium">{formData.nomeCompleto || 'João Silva Santos'}</p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-white/5"></div>

                                <div className="flex items-start gap-3">
                                    <Target className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-tight">Coordenadas</p>
                                        <p className="text-xs text-white font-mono text-[10px] mt-0.5">{formData.latitude}, {formData.longitude}</p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-white/5"></div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-tight">Distrito & Selo</p>
                                        <p className="text-xs text-white font-medium">
                                            {formData.distrito} • Selo Nº {seloNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {/* Bottom Action Buttons */}
        <div className="w-full p-4 pb-8 bg-[#030712] z-10 border-t border-white/5">
            <div className="flex flex-col gap-3 w-full">
                {/* Primary Action */}
                <button
                    onClick={() => onNavigate('step1_location')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl h-14 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white shadow-lg text-xs uppercase font-black tracking-wider"
                >
                    <MapPin className="w-4 h-4" />
                    Cadastrar Outro
                </button>
                {/* Secondary Action */}
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl h-14 px-5 bg-transparent border border-white/5 hover:bg-white/5 active:scale-[0.98] transition-all text-white text-xs uppercase font-black tracking-wider"
                >
                    <MapIcon className="w-4 h-4" />
                    Ir para o Dashboard
                </button>
            </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-[10%] -right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px]"></div>
            <div className="absolute -bottom-[10%] -left-[20%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[60px]"></div>
        </div>
    </div>
);

const ProfileView = ({ onNavigate }: { onNavigate: (step: RegistrationStep) => void }) => (
    <div className="h-full bg-[#030712] text-white flex flex-col">
        <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-[#090d16]/95 border-b border-white/5">
            <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-200">Meu Perfil</h1>
            <button className="text-emerald-450 font-black text-xs uppercase">Editar</button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto pb-32 custom-scrollbar">
            <div className="flex flex-col items-center mb-8 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full -z-10" />
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-800 shadow-2xl">
                        <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center overflow-hidden border-4 border-[#030712]">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-[#030712]" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Helena Souza</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Matrícula #849201 • ACS</p>
                <div className="bg-emerald-950/20 border border-emerald-900/30 px-4 py-1.5 rounded-full text-emerald-450 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-3">
                    <MapPin className="w-3.5 h-3.5" /> Belém - Setor 4 (Guamá)
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <GlassCard className="p-3.5 flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Hoje</span>
                    <span className="text-xl font-black font-mono mt-1 text-white">12</span>
                </GlassCard>
                <GlassCard className="p-3.5 flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Semana</span>
                    <span className="text-xl font-black font-mono mt-1 text-emerald-450">45</span>
                </GlassCard>
                <GlassCard className="p-3.5 flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Mês</span>
                    <span className="text-xl font-black font-mono mt-1 text-white">180</span>
                </GlassCard>
            </div>

            <div className="space-y-6">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronização</h3>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-450 border border-emerald-500/20">
                            <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-white">Dados Armazenados</p>
                            <div className="flex items-center gap-1.5 text-amber-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                3 Pontos Offline
                            </div>
                        </div>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">Sincronizar</button>
                </GlassCard>

                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest pt-4">Conta</h3>
                <div className="space-y-2">
                    <button className="w-full bg-[#090d16] border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3.5 text-slate-355">
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold">Configurações</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </button>
                    <button className="w-full bg-[#090d16] border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3.5 text-slate-355">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold">Ajuda e Suporte</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </button>
                    <button onClick={() => onNavigate('dashboard')} className="w-full p-4 flex items-center justify-center gap-2 text-rose-500 hover:text-rose-455 font-bold text-xs uppercase tracking-wider mt-4">
                        <LogOut className="w-4 h-4" /> Sair da Conta
                    </button>
                </div>
            </div>
        </main>
    </div>
);

// --- Componente Principal ---

export const AcaiAppPage = () => {
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('dashboard');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    
    // GPS & Capture Simulators
    const [locatingGPS, setLocatingGPS] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncStepText, setSyncStepText] = useState('');

    const [formData, setFormData] = useState<FormData>({
        nomeCompleto: '',
        cpf: '',
        email: '',
        whatsapp: '',
        nomePonto: '',
        dataAbertura: '',
        distrito: '',
        latitude: '',
        longitude: '',
        endereco: ''
    });

    const [newEmployee, setNewEmployee] = useState<Employee>({ name: '', cpf: '', role: '' });
    const [seloNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));

    // Auto scroll on step change
    useEffect(() => {
        const screenEl = document.getElementById('phone-screen');
        if (screenEl) {
            screenEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    const handleGPSLocate = () => {
        setLocatingGPS(true);
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                latitude: `-1.44792${Math.floor(10 + Math.random() * 90)}`,
                longitude: `-48.46852${Math.floor(10 + Math.random() * 90)}`,
                endereco: "Tv. Dom Romualdo de Seixas, 1200 - Umarizal, Belém - PA, 66050-160",
                distrito: "DABEL"
            }));
            setLocatingGPS(false);
        }, 1500);
    };

    const handleCapturePhoto = () => {
        setPhotoCaptured("https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=300");
        setCameraOpen(false);
    };

    const handleAddEmployee = () => {
        if (newEmployee.name && newEmployee.role && newEmployee.cpf) {
            setEmployees([...employees, { ...newEmployee }]);
            setNewEmployee({ name: '', cpf: '', role: '' });
            setShowEmployeeModal(false);
        }
    };

    const handleRemoveEmployee = (index: number) => {
        setEmployees(employees.filter((_, i) => i !== index));
    };

    const handleSubmitRegistration = () => {
        setSyncing(true);
        setSyncStepText("Processando coordenadas espaciais...");
        
        setTimeout(() => {
            setSyncStepText("Sincronizando com a base central (VisaBelém)...");
            setTimeout(() => {
                setSyncStepText("Selo 'Açaí no Ponto' emitido!");
                setTimeout(() => {
                    setSyncing(false);
                    setCurrentStep('success');
                }, 800);
            }, 900);
        }, 800);
    };

    const updateFormData = (newData: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    // --- Renderização ---

    const renderStep = () => {
        switch (currentStep) {
            case 'dashboard':
                return <DashboardView onNavigate={setCurrentStep} />;
            case 'step1_location':
                return <Step1Location onNavigate={setCurrentStep} formData={formData} onGPSLocate={handleGPSLocate} locating={locatingGPS} />;
            case 'step2_owner':
                return <Step2Owner onNavigate={setCurrentStep} formData={formData} onChange={updateFormData} />;
            case 'step3_details':
                return <Step3Details onNavigate={setCurrentStep} formData={formData} onChange={updateFormData} onOpenCamera={() => setCameraOpen(true)} photo={photoCaptured} />;
            case 'step4_employees':
                return <Step4Employees onNavigate={setCurrentStep} onShowModal={() => setShowEmployeeModal(true)} employees={employees} onRemoveEmployee={handleRemoveEmployee} onSubmitRegistration={handleSubmitRegistration} />;
            case 'success':
                return <SuccessView onNavigate={setCurrentStep} formData={formData} seloNumber={seloNumber} />;
            case 'profile':
                return <ProfileView onNavigate={setCurrentStep} />;
            default:
                return <DashboardView onNavigate={setCurrentStep} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <ScrollbarStyles />
            {/* Mobile Phone Frame */}
            <div className="relative">
                {/* Phone bezel */}
                <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl border border-slate-800 shadow-emerald-500/5">
                    {/* Screen */}
                    <div className="w-[390px] h-[844px] bg-slate-950 rounded-[2.5rem] overflow-hidden relative border border-slate-950">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-50 flex items-center justify-between px-8 pt-2">
                            <span className="text-white text-xs font-semibold">09:41</span>
                            <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                    <div className="w-0.75 h-2 bg-white rounded-full" />
                                    <div className="w-0.75 h-2.5 bg-white rounded-full" />
                                    <div className="w-0.75 h-3 bg-white rounded-full" />
                                    <div className="w-0.75 h-3.5 bg-white/30 rounded-full" />
                                </div>
                                <span className="text-white text-[9px] font-black tracking-tighter">5G</span>
                                <div className="w-5 h-2.5 border border-white/60 rounded-sm relative flex items-center p-0.5">
                                    <div className="h-full w-3.5 bg-emerald-500 rounded-2xs" />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Island (notch) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 border border-slate-900" />

                        {/* App Content */}
                        <div id="phone-screen" className="h-full pt-12 overflow-y-auto custom-scrollbar relative">
                            {renderStep()}

                            {/* Camera overlay simulation */}
                            {cameraOpen && (
                                <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between p-4 pt-14 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center text-white/80 px-2">
                                        <button onClick={() => setCameraOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Fachada do Ponto</span>
                                        <div className="w-9 h-9" />
                                    </div>

                                    <div className="relative flex-1 rounded-2xl border border-white/10 bg-slate-950 overflow-hidden flex items-center justify-center my-4">
                                        {/* Simulation of açaí store */}
                                        <div className="text-center p-6 space-y-4">
                                            <div className="w-18 h-18 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-500 flex items-center justify-center mx-auto animate-pulse">
                                                <Store className="w-8 h-8 text-emerald-450" />
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aponte a câmera para a fachada</p>
                                            <div className="inline-block px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-450 font-mono text-[9px] uppercase tracking-wider">
                                                Foco automático ativo
                                            </div>
                                        </div>
                                        
                                        {/* Viewfinder Grid */}
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                                            <div className="border-r border-b border-white/40"></div>
                                            <div className="border-r border-b border-white/40"></div>
                                            <div className="border-b border-white/40"></div>
                                            <div className="border-r border-b border-white/40"></div>
                                            <div className="border-r border-b border-white/40"></div>
                                            <div className="border-b border-white/40"></div>
                                            <div className="border-r border-white/40"></div>
                                            <div className="border-r border-white/40"></div>
                                            <div></div>
                                        </div>
                                    </div>

                                    <div className="h-24 flex items-center justify-center pb-4">
                                        <button
                                            onClick={handleCapturePhoto}
                                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-all"
                                        >
                                            <div className="w-full h-full bg-white rounded-full"></div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Database Sync Overlay */}
                            {syncing && (
                                <div className="absolute inset-0 bg-[#030712]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                                    <div className="text-center space-y-6">
                                        <div className="relative flex items-center justify-center mx-auto">
                                            <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 animate-ping" />
                                            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center border border-white/10 shadow-lg">
                                                <Zap className="w-5 h-5 text-white animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-bold text-sm uppercase tracking-wide">Sincronizando com a VISA</p>
                                            <p className="text-[10px] font-mono text-emerald-450 h-4">{syncStepText}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Home indicator */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50" />

                        {/* Modal de Funcionário (dentro do frame) */}
                        {showEmployeeModal && (
                            <div className="absolute inset-0 z-[100] flex items-end justify-center">
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEmployeeModal(false)} />
                                <div className="relative w-full bg-[#090d16] rounded-t-3xl border-t border-white/5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                                    <div className="flex justify-center pt-3 pb-1">
                                        <div className="w-10 h-1 rounded-full bg-slate-800" />
                                    </div>
                                    <div className="p-5 border-b border-white/5 flex justify-between items-center">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-white">Novo Funcionário</h3>
                                        <button onClick={() => setShowEmployeeModal(false)} className="text-slate-500 hover:text-white p-1">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-emerald-450 mb-2 block ml-1">Nome Completo</label>
                                            <input
                                                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                                                placeholder="Ex: João da Silva Santos"
                                                value={newEmployee.name}
                                                onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-emerald-450 mb-2 block ml-1">CPF</label>
                                            <input
                                                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                                                placeholder="000.000.000-00"
                                                value={newEmployee.cpf}
                                                onChange={e => setNewEmployee({ ...newEmployee, cpf: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-emerald-450 mb-2 block ml-1">Função / Cargo</label>
                                            <select
                                                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                                                value={newEmployee.role}
                                                onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                            >
                                                <option value="">Selecione uma opção</option>
                                                <option value="Batedor">Batedor (Manipulador)</option>
                                                <option value="Atendente">Atendente</option>
                                                <option value="Auxiliar">Auxiliar Geral</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="p-5 pt-0 flex gap-3 pb-8">
                                        <button onClick={() => setShowEmployeeModal(false)} className="flex-1 font-black text-xs uppercase text-slate-500 hover:text-slate-200 py-3">Cancelar</button>
                                        <button
                                            onClick={handleAddEmployee}
                                            disabled={!newEmployee.name || !newEmployee.cpf || !newEmployee.role}
                                            className="flex-[2] bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs uppercase py-3.5 rounded-xl flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-4 h-4" /> Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Device label */}
                <div className="text-center mt-4">
                    <p className="text-slate-400 text-sm">📱 Preview: App Açaí no Ponto - ACS</p>
                    <p className="text-slate-500 text-xs mt-1">iPhone 14 Pro Max (390 × 844)</p>
                </div>
            </div>
        </div>
    );
};

export default AcaiAppPage;