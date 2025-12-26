import React from 'react';
import { X } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-500 hover:border-uwjota-primary/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.03)] ${className}`}>
    {title && (
      <h3 className="text-base font-medium tracking-wide mb-6 text-uwjota-text flex justify-between items-center relative z-10 border-b border-uwjota-border/50 pb-3">
        {title}
      </h3>
    )}
    <div className="relative z-10">
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
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl tracking-wide shadow-md";
  
  const variants = {
    // Primary: Vibrant Sky to Cyan Gradient - High Contrast against Black
    primary: "bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-black shadow-sky-900/20 hover:shadow-sky-500/20 border border-transparent transform hover:-translate-y-0.5",
    // Secondary: Dark Slate
    secondary: "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-sky-500/30 hover:text-white shadow-none",
    // Danger
    danger: "bg-rose-950/30 text-rose-400 border border-rose-900/50 hover:bg-rose-900/50 shadow-none",
    // Ghost
    ghost: "text-uwjota-muted hover:text-sky-300 hover:bg-sky-500/5 shadow-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-5 group">
    {label && <label className="block text-xs font-medium text-uwjota-muted mb-2 ml-1 group-focus-within:text-uwjota-primary transition-colors">{label}</label>}
    <div className="relative">
      <input
        className={`w-full rounded-xl border border-uwjota-border bg-black/40 text-uwjota-text placeholder-uwjota-muted/30 
        focus:border-uwjota-primary/60 focus:bg-black/60 focus:ring-1 focus:ring-uwjota-primary/40 focus:shadow-[0_0_20px_rgba(56,189,248,0.05)]
        outline-none transition-all duration-300 px-4 py-3 text-sm backdrop-blur-sm ${className}`}
        {...props}
      />
    </div>
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="mb-5 group">
    {label && <label className="block text-xs font-medium text-uwjota-muted mb-2 ml-1 group-focus-within:text-uwjota-primary transition-colors">{label}</label>}
    <div className="relative">
      <select
        className={`w-full rounded-xl border border-uwjota-border bg-black/40 text-uwjota-text 
        focus:border-uwjota-primary/60 focus:bg-black/60 focus:ring-1 focus:ring-uwjota-primary/40
        outline-none px-4 py-3 text-sm transition-all duration-300 appearance-none cursor-pointer backdrop-blur-sm ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-black text-slate-200">{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop - Darker */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="inline-block align-bottom bg-[#020617] border border-uwjota-border rounded-2xl text-left overflow-hidden shadow-2xl shadow-black transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full animate-slide-up relative">
          
          {/* Subtle top gradient line - Thinner and sharper */}
          <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-70"></div>

          <div className="px-6 pt-8 pb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-light tracking-wide text-white" id="modal-title">
                {title}
              </h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-uwjota-muted hover:text-sky-300 transition-all">
                <X size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
  let style = "bg-slate-900 text-slate-400 border-slate-800"; 
  
  if (color === 'green') style = "text-emerald-300 border-emerald-900/50 bg-emerald-950/30";
  if (color === 'red') style = "text-rose-300 border-rose-900/50 bg-rose-950/30";
  if (color === 'yellow') style = "text-amber-300 border-amber-900/50 bg-amber-950/30"; 
  // Blue variations
  if (color === 'blue') style = "text-sky-300 border-sky-900/50 bg-sky-950/30 shadow-[0_0_15px_rgba(56,189,248,0.05)]"; 

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] uppercase tracking-wider font-semibold ${style}`}>
      {children}
    </span>
  );
};