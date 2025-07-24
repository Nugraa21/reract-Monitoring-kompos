import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

const Settings = () => {
  const [houses, setHouses] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [formData, setFormData] = useState({
    compostTempNormal: 30,
    compostTempCheck: 35,
    compostTempFull: 40,
    compostVolumeNormal: 50,
    compostVolumeCheck: 65,
    compostVolumeFull: 80,
    trashVolumeNormal: 50,
    trashVolumeCheck: 65,
    trashVolumeFull: 80,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Settings - Fetched houses:', houseList);
        setHouses(houseList);
        if (houseList.length > 0 && !selectedHouseId) {
          setSelectedHouseId(houseList[0].id);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Settings - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedHouseId) {
      const settingsRef = doc(db, 'settings', `rumah${selectedHouseId}`);
      getDoc(settingsRef).then((doc) => {
        if (doc.exists()) {
          setFormData(doc.data());
          console.log(`Settings - Fetched settings for rumah${selectedHouseId}:`, doc.data());
        } else {
          setFormData({
            compostTempNormal: 30,
            compostTempCheck: 35,
            compostTempFull: 40,
            compostVolumeNormal: 50,
            compostVolumeCheck: 65,
            compostVolumeFull: 80,
            trashVolumeNormal: 50,
            trashVolumeCheck: 65,
            trashVolumeFull: 80,
          });
          console.log(`Settings - No settings found for rumah${selectedHouseId}, using defaults`);
        }
      }).catch((err) => {
        console.error('Settings - Error fetching settings:', err);
        setError('Gagal memuat pengaturan: ' + err.message);
      });
    }
  }, [selectedHouseId]);

  const validateInput = ({
    compostTempNormal,
    compostTempCheck,
    compostTempFull,
    compostVolumeNormal,
    compostVolumeCheck,
    compostVolumeFull,
    trashVolumeNormal,
    trashVolumeCheck,
    trashVolumeFull,
  }) => {
    const tempNormal = parseFloat(compostTempNormal);
    const tempCheck = parseFloat(compostTempCheck);
    const tempFull = parseFloat(compostTempFull);
    const compVolNormal = parseFloat(compostVolumeNormal);
    const compVolCheck = parseFloat(compostVolumeCheck);
    const compVolFull = parseFloat(compostVolumeFull);
    const trashVolNormal = parseFloat(trashVolumeNormal);
    const trashVolCheck = parseFloat(trashVolumeCheck);
    const trashVolFull = parseFloat(trashVolumeFull);

    if (isNaN(tempNormal) || tempNormal < 20 || tempNormal > 60) {
      return 'Suhu kompos (Normal) harus antara 20-60°C';
    }
    if (isNaN(tempCheck) || tempCheck < 20 || tempCheck > 60 || tempCheck <= tempNormal) {
      return 'Suhu kompos (Perlu Diperiksa) harus lebih besar dari Normal dan antara 20-60°C';
    }
    if (isNaN(tempFull) || tempFull < 20 || tempFull > 60 || tempFull <= tempCheck) {
      return 'Suhu kompos (Penuh) harus lebih besar dari Perlu Diperiksa dan antara 20-60°C';
    }
    if (isNaN(compVolNormal) || compVolNormal < 0 || compVolNormal > 100) {
      return 'Volume kompos (Normal) harus antara 0-100%';
    }
    if (isNaN(compVolCheck) || compVolCheck < 0 || compVolCheck > 100 || compVolCheck <= compVolNormal) {
      return 'Volume kompos (Perlu Diperiksa) harus lebih besar dari Normal dan antara 0-100%';
    }
    if (isNaN(compVolFull) || compVolFull < 0 || compVolFull > 100 || compVolFull <= compVolCheck) {
      return 'Volume kompos (Penuh) harus lebih besar dari Perlu Diperiksa dan antara 0-100%';
    }
    if (isNaN(trashVolNormal) || trashVolNormal < 0 || trashVolNormal > 100) {
      return 'Volume sampah (Normal) harus antara 0-100%';
    }
    if (isNaN(trashVolCheck) || trashVolCheck < 0 || trashVolCheck > 100 || trashVolCheck <= trashVolNormal) {
      return 'Volume sampah (Perlu Diperiksa) harus lebih besar dari Normal dan antara 0-100%';
    }
    if (isNaN(trashVolFull) || trashVolFull < 0 || trashVolFull > 100 || trashVolFull <= trashVolCheck) {
      return 'Volume sampah (Penuh) harus lebih besar dari Perlu Diperiksa dan antara 0-100%';
    }
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!selectedHouseId) {
      setError('Pilih rumah terlebih dahulu');
      return;
    }
    const newThresholds = {
      compostTempNormal: parseFloat(formData.compostTempNormal),
      compostTempCheck: parseFloat(formData.compostTempCheck),
      compostTempFull: parseFloat(formData.compostTempFull),
      compostVolumeNormal: parseFloat(formData.compostVolumeNormal),
      compostVolumeCheck: parseFloat(formData.compostVolumeCheck),
      compostVolumeFull: parseFloat(formData.compostVolumeFull),
      trashVolumeNormal: parseFloat(formData.trashVolumeNormal),
      trashVolumeCheck: parseFloat(formData.trashVolumeCheck),
      trashVolumeFull: parseFloat(formData.trashVolumeFull),
    };

    const validationError = validateInput(newThresholds);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await setDoc(doc(db, 'settings', `rumah${selectedHouseId}`), newThresholds);
      setSuccess('Pengaturan ambang batas berhasil disimpan');
      console.log(`Settings - Saved settings for rumah${selectedHouseId}:`, newThresholds);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Settings - Error saving settings:', err);
      setError('Gagal menyimpan pengaturan: ' + err.message);
    }
  };

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!selectedHouseId) {
      setError('Pilih rumah terlebih dahulu');
      return;
    }
    const defaultThresholds = {
      compostTempNormal: 30,
      compostTempCheck: 35,
      compostTempFull: 40,
      compostVolumeNormal: 50,
      compostVolumeCheck: 65,
      compostVolumeFull: 80,
      trashVolumeNormal: 50,
      trashVolumeCheck: 65,
      trashVolumeFull: 80,
    };
    setFormData(defaultThresholds);
    try {
      await setDoc(doc(db, 'settings', `rumah${selectedHouseId}`), defaultThresholds);
      setSuccess('Pengaturan direset ke default');
      console.log(`Settings - Reset settings for rumah${selectedHouseId} to defaults`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Settings - Error resetting settings:', err);
      setError('Gagal mereset pengaturan: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Pengaturan Ambang Batas Rumah</h1>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-red-600">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-green-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-green-600">{success}</p>
          </motion.div>
        )}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-lg text-gray-600">Memuat daftar rumah...</p>
          </motion.div>
        ) : houses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-lg text-gray-600">Tidak ada rumah terdeteksi. Pastikan backend berjalan.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg space-y-6"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-1">Pilih Rumah</label>
              <select
                value={selectedHouseId}
                onChange={(e) => {
                  setSelectedHouseId(e.target.value);
                  console.log('Settings - Selected house ID:', e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Pilih Rumah</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
            </div>
            {selectedHouseId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Suhu Kompos (°C)</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Normal</label>
                        <input
                          type="number"
                          value={formData.compostTempNormal}
                          onChange={(e) => setFormData({ ...formData, compostTempNormal: e.target.value })}
                          placeholder="20-60°C"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('Suhu') && error.includes('Normal') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="20"
                          max="60"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                        <input
                          type="number"
                          value={formData.compostTempCheck}
                          onChange={(e) => setFormData({ ...formData, compostTempCheck: e.target.value })}
                          placeholder="20-60°C"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('Suhu') && error.includes('Perlu Diperiksa') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="20"
                          max="60"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                        <input
                          type="number"
                          value={formData.compostTempFull}
                          onChange={(e) => setFormData({ ...formData, compostTempFull: e.target.value })}
                          placeholder="20-60°C"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('Suhu') && error.includes('Penuh') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="20"
                          max="60"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Volume Kompos (%)</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Normal</label>
                        <input
                          type="number"
                          value={formData.compostVolumeNormal}
                          onChange={(e) => setFormData({ ...formData, compostVolumeNormal: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('kompos') && error.includes('Normal') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                        <input
                          type="number"
                          value={formData.compostVolumeCheck}
                          onChange={(e) => setFormData({ ...formData, compostVolumeCheck: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('kompos') && error.includes('Perlu Diperiksa') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                        <input
                          type="number"
                          value={formData.compostVolumeFull}
                          onChange={(e) => setFormData({ ...formData, compostVolumeFull: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('kompos') && error.includes('Penuh') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Volume Sampah (%)</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Normal</label>
                        <input
                          type="number"
                          value={formData.trashVolumeNormal}
                          onChange={(e) => setFormData({ ...formData, trashVolumeNormal: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('sampah') && error.includes('Normal') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                        <input
                          type="number"
                          value={formData.trashVolumeCheck}
                          onChange={(e) => setFormData({ ...formData, trashVolumeCheck: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('sampah') && error.includes('Perlu Diperiksa') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                        <input
                          type="number"
                          value={formData.trashVolumeFull}
                          onChange={(e) => setFormData({ ...formData, trashVolumeFull: e.target.value })}
                          placeholder="0-100%"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                            error.includes('sampah') && error.includes('Penuh') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Simpan
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset ke Default
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;