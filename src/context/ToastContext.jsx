import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: '1.5rem', right: '1.5rem',
      zIndex: 'var(--z-toast)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const colors = {
    success: { bg: 'var(--color-success)', icon: '✓' },
    error:   { bg: 'var(--color-error)',   icon: '✕' },
    warning: { bg: 'var(--color-warning)', icon: '⚠' },
    info:    { bg: 'var(--color-primary)', icon: 'ℹ' },
  };
  const { bg, icon } = colors[toast.type] || colors.info;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        minWidth: '280px', maxWidth: '400px',
        animation: 'slideInRight 0.25s ease',
        borderLeft: `4px solid ${bg}`,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        background: bg, color: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
      }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1rem', cursor: 'pointer', padding: '0 4px' }}
        aria-label="Dismiss"
      >×</button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
