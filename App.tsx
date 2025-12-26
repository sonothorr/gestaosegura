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
      
      {/* --- Ambient Background Lighting (Subtle Deep Space) --- */}
      {/* Top Left: Very Subtle Sky Blue */}
      <div className="fixed -top-[200px] -left-[200px] w-[800px] h-[800px] bg-sky-900/10 rounded-full blur-[140px] pointer-events-none z-0 mix-blend-screen" />
      
      {/* Bottom Right: Very Subtle Cyan */}
      <div className="fixed -bottom-[200px] -right-[200px] w-[700px] h-[700px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none z-0 mix-blend-screen" />
      
      {/* Center: Removed center glow for darker depth */}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden w-full py-8 px-6 md:px-32 pb-40 transition-all duration-500 relative z-10">
        {renderView()}
      </main>

      {/* Modern Floating Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="glass-panel rounded-2xl px-2 py-2 flex justify-between items-center shadow-2xl bg-[#020617]/80 border border-white/5 shadow-black/50">
          {navItems.map(item => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group flex-1`}
              >
                {/* Active Indicator Background */}
                <div className={`absolute inset-0 bg-sky-500/10 rounded-xl transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />

                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-500 group-hover:text-sky-200'}`} 
                />
                
                {/* Active Dot */}
                <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-sky-400 transition-all duration-300 ${isActive ? 'opacity-100 box-shadow-[0_0_5px_#38bdf8]' : 'opacity-0'}`} />
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