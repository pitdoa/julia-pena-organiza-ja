import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type CalendarEvent = Tables<'calendar_events'>;

interface CalendarModuleProps {
  onBack: () => void;
}

const CalendarModule = ({ onBack }: CalendarModuleProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: ''
  });
  const { toast } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.from('calendar_events').select('*').eq('user_id', user.id);
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar eventos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast({ title: "Campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      await supabase.from('calendar_events').insert({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: newEvent.date,
        event_time: newEvent.time || null
      });
      
      setIsDialogOpen(false);
      setNewEvent({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '' });
      toast({ title: "Evento adicionado com sucesso!" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Erro ao adicionar evento", description: error.message, variant: "destructive" });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await supabase.from('calendar_events').delete().eq('id', id);
      setEvents(prev => prev.filter(event => event.id !== id));
      toast({ title: "Evento removido com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro ao remover evento", description: error.message, variant: "destructive" });
    }
  };

  const dayEvents = events.filter(event => {
    if (!selectedDate) return false;
    const eventDate = startOfDay(parseISO(event.event_date));
    return eventDate.getTime() === startOfDay(selectedDate).getTime();
  });

  const eventDays = events.map(event => parseISO(event.event_date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">← Voltar</Button>
          <div className="flex items-center space-x-2 text-purple-800"><CalendarIcon size={24} /><h2 className="text-2xl font-bold">Calendário</h2></div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="bg-purple-600 hover:bg-purple-700 text-white"><Plus size={16} className="mr-2" />Novo Evento</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="text-purple-800">Adicionar Evento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título do evento" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
              <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
              <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} />
              <Textarea placeholder="Descrição (opcional)" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
              <Button onClick={addEvent} className="w-full bg-purple-600 hover:bg-purple-700">Adicionar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 border-purple-100 min-h-[400px]">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Eventos de {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Nenhuma data selecionada'}
            </h3>
            {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-purple-500" /></div>
             : dayEvents.length === 0 ? <p className="text-purple-600 text-center py-8">Nenhum evento para esta data 📅</p>
             : (<div className="space-y-3">{dayEvents.map((event) => (<div key={event.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg"><div><h4 className="font-semibold text-purple-800">{event.title}</h4>{event.event_time && <p className="text-sm text-purple-600">⏰ {event.event_time.substring(0,5)}</p>}{event.description && <p className="text-sm text-purple-700 mt-1">{event.description}</p>}</div><Button onClick={() => deleteEvent(event.id)} variant="outline" size="icon" className="text-red-600 hover:bg-red-50 h-8 w-8"><Trash2 size={16} /></Button></div>))}</div>)}
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="p-2 border-purple-100">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} modifiers={{ hasEvent: eventDays }} modifiersClassNames={{ hasEvent: 'bg-purple-200/50 rounded-full font-bold' }} className="w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;