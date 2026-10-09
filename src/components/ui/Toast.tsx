import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info', duration: number = 3200) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type, duration };

      setToasts(prev => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error', 4500), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
        {toasts.map(toast => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
              bg: 'bg-white border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/10'
            },
            error: {
              icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
              bg: 'bg-white border-rose-200 text-slate-800 shadow-lg shadow-rose-500/10'
            },
            warning: {
              icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
              bg: 'bg-white border-amber-200 text-slate-800 shadow-lg shadow-amber-500/10'
            },
            info: {
              icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
              bg: 'bg-white border-indigo-200 text-slate-800 shadow-lg shadow-indigo-500/10'
            }
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${typeConfig.bg}`}
            >
              <div className="mt-0.5">{typeConfig.icon}</div>
              <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
