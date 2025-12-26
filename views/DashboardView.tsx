import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Badge, Button, Modal, Input, Select } from '../components/UI';
import { CheckSquare, Circle, TrendingUp, TrendingDown, DollarSign, Calendar, Activity, Repeat, Diamond, Plus, Wallet, StickyNote } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, Priority, TransactionType } from '../types';

const DashboardView: React.FC = () => {
  const { tasks, transactions, toggleTaskCompletion, addTask, addTransaction, addNote } = useStore();

  const [modals, setModals] = useState({
    task: false,
    finance: false,
    note: false
  });

  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0], 
    priority: 'medium' as Priority 
  });
  
  const [financeForm, setFinanceForm] = useState({ 
    type: 'expense' as TransactionType, 
    value: '', 
    category: 'Geral', 
    date: new Date().toISOString().split('T')[0],
    note: '' 
  });
  
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // ... (Keep existing handlers) ...
  const handleQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({ ...taskForm, recurrence: { type: 'once' } });
    setModals(prev => ({ ...prev, task: false }));
    setTaskForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], priority: 'medium' });
  };

  const handleQuickFinance = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ 
      ...financeForm, 
      value: parseFloat(financeForm.value), 
    });
    setModals(prev => ({ ...prev, finance: false }));
    setFinanceForm({ type: 'expense', value: '', category: 'Geral', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const handleQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    addNote({ ...noteForm, isPinned: false });
    setModals(prev => ({ ...prev, note: false }));
    setNoteForm({ title: '', content: '' });
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split('T')[0];

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isTaskScheduledForToday = (t: Task) => {
    const taskDate = new Date(t.date);
    taskDate.setHours(0,0,0,0);
    if (!t.recurrence || t.recurrence.type === 'once') {
        return taskDate.getTime() === today.getTime();
    }
    if (t.recurrence.type === 'weekly' && t.recurrence.days) {
        if (today < taskDate) return false;
        return t.recurrence.days.includes(today.getDay());
    }
    return false;
  };

  const isTaskCompletedToday = (t: Task) => {
    if (t.recurrence && t.recurrence.type !== 'once') {
        return t.lastCompletedDate === todayStr;
    }
    return t.completed;
  };

  const pendingTasksToday = useMemo(() => 
    tasks.filter(t => {
      if (!isTaskScheduledForToday(t)) return false;
      return !isTaskCompletedToday(t);
    }).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }), 
  [tasks, todayStr]);

  const completedTodayCount = useMemo(() => {
     return tasks.filter(t => {
        if (!isTaskScheduledForToday(t)) return false;
        return isTaskCompletedToday(t);
     }).length;
  }, [tasks, todayStr]);

  const totalTasksForTodayCount = pendingTasksToday.length + completedTodayCount;
  const performancePercentage = totalTasksForTodayCount === 0 ? 0 : Math.round((completedTodayCount / totalTasksForTodayCount) * 100);

  const financials = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.value;
      else expense += t.value;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const chartData = useMemo(() => {
    const map = new Map<string, { date: string, income: number, expense: number }>();
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(t => {
      if (!map.has(t.date)) map.set(t.date, { date: t.date, income: 0, expense: 0 });
      const entry = map.get(t.date)!;
      if (t.type === 'income') entry.income += t.value;
      else entry.expense += t.value;
    });
    return Array.from(map.values());
  }, [transactions]);

  const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8 flex justify-center items-center border-b border-uwjota-border pb-6 pt-2">
        <div className="flex items-center bg-uwjota-card px-5 py-2 rounded-full border border-uwjota-border shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          <Diamond className="text-uwjota-primary mr-2.5" size={16} fill="currentColor" fillOpacity={0.2} />
          <span className="text-sm font-bold tracking-[0.2em] text-uwjota-text uppercase">uwjota</span>
        </div>
      </header>

      {/* --- QUICK ACTIONS SECTION --- */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {[
          { icon: CheckSquare, label: 'Tarefa', sub: 'Nova', color: 'text-violet-400', bg: 'bg-violet-900/20', action: () => setModals(p => ({...p, task: true})) },
          { icon: Wallet, label: 'Finanças', sub: 'Lançar', color: 'text-emerald-400', bg: 'bg-emerald-900/20', action: () => setModals(p => ({...p, finance: true})) },
          { icon: StickyNote, label: 'Nota', sub: 'Criar', color: 'text-fuchsia-400', bg: 'bg-fuchsia-900/20', action: () => setModals(p => ({...p, note: true})) },
        ].map((btn, i) => (
          <button 
            key={i}
            onClick={btn.action}
            className="group relative flex flex-col items-center justify-center p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300 active:scale-95"
          >
            <div className={`p-3 rounded-xl mb-3 ${btn.bg} ${btn.color} group-hover:scale-110 transition-transform shadow-inner`}>
              <btn.icon size={22} />
            </div>
            <div className="text-center">
              <span className="block text-xs sm:text-sm font-semibold text-uwjota-text tracking-tight">{btn.label}</span>
              <span className="hidden sm:block text-[10px] text-uwjota-muted uppercase tracking-wider font-medium mt-1">{btn.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task KPI */}
        <Card className="relative overflow-hidden">
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-uwjota-muted text-xs font-bold uppercase tracking-wider">Tarefas Pendentes</p>
              <h3 className="text-4xl font-mono font-medium text-uwjota-text mt-2">{pendingTasksToday.length}</h3>
            </div>
            <div className="mt-6 flex items-center text-xs text-uwjota-primary bg-uwjota-primary/10 px-3 py-1.5 rounded-md w-fit font-semibold border border-uwjota-primary/20">
               <Calendar size={12} className="mr-2" /> 
               {completedTodayCount} concluídas hoje
            </div>
          </div>
        </Card>

        {/* Finance KPI */}
        <Card className="relative overflow-hidden">
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-uwjota-muted text-xs font-bold uppercase tracking-wider">Saldo Atual</p>
              <h3 className={`text-3xl font-mono font-medium mt-2 tracking-tight ${financials.balance >= 0 ? 'text-uwjota-text' : 'text-uwjota-error'}`}>
                {formatBRL(financials.balance)}
              </h3>
            </div>
            <div className="mt-6 flex space-x-3 text-xs font-mono">
              <span className="flex items-center text-emerald-400 bg-emerald-950/30 border border-emerald-900 px-2 py-1 rounded">
                <TrendingUp size={12} className="mr-1" /> {formatBRL(financials.income)}
              </span>
              <span className="flex items-center text-rose-400 bg-rose-950/30 border border-rose-900 px-2 py-1 rounded">
                <TrendingDown size={12} className="mr-1" /> {formatBRL(financials.expense)}
              </span>
            </div>
          </div>
        </Card>

        {/* Chart KPI */}
        <Card>
           <p className="text-uwjota-muted text-xs font-bold uppercase tracking-wider mb-4">Fluxo de Caixa</p>
           <div className="h-28">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncomeDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenseDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '8px', color: '#f3f4f6', fontSize: '10px' }}
                      itemStyle={{color: '#f3f4f6'}}
                      formatter={(value: number, name: string) => [formatBRL(value), name === 'income' ? 'Rec.' : 'Desp.']}
                      labelFormatter={() => ''}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomeDash)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenseDash)" />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-xs text-uwjota-muted italic">Sem dados suficientes</div>
             )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card title="Fila de Prioridade">
          {pendingTasksToday.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-uwjota-bg border border-uwjota-border rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare size={24} className="text-uwjota-primary opacity-50" />
              </div>
              <p className="text-sm text-uwjota-muted font-medium">Todos objetivos concluídos</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {pendingTasksToday.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between py-3 px-3 hover:bg-uwjota-bg rounded-lg transition-all group border border-transparent hover:border-uwjota-border">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-uwjota-muted hover:text-uwjota-primary transition-colors focus:outline-none"
                    >
                      <Circle size={20} strokeWidth={2} className={`
                        ${task.priority === 'high' ? 'text-uwjota-error' : 'text-uwjota-muted group-hover:text-uwjota-primary'}
                      `} />
                    </button>
                    <div>
                      <span className="block font-semibold text-sm text-uwjota-text">{task.title}</span>
                      {task.priority === 'high' && <span className="text-[10px] text-uwjota-error uppercase tracking-wider font-bold">Alta Prioridade</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.recurrence?.type === 'weekly' && (
                        <div className="p-1.5 bg-violet-900/20 rounded-md">
                          <Repeat size={12} className="text-violet-400" />
                        </div>
                    )}
                    <Badge color={task.priority === 'high' ? 'red' : 'yellow'}>
                        {priorityLabels[task.priority]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Productivity */}
        <Card title="Performance">
             <div className="flex flex-col h-full justify-between">
                <div className="py-4">
                   <div className="flex justify-between items-end mb-4">
                     <p className="text-uwjota-muted text-xs font-bold uppercase tracking-wider">Conclusão Diária</p>
                     <span className="text-3xl font-mono text-uwjota-text font-medium">
                       {performancePercentage}<span className="text-lg text-uwjota-muted">%</span>
                     </span>
                   </div>
                   
                   {/* Clean Progress Bar */}
                   <div className="w-full bg-uwjota-bg h-3 rounded-full overflow-hidden border border-uwjota-border/50">
                      <div 
                        className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out bg-uwjota-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                        style={{ width: `${performancePercentage}%` }}
                      >
                      </div>
                   </div>

                   <p className="text-[10px] text-uwjota-muted mt-3 text-right font-mono">
                     {completedTodayCount} / {totalTasksForTodayCount} TARGETS
                   </p>
                </div>
                
                <div className="bg-uwjota-bg border border-uwjota-border p-5 rounded-lg mt-4">
                    <p className="text-sm text-uwjota-muted italic font-medium leading-relaxed pb-1">
                      "A consistência é a chave do sucesso."
                    </p>
                </div>
             </div>
        </Card>
      </div>

      {/* --- QUICK ACTION MODALS --- */}
      <Modal isOpen={modals.task} onClose={() => setModals(p => ({...p, task: false}))} title="Adicionar Tarefa">
         <form onSubmit={handleQuickTask}>
           <Input label="Objetivo" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required placeholder="Detalhes da tarefa..." />
           <div className="grid grid-cols-2 gap-4">
              <Input label="Data" type="date" value={taskForm.date} onChange={e => setTaskForm({...taskForm, date: e.target.value})} required />
              <Select label="Nível de Prioridade" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as Priority})} options={[{value:'low', label:'Baixa'}, {value:'medium', label:'Média'}, {value:'high', label:'Alta'}]} />
           </div>
           <div className="mb-6">
              <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">Resumo (Opcional)</label>
              <textarea
                className="w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30 outline-none px-3 py-2.5 text-sm resize-none"
                rows={3}
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              />
           </div>
           <div className="flex justify-end pt-4 mt-6 border-t border-uwjota-border"><Button type="submit">Adicionar</Button></div>
         </form>
      </Modal>

      <Modal isOpen={modals.finance} onClose={() => setModals(p => ({...p, finance: false}))} title="Adicionar Transação">
         <form onSubmit={handleQuickFinance}>
           <div className="flex gap-4 mb-6 p-1 bg-uwjota-bg rounded-lg border border-uwjota-border">
              <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'income'})} className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md transition-all font-bold ${financeForm.type === 'income' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900 shadow-sm' : 'text-uwjota-muted'}`}>Receita</button>
              <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'expense'})} className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md transition-all font-bold ${financeForm.type === 'expense' ? 'bg-rose-950/30 text-rose-400 border border-rose-900 shadow-sm' : 'text-uwjota-muted'}`}>Despesa</button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input label="Valor" type="number" step="0.01" value={financeForm.value} onChange={e => setFinanceForm({...financeForm, value: e.target.value})} required placeholder="0.00" />
              <Input label="Data" type="date" value={financeForm.date} onChange={e => setFinanceForm({...financeForm, date: e.target.value})} required />
           </div>
           <div className="mb-6">
              <Input label="Descrição" value={financeForm.note} onChange={e => setFinanceForm({...financeForm, note: e.target.value})} placeholder="Do que se trata..." />
           </div>
           <div className="flex justify-end pt-4 mt-6 border-t border-uwjota-border"><Button type="submit">Registrar</Button></div>
         </form>
      </Modal>

      <Modal isOpen={modals.note} onClose={() => setModals(p => ({...p, note: false}))} title="Nota Rápida">
         <form onSubmit={handleQuickNote}>
           <Input label="Título" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="Assunto principal..." className="font-semibold" />
           <div className="mb-6">
             <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">Conteúdo</label>
             <textarea 
                className="w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30 outline-none px-3 py-2.5 text-sm resize-none"
                rows={4} 
                value={noteForm.content} 
                onChange={e => setNoteForm({...noteForm, content: e.target.value})} 
                placeholder="Digite aqui...">
             </textarea>
           </div>
           <div className="flex justify-end pt-4 mt-6 border-t border-uwjota-border"><Button type="submit">Salvar Nota</Button></div>
         </form>
      </Modal>
    </div>
  );
};

export default DashboardView;