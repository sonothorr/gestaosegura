import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button, Input, Select, Modal, Badge } from '../components/UI';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Repeat } from 'lucide-react';
import { Task, Priority } from '../types';

const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useStore();
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ... (keep existing state and logic) ...
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
    <div className="space-y-8">
      <div className="flex flex-row justify-between items-start gap-4 border-b border-uwjota-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-uwjota-text uppercase">Operações</h1>
          <div className="flex space-x-4 mt-4 bg-uwjota-bg p-1 rounded-lg w-fit">
            {(['today', 'week', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
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
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={16} className="mr-2" /> <span className="hidden sm:inline">Nova Tarefa</span><span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <div className="grid gap-3">
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
                className={`group flex items-center p-4 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/40 transition-all ${
                  isCompleted ? 'opacity-60 bg-uwjota-bg' : ''
                }`}
              >
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`flex-shrink-0 mr-4 transition-colors ${
                    isCompleted ? 'text-uwjota-success' : 'text-uwjota-muted hover:text-uwjota-primary'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={24} className="fill-uwjota-success/10" /> : <Circle size={24} />}
                </button>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`text-sm font-semibold tracking-tight truncate ${isCompleted ? 'line-through text-uwjota-muted' : 'text-uwjota-text'}`}>
                      {task.title}
                    </h4>
                    <Badge color={task.priority === 'high' ? 'red' : 'yellow'}>
                      {{low:'Baixa', medium:'Média', high:'Alta'}[task.priority]}
                    </Badge>
                    {task.recurrence?.type === 'weekly' && (
                      <Badge color="violet">
                         <Repeat size={10} className="mr-1" /> Recorrente
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-uwjota-muted truncate">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button onClick={() => handleOpenModal(task)} className="p-2 text-uwjota-muted hover:text-uwjota-text rounded-md hover:bg-uwjota-bg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-uwjota-muted hover:text-rose-500 rounded-md hover:bg-rose-500/10">
                    <Trash2 size={16} />
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

          <div className="flex justify-end space-x-3 mt-6 border-t border-uwjota-border pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksView;