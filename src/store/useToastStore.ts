import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  notify: (message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;
const TOAST_TTL = 5000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  notify: (message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, TOAST_TTL);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
