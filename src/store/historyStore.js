import { create } from 'zustand';

const useHistoryStore = create((set) => ({
  history: (() => {
    const savedHistory = localStorage.getItem('history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  })(),
  addHistoryEntry: (entry) =>
    set((state) => {
      const newHistory = [
        ...state.history,
        {
          id: `hist${Date.now()}-${Math.random().toString(36).slice(2)}`,
          ...entry,
          timestamp: new Date().toISOString(),
        },
      ].slice(-50); // Batasi hingga 50 entri terbaru
      localStorage.setItem('history', JSON.stringify(newHistory));
      return { history: newHistory };
    }),
  clearHistory: () =>
    set(() => {
      localStorage.removeItem('history');
      return { history: [] };
    }),
}));

export default useHistoryStore;