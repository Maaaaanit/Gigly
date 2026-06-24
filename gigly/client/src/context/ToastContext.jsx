import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/helpers';

const ToastContext = createContext(null);
let tid = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, type = 'default', duration = 4000 }) => {
    const id = ++tid;
    setToasts(p => [...p, { id, title, description, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  const ICONS = { success: CheckCircle, error: AlertCircle, default: Info };
  const STYLES = {
    success: 'bg-white border-green-200 [&_.icon]:text-green-500',
    error: 'bg-white border-red-200 [&_.icon]:text-red-500',
    default: 'bg-white border-gray-200 [&_.icon]:text-primary-500',
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={cn('flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up', STYLES[t.type] || STYLES.default)}>
              <Icon size={18} className="icon flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold text-gray-900">{t.title}</p>}
                {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
