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
          // E se o dia da semana coincide
          return targetDate >= taskDate && task.recurrence.days.includes(targetDate.getDay());
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
        // Ordenação personalizada: Completas por último, depois por prioridade
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-uwjota-border pb-6">
        <div>
          <h1 className="text-3xl font-thin tracking-wider text-uwjota-text uppercase">Operações</h1>
          <div className="flex space-x-4 mt-4">
            {(['today', 'week', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs uppercase tracking-widest pb-1 transition-all ${
                  filter === f 
                    ? 'text-uwjota-gold border-b border-uwjota-gold' 
                    : 'text-uwjota-muted hover:text-white'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={16} className="mr-2" /> Inicializar
        </Button>
      </div>

      <div className="grid gap-1">
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-uwjota-border/30">
            <h3 className="text-lg font-light text-uwjota-text tracking-wide">Nenhuma operação listada</h3>
            <p className="text-uwjota-muted mt-2 text-sm">Sistema ocioso para este período.</p>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center p-6 bg-uwjota-card border-b border-uwjota-border/50 hover:bg-[#1a1a1a] transition-all ${
                task.completed ? 'opacity-40 grayscale' : ''
              }`}
            >
              <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className={`flex-shrink-0 mr-6 transition-colors ${
                  task.completed ? 'text-uwjota-gold' : 'text-uwjota-border hover:text-uwjota-gold'
                }`}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`text-sm font-medium tracking-wide truncate ${task.completed ? 'line-through' : 'text-uwjota-text'}`}>
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
                <button onClick={() => handleOpenModal(task)} className="p-2 text-uwjota-muted hover:text-white">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-2 text-uwjota-muted hover:text-uwjota-error">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
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
            <label className="block text-xs uppercase tracking-widest text-uwjota-muted mb-2">Repetição</label>
            <div className="flex space-x-4 mb-4">
               <button
                 type="button"
                 onClick={() => setFormData({...formData, recurrenceType: 'once'})}
                 className={`flex-1 py-2 text-xs uppercase tracking-wider rounded border transition-all ${
                   formData.recurrenceType === 'once' 
                    ? 'bg-uwjota-gold/10 border-uwjota-gold text-uwjota-gold' 
                    : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-muted/80'
                 }`}
               >
                 Apenas Uma Vez
               </button>
               <button
                 type="button"
                 onClick={() => setFormData({...formData, recurrenceType: 'weekly'})}
                 className={`flex-1 py-2 text-xs uppercase tracking-wider rounded border transition-all ${
                   formData.recurrenceType === 'weekly' 
                    ? 'bg-uwjota-gold/10 border-uwjota-gold text-uwjota-gold' 
                    : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-muted/80'
                 }`}
               >
                 Semanalmente
               </button>
            </div>

            {formData.recurrenceType === 'weekly' && (
              <div className="animate-fade-in bg-[#111] p-4 rounded border border-uwjota-border/50">
                <p className="text-[10px] text-uwjota-muted uppercase mb-3">Selecione os dias</p>
                <div className="flex justify-between">
                  {weekDays.map((day, index) => {
                    const isSelected = formData.recurrenceDays.includes(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                          isSelected
                            ? 'bg-uwjota-gold text-black shadow-[0_0_10px_rgba(200,169,81,0.3)]'
                            : 'bg-uwjota-card border border-uwjota-border text-uwjota-muted hover:border-uwjota-gold/50'
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
            <label className="block text-xs uppercase tracking-widest text-uwjota-muted mb-2">Resumo (Opcional)</label>
            <textarea
              className="w-full rounded-md border border-uwjota-border bg-[#0f0f0f] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-gold focus:ring-1 focus:ring-uwjota-gold outline-none px-4 py-3 text-sm"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6 border-t border-uwjota-border pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksView;