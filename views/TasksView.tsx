import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Button, Input, Select, Modal, Badge } from '../components/UI';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Repeat } from 'lucide-react';
import { Task, Priority } from '../types';

const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useStore();
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium' as Priority,
    recurrenceType: 'once' as 'once' | 'weekly',
    recurrenceDays: [] as number[],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      recurrenceType: 'once',
      recurrenceDays: [],
    });
    setEditingTask(null);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        date: task.date,
        priority: task.priority,
        recurrenceType: task.recurrence?.type || 'once',
        recurrenceDays: task.recurrence?.days || [],
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskPayload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      priority: formData.priority,
      recurrence: {
        type: formData.recurrenceType,
        days: formData.recurrenceType === 'weekly' ? formData.recurrenceDays : undefined
      }
    };
    if (editingTask) updateTask(editingTask.id, taskPayload);
    else addTask(taskPayload);
    setIsModalOpen(false);
    resetForm();
  };

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => {
      const currentDays = prev.recurrenceDays;
      if (currentDays.includes(dayIndex)) {
        return { ...prev, recurrenceDays: currentDays.filter(d => d !== dayIndex) };
      } else {
        return { ...prev, recurrenceDays: [...currentDays, dayIndex].sort() };
      }
    });
  };

  const getTaskStatus = (task: Task) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (task.recurrence && task.recurrence.type !== 'once') {
      return task.lastCompletedDate === todayStr;
    }
    return task.completed;
  };

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0,0,0,0);
      const matchesRecurrence = (targetDate: Date) => {
        if (!task.recurrence || task.recurrence.type === 'once') return taskDate.getTime() === targetDate.getTime();
        if (task.recurrence.type === 'weekly' && task.recurrence.days) {
          if (targetDate < taskDate) return false;
          return task.recurrence.days.includes(targetDate.getDay());
        }
        return false;
      };
      if (filter === 'today') return matchesRecurrence(today);
      if (filter === 'week') {
         for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            if (matchesRecurrence(checkDate)) return true;
         }
         return false;
      }
      return true;
    }).sort((a, b) => {
        const isADone = getTaskStatus(a);
        const isBDone = getTaskStatus(b);
        if (isADone !== isBDone) return isADone ? 1 : -1;
        const prio = { high: 0, medium: 1, low: 2 };
        return prio[a.priority] - prio[b.priority];
    });
  }, [tasks, filter]);

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header Updated to match NotesView Style (Mobile: Stacked & Full Width Button) */}
      <div className="border-b border-uwjota-border pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <h1 className="text-2xl font-bold tracking-tight text-uwjota-text uppercase">Operações</h1>
           <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
             <Plus size={16} className="mr-2" /> Nova Tarefa
           </Button>
        </div>
        
        <div className="flex space-x-2 bg-uwjota-bg p-1 rounded-lg w-full sm:w-fit overflow-x-auto no-scrollbar">
          {(['today', 'week', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-uwjota-card text-uwjota-primary shadow-sm border border-uwjota-primary/20' 
                  : 'text-uwjota-muted hover:text-uwjota-text'
              }`}
            >
              {{today:'Hoje', week:'Semana', all:'Todas'}[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 w-full">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-uwjota-card/30 rounded-xl border-dashed border-2 border-uwjota-border">
            <h3 className="text-lg font-medium text-uwjota-text tracking-wide">Nenhuma operação listada</h3>
            <p className="text-uwjota-muted mt-2 text-sm">Sistema ocioso para este período.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = getTaskStatus(task);
            return (
              <div 
                key={task.id} 
                className={`group flex flex-col sm:flex-row sm:items-center p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/40 transition-all ${
                  isCompleted ? 'opacity-60 bg-uwjota-bg' : ''
                }`}
              >
                <div className="flex items-start sm:items-center flex-grow min-w-0 mb-3 sm:mb-0 max-w-full">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`flex-shrink-0 mr-4 mt-1 sm:mt-0 transition-colors ${
                        isCompleted ? 'text-uwjota-success' : 'text-uwjota-muted hover:text-uwjota-primary'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={24} className="fill-uwjota-success/10" /> : <Circle size={24} />}
                    </button>
                    
                    {/* Container de texto principal com overflow hidden */}
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1 w-full">
                        {/* Title: flex-1 força o título a ocupar o espaço e truncar quando necessário, empurrando os badges para a direita dentro do limite */}
                        <h4 className={`text-sm font-semibold tracking-tight truncate flex-1 ${isCompleted ? 'line-through text-uwjota-muted' : 'text-uwjota-text'}`}>
                          {task.title}
                        </h4>
                        
                        {/* Badges: shrink-0 garante que nunca diminuam */}
                        <div className="flex gap-1 shrink-0">
                            <Badge color={task.priority === 'high' ? 'red' : 'yellow'}>
                              {{low:'Baixa', medium:'Média', high:'Alta'}[task.priority]}
                            </Badge>
                            {task.recurrence?.type === 'weekly' && (
                              <Badge color="violet">
                                <Repeat size={10} className="mr-1" /> Semanal
                              </Badge>
                            )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-uwjota-muted truncate pr-2">{task.description}</p>
                      )}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end space-x-1 sm:ml-4 border-t sm:border-t-0 border-uwjota-border pt-2 sm:pt-0 mt-1 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleOpenModal(task)} className="p-2 text-uwjota-muted hover:text-uwjota-text rounded-md hover:bg-uwjota-bg flex items-center text-xs sm:text-base">
                    <Edit2 size={16} className="mr-2 sm:mr-0" /> <span className="sm:hidden">Editar</span>
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-uwjota-muted hover:text-rose-500 rounded-md hover:bg-rose-500/10 flex items-center text-xs sm:text-base">
                    <Trash2 size={16} className="mr-2 sm:mr-0" /> <span className="sm:hidden">Excluir</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Editar Operação' : 'Nova Operação'}
      >
        <form onSubmit={handleSubmit}>
          <Input label="Objetivo" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Detalhes da tarefa..." />
          <div className="grid grid-cols-2 gap-4">
             <Input label={formData.recurrenceType === 'weekly' ? "Início" : "Data"} type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
             <Select label="Prioridade" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} options={[{ value: 'low', label: 'Baixa' }, { value: 'medium', label: 'Média' }, { value: 'high', label: 'Alta' }]} />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-uwjota-text mb-2">Repetição</label>
            <div className="flex space-x-3 mb-4">
               {['once', 'weekly'].map(type => (
                 <button
                   key={type}
                   type="button"
                   onClick={() => setFormData({...formData, recurrenceType: type as any})}
                   className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md border transition-all font-bold ${
                     formData.recurrenceType === type
                      ? 'bg-uwjota-primary/10 border-uwjota-primary text-uwjota-primary' 
                      : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-text'
                   }`}
                 >
                   {type === 'once' ? 'Única' : 'Semanal'}
                 </button>
               ))}
            </div>

            {formData.recurrenceType === 'weekly' && (
              <div className="animate-fade-in bg-uwjota-bg p-4 rounded-lg border border-uwjota-border">
                <p className="text-[10px] text-uwjota-muted uppercase mb-3 font-bold">Dias da semana</p>
                <div className="flex justify-between">
                  {weekDays.map((day, index) => {
                    const isSelected = formData.recurrenceDays.includes(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          isSelected
                            ? 'bg-uwjota-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                            : 'bg-[#0a0a0a] border border-uwjota-border text-uwjota-muted'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
           <div className="mb-6">
              <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">Resumo (Opcional)</label>
              <textarea
                className="w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30 outline-none px-3 py-2.5 text-sm resize-none"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>

           <div className="flex justify-end pt-4 mt-6 border-t border-uwjota-border">
             <Button type="submit">Salvar</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksView;