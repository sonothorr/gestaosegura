import React, { useState, useEffect, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LayoutDashboard, CheckSquare, Wallet, Settings as SettingsIcon, StickyNote, Bell, Calendar, ArrowRight } from 'lucide-react';
import { ViewMode, Task } from './types';
import { Modal, Button, Badge } from './components/UI'; // Import UI components
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import FinanceView from './views/FinanceView';
import SettingsView from './views/SettingsView';
import NotesView from './views/NotesView';

const AppContent: React.FC = () => {
  const { tasks, transactions } = useStore(); // Get data from store
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // Notification State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dailyStats, setDailyStats] = useState({ tasks: 0, finance: 0, taskList: [] as Task[] });

  // Reordered to put Dashboard in the middle (Index 2)
  const navItems = [
    { id: 'tasks' as ViewMode, label: 'Operações', icon: CheckSquare },
    { id: 'finance' as ViewMode, label: 'Financeiro', icon: Wallet },
    { id: 'dashboard' as ViewMode, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'notes' as ViewMode, label: 'Anotações', icon: StickyNote },
    { id: 'settings' as ViewMode, label: 'Sistema', icon: SettingsIcon },
  ];

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Lembre-se de exportar seus dados antes de sair.";
      return "Lembre-se de exportar seus dados antes de sair.";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // --- DAILY NOTIFICATION LOGIC ---
  useEffect(() => {
    const hasShown = sessionStorage.getItem('uwjota_daily_shown');
    
    // Only run if not shown this session
    if (!hasShown && (tasks.length > 0 || transactions.length > 0)) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayStr = today.toISOString().split('T')[0];

      // Logic adapted from Dashboard to find today's tasks
      const pendingTasks = tasks.filter(t => {
        const taskDate = new Date(t.date);
        taskDate.setHours(0,0,0,0);
        
        // 1. Check Date/Recurrence matches Today
        let isScheduled = false;
        if (!t.recurrence || t.recurrence.type === 'once') {
           isScheduled = taskDate.getTime() === today.getTime();
        } else if (t.recurrence.type === 'weekly' && t.recurrence.days) {
           if (today >= taskDate) {
             isScheduled = t.recurrence.days.includes(today.getDay());
           }
        }

        // 2. Check Completion status for Today
        let isIncomplete = true;
        if (t.recurrence && t.recurrence.type !== 'once') {
           isIncomplete = t.lastCompletedDate !== todayStr;
        } else {
           isIncomplete = !t.completed;
        }

        return isScheduled && isIncomplete;
      });

      // Filter Finance for today
      const todayFinance = transactions.filter(t => t.date === todayStr);

      if (pendingTasks.length > 0 || todayFinance.length > 0) {
        setDailyStats({
          tasks: pendingTasks.length,
          finance: todayFinance.length,
          taskList: pendingTasks.slice(0, 3) // Top 3 for preview
        });
        setNotificationOpen(true);
        sessionStorage.setItem('uwjota_daily_shown', 'true');
      }
    }
  }, [tasks, transactions]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'tasks': return <TasksView />;
      case 'notes': return <NotesView />;
      case 'finance': return <FinanceView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-uwjota-bg text-uwjota-text font-sans relative overflow-hidden">
      
      {/* --- Ambient Background Lighting (Midnight Theme) --- */}
      
      {/* Top Left: Deep Violet */}
      <div className="fixed -top-[300px] -left-[100px] w-[900px] h-[900px] rounded-full blur-[180px] pointer-events-none z-0 bg-violet-900/10 mix-blend-screen opacity-60 animate-pulse-slow" />
      
      {/* Bottom Right: Subtle Fuchsia */}
      <div className="fixed -bottom-[300px] -right-[100px] w-[900px] h-[900px] rounded-full blur-[180px] pointer-events-none z-0 bg-fuchsia-900/10 mix-blend-screen opacity-60" />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden w-full py-8 px-6 md:px-32 pb-40 relative z-10">
        {renderView()}
      </main>

      {/* Modern Floating Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-md">
        <div className="glass-panel rounded-2xl px-2 py-2 flex justify-between items-end shadow-2xl shadow-black/80 border border-uwjota-border/80 overflow-visible">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            const isDashboard = item.id === 'dashboard';

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 group flex-1
                  ${isDashboard 
                    ? '-translate-y-3 bg-uwjota-bg border border-uwjota-border rounded-full w-14 h-14 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 mx-2' 
                    : 'p-3 rounded-xl'
                  }
                `}
              >
                {/* Active Indicator Background for Non-Dashboard items */}
                {!isDashboard && (
                    <div className={`absolute inset-0 bg-uwjota-primary/10 rounded-xl transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />
                )}

                {/* Dashboard Specific Active Styling */}
                {isDashboard && isActive && (
                    <div className="absolute inset-0 bg-uwjota-primary rounded-full opacity-20 animate-pulse"></div>
                )}
                {isDashboard && (
                    <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${isActive ? 'border-uwjota-primary' : 'border-transparent'}`}></div>
                )}

                <item.icon 
                  size={isDashboard ? 28 : 20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-uwjota-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-uwjota-muted group-hover:text-uwjota-primary'}`} 
                />
                
                {/* Active Dot for non-dashboard */}
                {!isDashboard && (
                    <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-uwjota-primary transition-all duration-300 ${isActive ? 'opacity-100 box-shadow-[0_0_5px_currentColor]' : 'opacity-0'}`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* --- NOTIFICATION MODAL --- */}
      <Modal 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
        title="Briefing Diário"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-uwjota-bg p-3 rounded-lg border border-uwjota-border">
            <div className="p-2 bg-uwjota-primary/20 rounded-full text-uwjota-primary">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-sm text-uwjota-text font-semibold">Resumo do Dia</p>
              <p className="text-xs text-uwjota-muted">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-uwjota-card border border-uwjota-border p-4 rounded-xl text-center">
                <p className="text-[10px] uppercase text-uwjota-muted font-bold tracking-wider">Operações</p>
                <p className="text-2xl font-mono text-uwjota-text mt-1">{dailyStats.tasks}</p>
             </div>
             <div className="bg-uwjota-card border border-uwjota-border p-4 rounded-xl text-center">
                <p className="text-[10px] uppercase text-uwjota-muted font-bold tracking-wider">Financeiro</p>
                <p className="text-2xl font-mono text-uwjota-text mt-1">{dailyStats.finance}</p>
             </div>
          </div>

          {dailyStats.taskList.length > 0 && (
            <div className="bg-uwjota-card/50 rounded-lg p-3 border border-uwjota-border/50">
              <p className="text-xs font-semibold text-uwjota-muted mb-2 uppercase">Prioridades</p>
              <ul className="space-y-2">
                {dailyStats.taskList.map(task => (
                  <li key={task.id} className="flex items-center gap-2 text-sm text-uwjota-text truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : 'bg-uwjota-primary'}`}></span>
                    <span className="truncate">{task.title}</span>
                  </li>
                ))}
                {dailyStats.tasks > 3 && (
                   <li className="text-xs text-uwjota-muted italic pl-3.5">+ {dailyStats.tasks - 3} outras tarefas...</li>
                )}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={() => setNotificationOpen(false)} className="w-full group">
              Visualizar Painel <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;