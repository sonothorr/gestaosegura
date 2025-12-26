import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Badge } from '../components/UI';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, DollarSign, Calendar, Activity, Repeat, Diamond } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardView: React.FC = () => {
  const { tasks, transactions } = useStore();

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split('T')[0];

  // Helper para formatar moeda BRL
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const todaysTasks = useMemo(() => 
    tasks.filter(t => {
      // Logic duplicated from TasksView for consistency
      const taskDate = new Date(t.date);
      taskDate.setHours(0,0,0,0);

      // Check if task applies to today
      let isForToday = false;
      if (!t.recurrence || t.recurrence.type === 'once') {
        isForToday = taskDate.getTime() === today.getTime();
      } else if (t.recurrence.type === 'weekly' && t.recurrence.days) {
        isForToday = today >= taskDate && t.recurrence.days.includes(today.getDay());
      }

      return isForToday && !t.completed;
    }).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }), 
  [tasks, today, todayStr]);

  const completedTodayCount = useMemo(() => {
     return tasks.filter(t => {
        const taskDate = new Date(t.date);
        taskDate.setHours(0,0,0,0);
        let isForToday = false;
        if (!t.recurrence || t.recurrence.type === 'once') {
           isForToday = taskDate.getTime() === today.getTime();
        } else if (t.recurrence.type === 'weekly' && t.recurrence.days) {
           isForToday = today >= taskDate && t.recurrence.days.includes(today.getDay());
        }
        return isForToday && t.completed;
     }).length;
  }, [tasks, today]);

  const financials = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.value;
      else expense += t.value;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recentData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-7).map(t => ({
      name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount: t.type === 'income' ? t.value : -t.value,
      type: t.type
    }));
  }, [transactions]);

  const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8 border-b border-uwjota-border pb-6 flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-thin tracking-wider text-uwjota-text uppercase">Visão Geral</h1>
            <p className="text-uwjota-muted text-sm mt-1 tracking-wide">Resumo Executivo</p>
        </div>
        <div className="flex items-center mt-2 opacity-90">
          <Diamond className="text-uwjota-gold mr-3" size={18} />
          <span className="text-lg font-light tracking-[0.2em] text-uwjota-text uppercase">
            uwjota
          </span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task KPI */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={60} className="text-uwjota-gold" />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-uwjota-muted text-xs uppercase tracking-widest">Tarefas Pendentes</p>
              <h3 className="text-4xl font-light text-uwjota-text mt-2">{todaysTasks.length}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-uwjota-border/50 text-xs text-uwjota-gold flex items-center">
               <Calendar size={12} className="mr-2" /> 
               {completedTodayCount} concluídas hoje
            </div>
          </div>
        </Card>

        {/* Finance KPI */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={60} className="text-uwjota-text" />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-uwjota-muted text-xs uppercase tracking-widest">Patrimônio Líquido</p>
              <h3 className={`text-4xl font-light mt-2 ${financials.balance >= 0 ? 'text-uwjota-gold' : 'text-uwjota-error'}`}>
                {formatBRL(financials.balance)}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-uwjota-border/50 flex space-x-6 text-xs">
              <span className="flex items-center text-uwjota-success">
                <TrendingUp size={12} className="mr-2" /> {formatBRL(financials.income)}
              </span>
              <span className="flex items-center text-uwjota-error">
                <TrendingDown size={12} className="mr-2" /> {formatBRL(financials.expense)}
              </span>
            </div>
          </div>
        </Card>

        {/* Chart KPI */}
        <Card>
           <p className="text-uwjota-muted text-xs uppercase tracking-widest mb-4">Fluxo de Caixa</p>
           <div className="h-24">
             {recentData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={recentData}>
                   <Bar dataKey="amount" radius={[0, 0, 0, 0]}>
                     {recentData.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={entry.type === 'income' ? '#C8A951' : '#333333'} 
                         strokeWidth={0}
                       />
                     ))}
                   </Bar>
                   <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#161616', borderColor: '#333', color: '#EAEAEA', fontSize: '12px' }}
                      itemStyle={{ color: '#C8A951' }}
                      formatter={(value: number) => [formatBRL(Math.abs(value)), value > 0 ? "Receita" : "Despesa"]}
                      labelStyle={{ color: '#888' }}
                   />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-xs text-uwjota-muted">Sem dados disponíveis</div>
             )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card title="Fila de Prioridade">
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8 text-uwjota-muted">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-uwjota-gold opacity-50" />
              <p className="text-sm font-light uppercase tracking-widest">Todos objetivos concluídos</p>
            </div>
          ) : (
            <ul className="space-y-0 divide-y divide-uwjota-border">
              {todaysTasks.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between py-4 group hover:bg-white/5 px-2 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Circle size={14} className={`
                      ${task.priority === 'high' ? 'text-uwjota-error' : 'text-uwjota-gold'}
                    `} />
                    <span className="font-normal text-sm text-uwjota-text">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.recurrence?.type === 'weekly' && (
                        <Repeat size={12} className="text-uwjota-muted" />
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
                <div>
                   <div className="flex justify-between items-end mb-2">
                     <p className="text-uwjota-muted text-sm">Taxa de Conclusão</p>
                     <span className="text-2xl text-uwjota-gold font-light">
                       {Math.round((completedTodayCount / Math.max(1, todaysTasks.length + completedTodayCount)) * 100)}%
                     </span>
                   </div>
                   <div className="w-full bg-[#333] h-1 mb-1">
                      <div 
                        className="bg-uwjota-gold h-1 transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(100, (completedTodayCount / Math.max(1, todaysTasks.length + completedTodayCount)) * 100)}%` }}>
                      </div>
                   </div>
                </div>
                
                <div className="border border-uwjota-gold/20 bg-uwjota-gold/5 p-4 mt-6">
                  <p className="text-xs uppercase tracking-widest text-uwjota-gold mb-2">Insight do Sistema</p>
                  <p className="text-sm text-uwjota-muted italic font-light">
                    "A disciplina é a ponte entre metas e conquistas."
                  </p>
                </div>
             </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;