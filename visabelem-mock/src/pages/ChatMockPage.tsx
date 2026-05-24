import { useState } from 'react';
import {
    Search,
    Plus,
    RefreshCw,
    Send,
    ArrowLeft,
    Paperclip,
    Smile,
    FileText,
    Bot,
    Users,
    User,
    Download,
    Eye,
    CheckCheck,
    Check,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Componente para renderizar markdown simples
const MarkdownText = ({ text, isMe }: { text: string; isMe?: boolean }) => {
    // Parse inline markdown (bold, italic, links) within a line
    const parseInline = (line: string, key: number) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let partKey = 0;

        // Process **bold**, *italic*, and [link](url) patterns
        while (remaining.length > 0) {
            // Check for [link](url)
            const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
            // Check for **bold**
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            // Check for *italic*
            const italicMatch = remaining.match(/\*([^*]+?)\*/);

            // Find which pattern comes first
            const matches = [
                { type: 'link', match: linkMatch, index: linkMatch?.index ?? Infinity },
                { type: 'bold', match: boldMatch, index: boldMatch?.index ?? Infinity },
                { type: 'italic', match: italicMatch, index: italicMatch?.index ?? Infinity }
            ].filter(m => m.match).sort((a, b) => a.index - b.index);

            if (matches.length === 0) {
                // No more matches, add remaining text
                parts.push(<span key={`${key}-${partKey++}`}>{remaining}</span>);
                break;
            }

            const first = matches[0];

            // Add text before the match
            if (first.index > 0) {
                parts.push(<span key={`${key}-${partKey++}`}>{remaining.slice(0, first.index)}</span>);
            }

            if (first.type === 'link' && linkMatch) {
                // Add link
                parts.push(
                    <a
                        key={`${key}-${partKey++}`}
                        href={linkMatch[2]}
                        className={`inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity ${isMe ? 'text-blue-200' : 'text-blue-600'}`}
                    >
                        {linkMatch[1]}
                    </a>
                );
                remaining = remaining.slice(first.index + linkMatch[0].length);
            } else if (first.type === 'bold' && boldMatch) {
                // Add bold text
                parts.push(
                    <strong key={`${key}-${partKey++}`} className="font-bold">
                        {boldMatch[1]}
                    </strong>
                );
                remaining = remaining.slice(first.index + boldMatch[0].length);
            } else if (first.type === 'italic' && italicMatch) {
                // Add italic text
                parts.push(
                    <em key={`${key}-${partKey++}`} className={isMe ? 'text-blue-100' : 'text-zinc-500'}>
                        {italicMatch[1]}
                    </em>
                );
                remaining = remaining.slice(first.index + italicMatch[0].length);
            }
        }

        return parts.length > 0 ? parts : line;
    };

    const lines = text.split('\n');

    return (
        <>
            {lines.map((line, i) => {
                // Check if line is a numbered list item (1. 2. 3. etc)
                const numberedListMatch = line.match(/^(\d+)\.\s+(.*)$/);
                // Check if line is a bullet point
                const isBullet = line.trimStart().startsWith('•') || line.trimStart().startsWith('-');
                // Check indent level
                const indentMatch = line.match(/^(\s*)/);
                const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 3) : 0;

                if (numberedListMatch) {
                    return (
                        <div key={i} className="flex items-start gap-2 my-0.5">
                            <span className={`font-bold min-w-[20px] ${isMe ? 'text-blue-200' : 'text-blue-600'}`}>
                                {numberedListMatch[1]}.
                            </span>
                            <span>{parseInline(numberedListMatch[2], i)}</span>
                        </div>
                    );
                } else if (isBullet) {
                    const bulletContent = line.replace(/^\s*[•-]\s*/, '');
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-1.5 my-0.5"
                            style={{ marginLeft: `${indentLevel * 12}px` }}
                        >
                            <span className={`${isMe ? 'text-blue-200' : 'text-blue-500'}`}>•</span>
                            <span>{parseInline(bulletContent, i)}</span>
                        </div>
                    );
                } else if (line.trim() === '') {
                    return <div key={i} className="h-2" />;
                } else {
                    return (
                        <div key={i}>
                            {parseInline(line, i)}
                        </div>
                    );
                }
            })}
        </>
    );
};

// Mock data para conversas
const mockConversations = [
    {
        id: 'ai-visa',
        type: 'private',
        name: 'IA VISA',
        avatar: null,
        isBot: true,
        lastMessage: '📄 Relatório Licenças Distribuidoras - Janeiro 2026.pdf',
        lastMessageTime: '14:32',
        unread: 0,
        online: true
    },
    {
        id: 'grupo-gvdm',
        type: 'group',
        name: 'GVDM - Medicamentos',
        avatar: null,
        sector: 'GVDM',
        lastMessage: 'João: Precisamos revisar o processo 2026.01.0042',
        lastMessageTime: '13:22',
        unread: 3,
        members: 8
    },

    {
        id: 'diretoria',
        type: 'group',
        name: 'Diretoria DEVISA',
        avatar: null,
        sector: 'DEVISA',
        lastMessage: 'Reunião remarcada para 15h',
        lastMessageTime: '11:30',
        unread: 1,
        members: 5
    },
    {
        id: 'joao-silva',
        type: 'private',
        name: 'João Silva',
        avatar: '/man-avatar-1.jpg',
        role: 'Técnico em VISA',
        lastMessage: 'Ok, vou verificar!',
        lastMessageTime: 'Ontem',
        unread: 0,
        online: false
    },
    {
        id: 'maria-santos',
        type: 'private',
        name: 'Maria Santos',
        avatar: '/woman-avatar-1.jpg',
        role: 'Fiscal Sanitário',
        lastMessage: 'Processo aprovado ✓',
        lastMessageTime: 'Ontem',
        unread: 0,
        online: true
    }
];

// Mock de mensagens da conversa com a IA
const mockAIMessages = [
    {
        id: '1',
        author: 'user',
        content: 'Consulte as AFEs do CNPJ 04.418.934/0001-07 na Anvisa',
        time: '14:15',
        status: 'read'
    },
    {
        id: '2',
        author: 'ai',
        content: 'Consultando o portal da Anvisa...\n\n🏢 **Empresa:** DROGARIA EXTRAFARMA DO BRASIL LTDA\n**CNPJ:** 04.418.934/0001-07\n**Situação:** ✅ Ativa\n\n📋 **Autorizações de Funcionamento (AFE):**\n\n**AFE nº 0.05679.2** - Válida até 31/12/2026\n• Comércio: Medicamentos\n• Atividade: Dispensar medicamentos, inclusive sujeitos a controle especial\n• Classe: Drogaria\n\n**AFE nº 7.04521.8** - Válida até 31/12/2026\n• Comércio: Cosméticos, Produtos de Higiene e Perfumes\n• Atividade: Dispensar produtos cosméticos\n• Classe: Drogaria\n\n**AE nº 1.05679.6** - Válida até 31/12/2026\n• Autorização Especial para medicamentos sujeitos a controle especial (Portaria 344/98)\n• Lista: A1, A2, A3, B1, B2, C1, C2, C4, C5\n\n*Fonte: Consulta Pública ANVISA - 12/01/2026 às 14:15*',
        time: '14:16',
        status: 'read'
    },
    {
        id: '3',
        author: 'user',
        content: 'O prescritor Raimundo dos Santos Nonato está cadastrado?',
        time: '14:20',
        status: 'read'
    },
    {
        id: '4',
        author: 'ai',
        content: 'Pesquisando na base de prescritores...\n\n✅ **Prescritor encontrado!**\n\n👤 **Dr. Raimundo dos Santos Nonato**\n• **CRM:** 8745-PA\n• **Especialidade:** Clínica Geral\n• **Situação:** 🟢 Ativo\n• **Cadastro DEVISA:** #PRESC-2024-00892\n\n📍 **Endereço de Atendimento:**\nAv. Governador José Malcher, 2300 - Sala 405\nNazaré, Belém/PA - CEP 66035-100\n\n📝 **Talonários Vinculados:**\n• Receita A (Amarela): Último talonário #4521 - 15 folhas restantes\n• Receita B (Azul): Último talonário #2893 - 42 folhas restantes\n• Notificação de Receita Especial: Último talonário #892 - 28 folhas restantes\n\n🔗 **Acesso Rápido:**\n[Ver cadastro completo →](/admin/prescritores/cadastro-pf?id=PRESC-2024-00892)\n\n*Última atualização: 08/01/2026*',
        time: '14:21',
        status: 'read'
    },
    {
        id: '5',
        author: 'user',
        content: 'Gere um relatório das licenças de distribuidoras vencidas ou a vencer nos próximos 30 dias',
        time: '14:30',
        status: 'read'
    },
    {
        id: '6',
        author: 'ai',
        content: 'Gerando relatório de licenças...\n\n✅ **Relatório gerado com sucesso!**\n\nO documento contém:\n• **8 Distribuidoras** com licença vencida aguardando renovação\n• **23 Distribuidoras** com licença a vencer nos próximos 30 dias\n• Lista de CNPJs e responsáveis técnicos\n• Histórico de renovações anteriores\n• Sugestão de notificações preventivas',
        time: '14:32',
        status: 'read',
        attachment: {
            name: 'Relatório Licenças Distribuidoras - Janeiro 2026.pdf',
            type: 'pdf',
            size: '1.4 MB'
        }
    }
];

// Componente Sidebar
const ChatSidebar = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    searchTerm,
    setSearchTerm
}: {
    conversations: typeof mockConversations;
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) => {
    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-200 w-full md:w-80 lg:w-96 flex-shrink-0">
            {/* Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <h1 className="text-xl font-bold text-zinc-800">Conversas</h1>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full shadow-sm transition-all"
                        title="Atualizar Chat"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onNewChat}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm transition-colors"
                        title="Nova Conversa"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-zinc-200">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar conversa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 text-zinc-800 placeholder-zinc-500"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-zinc-100">
                    {filteredConversations.map((conv) => {
                        const isActive = activeConversationId === conv.id;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`w-full p-3 flex items-center gap-3 transition-all duration-200 ${isActive
                                    ? 'bg-blue-50'
                                    : 'hover:bg-zinc-50'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${conv.isBot
                                        ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                        : conv.type === 'group'
                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                            : 'bg-zinc-200'
                                        }`}>
                                        {conv.avatar ? (
                                            <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                                        ) : conv.isBot ? (
                                            <Bot className="w-6 h-6 text-white" />
                                        ) : conv.type === 'group' ? (
                                            <Users className="w-6 h-6 text-white" />
                                        ) : (
                                            <span className="text-lg font-semibold uppercase text-zinc-500">{conv.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    {conv.online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-sm font-semibold text-zinc-900 truncate flex items-center gap-1.5">
                                            {conv.name}
                                            {conv.isBot && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                                                    <Sparkles className="w-2.5 h-2.5" /> IA
                                                </span>
                                            )}
                                        </h3>
                                        <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-zinc-400'}`}>
                                            {conv.lastMessageTime}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-zinc-500 truncate max-w-[85%]">
                                            {conv.lastMessage}
                                        </p>
                                        {/* Unread badge */}
                                        {conv.unread > 0 && (
                                            <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Componente Message Bubble
const MessageBubble = ({ message, isMe }: { message: typeof mockAIMessages[0]; isMe: boolean }) => {
    const [showPdfModal, setShowPdfModal] = useState(false);

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                    className={`relative px-4 py-2 rounded-2xl shadow-sm border ${isMe
                        ? 'bg-blue-600 border-blue-600 text-white rounded-tr-sm'
                        : 'bg-white border-zinc-200 text-zinc-800 rounded-tl-sm'
                        }`}
                >
                    {/* Author Name for AI */}
                    {!isMe && (
                        <span className="flex items-center gap-1.5 text-xs font-bold mb-1 text-violet-500">
                            <Bot className="w-3.5 h-3.5" />
                            IA VISA
                        </span>
                    )}

                    {/* Text Content - with Markdown support */}
                    {message.content && (
                        <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                            <MarkdownText text={message.content} isMe={isMe} />
                        </div>
                    )}

                    {/* Attachment */}
                    {message.attachment && (
                        <div className="mt-3">
                            <button
                                onClick={() => setShowPdfModal(true)}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left w-full group/file ${isMe
                                    ? 'bg-blue-700/50 hover:bg-blue-700'
                                    : 'bg-zinc-100 hover:bg-zinc-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 ${isMe ? 'bg-blue-600' : 'bg-white'}`}>
                                    <FileText className={`w-5 h-5 ${isMe ? 'text-blue-100' : 'text-red-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-50' : 'text-zinc-700'}`}>
                                        {message.attachment.name}
                                    </p>
                                    <div className="flex items-center gap-2 opacity-70 text-xs">
                                        <span>{message.attachment.size}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            <span className="font-bold uppercase tracking-wider text-[10px]">Visualizar</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Timestamp + Status */}
                    <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-blue-200' : 'text-zinc-400'}`}>
                        <span>{message.time}</span>
                        {isMe && (
                            message.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Modal */}
            {showPdfModal && message.attachment && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowPdfModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <FileText className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{message.attachment.name}</h3>
                                    <p className="text-xs text-zinc-500">{message.attachment.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" /> Baixar
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowPdfModal(false)}>
                                    ✕
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 bg-zinc-100 flex items-center justify-center">
                            <div className="text-center text-zinc-400">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
                                <p className="text-sm font-medium">Visualização do PDF</p>
                                <p className="text-xs mt-1">Em produção, o PDF seria renderizado aqui</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente Chat Window
const ChatWindow = ({
    conversation,
    messages,
    onBack
}: {
    conversation: typeof mockConversations[0];
    messages: typeof mockAIMessages;
    onBack: () => void;
}) => {
    const [inputText, setInputText] = useState('');

    return (
        <div className="flex flex-col h-full bg-[#efeae2] relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-repeat"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
            />

            {/* Header */}
            <div className="bg-white border-b border-zinc-200 py-3 px-4 flex items-center gap-3 z-10 shadow-sm">
                <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-zinc-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>

                <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${conversation.isBot
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                    : 'bg-zinc-200'
                    }`}>
                    {conversation.isBot ? (
                        <Bot className="w-5 h-5 text-white" />
                    ) : conversation.avatar ? (
                        <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-zinc-500" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-zinc-900 truncate flex items-center gap-2">
                        {conversation.name}
                        {conversation.isBot && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5" /> Assistente IA
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-zinc-500">
                        {conversation.isBot ? 'Sempre disponível' : conversation.online ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 z-10">
                {/* Date Divider */}
                <div className="flex justify-center my-4 sticky top-0 z-20">
                    <div className="bg-white/80 backdrop-blur-sm border border-zinc-200/50 px-4 py-1 rounded-full shadow-sm">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            Hoje
                        </span>
                    </div>
                </div>

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMe={msg.author === 'user'}
                    />
                ))}
            </div>

            {/* Input Area */}
            <div className="relative z-10 border-t border-zinc-200/50">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-zinc-50/80 backdrop-blur-xl" />

                <div className="relative p-3 md:p-4">
                    <form className="flex items-end gap-2 md:gap-3 max-w-4xl mx-auto">
                        {/* Attachment Button */}
                        <button
                            type="button"
                            className="group p-2.5 md:p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-300 transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Anexar arquivo"
                        >
                            <Paperclip className="w-5 h-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                        </button>

                        {/* Emoji Button */}
                        <button
                            type="button"
                            className="group p-2.5 md:p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-300 transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Inserir emoji"
                        >
                            <Smile className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                        </button>

                        {/* Input */}
                        <div className="flex-1 relative">
                            <textarea
                                placeholder="Digite uma mensagem..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={1}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            type="submit"
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Página principal
const ChatMockPage = () => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>('ai-visa');
    const [searchTerm, setSearchTerm] = useState('');

    const activeConversation = mockConversations.find(c => c.id === activeConversationId);

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200 shadow-sm relative">
            {/* Sidebar */}
            <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full z-10`}>
                <ChatSidebar
                    conversations={mockConversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={setActiveConversationId}
                    onNewChat={() => alert('Nova conversa')}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </div>

            {/* Chat Window */}
            <div className={`${!activeConversationId ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-white`}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        messages={activeConversationId === 'ai-visa' ? mockAIMessages : []}
                        onBack={() => setActiveConversationId(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-zinc-400 bg-zinc-50/50">
                        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-600">Selecione uma conversa</h3>
                        <p className="text-sm">Escolha um contato para começar a conversar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMockPage;
