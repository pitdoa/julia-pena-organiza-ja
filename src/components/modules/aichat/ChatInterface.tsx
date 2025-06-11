// Em: src/components/modules/aichat/ChatInterface.tsx

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2, Sparkles, MessageSquare, Paperclip, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormattedMessage } from './FormattedMessage'; // 1. Importe o novo componente

export interface Message {
  isUser: boolean;
  text: string;
  imageUrl?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, imageFile?: File) => Promise<void>;
  isLoading: boolean;
  isHistoryView?: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading, isHistoryView = false }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !imageFile) || isLoading || isHistoryView) return;
    onSendMessage(input, imageFile || undefined);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  const placeholderText = isHistoryView ? "Você está visualizando um histórico." : "Envie uma imagem ou mensagem...";
  const isDisabled = isLoading || isHistoryView;

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col gap-2 ${msg.isUser ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                {!msg.isUser && <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Bot size={16} /></div>}
                <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2.5 ${msg.isUser ? 'bg-blue-500 text-white rounded-bl-none' : 'bg-muted text-foreground rounded-br-none'}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Imagem enviada" className="rounded-md mb-2 max-w-full" />}
                  
                  {/* 2. AQUI ESTÁ A MUDANÇA: Usando o novo componente para formatar o texto */}
                  {msg.text && <FormattedMessage text={msg.text} />}

                </div>
              </div>
            </div>
          ))}
          {isLoading && (<div className="flex items-start gap-3"><div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Loader2 className="animate-spin" size={16}/></div><div className="max-w-xs md:max-w-md rounded-2xl px-4 py-2 bg-muted text-foreground rounded-br-none"><p className="text-sm">Juju está digitando...</p></div></div>)}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      {!isHistoryView && (
        <div className="p-4 border-t">
          {imagePreview && <div className="mb-2 relative w-24 h-24"><img src={imagePreview} alt="Preview" className="rounded-md object-cover w-full h-full" /><Button onClick={() => { setImageFile(null); setImagePreview(null); }} size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full"><X size={16}/></Button></div>}
          <div className="flex w-full items-center space-x-2">
            <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip size={18}/></Button>
            <Input type="text" placeholder={placeholderText} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={isDisabled} />
            <Button onClick={handleSend} disabled={isDisabled || (!input.trim() && !imageFile)} className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 p-2"><Send size={18} /></Button>
          </div>
        </div>
      )}
    </div>
  );
};