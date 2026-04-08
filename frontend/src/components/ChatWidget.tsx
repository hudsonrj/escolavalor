import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a assistente de IA da EscolaValor. Posso ajudá-lo a encontrar a escola ideal para seu filho. Como posso ajudar?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 md:p-5 shadow-2xl shadow-blue-500/30 transition-all hover:scale-110"
        aria-label="Abrir chat com assistente IA"
      >
        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
        <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 bg-purple-600 rounded-full shadow-lg border-2 border-white">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-[9px] font-black text-white uppercase">IA</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 left-0 md:bottom-8 md:right-8 md:left-auto z-50 w-full md:w-[420px] h-[100vh] md:h-[650px] md:max-h-[calc(100vh-8rem)] md:rounded-3xl flex flex-col bg-white shadow-2xl border-t md:border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-4">
          {/* AI Avatar */}
          <div className="bg-white/20 p-3 rounded-2xl">
            <Bot className="h-7 w-7 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-black text-lg">Assistente IA</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary-400 rounded-full"></span>
              <span className="text-xs font-bold text-white/90">Online agora</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2.5 rounded-xl transition-all"
          aria-label="Fechar chat"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}

            <div className="flex flex-col max-w-[75%]">
              <div
                className={`rounded-2xl px-5 py-3.5 shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                    : 'bg-white text-gray-900 border-2 border-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              </div>

              <div className={`flex items-center gap-1.5 mt-2 px-1 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs font-medium text-gray-500">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-400 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-3.5 shadow-md">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-sm font-bold text-gray-900">Analisando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            rows={1}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none disabled:opacity-50 transition-all font-medium"
            style={{ minHeight: '3rem', maxHeight: '6rem' }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-bold"
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-gray-500 font-medium">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-300">Enter</kbd> para enviar
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3 text-primary-500" />
            <span className="font-semibold">Powered by IA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
