import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { LayoutDashboard, CheckSquare, Wallet, Settings as SettingsIcon } from 'lucide-react';
import { ViewMode } from './types';
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import FinanceView from './views/FinanceView';
import SettingsView from './views/SettingsView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'tasks' as ViewMode, label: 'Operações', icon: CheckSquare },
    { id: 'finance' as ViewMode, label: 'Financeiro', icon: Wallet },
    { id: 'settings' as ViewMode, label: 'Sistema', icon: SettingsIcon },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'tasks': return <TasksView />;
      case 'finance': return <FinanceView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-uwjota-bg text-uwjota-text font-sans selection:bg-uwjota-gold selection:text-black">
      
      {/* Main Content - Increased padding to pb-48 (192px) to forcefully clear the fixed navigation bar */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-8 pb-48 max-w-4xl mx-auto w-full">
        {renderView()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161616]/95 backdrop-blur-xl border-t border-uwjota-border pb-safe transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-20 max-w-4xl mx-auto px-2">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 group ${
                  isActive 
                    ? 'text-uwjota-gold' 
                    : 'text-uwjota-muted hover:text-uwjota-text'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 relative ${isActive ? 'bg-uwjota-gold/10 translate-y-[-2px]' : 'group-hover:bg-white/5'}`}>
                  <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <div className="absolute inset-0 bg-uwjota-gold/20 blur-lg rounded-full -z-10" />}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-medium ${isActive ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-300`}>
                  {item.label}
                </span>
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