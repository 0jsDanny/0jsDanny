
import { useState } from 'react';
import { Scale, ArrowLeft, Printer, Minimize2, Maximize2, X, FileText, Eye } from 'lucide-react';
import { Button } from './ui/Button';

export interface LegislationDoc {
    name: string;
    url: string;
    description?: string;
}

export interface LegislationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    documents: LegislationDoc[];
}


const LegislationModal = ({ isOpen, onClose, title, documents }: LegislationModalProps) => {
    const [selectedDoc, setSelectedDoc] = useState<LegislationDoc | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    if (isOpen && documents.length === 1 && !selectedDoc) {
        setSelectedDoc(documents[0]);
    }

    if (!isOpen) return null;

    const handleBackToList = () => {
        setSelectedDoc(null);
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className={`shadow-2xl flex flex-col animate-scale-in border transition-all duration-300 overflow-hidden bg-white border-slate-100 ${isFullScreen
                ? 'fixed inset-0 w-full h-full rounded-none'
                : 'w-full max-w-5xl h-[90vh] rounded-2xl'
                }`}>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b gap-3 sm:gap-0 border-slate-200">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold leading-tight text-slate-900">
                                {selectedDoc ? 'Visualizando Documento' : 'Legislação e Normas'}
                            </h3>
                            <p className="text-xs sm:text-sm mt-0.5 text-slate-500 truncate pr-4">
                                {selectedDoc ? selectedDoc.name : title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                        {selectedDoc && documents.length > 1 && (
                            <Button onClick={handleBackToList} variant="ghost" size="sm" className="hidden sm:flex mr-2 text-slate-600 font-medium">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                        )}

                        {selectedDoc && (
                            <>
                                <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm hidden sm:flex">
                                    <Printer className="w-4 h-4" /> <span>Imprimir</span>
                                </button>
                                <div className="w-px h-6 sm:h-8 mx-1 sm:mx-2 hidden sm:block bg-gray-200" />
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-slate-100 text-slate-500 hover:text-blue-600 hidden sm:block"
                                    title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
                                >
                                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-slate-100 text-slate-500 hover:text-red-600"
                            title="Fechar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative overflow-hidden bg-slate-50">
                    {selectedDoc ? (
                        <iframe
                            src={selectedDoc.url}
                            className="w-full h-full border-none"
                            title="Legislation Viewer"
                        />
                    ) : (
                        <div className="p-6 h-full overflow-auto">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Documentos Relacionados</h4>
                            <div className="grid gap-3">
                                {documents.map((doc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDoc(doc)}
                                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex items-start gap-4"
                                    >
                                        <div className="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{doc.name}</h5>
                                            {doc.description && <p className="text-sm text-gray-500 mt-1">{doc.description}</p>}
                                            <p className="text-xs text-blue-500 font-medium mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye className="w-3 h-3" /> Clique para visualizar documento
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegislationModal;
