import { useState, useEffect } from 'react';

const toasts = [];
let listeners = [];

export function toast(message, type = 'info') {
  const id = Date.now();
  toasts.push({ id, message, type });
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx > -1) {
      toasts.splice(idx, 1);
      listeners.forEach(fn => fn([...toasts]));
    }
  }, 4000);
}

toast.success = (msg) => toast(msg, 'success');
toast.error = (msg) => toast(msg, 'error');

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => setItems([...newToasts]);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium min-w-[280px] flex items-center gap-3 animate-slide-in ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-gray-700'
          }`}
        >
          <span className="text-xl">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
