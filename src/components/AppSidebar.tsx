// Em: src/components/AppSidebar.tsx

import {
  Calendar,
  ClipboardList, // Ícone atualizado para Plano de Ação
  Home,
  Languages,
  Moon,
  Music,
  Repeat, // Ícone atualizado para Hábitos
  Settings,
  Sparkles, // Ícone para IA Juju
  StickyNote, // Ícone atualizado para Notas
  BookText, // Ícone atualizado para Caderno
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  onLogout: () => void;
}

const AppSidebar = ({ activeModule, onModuleChange, onLogout }: AppSidebarProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const modules = [
    { id: 'home', name: 'Home', icon: Home, color: 'text-purple-600' },
    { id: 'calendar', name: t('modules.calendar'), icon: Calendar, color: 'text-sky-500' },
    { id: 'notes', name: t('modules.notes'), icon: StickyNote, color: 'text-yellow-500' },
    { id: 'habits', name: t('modules.habits'), icon: Repeat, color: 'text-green-500' },
    { id: 'actionPlan', name: t('modules.actionPlan'), icon: ClipboardList, color: 'text-red-500' },
    { id: 'notebook', name: t('modules.notebook'), icon: BookText, color: 'text-indigo-500' },
    { id: 'juju', name: 'Histórico da Juju', icon: Sparkles, color: 'text-pink-500' },
  ];

  return (
    <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="logo.jpg" alt="" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Julia Pena</h2>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {modules.map((module) => (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton
                    onClick={() => onModuleChange(module.id)}
                    isActive={activeModule === module.id}
                    className="w-full justify-start h-10 px-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <module.icon className={`h-5 w-5 ${module.color}`} />
                    <span className="ml-3 font-medium">{module.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configurações</span>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button onClick={onLogout} variant="outline" className="w-full h-8 text-sm">
            {t('dashboard.logout')}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;