
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompleted: string | null;
  created_at: string;
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

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('category', 'crescimento')
        .eq('repeats', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar tarefas em hábitos para compatibilidade
      const habitsData = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        streak: 0, // Será calculado baseado no histórico
        lastCompleted: task.completed_at,
        created_at: task.created_at
      }));

      setHabits(habitsData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar hábitos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do hábito",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert([
          {
            user_id: user.id,
            title: newHabitName.trim(),
            description: `Hábito: ${newHabitName.trim()}`,
            category: 'crescimento',
            status: 'começou',
            repeats: true,
            repeat_frequency: 'daily'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newHabit: Habit = {
        id: data.id,
        title: data.title,
        streak: 0,
        lastCompleted: null,
        created_at: data.created_at
      };

      setHabits(prev => [newHabit, ...prev]);
      setNewHabitName('');
      setIsDialogOpen(false);

      toast({
        title: "Hábito criado!",
        description: "Agora é só manter a consistência ✨",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeHabit = async (id: string) => {
    const today = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({
          status: 'finalizou',
          completed_at: today
        })
        .eq('id', id);

      if (error) throw error;

      setHabits(prev => prev.map(habit => {
        if (habit.id === id) {
          const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;
          const todayStr = new Date().toDateString();
          
          if (lastCompleted === todayStr) {
            return habit; // Já foi completado hoje
          }
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasYesterday = lastCompleted === yesterday.toDateString();
          
          return {
            ...habit,
            streak: wasYesterday || habit.streak === 0 ? habit.streak + 1 : 1,
            lastCompleted: today
          };
        }
        return habit;
      }));

      toast({
        title: "Parabéns! 🎉",
        description: "Hábito completado hoje",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao completar hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHabits(prev => prev.filter(habit => habit.id !== id));
      
      toast({
        title: "Hábito removido",
        description: "O hábito foi excluído",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.lastCompleted) return false;
    const today = new Date().toDateString();
    const lastCompleted = new Date(habit.lastCompleted).toDateString();
    return lastCompleted === today;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 21) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '💪';
    if (streak >= 3) return '🌟';
    return '💙';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="text-purple-600">Carregando hábitos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <Clock size={24} />
            <h2 className="text-2xl font-bold">Hábitos</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Hábito
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Criar Novo Hábito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ex: Estudar 30 minutos"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="border-purple-200 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              <Button onClick={addHabit} className="w-full bg-purple-600 hover:bg-purple-700">
                Criar Hábito
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card className="p-12 text-center border-purple-100">
          <p className="text-purple-600 text-lg">
            Seus hábitos aparecerão aqui 🌱
          </p>
          <p className="text-purple-500 text-sm mt-2">
            Crie seu primeiro hábito para começar a construir uma rotina!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <Card key={habit.id} className="p-6 border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-purple-800 truncate pr-2">{habit.title}</h3>
                <Button
                  onClick={() => deleteHabit(habit.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 p-1 h-8 w-8"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl mb-2">{getStreakEmoji(habit.streak)}</div>
                <div className="text-2xl font-bold text-purple-800">{habit.streak}</div>
                <div className="text-sm text-purple-600">dias consecutivos</div>
              </div>

              <Button
                onClick={() => completeHabit(habit.id)}
                disabled={isCompletedToday(habit)}
                className={`w-full ${
                  isCompletedToday(habit)
                    ? 'bg-green-500 hover:bg-green-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isCompletedToday(habit) ? '✓ Completado Hoje' : 'Marcar como Feito'}
              </Button>

              {habit.lastCompleted && (
                <div className="text-xs text-purple-500 text-center mt-2">
                  Último: {new Date(habit.lastCompleted).toLocaleDateString('pt-BR')}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            💡 Dica para Manter Hábitos
          </h3>
          <p className="text-purple-700 text-sm">
            A consistência é mais importante que a perfeição. Mesmo que você falhe um dia, 
            continue no próximo. Cada dia é uma nova oportunidade! 🌟
          </p>
        </Card>
      )}
    </div>
  );
};

export default HabitsModule;
