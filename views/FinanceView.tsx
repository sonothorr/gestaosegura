import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button, Input, Select, Modal } from '../components/UI';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinanceView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form helper
  // Category default to 'Geral' as requested to hide classification
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    value: '',
    category: 'Geral',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Helper para formatar moeda BRL
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      value: '',
      category: 'Geral',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      value: parseFloat(formData.value),
    });
    setIsModalOpen(false);
    resetForm();
  };

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group by date and sort
    const map = new Map<string, { date: string, income: number, expense: number }>();
    
    // Sort transactions by date
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
      if (!map.has(t.date)) {
        map.set(t.date, { date: t.date, income: 0, expense: 0 });
      }
      const entry = map.get(t.date)!;
      if (t.type === 'income') entry.income += t.value;
      else entry.expense += t.value;
    });

    return Array.from(map.values());
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-uwjota-border pb-6">
        <h1 className="text-3xl font-light tracking-wide text-uwjota-text uppercase">Financeiro</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" /> Registrar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-uwjota-card">
           <p className="text-uwjota-muted text-xs uppercase tracking-widest font-medium">Entradas</p>
           <h3 className="text-3xl font-light text-emerald-400 mt-2">{formatBRL(stats.totalIncome)}</h3>
        </Card>
        <Card className="bg-uwjota-card">
           <p className="text-uwjota-muted text-xs uppercase tracking-widest font-medium">Saídas</p>
           <h3 className="text-3xl font-light text-rose-400 mt-2">{formatBRL(stats.totalExpense)}</h3>
        </Card>
        <Card className="border-uwjota-border bg-[#18181b]">
           <p className="text-uwjota-muted text-xs uppercase tracking-widest font-medium">Total</p>
           <h3 className={`text-3xl font-medium mt-2 ${stats.balance >= 0 ? 'text-white' : 'text-uwjota-error'}`}>
             {formatBRL(stats.balance)}
           </h3>
        </Card>
      </div>

      <Card title="Movimentação">
        <div className="h-72 w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('pt-BR', {month:'numeric', day:'numeric'})} stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px', color: '#fafafa' }}
                  formatter={(value: number, name: string) => [formatBRL(value), name === 'income' ? 'Receita' : 'Despesa']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                />
                <CartesianGrid vertical={false} stroke="#333" strokeOpacity={0.1} strokeDasharray="3 3" />
                <Area type="basis" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="basis" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-uwjota-muted font-light">Aguardando dados financeiros</div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-widest text-uwjota-muted">Lançamentos</h3>
        
        {/* Table Container with Scroll - ADDED overflow-x-auto for mobile */}
        <div className="bg-uwjota-card rounded-xl border border-uwjota-border overflow-hidden flex flex-col max-h-96">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-uwjota-muted">Nenhum registro encontrado.</div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto">
              <table className="min-w-full divide-y divide-uwjota-border">
                <thead className="bg-[#18181b] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-medium text-uwjota-muted uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-left text-[10px] font-medium text-uwjota-muted uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-right text-[10px] font-medium text-uwjota-muted uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-right text-[10px] font-medium text-uwjota-muted uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-uwjota-border">
                  {[...transactions].sort((a,b) => b.createdAt - a.createdAt).map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-uwjota-muted font-mono">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-uwjota-text">
                        <div className="flex items-center">
                          <span className="font-medium">{t.note || (t.type === 'income' ? 'Receita' : 'Despesa')}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-light tracking-wide ${t.type === 'income' ? 'text-uwjota-success' : 'text-uwjota-error'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatBRL(t.value).replace('R$', '').trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => deleteTransaction(t.id)} className="text-uwjota-muted hover:text-uwjota-error transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançamento Contábil"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg border text-xs uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-text'}`}
              onClick={() => setFormData({...formData, type: 'income'})}
            >
              Receita
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg border text-xs uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'border-uwjota-border text-uwjota-muted hover:border-uwjota-text'}`}
              onClick={() => setFormData({...formData, type: 'expense'})}
            >
              Despesa
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
               label="Valor" 
               type="number" 
               step="0.01" 
               required 
               min="0"
               value={formData.value}
               onChange={e => setFormData({...formData, value: e.target.value})} 
               placeholder="0.00"
            />
            <Input 
               label="Data" 
               type="date" 
               required 
               value={formData.date}
               onChange={e => setFormData({...formData, date: e.target.value})} 
            />
          </div>

          <div className="mb-6">
            <Input 
               label="Descrição" 
               value={formData.note}
               onChange={e => setFormData({...formData, note: e.target.value})}
               placeholder="Do que se trata..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Descartar</Button>
            <Button type="submit">Gravar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceView;