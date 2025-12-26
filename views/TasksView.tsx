import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button, Input, Select, Modal, Badge } from '../components/UI';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Repeat, Calendar as CalendarIcon } from 'lucide-react';
import { Task, Priority } from '../types';

const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useStore();
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
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

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }
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

  // Helper de Status de Conclusão Dinâmico
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

      // Verificação de Recorrência
      const matchesRecurrence = (targetDate: Date) => {
        if (!task.recurrence || task.recurrence.type === 'once') {
          return taskDate.getTime() === targetDate.getTime();
        }
        if (task.recurrence.type === 'weekly' && task.recurrence.days) {
          // Verifica se a data alvo é maior ou igual a data de criação/início
          if (targetDate < taskDate) return false;
          return task.recurrence.days.includes(targetDate.getDay());
        }
        return false;
      };

      if (filter === 'today') {
         return matchesRecurrence(today);
      }
      
      if (filter === 'week') {
         // Verifica se a tarefa ocorre em QUALQUER dia da próxima semana
         for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            if (matchesRecurrence(checkDate)) return true;
         }
         return false;
      }
      
      return true; // All shows everything
    }).sort((a, b) => {
        const isADone = getTaskStatus(a);
        const isBDone = getTaskStatus(b);
        
        // Completas por último
        if (isADone !== isBDone) return isADone ? 1 : -1;
        
        const prio = { high: 0, medium: 1, low: 2 };
        return prio[a.priority] - prio[b.priority];
    });
  }, [tasks, filter]);

  const filterLabels = {
    today: 'Hoje',
    week: 'Semana',
    all: 'Todas'
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta'
  };

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="space-y-8">
      <div className="flex flex-row justify-between items-start gap-4 border-b border-uwjota-border pb-6">
        <div>
          <h1 className="text-3xl font-light tracking-wide text-uwjota-text uppercase">Operações</h1>
          <div className="flex space-x-6 mt-4">
            {(['today', 'week', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium uppercase tracking-wider pb-1 transition-all ${
                  filter === f 
                    ? 'text-uwjota-primary border-b-2 border-uwjota-primary' 
                    : 'text-uwjota-muted hover:text-white'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={16} className="mr-2" /> <span className="hidden sm:inline">Inicializar</span><span className="sm:hidden">Novo</span>
        </Button>
      </div>

      <div className="grid gap-2">
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-uwjota-border/50 bg-transparent shadow-none">
            <h3 className="text-lg font-medium text-uwjota-text tracking-wide">Nenhuma operação listada</h3>
            <p className="text-uwjota-muted mt-2 text-sm">Sistema ocioso para este período.</p>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = getTaskStatus(task);
            return (
              <div 
                key={task.id} 
                className={`group flex items-center p-5 bg-uwjota-card border border-uwjota-border rounded-xl hover:border-uwjota-primary/30 transition-all ${
                  isCompleted ? 'opacity-50' : ''
                }`}
              >
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`flex-shrink-0 mr-5 transition-colors ${
                    isCompleted ? 'text-uwjota-primary' : 'text-uwjota-muted hover:text-uwjota-primary'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`text-sm font-medium tracking-wide truncate ${isCompleted ? 'line-through' : 'text-uwjota-text'}`}>
                      {task.title}
                    </h4>
                    <Badge color={task.priority === 'high' ? 'red' : 'yellow'}>
                      {priorityLabels[task.priority]}
                    </Badge>
                    {task.recurrence?.type === 'weekly' && (
                      <Badge color="blue">
                         <Repeat size={10} className="mr-1" /> Recorrente
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-uwjota-muted truncate">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button onClick={() => handleOpenModal(task)} className="p-2 text-uwjota-muted hover:text-white rounded-md hover:bg-white/5">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-uwjota-muted hover:text-uwjota-error rounded-md hover:bg-uwjota-error/10">
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
          <Input 
            label="Objetivo" 
            required 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="Detalhes da tarefa..."
          />
          
          <div className="grid grid-cols-2 gap-4">
             <Input 
                label={formData.recurrenceType === 'weekly' ? "Início" : "Data"}
                type="date" 
                required 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})} 
             />
             <Select 
                label="Nível de Prioridade"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                ]}
             />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-uwjota-muted mb-2">Repetição</label>
            <div className="flex space-x-3 mb-4">
               <button
                 type="button"
                 onClick={() => setFormData({...formData, recurrenceType: 'once'})}
                 className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md border transition-all ${
                   formData.recurrenceType === 'once' 
                    ? 'bg-uwjota-primary/10 border-uwjota-primary text-uwjota-primary' 
                    : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-muted/80'
                 }`}
               >
                 Apenas Uma Vez
               </button>
               <button
                 type="button"
                 onClick={() => setFormData({...formData, recurrenceType: 'weekly'})}
                 className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md border transition-all ${
                   formData.recurrenceType === 'weekly' 
                    ? 'bg-uwjota-primary/10 border-uwjota-primary text-uwjota-primary' 
                    : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-muted/80'
                 }`}
               >
                 Semanalmente
               </button>
            </div>

            {formData.recurrenceType === 'weekly' && (
              <div className="animate-fade-in bg-uwjota-card/50 p-4 rounded-lg border border-uwjota-border">
                <p className="text-[10px] text-uwjota-muted uppercase mb-3 font-semibold">Selecione os dias</p>
                <div className="flex justify-between">
                  {weekDays.map((day, index) => {
                    const isSelected = formData.recurrenceDays.includes(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-uwjota-primary text-white shadow-lg shadow-uwjota-primary/20'
                            : 'bg-uwjota-card border border-uwjota-border text-uwjota-muted hover:border-uwjota-primary/50'
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
            <label className="block text-xs font-medium text-uwjota-muted mb-2">Resumo (Opcional)</label>
            <textarea
              className="w-full rounded-lg border border-uwjota-border bg-uwjota-card/50 text-uwjota-text placeholder-uwjota-muted/40 focus:border-uwjota-primary focus:bg-uwjota-card focus:ring-1 focus:ring-uwjota-primary outline-none px-4 py-2.5 text-sm"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6 border-t border-white/5 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksView;