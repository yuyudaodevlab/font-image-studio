'use client';

import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

export const Toast: React.FC = () => {
  const toastMessage = useAppStore((state) => state.toastMessage);
  const clearToast = useAppStore((state) => state.clearToast);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-2.5 rounded-lg glass-panel text-sm shadow-lg border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100">
      <span>{toastMessage}</span>
      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-2 font-bold"
      >
        ✕
      </button>
    </div>
  );
};
