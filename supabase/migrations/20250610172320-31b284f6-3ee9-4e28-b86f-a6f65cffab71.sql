
-- Tabela de perfil da usuária (Júlia)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Júlia Pena',
  email TEXT,
  photo_url TEXT,
  language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'rosa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de hábitos diários
CREATE TABLE public.daily_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  tomou_creatina BOOLEAN DEFAULT false,
  leu_biblia BOOLEAN DEFAULT false,
  tomou_whey BOOLEAN DEFAULT false,
  treinou BOOLEAN DEFAULT false,
  rezou BOOLEAN DEFAULT false,
  estudou BOOLEAN DEFAULT false,
  agua_gotas INTEGER CHECK (agua_gotas >= 1 AND agua_gotas <= 5),
  qualidade_sono TEXT CHECK (qualidade_sono IN ('pessimo', 'ruim', 'regular', 'bom', 'otimo')),
  humor TEXT,
  hora_acordou TIME,
  reflexao TEXT,
  gratidao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tabela de tarefas do Kanban
CREATE TABLE public.kanban_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('estudo', 'vida_social', 'dieta', 'crescimento', 'relacionamento', 'trabalho', 'academia')),
  status TEXT CHECK (status IN ('começou', 'em_processo', 'finalizou')) DEFAULT 'começou',
  priority INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT false,
  repeats BOOLEAN DEFAULT false,
  repeat_frequency TEXT CHECK (repeat_frequency IN ('daily', 'weekly', 'monthly')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de lista de leitura
CREATE TABLE public.reading_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT CHECK (status IN ('quero_ler', 'lendo', 'finalizado')) DEFAULT 'quero_ler',
  comments TEXT,
  cover_url TEXT,
  pages INTEGER,
  current_page INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at DATE,
  finished_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notas por matéria
CREATE TABLE public.subject_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subject_name TEXT NOT NULL,
  professor_name TEXT,
  content TEXT NOT NULL,
  text_color TEXT DEFAULT '#000000',
  font_size TEXT DEFAULT 'medium',
  is_bold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos do calendário
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  type TEXT CHECK (type IN ('tarefa', 'habito', 'nota', 'evento')) DEFAULT 'evento',
  color TEXT DEFAULT '#e91e63',
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conversas com IA Juju
CREATE TABLE public.juju_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context_type TEXT CHECK (context_type IN ('motivacional', 'habitos', 'emocional', 'treino', 'estudar', 'dieta')),
  keywords TEXT[], -- array de palavras-chave detectadas
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens motivacionais da Juju
CREATE TABLE public.juju_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  context_type TEXT CHECK (context_type IN ('bom_dia', 'boa_tarde', 'boa_noite', 'motivacional', 'parabenizacao')),
  hour_range TEXT, -- ex: "06:00-12:00" para manhã
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de sessões Pomodoro
CREATE TABLE public.pomodoro_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  break_duration_minutes INTEGER NOT NULL DEFAULT 5,
  task_description TEXT,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de configurações do Spotify
CREATE TABLE public.spotify_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  current_track_id TEXT,
  current_playlist_id TEXT,
  volume INTEGER DEFAULT 50 CHECK (volume >= 0 AND volume <= 100),
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de playlists favoritas
CREATE TABLE public.spotify_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  spotify_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tracks_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de músicas recentes
CREATE TABLE public.spotify_recent_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  duration_ms INTEGER,
  image_url TEXT,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juju_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juju_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_recent_tracks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para daily_habits
CREATE POLICY "Users can view their own habits" ON public.daily_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON public.daily_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.daily_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.daily_habits FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para kanban_tasks
CREATE POLICY "Users can view their own tasks" ON public.kanban_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.kanban_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.kanban_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.kanban_tasks FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para reading_list
CREATE POLICY "Users can view their own reading list" ON public.reading_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reading entries" ON public.reading_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading entries" ON public.reading_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reading entries" ON public.reading_list FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para subject_notes
CREATE POLICY "Users can view their own notes" ON public.subject_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.subject_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.subject_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.subject_notes FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para calendar_events
CREATE POLICY "Users can view their own events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para juju_conversations
CREATE POLICY "Users can view their own conversations" ON public.juju_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.juju_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para juju_messages (público para leitura, admin para escrita)
CREATE POLICY "Anyone can view juju messages" ON public.juju_messages FOR SELECT TO authenticated USING (true);

-- Políticas RLS para pomodoro_sessions
CREATE POLICY "Users can view their own pomodoro sessions" ON public.pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pomodoro sessions" ON public.pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pomodoro sessions" ON public.pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para spotify_settings
CREATE POLICY "Users can view their own spotify settings" ON public.spotify_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own spotify settings" ON public.spotify_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spotify settings" ON public.spotify_settings FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para spotify_playlists
CREATE POLICY "Users can view their own playlists" ON public.spotify_playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own playlists" ON public.spotify_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON public.spotify_playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON public.spotify_playlists FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para spotify_recent_tracks
CREATE POLICY "Users can view their own recent tracks" ON public.spotify_recent_tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recent tracks" ON public.spotify_recent_tracks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir algumas mensagens motivacionais padrão da Juju
INSERT INTO public.juju_messages (message, context_type, hour_range) VALUES
('Bom dia, Júlia! ✨ Pronta para mais um dia incrível?', 'bom_dia', '06:00-12:00'),
('Boa tarde, querida! 🌸 Como está sendo seu dia?', 'boa_tarde', '12:00-18:00'),
('Boa noite, Júlia! 🌙 Hora de relaxar e descansar bem!', 'boa_noite', '18:00-06:00'),
('Uau, que orgulho de você! 💕', 'parabenizacao', null),
('Top demais, Júlia! Continue assim! 🚀', 'parabenizacao', null),
('Nem amo! Você é incrível! 💖', 'parabenizacao', null),
('Lembre-se: pequenos passos levam a grandes conquistas! 🌟', 'motivacional', null),
('Você é mais forte do que imagina! 💪', 'motivacional', null),
('Hoje é um novo dia cheio de possibilidades! ✨', 'motivacional', null);

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_habits_updated_at BEFORE UPDATE ON public.daily_habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kanban_tasks_updated_at BEFORE UPDATE ON public.kanban_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reading_list_updated_at BEFORE UPDATE ON public.reading_list FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subject_notes_updated_at BEFORE UPDATE ON public.subject_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_settings_updated_at BEFORE UPDATE ON public.spotify_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_playlists_updated_at BEFORE UPDATE ON public.spotify_playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
