import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Button } from '../components/UI';
import { Download, Upload, Trash } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { exportData, importData, resetData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const success = importData(event.target.result as string);
          if (success) alert("Dados importados com sucesso!");
          else alert("Falha ao importar dados. Formato inválido.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-uwjota-text uppercase mb-10 border-b border-uwjota-border pb-6 text-center">Sistema</h1>

      <Card title="Gerenciamento de Dados">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-uwjota-border">
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-uwjota-bg rounded-lg border border-uwjota-border text-uwjota-primary">
                 <Download size={20} />
               </div>
               <div>
                 <p className="font-semibold text-uwjota-text text-sm">Backup Local</p>
                 <p className="text-xs text-uwjota-muted">Baixar arquivo JSON.</p>
               </div>
             </div>
             <Button variant="secondary" onClick={exportData} size="sm">Exportar</Button>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-uwjota-border">
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-uwjota-bg rounded-lg border border-uwjota-border text-uwjota-primary">
                 <Upload size={20} />
               </div>
               <div>
                 <p className="font-semibold text-uwjota-text text-sm">Restaurar Backup</p>
                 <p className="text-xs text-uwjota-muted">Carregar arquivo JSON.</p>
               </div>
             </div>
             <div>
               <input 
                 type="file" 
                 accept=".json" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileChange}
               />
               <Button variant="secondary" onClick={() => fileInputRef.current?.click()} size="sm">Importar</Button>
             </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-rose-950/20 rounded-lg border border-rose-900/50 text-rose-500">
                 <Trash size={20} />
               </div>
               <div>
                 <p className="font-semibold text-rose-400 text-sm">Resetar Sistema</p>
                 <p className="text-xs text-uwjota-muted">Apagar tudo.</p>
               </div>
             </div>
             <Button variant="danger" onClick={resetData} size="sm">Resetar</Button>
          </div>
        </div>
      </Card>
      
      <div className="text-center mt-20">
        <p className="text-[10px] uppercase tracking-[0.2em] text-uwjota-muted font-bold opacity-60">uwjota v1.4 • Midnight Secure</p>
      </div>
    </div>
  );
};

export default SettingsView;