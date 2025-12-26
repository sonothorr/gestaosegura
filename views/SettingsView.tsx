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
      <h1 className="text-3xl font-thin tracking-wider text-uwjota-text uppercase mb-10 border-b border-uwjota-border pb-6">Configuração do Sistema</h1>

      <Card title="Gerenciamento de Dados">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-uwjota-border/50">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-uwjota-gold/10 rounded border border-uwjota-gold/20 text-uwjota-gold">
                 <Download size={20} />
               </div>
               <div>
                 <p className="font-medium text-uwjota-text">Protocolo de Backup</p>
                 <p className="text-xs text-uwjota-muted">Exportar dados e chave local.</p>
               </div>
             </div>
             <Button variant="secondary" onClick={exportData}>Exportar</Button>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-uwjota-border/50">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-uwjota-gold/10 rounded border border-uwjota-gold/20 text-uwjota-gold">
                 <Upload size={20} />
               </div>
               <div>
                 <p className="font-medium text-uwjota-text">Ponto de Restauração</p>
                 <p className="text-xs text-uwjota-muted">Injetar estado anterior do sistema.</p>
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
               <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Importar</Button>
             </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-uwjota-error/10 rounded border border-uwjota-error/20 text-uwjota-error">
                 <Trash size={20} />
               </div>
               <div>
                 <p className="font-medium text-uwjota-error">Expurgo do Sistema</p>
                 <p className="text-xs text-uwjota-muted">Destruição irreversível de dados.</p>
               </div>
             </div>
             <Button variant="danger" onClick={resetData}>Resetar</Button>
          </div>
        </div>
      </Card>
      
      <div className="text-center mt-20">
        <p className="text-[10px] uppercase tracking-[0.2em] text-uwjota-muted opacity-50">uwjota v1.0 • Ambiente Local Seguro</p>
      </div>
    </div>
  );
};

export default SettingsView;