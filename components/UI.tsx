import React from 'react';
import { X } from 'lucide-react';

// --- Card ---
// Minimalist, dark gray #161616, subtle border
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-uwjota-card border border-uwjota-border rounded-lg p-6 ${className}`}>
    {title && <h3 className="text-lg font-light tracking-wide mb-6 text-uwjota-text border-b border-uwjota-border/50 pb-2">{title}</h3>}
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-md uppercase tracking-wider";
  
  const variants = {
    // Gold background, black text, bold authority
    primary: "bg-uwjota-gold text-black hover:bg-[#D4B65F] hover:shadow-[0_0_15px_rgba(200,169,81,0.2)]",
    // Transparent with gold border
    secondary: "bg-transparent border border-uwjota-border text-uwjota-text hover:border-uwjota-gold hover:text-uwjota-gold",
    // Subtle red
    danger: "bg-uwjota-error/10 text-uwjota-error border border-uwjota-error/20 hover:bg-uwjota-error/20",
    // Ghost
    ghost: "text-uwjota-muted hover:text-uwjota-gold hover:bg-white/5",
  };

  const sizes = {
    sm: "text-[10px] px-3 py-2",
    md: "text-xs px-5 py-3",
    lg: "text-sm px-8 py-4",
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
  <div className="mb-4">
    {label && <label className="block text-xs uppercase tracking-widest text-uwjota-muted mb-2">{label}</label>}
    <input
      className={`w-full rounded-md border border-uwjota-border bg-[#0f0f0f] text-uwjota-text placeholder-uwjota-muted/50 focus:border-uwjota-gold focus:ring-1 focus:ring-uwjota-gold outline-none transition-colors px-4 py-3 text-sm ${className}`}
      {...props}
    />
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs uppercase tracking-widest text-uwjota-muted mb-2">{label}</label>}
    <select
      className={`w-full rounded-md border border-uwjota-border bg-[#0f0f0f] text-uwjota-text focus:border-uwjota-gold focus:ring-1 focus:ring-uwjota-gold outline-none px-4 py-3 text-sm ${className}`}
      {...props}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
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
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black/80 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-uwjota-card border border-uwjota-border rounded-lg text-left overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-center mb-6 border-b border-uwjota-border pb-4">
              <h3 className="text-xl font-light tracking-wide text-uwjota-text" id="modal-title">
                {title}
              </h3>
              <button onClick={onClose} className="text-uwjota-muted hover:text-uwjota-gold transition-colors">
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
  // Overriding color props to stick to the palette strictness, but mapping intent
  let style = "bg-uwjota-border text-uwjota-muted"; // default
  
  if (color === 'green') style = "text-uwjota-success border border-uwjota-success/30 bg-uwjota-success/5";
  if (color === 'red') style = "text-uwjota-error border border-uwjota-error/30 bg-uwjota-error/5";
  if (color === 'yellow' || color === 'blue') style = "text-uwjota-gold border border-uwjota-gold/30 bg-uwjota-gold/5"; // Unify attention colors to gold

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${style}`}>
      {children}
    </span>
  );
};