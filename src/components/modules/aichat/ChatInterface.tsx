// Em: src/components/modules/aichat/ChatInterface.tsx

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Bot, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Message {
  isUser: boolean;
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isHistoryView?: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading, isHistoryView = false }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ESTA É A MUDANÇA PRINCIPAL: Usamos uma referência no final da lista
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // A rolagem agora acontece toda vez que as mensagens mudam
  useEffect(() => {
    // Adicionamos um pequeno delay para garantir que o DOM foi atualizado
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading || isHistoryView) return;
    onSendMessage(input);
    setInput('');
  };

  const placeholderText = isHistoryView ? "Você está visualizando um histórico." : "Converse com a Juju...";
  const isDisabled = isLoading || isHistoryView;

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="font-bold text-lg text-foreground">Sessão de chat vazia</h3>
              <p className="text-sm">Envie uma mensagem ou selecione um dia no histórico.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}>
                {!msg.isUser && <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Bot size={16} /></div>}
                <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2.5 ${msg.isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3"><div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Loader2 className="animate-spin" size={16}/></div><div className="max-w-xs md:max-w-md rounded-2xl px-4 py-2 bg-muted text-foreground rounded-bl-none"><p className="text-sm">Juju está digitando...</p></div></div>
          )}
          {/* Adicionamos um elemento invisível no final para ser o nosso 'alvo' de rolagem */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {!isHistoryView && (
        <div className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input type="text" placeholder={placeholderText} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={isDisabled} />
            <Button onClick={handleSend} disabled={isDisabled} className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 p-2"><Send size={18} /></Button>
          </div>
        </div>
      )}
    </div>
  );
};