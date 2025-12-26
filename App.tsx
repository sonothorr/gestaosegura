import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { LayoutDashboard, CheckSquare, Wallet, Settings as SettingsIcon, StickyNote } from 'lucide-react';
import { ViewMode } from './types';
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import FinanceView from './views/FinanceView';
import SettingsView from './views/SettingsView';
import NotesView from './views/NotesView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'tasks' as ViewMode, label: 'Operações', icon: CheckSquare },
    { id: 'finance' as ViewMode, label: 'Financeiro', icon: Wallet },
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
    <div className="min-h-screen flex flex-col bg-uwjota-bg text-uwjota-text font-sans relative overflow-hidden">
      
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
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="glass-panel rounded-2xl px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/80 border border-uwjota-border/80">
          {navItems.map(item => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group flex-1`}
              >
                {/* Active Indicator Background */}
                <div className={`absolute inset-0 bg-uwjota-primary/10 rounded-xl transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />

                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-uwjota-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-uwjota-muted group-hover:text-uwjota-primary'}`} 
                />
                
                {/* Active Dot */}
                <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-uwjota-primary transition-all duration-300 ${isActive ? 'opacity-100 box-shadow-[0_0_5px_currentColor]' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>
      </nav>
      
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