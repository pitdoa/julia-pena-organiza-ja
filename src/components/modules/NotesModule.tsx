
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NotesModuleProps {
  onBack: () => void;
}

const NotesModule = ({ onBack }: NotesModuleProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedNotes = localStorage.getItem('julia_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('julia_notes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o conteúdo da nota",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [note, ...notes];
    saveNotes(updatedNotes);

    setNewNote({ title: '', content: '' });
    setIsDialogOpen(false);

    toast({
      title: "Nota criada!",
      description: "Sua anotação foi salva com sucesso ✨",
    });
  };

  const updateNote = () => {
    if (!editingNote || !newNote.title || !newNote.content) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...note, title: newNote.title, content: newNote.content }
        : note
    );

    saveNotes(updatedNotes);
    setEditingNote(null);
    setNewNote({ title: '', content: '' });
    setIsDialogOpen(false);

    toast({
      title: "Nota atualizada!",
      description: "Suas alterações foram salvas",
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    toast({
      title: "Nota removida",
      description: "A anotação foi excluída",
    });
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingNote(null);
    setNewNote({ title: '', content: '' });
    setIsDialogOpen(true);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                placeholder="Título da nota"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
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
                <h3 className="font-semibold text-purple-800 truncate">{note.title}</h3>
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
                  {new Date(note.createdAt).toLocaleDateString('pt-BR')}
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
