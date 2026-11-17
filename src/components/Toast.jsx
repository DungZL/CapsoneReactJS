import React, { useEffect, useState } from 'react';

// Lightweight notification system replacing alert(): call toast('...') anywhere,
// <Toaster /> (placed in HomeTemplate) shows it and hides it after a few seconds.
const DURATION = 3500;
let listeners = [];
let nextId = 1;

export function toast(message, type = 'info') {
  const item = { id: nextId++, message: String(message), type };
  listeners.forEach((fn) => fn(item));
}

toast.success = (message) => toast(message, 'success');
toast.error = (message) => toast(message, 'error');

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  info: 'fa-circle-info',
};

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const add = (item) => {
      setItems((prev) => [...prev.slice(-2), item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, DURATION);
    };
    listeners.push(add);
    return () => {
      listeners = listeners.filter((fn) => fn !== add);
    };
  }, []);

  const dismiss = (id) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i className={`fa-solid ${ICONS[t.type] || ICONS.info}`} aria-hidden="true"></i>
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Close notification"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
