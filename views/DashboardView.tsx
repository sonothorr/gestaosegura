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
      <header className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
            <h1 className="text-3xl font-light tracking-tight text-white mb-1">Visão Geral</h1>
        </div>
        <div className="flex items-center opacity-70 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <Diamond className="text-uwjota-primary mr-2" size={14} fill="currentColor" fillOpacity={0.2} />
          <span className="text-xs font-medium tracking-wider text-gray-300 uppercase">uwjota</span>
        </div>
      </header>

      {/* --- QUICK ACTIONS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => setModals(p => ({...p, task: true}))}
          className="group relative flex items-center justify-between p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <CheckSquare size={20} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-medium text-gray-200">Nova Tarefa</span>
              <span className="text-[10px] text-uwjota-muted uppercase tracking-wider">Ação Rápida</span>
            </div>
          </div>
          <Plus size={16} className="text-uwjota-muted group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => setModals(p => ({...p, finance: true}))}
          className="group relative flex items-center justify-between p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <Wallet size={20} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-medium text-gray-200">Lançamento</span>
              <span className="text-[10px] text-uwjota-muted uppercase tracking-wider">Financeiro</span>
            </div>
          </div>
          <Plus size={16} className="text-uwjota-muted group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => setModals(p => ({...p, note: true}))}
          className="group relative flex items-center justify-between p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-all">
              <StickyNote size={20} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-medium text-gray-200">Anotação</span>
              <span className="text-[10px] text-uwjota-muted uppercase tracking-wider">Lembrete</span>
            </div>
          </div>
          <Plus size={16} className="text-uwjota-muted group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task KPI */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity size={80} className="text-white" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-uwjota-muted text-xs font-medium uppercase tracking-wider">Tarefas Pendentes</p>
              <h3 className="text-4xl font-medium text-white mt-3">{pendingTasksToday.length}</h3>
            </div>
            <div className="mt-6 flex items-center text-xs text-uwjota-primary bg-uwjota-primary/10 px-3 py-1.5 rounded-md w-fit font-medium">
               <Calendar size={12} className="mr-2" /> 
               {completedTodayCount} concluídas hoje
            </div>
          </div>
        </Card>

        {/* Finance KPI */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign size={80} className="text-white" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-uwjota-muted text-xs font-medium uppercase tracking-wider">Saldo Atual</p>
              <h3 className={`text-4xl font-medium mt-3 ${financials.balance >= 0 ? 'text-white' : 'text-uwjota-error'}`}>
                {formatBRL(financials.balance)}
              </h3>
            </div>
            <div className="mt-6 flex space-x-3 text-xs">
              <span className="flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                <TrendingUp size={12} className="mr-1" /> {formatBRL(financials.income)}
              </span>
              <span className="flex items-center text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                <TrendingDown size={12} className="mr-1" /> {formatBRL(financials.expense)}
              </span>
            </div>
          </div>
        </Card>

        {/* Chart KPI */}
        <Card>
           <p className="text-uwjota-muted text-xs font-medium uppercase tracking-wider mb-4">Fluxo de Caixa</p>
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
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '10px' }}
                      itemStyle={{color: '#fff'}}
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
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare size={24} className="text-uwjota-primary opacity-50" />
              </div>
              <p className="text-sm text-gray-400">Todos objetivos concluídos</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {pendingTasksToday.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between py-3 px-3 hover:bg-white/5 rounded-lg transition-all group">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-uwjota-border hover:text-uwjota-primary transition-colors focus:outline-none"
                    >
                      <Circle size={20} strokeWidth={2} className={`
                        ${task.priority === 'high' ? 'text-uwjota-error' : 'text-uwjota-muted group-hover:text-uwjota-primary'}
                      `} />
                    </button>
                    <div>
                      <span className="block font-medium text-sm text-gray-200">{task.title}</span>
                      {task.priority === 'high' && <span className="text-[10px] text-uwjota-error uppercase tracking-wider font-bold">Alta Prioridade</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.recurrence?.type === 'weekly' && (
                        <div className="p-1.5 bg-blue-500/10 rounded-md">
                          <Repeat size={12} className="text-blue-400" />
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
                     <p className="text-uwjota-muted text-xs font-medium uppercase tracking-wider">Conclusão Diária</p>
                     <span className="text-3xl text-white font-medium">
                       {performancePercentage}<span className="text-lg text-uwjota-muted">%</span>
                     </span>
                   </div>
                   
                   {/* Clean Progress Bar */}
                   <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out bg-uwjota-primary" 
                        style={{ width: `${performancePercentage}%` }}
                      >
                      </div>
                   </div>

                   <p className="text-[10px] text-uwjota-muted mt-3 text-right font-mono">
                     {completedTodayCount} / {totalTasksForTodayCount} TARGETS
                   </p>
                </div>
                
                <div className="bg-uwjota-card border border-uwjota-border p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-400 italic font-light leading-relaxed">
                      "A consistência é a chave do sucesso."
                    </p>
                </div>
             </div>
        </Card>
      </div>

      {/* --- QUICK ACTION MODALS --- */}
      
      {/* Task Modal */}
      <Modal isOpen={modals.task} onClose={() => setModals(p => ({...p, task: false}))} title="Adicionar Tarefa">
         <form onSubmit={handleQuickTask}>
           <Input label="Objetivo" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required placeholder="Detalhes da tarefa..." />
           
           <div className="grid grid-cols-2 gap-4">
              <Input label="Data" type="date" value={taskForm.date} onChange={e => setTaskForm({...taskForm, date: e.target.value})} required />
              <Select label="Nível de Prioridade" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as Priority})} options={[{value:'low', label:'Baixa'}, {value:'medium', label:'Média'}, {value:'high', label:'Alta'}]} />
           </div>

           <div className="mb-6 group">
              <label className="block text-xs font-medium text-uwjota-muted mb-2 ml-1">Resumo (Opcional)</label>
              <textarea
                className="w-full rounded-lg border border-uwjota-border bg-uwjota-card/50 text-uwjota-text placeholder-uwjota-muted/40 focus:border-uwjota-primary focus:bg-uwjota-card focus:ring-1 focus:ring-uwjota-primary outline-none px-4 py-2.5 text-sm transition-all duration-200"
                rows={3}
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              />
           </div>

           <div className="flex justify-end pt-4 mt-6 border-t border-white/5"><Button type="submit">Adicionar</Button></div>
         </form>
      </Modal>

      {/* Finance Modal */}
      <Modal isOpen={modals.finance} onClose={() => setModals(p => ({...p, finance: false}))} title="Adicionar Transação">
         <form onSubmit={handleQuickFinance}>
           <div className="flex gap-4 mb-6 p-1 bg-white/5 rounded-lg">
              <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'income'})} className={`flex-1 py-2.5 text-xs uppercase tracking-wider rounded-md transition-all font-medium ${financeForm.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-uwjota-muted hover:text-white'}`}>Receita</button>
              <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'expense'})} className={`flex-1 py-2.5 text-xs uppercase tracking-wider rounded-md transition-all font-medium ${financeForm.type === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'text-uwjota-muted hover:text-white'}`}>Despesa</button>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <Input label="Valor" type="number" step="0.01" value={financeForm.value} onChange={e => setFinanceForm({...financeForm, value: e.target.value})} required placeholder="0.00" />
              <Input label="Data" type="date" value={financeForm.date} onChange={e => setFinanceForm({...financeForm, date: e.target.value})} required />
           </div>

           <div className="mb-6">
              <Input label="Descrição" value={financeForm.note} onChange={e => setFinanceForm({...financeForm, note: e.target.value})} placeholder="Do que se trata..." />
           </div>

           <div className="flex justify-end pt-4 mt-6 border-t border-white/5"><Button type="submit">Registrar</Button></div>
         </form>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={modals.note} onClose={() => setModals(p => ({...p, note: false}))} title="Nota Rápida">
         <form onSubmit={handleQuickNote}>
           <Input 
              label="Título" 
              value={noteForm.title} 
              onChange={e => setNoteForm({...noteForm, title: e.target.value})} 
              placeholder="Assunto principal..." 
              className="font-medium" 
            />
           <div className="mb-6">
             <label className="block text-xs font-medium text-uwjota-muted mb-2 ml-1">Conteúdo</label>
             <textarea 
                className="w-full rounded-lg border border-uwjota-border bg-uwjota-card/50 text-uwjota-text placeholder-uwjota-muted/40 focus:border-uwjota-primary focus:bg-uwjota-card focus:ring-1 focus:ring-uwjota-primary outline-none px-4 py-2.5 text-sm transition-all duration-200"
                rows={4} 
                value={noteForm.content} 
                onChange={e => setNoteForm({...noteForm, content: e.target.value})} 
                placeholder="Digite aqui...">
             </textarea>
           </div>
           <div className="flex justify-end pt-4 mt-6 border-t border-white/5"><Button type="submit">Salvar Nota</Button></div>
         </form>
      </Modal>

    </div>
  );
};

export default DashboardView;