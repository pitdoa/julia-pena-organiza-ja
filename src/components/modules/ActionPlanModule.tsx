// Em: src/components/modules/ActionPlanModule.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, ListTodo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Tipos para o Plano de Ação e suas Tarefas
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
type ActionPlanTask = Tables<'kanban_tasks'> & { sub_tasks: SubTask[] };

interface ActionPlanModuleProps {
  onBack: () => void;
}

const ActionPlanModule = ({ onBack }: ActionPlanModuleProps) => {
  const [plans, setPlans] = useState<ActionPlanTask[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({
    title: '',
    tasks: ['']
  });
  const { toast } = useToast();

  const parseDescriptionToTasks = (description: string | null): SubTask[] => {
    if (!description) return [];
    try {
        const tasks = JSON.parse(description);
        return Array.isArray(tasks) ? tasks : [];
    } catch (e) {
        return [];
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from('kanban_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'trabalho'); // Usando a categoria 'trabalho' para planos

        if (error) throw error;
        
        const formattedPlans = (data || []).map(plan => ({
          ...plan,
          sub_tasks: parseDescriptionToTasks(plan.description)
        }));
        setPlans(formattedPlans);
      } catch (error: any) {
        toast({ title: "Erro ao carregar planos", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [toast]);

  const createPlan = async () => {
    if (!newPlan.title || newPlan.tasks.every(task => !task.trim())) {
      toast({ title: "Campos obrigatórios", description: "Preencha o título e pelo menos uma tarefa", variant: "destructive" });
      return;
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const subTasks: SubTask[] = newPlan.tasks
            .filter(t => t.trim())
            .map(t => ({ id: crypto.randomUUID(), title: t.trim(), completed: false }));

        const { data, error } = await supabase.from('kanban_tasks').insert({
            user_id: user.id,
            title: newPlan.title,
            description: JSON.stringify(subTasks),
            category: 'trabalho', // Categoria fixa para planos de ação
            status: 'em_processo'
        }).select().single();

        if (error) throw error;

        setPlans(prev => [{ ...data, sub_tasks: subTasks }, ...prev]);
        setIsDialogOpen(false);
        setNewPlan({ title: '', tasks: [''] });
        toast({ title: "Plano criado!", description: "Seu plano de ação foi salvo com sucesso." });
    } catch(e: any) {
        toast({ title: "Erro ao criar plano", description: e.message, variant: "destructive" });
    }
  };

  const toggleSubTask = async (planId: string, subTaskId: string) => {
    const planToUpdate = plans.find(p => p.id === planId);
    if (!planToUpdate) return;

    const updatedSubTasks = planToUpdate.sub_tasks.map(task => 
      task.id === subTaskId ? { ...task, completed: !task.completed } : task
    );

    try {
        const { data, error } = await supabase.from('kanban_tasks')
            .update({ description: JSON.stringify(updatedSubTasks) })
            .eq('id', planId)
            .select()
            .single();

        if (error) throw error;
        
        const updatedPlan = { ...data, sub_tasks: updatedSubTasks };
        setPlans(plans.map(p => p.id === planId ? updatedPlan : p));
        if(selectedPlan?.id === planId) {
            setSelectedPlan(updatedPlan);
        }
    } catch(e: any) {
        toast({ title: "Erro ao atualizar tarefa", description: e.message, variant: "destructive" });
    }
  };
  
  const deletePlan = async (planId: string) => {
    try {
        const { error } = await supabase.from('kanban_tasks').delete().eq('id', planId);
        if (error) throw error;

        setPlans(plans.filter(p => p.id !== planId));
        setSelectedPlan(null);
        toast({ title: "Plano removido", description: "O plano de ação foi excluído." });
    } catch(e: any) {
        toast({ title: "Erro ao remover plano", description: e.message, variant: "destructive" });
    }
  };

  const addTaskField = () => setNewPlan(p => ({ ...p, tasks: [...p.tasks, ''] }));
  const updateTaskField = (index: number, value: string) => {
      const tasks = [...newPlan.tasks];
      tasks[index] = value;
      setNewPlan(p => ({ ...p, tasks }));
  };
  const removeTaskField = (index: number) => setNewPlan(p => ({...p, tasks: p.tasks.filter((_, i) => i !== index)}));

  const getProgress = (plan: ActionPlanTask) => {
    if (plan.sub_tasks.length === 0) return 0;
    const completed = plan.sub_tasks.filter(task => task.completed).length;
    return Math.round((completed / plan.sub_tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4"><Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">← Voltar</Button><div className="flex items-center space-x-2 text-purple-800"><ListTodo size={24} /><h2 className="text-2xl font-bold">Planos de Ação</h2></div></div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button className="bg-purple-600 hover:bg-purple-700 text-white"><Plus size={16} className="mr-2" />Novo Plano</Button></DialogTrigger><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle className="text-purple-800">Criar Plano de Ação</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Título do plano" value={newPlan.title} onChange={(e) => setNewPlan(p => ({ ...p, title: e.target.value }))} className="border-purple-200 focus:border-purple-500" /><div><h4 className="font-medium text-purple-800 mb-2">Tarefas</h4>{newPlan.tasks.map((task, index) => (<div key={index} className="flex gap-2 mb-2"><Input placeholder={`Tarefa ${index + 1}`} value={task} onChange={(e) => updateTaskField(index, e.target.value)} className="border-purple-200 focus:border-purple-500" />{newPlan.tasks.length > 1 && (<Button type="button" onClick={() => removeTaskField(index)} variant="outline" size="sm" className="text-red-600"><Trash2 size={16} /></Button>)}</div>))}<Button type="button" onClick={addTaskField} variant="outline" size="sm" className="mt-2">+ Adicionar Tarefa</Button></div><Button onClick={createPlan} className="w-full bg-purple-600 hover:bg-purple-700">Criar Plano</Button></div></DialogContent></Dialog>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><Card className="p-4 border-purple-100 h-full">{isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div> : plans.length === 0 ? <p className="text-purple-600 text-center py-4">Nenhum plano criado ainda 📋</p> : <div className="space-y-2">{plans.map((plan) => (<div key={plan.id} onClick={() => setSelectedPlan(plan)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPlan?.id === plan.id ? 'bg-purple-100 border-2 border-purple-300' : 'bg-purple-50 hover:bg-purple-100'}`}><h4 className="font-medium text-purple-800 text-sm truncate">{plan.title}</h4><div className="flex items-center justify-between mt-1"><span className="text-xs text-purple-600">{plan.sub_tasks.length} tarefas</span><span className="text-xs text-purple-600">{getProgress(plan)}% ✓</span></div></div>))}</div>}</Card></div>
            <div className="lg:col-span-2">{selectedPlan ? (<Card className="p-6 border-purple-100"><div className="flex justify-between items-start mb-4"><div><h3 className="text-xl font-bold text-purple-800">{selectedPlan.title}</h3></div><Button onClick={() => deletePlan(selectedPlan.id)} variant="outline" className="text-red-600 hover:bg-red-50"><Trash2 size={16} /></Button></div><div className="mb-4"><div className="flex justify-between items-center mb-2"><span className="text-sm font-medium text-purple-700">Progresso</span><span className="text-sm text-purple-600">{getProgress(selectedPlan)}%</span></div><div className="w-full bg-purple-100 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgress(selectedPlan)}%` }}></div></div></div><div className="space-y-3 mt-4"><h4 className="font-medium text-purple-800">Tarefas</h4>{selectedPlan.sub_tasks.map((task) => (<div key={task.id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg"><Checkbox checked={task.completed} onCheckedChange={() => toggleSubTask(selectedPlan.id, task.id)} id={`task-${task.id}`} className="border-purple-300" /><label htmlFor={`task-${task.id}`} className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-purple-500' : 'text-purple-800'}`}>{task.title}</label></div>))}</div></Card>) : (<Card className="p-12 text-center border-purple-100 flex flex-col justify-center items-center min-h-[300px]"><p className="text-purple-600 text-lg">Selecione um plano para visualizar as tarefas 📋</p><p className="text-purple-500 text-sm mt-2">Ou crie seu primeiro plano de ação!</p></Card>)}</div>
        </div>
    </div>
  );
};

export default ActionPlanModule;