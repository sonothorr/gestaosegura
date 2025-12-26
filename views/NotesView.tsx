import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button, Input, Modal } from '../components/UI';
import { Plus, Pin, Trash2, Edit2, Search } from 'lucide-react';
import { Note } from '../types';

const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({ title: '', content: '', isPinned: false });

  const resetForm = () => {
    setFormData({ title: '', content: '', isPinned: false });
    setEditingNote(null);
  };

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({ title: note.title, content: note.content, isPinned: note.isPinned });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) updateNote(editingNote.id, formData);
    else addNote(formData);
    setIsModalOpen(false);
    resetForm();
  };

  const filteredNotes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return notes
      .filter(n => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-row justify-between items-center gap-4 border-b border-uwjota-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-uwjota-text uppercase">Anotações</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={16} className="mr-2" /> <span className="hidden sm:inline">Nova Nota</span><span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-uwjota-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-uwjota-border rounded-lg pl-10 pr-4 py-3 text-sm text-uwjota-text focus:border-uwjota-primary focus:outline-none placeholder-uwjota-muted/50 transition-colors shadow-sm focus:ring-1 focus:ring-uwjota-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-uwjota-border rounded-xl">
             <p className="text-uwjota-muted text-sm font-semibold">Nenhuma nota encontrada</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className={`bg-uwjota-card border rounded-xl p-6 group transition-all duration-300 hover:shadow-md hover:border-uwjota-primary/30 ${note.isPinned ? 'border-uwjota-primary/40 shadow-sm shadow-violet-900/10' : 'border-uwjota-border'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className={`font-semibold text-lg pr-8 truncate ${note.isPinned ? 'text-uwjota-primary' : 'text-uwjota-text'}`}>
                   {note.title || <span className="text-uwjota-muted italic">Sem título</span>}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 bg-uwjota-card pl-2">
                   <button onClick={() => updateNote(note.id, { isPinned: !note.isPinned })} className={`p-1.5 rounded hover:bg-uwjota-bg ${note.isPinned ? 'text-uwjota-primary' : 'text-uwjota-muted'}`}>
                     <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
                   </button>
                   <button onClick={() => handleOpenModal(note)} className="p-1.5 rounded text-uwjota-muted hover:text-uwjota-text hover:bg-uwjota-bg">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded text-uwjota-muted hover:text-rose-500 hover:bg-rose-500/10">
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="md:hidden">
                   {note.isPinned && <Pin size={14} className="text-uwjota-primary" fill="currentColor" />}
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-uwjota-muted whitespace-pre-wrap line-clamp-6 text-sm leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-uwjota-border flex justify-between items-center text-[10px] text-uwjota-muted uppercase tracking-wider font-bold">
                 <span>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                 {note.isPinned && <span className="text-uwjota-primary">Fixado</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? 'Editar Nota' : 'Nova Nota'}>
        <form onSubmit={handleSubmit} className="flex flex-col h-[60vh] sm:h-auto">
          <Input label="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Assunto principal..." className="text-lg font-semibold" />
          <div className="flex-1 mb-6 flex flex-col">
            <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">Conteúdo</label>
            <textarea
              className="flex-1 w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30 outline-none px-3 py-3 text-sm resize-none"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Digite suas anotações aqui..."
            />
          </div>
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors font-bold ${formData.isPinned ? 'text-uwjota-primary bg-uwjota-primary/10' : 'text-uwjota-muted hover:text-uwjota-text border border-uwjota-border'}`}
            >
              <Pin size={14} fill={formData.isPinned ? "currentColor" : "none"} />
              {formData.isPinned ? 'Fixado no topo' : 'Fixar nota'}
            </button>
          </div>
          <div className="flex justify-end space-x-3 border-t border-uwjota-border pt-4 mt-auto">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotesView;