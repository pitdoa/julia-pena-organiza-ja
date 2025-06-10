
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Note {
  id: string;
  subject_name: string;
  professor_name: string;
  content: string;
  created_at: string;
}

interface NotesModuleProps {
  onBack: () => void;
}

const NotesModule = ({ onBack }: NotesModuleProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState({
    subject_name: '',
    professor_name: '',
    content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('subject_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar notas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.subject_name || !newNote.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a matéria e o conteúdo da nota",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('subject_notes')
        .insert([
          {
            user_id: user.id,
            subject_name: newNote.subject_name,
            professor_name: newNote.professor_name || null,
            content: newNote.content
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote({ subject_name: '', professor_name: '', content: '' });
      setIsDialogOpen(false);

      toast({
        title: "Nota criada!",
        description: "Sua anotação foi salva com sucesso ✨",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar nota",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateNote = async () => {
    if (!editingNote || !newNote.subject_name || !newNote.content) return;

    try {
      const { data, error } = await supabase
        .from('subject_notes')
        .update({
          subject_name: newNote.subject_name,
          professor_name: newNote.professor_name || null,
          content: newNote.content
        })
        .eq('id', editingNote.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? data : note
      ));

      setEditingNote(null);
      setNewNote({ subject_name: '', professor_name: '', content: '' });
      setIsDialogOpen(false);

      toast({
        title: "Nota atualizada!",
        description: "Suas alterações foram salvas",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar nota",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subject_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: "Nota removida",
        description: "A anotação foi excluída",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover nota",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNewNote({ 
      subject_name: note.subject_name, 
      professor_name: note.professor_name || '', 
      content: note.content 
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingNote(null);
    setNewNote({ subject_name: '', professor_name: '', content: '' });
    setIsDialogOpen(true);
  };

  const filteredNotes = notes.filter(note =>
    note.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.professor_name && note.professor_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="text-purple-600">Carregando notas...</div>
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
            <Pencil size={24} />
            <h2 className="text-2xl font-bold">Notas</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-purple-800">
                {editingNote ? 'Editar Nota' : 'Nova Nota'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Matéria"
                value={newNote.subject_name}
                onChange={(e) => setNewNote({...newNote, subject_name: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Input
                placeholder="Professor (opcional)"
                value={newNote.professor_name}
                onChange={(e) => setNewNote({...newNote, professor_name: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Textarea
                placeholder="Conteúdo da nota..."
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="border-purple-200 focus:border-purple-500 min-h-32"
              />
              <Button 
                onClick={editingNote ? updateNote : addNote} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {editingNote ? 'Atualizar Nota' : 'Criar Nota'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 border-purple-100">
        <Input
          placeholder="Buscar notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-purple-200 focus:border-purple-500"
        />
      </Card>

      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center border-purple-100">
          <p className="text-purple-600 text-lg">
            {searchTerm ? 'Nenhuma nota encontrada 🔍' : 'Suas anotações aparecerão aqui ✍️'}
          </p>
          <p className="text-purple-500 text-sm mt-2">
            Comece criando sua primeira nota!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-4 border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-purple-800 truncate">{note.subject_name}</h3>
                  {note.professor_name && (
                    <p className="text-sm text-purple-600">{note.professor_name}</p>
                  )}
                </div>
                <Button
                  onClick={() => deleteNote(note.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 p-1 h-8 w-8"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <p className="text-purple-700 text-sm mb-3 line-clamp-3">
                {note.content}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-500">
                  {new Date(note.created_at).toLocaleDateString('pt-BR')}
                </span>
                <Button
                  onClick={() => openEditDialog(note)}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 hover:bg-purple-50"
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesModule;
