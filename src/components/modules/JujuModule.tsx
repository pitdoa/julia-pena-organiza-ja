import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatInterface, Message } from './aichat/ChatInterface';
import { Sparkles, Trash2 } from 'lucide-react';

interface JujuModuleProps {
  onBack: () => void;
}

const JujuModule = ({ onBack }: JujuModuleProps) => {
  const [conversations, setConversations] = useState<Map<string, Message[]>>(new Map());
  const [activeDate, setActiveDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('juju_conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (error) { toast({ title: 'Erro ao carregar histórico', variant: 'destructive' }); return; }
    
    const grouped = new Map<string, Message[]>();
    data.forEach(d => {
      const dateKey = format(parseISO(d.created_at), 'yyyy-MM-dd');
      const dayMessages = grouped.get(dateKey) || [];
      
      let userMessage: Message;
      try {
        const parsed = JSON.parse(d.message);
        userMessage = { isUser: true, text: parsed.text, imageUrl: parsed.imageUrl };
      } catch (e) {
        userMessage = { isUser: true, text: d.message, imageUrl: undefined };
      }
      
      dayMessages.push(userMessage, { isUser: false, text: d.response });
      grouped.set(dateKey, dayMessages);
    });
    setConversations(grouped);
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  
  const messagesToShow = conversations.get(activeDate) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
        </Button>
        <div className="flex items-center space-x-2 text-purple-800">
            <Sparkles size={24} />
            <h2 className="text-2xl font-bold">Histórico da Juju</h2>
        </div>
    </div>
        </div>
        <div className="flex-1 grid grid-cols-12 gap-4 h-full min-h-0">
            <div className="col-span-3 bg-muted/50 rounded-lg p-2 flex flex-col">
                <h4 className="text-sm font-semibold text-muted-foreground px-2 mb-2 pt-2">Histórico de Conversas</h4>
                <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                        {Array.from(conversations.keys()).sort((a,b) => b.localeCompare(a)).map(dateKey => (
                            <Button key={dateKey} variant={activeDate === dateKey ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveDate(dateKey)}>
                                {format(parseISO(dateKey), "dd 'de' MMMM", { locale: ptBR })}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            
            {/* AQUI ESTÁ A CORREÇÃO PRINCIPAL */}
            <div className="col-span-9 rounded-lg border flex flex-col h-full min-h-0">
                <div className="p-2 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="font-semibold text-sm px-2">{`Relembrando: ${format(parseISO(activeDate), "PPP", { locale: ptBR })}`}</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatInterface messages={messagesToShow} onSendMessage={async ()=>{}} isLoading={false} isHistoryView={true} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default JujuModule;


