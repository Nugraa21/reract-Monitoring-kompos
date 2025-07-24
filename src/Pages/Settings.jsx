import { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';

const Settings = () => {
  const { thresholds, updateThresholds } = useSettingsStore();
  const [formData, setFormData] = useState({
    compostTemp: thresholds.compostTemp,
    compostVolume: thresholds.compostVolume,
    trashVolume: thresholds.trashVolume,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (success && Notification.permission === 'granted') {
      new Notification('Ambang batas diperbarui', {
        body: `Suhu Kompos: ${formData.compostTemp}°C, Volume Kompos: ${formData.compostVolume}%, Volume Sampah: ${formData.trashVolume}%`,
      });
    }
  }, [success, formData]);

  const validateInput = ({ compostTemp, compostVolume, trashVolume }) => {
    if (isNaN(compostTemp) || compostTemp < 20 || compostTemp > 60) {
      return 'Suhu kompos harus antara 20-60°C';
    }
    if (isNaN(compostVolume) || compostVolume < 0 || compostVolume > 100) {
      return 'Volume kompos harus antara 0-100%';
    }
    if (isNaN(trashVolume) || trashVolume < 0 || trashVolume > 100) {
      return 'Volume sampah harus antara 0-100%';
    }
    return '';
  };

  const handleSubmit = () => {
    const newThresholds = {
      compostTemp: parseFloat(formData.compostTemp),
      compostVolume: parseFloat(formData.compostVolume),
      trashVolume: parseFloat(formData.trashVolume),
    };

    const validationError = validateInput(newThresholds);
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    updateThresholds(newThresholds);
    setError('');
    setSuccess('Ambang batas berhasil disimpan');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    const defaultThresholds = { compostTemp: 40, compostVolume: 80, trashVolume: 80 };
    setFormData(defaultThresholds);
    updateThresholds(defaultThresholds);
    setError('');
    setSuccess('Ambang batas direset ke default');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Pengaturan Ambang Batas</h1>
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Suhu Kompos (°C)</label>
              <input
                type="number"
                value={formData.compostTemp}
                onChange={(e) => setFormData({ ...formData, compostTemp: e.target.value })}
                placeholder="Masukkan suhu (20-60°C)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('Suhu') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="20"
                max="60"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Volume Kompos (%)</label>
              <input
                type="number"
                value={formData.compostVolume}
                onChange={(e) => setFormData({ ...formData, compostVolume: e.target.value })}
                placeholder="Masukkan volume (0-100%)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('kompos') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Volume Sampah (%)</label>
              <input
                type="number"
                value={formData.trashVolume}
                onChange={(e) => setFormData({ ...formData, trashVolume: e.target.value })}
                placeholder="Masukkan volume (0-100%)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('sampah') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger font-medium">{error}</p>}
          {success && <p className="text-sm text-primary font-medium">{success}</p>}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-all duration-300"
            >
              Simpan
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              Reset ke Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
