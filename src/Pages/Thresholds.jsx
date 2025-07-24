import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';

const Thresholds = () => {
  const [houses, setHouses] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [thresholds, setThresholds] = useState({
    compostTempNormal: 25,
    compostTempCheck: 32.5,
    compostTempFull: 40,
    compostVolumeNormal: 50,
    compostVolumeCheck: 75,
    compostVolumeFull: 100,
    trashVolumeNormal: 50,
    trashVolumeCheck: 75,
    trashVolumeFull: 100,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Thresholds - Fetched houses:', houseList);
        setHouses(houseList);
        if (houseList.length > 0 && !selectedHouseId) {
          setSelectedHouseId(houseList[0].id);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Thresholds - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const applyAutomaticThresholds = () => {
    const autoThresholds = {
      compostTempNormal: 25,
      compostTempCheck: 32.5,
      compostTempFull: 40,
      compostVolumeNormal: 50,
      compostVolumeCheck: 75,
      compostVolumeFull: 100,
      trashVolumeNormal: 50,
      trashVolumeCheck: 75,
      trashVolumeFull: 100,
    };
    setThresholds(autoThresholds);
    console.log('Thresholds - Applied automatic thresholds:', autoThresholds);
    return autoThresholds;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!selectedHouseId) {
      setError('Pilih rumah terlebih dahulu');
      return;
    }
    if (!window.confirm('Simpan ambang batas otomatis untuk rumah ini?')) {
      return;
    }
    try {
      const autoThresholds = applyAutomaticThresholds();
      await setDoc(doc(db, 'settings', `rumah${selectedHouseId}`), autoThresholds);
      setSuccess('Ambang batas otomatis berhasil disimpan');
      console.log(`Thresholds - Saved automatic thresholds for rumah${selectedHouseId}:`, autoThresholds);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Thresholds - Error saving thresholds:', err);
      setError('Gagal menyimpan ambang batas: ' + err.message);
    }
  };

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!selectedHouseId) {
      setError('Pilih rumah terlebih dahulu');
      return;
    }
    if (!window.confirm('Reset ambang batas ke default otomatis untuk rumah ini?')) {
      return;
    }
    try {
      const defaultThresholds = applyAutomaticThresholds();
      await setDoc(doc(db, 'settings', `rumah${selectedHouseId}`), defaultThresholds);
      setSuccess('Ambang batas direset ke default otomatis');
      console.log(`Thresholds - Reset thresholds for rumah${selectedHouseId} to defaults`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Thresholds - Error resetting thresholds:', err);
      setError('Gagal mereset ambang batas: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen flex flex-col items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-green-700 mb-8 text-center"
        >
          Pengaturan Ambang Batas
        </motion.h1>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-2xl shadow-lg mb-6"
          >
            <p className="text-lg text-red-700">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-green-100 rounded-2xl shadow-lg mb-6"
          >
            <p className="text-lg text-green-700">{success}</p>
          </motion.div>
        )}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-600">Memuat daftar rumah...</p>
          </motion.div>
        ) : houses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-600">Tidak ada rumah terdeteksi. Pastikan backend berjalan.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-2xl space-y-6"
          >
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-lg">Pilih Rumah</label>
              <select
                value={selectedHouseId}
                onChange={(e) => {
                  setSelectedHouseId(e.target.value);
                  console.log('Thresholds - Selected house ID:', e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="">Pilih Rumah</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
              <span className="absolute top-0 right-0 text-sm text-gray-500">Pilih rumah untuk mengatur ambang batas</span>
            </div>
            {selectedHouseId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Suhu Kompos (°C)</h3>
                    <div className="space-y-3 text-gray-700">
                      <p>Normal: <span className="font-medium">{thresholds.compostTempNormal}°C</span></p>
                      <p>Perlu Diperiksa: <span className="font-medium">{thresholds.compostTempCheck}°C</span></p>
                      <p>Penuh: <span className="font-medium">{thresholds.compostTempFull}°C</span></p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Kompos (%)</h3>
                    <div className="space-y-3 text-gray-700">
                      <p>Normal: <span className="font-medium">{thresholds.compostVolumeNormal}%</span></p>
                      <p>Perlu Diperiksa: <span className="font-medium">{thresholds.compostVolumeCheck}%</span></p>
                      <p>Penuh: <span className="font-medium">{thresholds.compostVolumeFull}%</span></p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Sampah (%)</h3>
                    <div className="space-y-3 text-gray-700">
                      <p>Normal: <span className="font-medium">{thresholds.trashVolumeNormal}%</span></p>
                      <p>Perlu Diperiksa: <span className="font-medium">{thresholds.trashVolumeCheck}%</span></p>
                      <p>Penuh: <span className="font-medium">{thresholds.trashVolumeFull}%</span></p>
                    </div>
                  </motion.div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Simpan ambang batas otomatis ke Firestore"
                  >
                    Simpan Ambang Batas
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Reset ke ambang batas otomatis default"
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

export default Thresholds;