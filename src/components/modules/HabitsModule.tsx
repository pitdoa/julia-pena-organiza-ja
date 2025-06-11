import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface Habit {
  id: string;
  title: string;
  streak: number;
  last_completed: string | null;
}

interface HabitsModuleProps {
  onBack: () => void;
}

const HabitsModule = ({ onBack }: HabitsModuleProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.from('kanban_tasks').select('id, title, completed_at, description').eq('user_id', user.id).eq('repeats', true).order('created_at', { ascending: false });
      if (error) throw error;

      setHabits((data || []).map(task => ({
        id: task.id,
        title: task.title,
        last_completed: task.completed_at,
        streak: task.description ? parseInt(task.description, 10) || 0 : 0,
      })));
    } catch (error: any) {
      toast({ title: "Erro ao carregar hábitos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async () => {
    if (!newHabitName.trim()) { toast({ title: "Nome do hábito é obrigatório.", variant: "destructive" }); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      await supabase.from('kanban_tasks').insert([{ user_id: user.id, title: newHabitName.trim(), category: 'crescimento', repeats: true, status: 'começou', description: '0' }]);
      setNewHabitName('');
      setIsDialogOpen(false);
      toast({ title: "Hábito criado com sucesso!" });
      fetchHabits();
    } catch (error: any) {
      toast({ title: "Erro ao criar hábito", description: error.message, variant: "destructive" });
    }
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.last_completed) return false;
    return differenceInCalendarDays(new Date(), parseISO(habit.last_completed)) === 0;
  };

  const completeHabit = async (habit: Habit) => {
    if (isCompletedToday(habit)) return;
    try {
        const today = new Date();
        const lastDate = habit.last_completed ? parseISO(habit.last_completed) : null;
        let newStreak = lastDate && differenceInCalendarDays(today, lastDate) === 1 ? habit.streak + 1 : 1;
        await supabase.from('kanban_tasks').update({ completed_at: today.toISOString(), description: newStreak.toString() }).eq('id', habit.id);
        toast({ title: `Hábito "${habit.title}" completo!`, description: `Você está há ${newStreak} dia(s) nesse ritmo! 🔥` });
        fetchHabits();
    } catch (error: any) {
      toast({ title: "Erro ao completar hábito", description: error.message, variant: "destructive" });
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await supabase.from('kanban_tasks').delete().eq('id', id);
      setHabits(prev => prev.filter(h => h.id !== id));
      toast({ title: "Hábito removido." });
    } catch (error: any) {
      toast({ title: "Erro ao remover hábito", description: error.message, variant: "destructive" });
    }
  };
  
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 7) return '🔥';
    if (streak >= 1) return '🌟';
    return '🌱';
  };

  if (isLoading) { return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>; }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">← Voltar</Button>
          <div className="flex items-center space-x-2 text-purple-800"><Clock size={24} /><h2 className="text-2xl font-bold">Hábitos</h2></div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button className="bg-purple-600 hover:bg-purple-700 text-white"><Plus size={16} className="mr-2" />Novo Hábito</Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="text-purple-800">Criar Novo Hábito</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Ex: Estudar 30 minutos" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addHabit()} /><Button onClick={addHabit} className="w-full bg-purple-600 hover:bg-purple-700">Criar Hábito</Button></div></DialogContent></Dialog>
      </div>

      {habits.length === 0 ? <Card className="p-12 text-center border-purple-100"><p className="text-purple-600 text-lg">Crie seu primeiro hábito para começar!</p></Card>
       : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{habits.map((habit) => (<Card key={habit.id} className="p-6 border-purple-100 hover:shadow-lg transition-shadow flex flex-col justify-between"><div className="flex justify-between items-start mb-4"><h3 className="font-semibold text-purple-800 truncate pr-2">{habit.title}</h3><Button onClick={() => deleteHabit(habit.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 flex-shrink-0"><Trash2 size={16} /></Button></div><div className="text-center my-4"><div className="text-4xl mb-2">{getStreakEmoji(habit.streak)}</div><div className="text-2xl font-bold text-purple-800">{habit.streak}</div><div className="text-sm text-purple-600">dias de sequência</div></div><Button onClick={() => completeHabit(habit)} disabled={isCompletedToday(habit)} className={`w-full ${isCompletedToday(habit) ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}>{isCompletedToday(habit) ? '✓ Feito Hoje' : 'Marcar como Feito'}</Button></Card>))}</div>}
    </div>
  );
};  

export default HabitsModule;