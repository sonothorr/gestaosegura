import React from 'react';
import { X } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`glass-panel rounded-xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col ${className}`}>
    {title && (
      <h3 className="text-base font-semibold tracking-tight mb-5 text-uwjota-text flex justify-between items-center relative z-10 border-b border-uwjota-border pb-3 shrink-0">
        {title}
      </h3>
    )}
    <div className="relative z-10 flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg tracking-tight shadow-md active:scale-95";
  
  const variants = {
    // Primary: Violet to Fuchsia Gradient
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border border-transparent shadow-violet-900/20",
    // Secondary: Dark
    secondary: "bg-uwjota-card border border-uwjota-border text-uwjota-text hover:bg-uwjota-border hover:border-uwjota-primary/30 shadow-none",
    // Danger
    danger: "bg-rose-950/30 text-rose-400 border border-rose-900 hover:bg-rose-900/40 shadow-none",
    // Ghost
    ghost: "text-uwjota-muted hover:text-uwjota-primary hover:bg-uwjota-primary/10 shadow-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Input ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4 group">
    {label && <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">{label}</label>}
    <div className="relative">
      <input
        className={`w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text placeholder-uwjota-muted/50
        focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30
        outline-none transition-all duration-200 px-3 py-2.5 text-sm ${className}`}
        {...props}
      />
    </div>
  </div>
);

// --- Select ---
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }> = ({ label, options, className = '', ...props }) => (
  <div className="mb-4 group">
    {label && <label className="block text-xs font-semibold text-uwjota-text mb-1.5 ml-0.5">{label}</label>}
    <div className="relative">
      <select
        className={`w-full rounded-lg border border-uwjota-border bg-[#0a0a0a] text-uwjota-text 
        focus:border-uwjota-primary focus:ring-1 focus:ring-uwjota-primary/30
        outline-none px-3 py-2.5 text-sm transition-all duration-200 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-uwjota-text">{opt.label}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-uwjota-text">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:p-0">
        <div className="inline-block align-bottom bg-[#0f0f10] border border-uwjota-border rounded-xl text-left overflow-hidden shadow-2xl shadow-black transform transition-all sm:my-8 sm:max-w-md w-full animate-slide-up relative">
          
          {/* Subtle gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-uwjota-primary to-transparent opacity-50"></div>

          <div className="px-6 py-5 border-b border-uwjota-border flex justify-between items-center bg-uwjota-bg/30">
            <h3 className="text-lg font-semibold text-uwjota-text">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-md text-uwjota-muted hover:text-uwjota-text hover:bg-uwjota-border/50 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'violet' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
  const styles = {
    gray: "bg-zinc-900 text-zinc-400 border-zinc-800",
    green: "bg-emerald-950/30 text-emerald-400 border-emerald-900",
    red: "bg-rose-950/30 text-rose-400 border-rose-900",
    yellow: "bg-amber-950/30 text-amber-400 border-amber-900",
    violet: "bg-violet-950/30 text-violet-400 border-violet-900 shadow-[0_0_10px_rgba(139,92,246,0.1)]"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[color]}`}>
      {children}
    </span>
  );
};