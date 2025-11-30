// stores/errorStore.ts
import { writable } from 'svelte/store';

type Toast = {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning';
};

const toasts = writable<Toast[]>([]);
let nextId = 0;

export const errorStore = {
  subscribe: toasts.subscribe,
  add: (message: string, type: Toast['type'] = 'error') => {
    const id = nextId++;
    toasts.update(t => [...t, { id, message, type }]);

    // Supprimer après 5 secondes
    setTimeout(() => {
      toasts.update(t => t.filter(toast => toast.id !== id));
    }, 5000);
  },
};