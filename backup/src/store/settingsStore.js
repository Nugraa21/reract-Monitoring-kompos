import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  thresholds: (() => {
    const savedThresholds = localStorage.getItem('thresholds');
    return savedThresholds
      ? JSON.parse(savedThresholds)
      : {
          compostTemp: 40,
          compostVolume: 80,
          trashVolume: 80,
        };
  })(),
  updateThresholds: (newThresholds) =>
    set((state) => {
      const updatedThresholds = { ...state.thresholds, ...newThresholds };
      localStorage.setItem('thresholds', JSON.stringify(updatedThresholds));
      return { thresholds: updatedThresholds };
    }),
}));

export default useSettingsStore;