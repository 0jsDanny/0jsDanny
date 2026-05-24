import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    UploadCloud,
    FileText,
    Search,
    Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
    { id: 1, title: 'Identificação', desc: 'Dados da empresa' },
    { id: 2, title: 'Atividade', desc: 'Ramo de atuação' },
    { id: 3, title: 'Documentos', desc: 'Envio de arquivos' },
    { id: 4, title: 'Revisão', desc: 'Confirmar dados' },
];

export const LicensingWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [complete, setComplete] = useState(false);

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(c => c + 1);
        else setComplete(true);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-brand-500 -z-10 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.id <= currentStep
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110'
                                    : 'bg-slate-200 text-slate-500'
                                    }`}
                            >
                                {step.id < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                            </div>
                            <div className="text-center hidden sm:block">
                                <p className={`text-sm font-semibold ${step.id <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-slate-400">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {complete ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-24 h-24 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success-500/20">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Solicitação Enviada!</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
                            Seu processo foi gerado com sucesso. O número do seu protocolo é <strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded">2026.01.0842</strong>.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/">
                                <Button variant="outline">Voltar ao Início</Button>
                            </Link>
                            <Button>Acompanhar Processo</Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="min-h-[400px] flex flex-col">
                            <div className="flex-1">
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-slate-800">Identificação da Empresa</h2>
                                            <p className="text-slate-500">Informe os dados básicos para iniciar o processo.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <Input label="CNPJ" placeholder="00.000.000/0000-00" icon={<Search className="w-4 h-4" />} />
                                                <Input label="Nome Fantasia" placeholder="Ex: Farmácia Santo Remédio" icon={<Building className="w-4 h-4" />} />
                                            </div>
                                            <div className="space-y-4">
                                                <Input label="Razão Social" placeholder="Razão Social Ltda" />
                                                <Input label="E-mail Responsável" type="email" placeholder="contato@empresa.com" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-slate-800">Atividade Principal</h2>
                                            <p className="text-slate-500">Selecione o CNAE ou a categoria do seu estabelecimento.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {['Comércio de Alimentos', 'Drogarias e Farmácias', 'Clínicas Médicas', 'Serviços de Estética', 'Escolas e Creches', 'Indústria de Alimentos'].map((item) => (
                                                <div key={item} className="border border-slate-200 rounded-xl p-4 hover:border-brand-500 hover:bg-brand-50 cursor-pointer transition-all flex items-center gap-3 group">
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-brand-500" />
                                                    <span className="font-medium text-slate-700 group-hover:text-brand-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-slate-800">Documentação</h2>
                                            <p className="text-slate-500">Envie os arquivos necessários em PDF ou imagem.</p>
                                        </div>

                                        <div className="space-y-4">
                                            {['Contrato Social', 'Licença do Bombeiros', 'CNPJ (Cartão)'].map((doc) => (
                                                <div key={doc} className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-brand-400 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-brand-100 p-2 rounded-lg text-brand-600 group-hover:bg-brand-200 transition-colors">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{doc}</p>
                                                            <p className="text-xs text-slate-400">PDF ou JPG até 5MB</p>
                                                        </div>
                                                    </div>
                                                    <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-brand-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-slate-800">Revisão Final</h2>
                                            <p className="text-slate-500">Confira as informações antes de enviar.</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-100">
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-slate-500">CNPJ</span>
                                                <span className="font-medium">19.769.575/0001-00</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-slate-500">Razão Social</span>
                                                <span className="font-medium">NOVA MEDICA COMÉRCIO LTDA</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-slate-500">Atividade</span>
                                                <span className="font-medium">Drogarias e Farmácias</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Documentos</span>
                                                <span className="text-success-600 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" /> 3 anexados
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={currentStep === 1 ? 'invisible' : ''}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                                <Button onClick={nextStep} className="px-8">
                                    {currentStep === 4 ? 'Enviar Solicitação' : 'Próximo Passo'}
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
