
import { useState } from 'react';
import { X, User, Users, ClipboardList, CheckSquare, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface Cnae {
    codigo: string;
    descricao: string;
    risco: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface DispatchConfirmData {
    cnaes: string[];
    fiscal: TeamMember | undefined;
    support: TeamMember[];
    instructions: string;
    priority: string;
}

interface DispatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableCnaes: Cnae[];
    preSelectedCnae?: string; // Código do CNAE que originou o clique
    onConfirm: (data: DispatchConfirmData) => void;
}

// Dados mockados de equipe para o exemplo
const MOCK_TEAM: TeamMember[] = [
    { id: '1', name: 'Ana Souza', role: 'Técnico em VISA', avatar: '/woman-avatar-1.jpg' },
    { id: '2', name: 'Carlos Lima', role: 'Técnico em VISA', avatar: '/man-avatar-2.jpg' },
    { id: '3', name: 'Pedro Santos', role: 'Agente em VISA', avatar: '/man-avatar-1.jpg' },
    { id: '4', name: 'Mariana Costa', role: 'Agente em VISA', avatar: '/woman-avatar-2.jpg' },
    { id: '5', name: 'Roberto Almeida', role: 'Gerente', avatar: '/man-avatar-3.jpg' },
    { id: '6', name: 'Lucas Oliveira', role: 'Técnico em VISA', avatar: '/man-avatar-4.jpg' },
    { id: '7', name: 'Fernanda Lima', role: 'Técnico em VISA', avatar: '/woman-avatar-4.jpg' },
];

export const DispatchModal = ({ isOpen, onClose, availableCnaes, preSelectedCnae, onConfirm }: DispatchModalProps) => {
    const [selectedCnaes, setSelectedCnaes] = useState<string[]>(preSelectedCnae ? [preSelectedCnae] : []);
    const [selectedFiscal, setSelectedFiscal] = useState<string>('');
    const [selectedSupport, setSelectedSupport] = useState<string[]>([]);
    const [instructions, setInstructions] = useState('');
    const priority = 'normal';

    const toggleCnae = (codigo: string) => {
        setSelectedCnaes(prev =>
            prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
        );
    };

    const toggleSupport = (id: string) => {
        setSelectedSupport(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSelectFiscal = (id: string) => {
        setSelectedFiscal(id);
        setSelectedSupport(prev => prev.filter(sid => sid !== id));
    };

    const handleConfirm = () => {
        onConfirm({
            cnaes: selectedCnaes,
            fiscal: MOCK_TEAM.find(m => m.id === selectedFiscal),
            support: MOCK_TEAM.filter(m => selectedSupport.includes(m.id)),
            instructions,
            priority
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                            Novo Despacho de Fiscalização
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Defina a equipe e as atividades para este despacho</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* 1. Seleção de CNAEs */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-gray-400" />
                            Atividades Disponíveis
                        </label>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                            {availableCnaes.length > 0 ? availableCnaes.map((cnae) => (
                                <div
                                    key={cnae.codigo}
                                    className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${selectedCnaes.includes(cnae.codigo) ? 'bg-blue-50/50' : 'hover:bg-gray-100/50'}`}
                                    onClick={() => toggleCnae(cnae.codigo)}
                                >
                                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selectedCnaes.includes(cnae.codigo) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                        {selectedCnaes.includes(cnae.codigo) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-sm text-gray-900">{cnae.codigo}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${cnae.risco === 'Alto Risco' ? 'bg-red-500' : cnae.risco === 'Médio Risco' ? 'bg-amber-500' : 'bg-green-500'
                                                }`}>
                                                {cnae.risco}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{cnae.descricao}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-sm text-gray-500 italic">
                                    Nenhuma atividade disponível para despacho.
                                </div>
                            )}
                        </div>
                        {selectedCnaes.length === 0 && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Selecione pelo menos uma atividade
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Fiscal Responsável */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                Fiscal Responsável
                            </label>
                            <div className="border border-gray-200 rounded-lg p-2 space-y-1 max-h-[150px] overflow-y-auto">
                                {MOCK_TEAM.filter(m => ['Técnico em VISA', 'Gerente'].includes(m.role)).map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => handleSelectFiscal(m.id)}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedFiscal === m.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedFiscal === m.id ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {selectedFiscal === m.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src={m.avatar} alt="" className="w-5 h-5 rounded-full bg-gray-100 object-cover" />
                                            <span className="text-sm text-gray-700">{m.name} <span className="text-gray-400 text-xs">({m.role})</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Equipe de Apoio */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                Equipe de Apoio
                            </label>
                            <div className="border border-gray-200 rounded-lg p-2 space-y-1 max-h-[150px] overflow-y-auto">
                                {MOCK_TEAM.filter(m => m.id !== selectedFiscal).map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => toggleSupport(m.id)}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedSupport.includes(m.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedSupport.includes(m.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                            {selectedSupport.includes(m.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src={m.avatar} alt="" className="w-5 h-5 rounded-full bg-gray-100 object-cover" />
                                            <span className="text-sm text-gray-700">{m.name} <span className="text-gray-400 text-xs">({m.role})</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. Instruções */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-gray-400" />
                            Despacho / Orientações
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Insira as orientações para a equipe de fiscalização, prazos específicos ou pontos de atenção..."
                            className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:bg-gray-200">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedCnaes.length === 0 || !selectedFiscal}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-6 gap-2"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Confirmar Despacho
                    </Button>
                </div>
            </div>
        </div>
    );
};
