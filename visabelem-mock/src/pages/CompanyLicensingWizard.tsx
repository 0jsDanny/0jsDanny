import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    UploadCloud,
    FileText,
    Building2,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import { cn } from '../lib/utils';

const steps = [
    { id: 1, title: 'Unidade', desc: 'Escolha o estabelecimento' },
    { id: 2, title: 'Serviço', desc: 'O que deseja solicitar?' },
    { id: 3, title: 'Documentos', desc: 'Envio de anexos' },
    { id: 4, title: 'Confirmação', desc: 'Resumo do pedido' },
];

const processTypes = [
    { id: 'lf', title: 'Licença de Funcionamento (LF)', desc: 'Primeira licença ou renovação anual do estabelecimento.' },
    { id: 'apa', title: 'Aprovação de Projeto (APA)', desc: 'Análise de projeto arquitetônico para novas instalações.' },
    { id: 'cc', title: 'Carta de Crédito (CC)', desc: 'Para fins de licitação ou garantias financeiras.' },
    { id: 'dlf', title: 'Dispensa de Licença (DLF)', desc: 'Certificado de isenção para atividades de baixo risco.' },
];

export const CompanyLicensingWizard = () => {
    const navigate = useNavigate();
    const { userProfile } = useMode();
    const [currentStep, setCurrentStep] = useState(1);
    const [complete, setComplete] = useState(false);

    // Selection state
    const [selectedUnit, setSelectedUnit] = useState<string | null>(userProfile.activeUnitId || null);
    const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(c => c + 1);
        else setComplete(true);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const currentUnitData = userProfile.units?.find(u => u.id === selectedUnit);
    const currentProcessData = processTypes.find(p => p.id === selectedProcess);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Header com Contexto */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-gray-900 lowercase flex items-center justify-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" /> Nova Solicitação
                </h1>
                <p className="text-gray-500 mt-2 uppercase tracking-widest font-bold text-[10px]">
                    Grupo Econômico: {userProfile.name}
                </p>
            </div>

            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300 ${step.id <= currentStep
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <div className="text-center hidden sm:block">
                                <p className={`text-[10px] uppercase font-black tracking-widest ${step.id <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {complete ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Protocolo Gerado!</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                            Sua solicitação para <span className="text-blue-600 font-bold">{currentUnitData?.name}</span> foi enviada à Vigilância Sanitária.
                        </p>

                        <Card className="max-w-sm mx-auto p-6 bg-gray-50 border-gray-100 mb-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Número do Protocolo</p>
                            <p className="text-2xl font-black text-gray-900">2026.01.8412</p>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-left">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Processo</p>
                                    <p className="text-xs font-bold text-gray-700">{currentProcessData?.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Previsão</p>
                                    <p className="text-xs font-bold text-green-600">72h (Triagem)</p>
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-center gap-4">
                            <Button variant="ghost" onClick={() => navigate('/empresa/dashboard')} className="font-bold text-gray-500">Voltar ao Painel</Button>
                            <Button className="bg-blue-600 text-white font-black px-8">Acompanhar Agora</Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card className="p-8 border-gray-100 shadow-xl shadow-gray-500/5 min-h-[460px] flex flex-col">
                            <div className="flex-1">
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-left mb-8">
                                            <h2 className="text-xl font-black text-gray-900">Selecione a Unidade</h2>
                                            <p className="text-sm text-gray-500 font-medium">Escolha qual estabelecimento de Belém deseja regularizar.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {userProfile.units?.map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    onClick={() => setSelectedUnit(unit.id)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                                        selectedUnit === unit.id
                                                            ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5"
                                                            : "border-gray-100 bg-white hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            selectedUnit === unit.id ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400"
                                                        )}>
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={cn("text-sm font-black uppercase tracking-tight", selectedUnit === unit.id ? "text-blue-900" : "text-gray-900")}>{unit.name}</p>
                                                            <p className="text-[10px] font-mono text-gray-400">{unit.cnpj}</p>
                                                        </div>
                                                    </div>
                                                    {selectedUnit === unit.id && (
                                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-left mb-8">
                                            <h2 className="text-xl font-black text-gray-900">Qual o serviço desejado?</h2>
                                            <p className="text-sm text-gray-500 font-medium">Unidade selecionada: <span className="text-blue-600 font-bold uppercase">{currentUnitData?.name}</span></p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {processTypes.map((type) => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setSelectedProcess(type.id)}
                                                    className={cn(
                                                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-5 group",
                                                        selectedProcess === type.id
                                                            ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5"
                                                            : "border-gray-100 bg-white hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0",
                                                        selectedProcess === type.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                                                    )}>
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={cn("text-sm font-black uppercase tracking-widest", selectedProcess === type.id ? "text-blue-900" : "text-gray-900")}>{type.title}</p>
                                                        <p className="text-xs text-gray-500 font-medium leading-tight mt-1">{type.desc}</p>
                                                    </div>
                                                    {selectedProcess === type.id && <Check className="w-5 h-5 text-blue-600" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-left mb-8">
                                            <h2 className="text-xl font-black text-gray-900">Documentação Obrigatória</h2>
                                            <p className="text-sm text-gray-500 font-medium">Para <span className="font-bold text-gray-900 underline">{currentProcessData?.title}</span>:</p>
                                        </div>

                                        <div className="space-y-4">
                                            {['Contrato Social Atualizado', 'CNPJ da Unidade', 'Taxa de Protocolo (DAM)'].map((doc) => (
                                                <div key={doc} className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-gray-50 p-2 rounded-xl text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
                                                            <UploadCloud className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{doc}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apenas PDF ou Imagem</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" className="text-[10px] font-black h-8 px-4 rounded-lg uppercase">Anexar</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6 text-left">
                                        <div className="text-left mb-8">
                                            <h2 className="text-xl font-black text-gray-900">Resumo da Solicitação</h2>
                                            <p className="text-sm text-gray-500 font-medium">Confira os detalhes antes de protocolar.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            <Building2 className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Unidade Selecionada</p>
                                                            <p className="text-sm font-black text-gray-900 uppercase">{currentUnitData?.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 divide-y divide-gray-200">
                                                        <div className="flex justify-between pt-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">CNPJ</span>
                                                            <span className="text-xs font-mono font-bold">{currentUnitData?.cnpj}</span>
                                                        </div>
                                                        <div className="flex justify-between pt-4">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Endereço</span>
                                                            <span className="text-[10px] font-bold text-gray-700 text-right max-w-[150px]">{currentUnitData?.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Processo Solicitado</p>
                                                            <p className="text-sm font-black text-blue-900 uppercase">{currentProcessData?.title}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Documentos OK</span>
                                                        </div>
                                                        <p className="text-[10px] text-blue-800/70 font-medium leading-relaxed">
                                                            Ao confirmar, sua empresa declara sob as penas da lei que as informações e documentos anexados são verídicos.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={cn("font-black text-xs uppercase tracking-widest text-gray-400", currentStep === 1 ? 'invisible' : 'hover:bg-gray-50')}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="bg-blue-600 text-white font-black px-10 rounded-xl shadow-lg shadow-blue-600/20"
                                    disabled={(currentStep === 1 && !selectedUnit) || (currentStep === 2 && !selectedProcess)}
                                >
                                    {currentStep === 4 ? 'Confirmar e Protocolar' : 'Continuar'}
                                    {currentStep !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
