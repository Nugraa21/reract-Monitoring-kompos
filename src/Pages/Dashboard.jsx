import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaTemperatureHigh, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, getDoc } from 'firebase/firestore';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  hover: { 
    scale: 1.05, 
    rotateX: 2, 
    rotateY: 2, 
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    transition: { duration: 0.3 }
  },
};

const Dashboard = () => {
  const { rumahId } = useParams();
  const [house, setHouse] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Inisialisasi dan validasi rumahId
  useEffect(() => {
    setIsLoading(true);
    setError('');
    if (!rumahId || !rumahId.startsWith('rumah')) {
      setError(`Format rumahId tidak valid. Harus berupa "rumahX". Diterima: ${rumahId}`);
      setIsLoading(false);
      return;
    }
  }, [rumahId]);

  // Mengambil data rumah
  useEffect(() => {
    if (error || !rumahId) return;

    const houseRef = doc(db, 'houses', rumahId);

    const unsubscribeHouse = onSnapshot(
      houseRef,
      (doc) => {
        if (doc.exists()) {
          const houseData = { id: doc.id, ...doc.data(), name: doc.data().name || rumahId.replace(/^rumah/, '') };
          setHouse(houseData);
          console.log('Dashboard - Fetched house:', houseData);
        } else {
          setError(`Rumah ${rumahId} tidak ditemukan di Firestore.`);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Dashboard - Error fetching house:', err);
        setError('Gagal memuat data rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribeHouse();
  }, [rumahId, error]);

  // Mengambil data sensor terbaru dan riwayat
  useEffect(() => {
    if (error || !rumahId) return;

    const latestDataQuery = query(
      collection(db, `monitoring/${rumahId}/data`),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const historyDataQuery = query(
      collection(db, `monitoring/${rumahId}/data`),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribeLatest = onSnapshot(
      latestDataQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setLatestData({ ...data, timestamp: data.timestamp?.toDate().toLocaleString('id-ID') || 'Tidak ada timestamp' });
          console.log('Dashboard - Latest data:', data);
        } else {
          setLatestData(null);
          setError(`Tidak ada data sensor untuk ${rumahId}.`);
        }
      },
      (err) => {
        console.error('Dashboard - Error fetching latest data:', err);
        setError('Gagal memuat data sensor: ' + err.message);
      }
    );

    const unsubscribeHistory = onSnapshot(
      historyDataQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toLocaleString('id-ID') || 'Tidak ada timestamp'
        }));
        setHistoryData(data);
        console.log('Dashboard - History data:', data);
      },
      (err) => {
        console.error('Dashboard - Error fetching history data:', err);
        setError('Gagal memuat riwayat data: ' + err.message);
      }
    );

    return () => {
      unsubscribeLatest();
      unsubscribeHistory();
    };
  }, [rumahId, error]);

  // Menghitung status secara lokal
  const calculateStatus = async () => {
    if (!latestData || !house) return;

    try {
      const settingsRef = doc(db, 'settings', rumahId);
      const settingsDoc = await getDoc(settingsRef);
      const defaultSettings = {
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
      const settings = settingsDoc.exists() ? settingsDoc.data() : defaultSettings;

      const validatedSettings = {};
      Object.keys(defaultSettings).forEach((key) => {
        validatedSettings[key] = isNaN(parseFloat(settings[key])) ? defaultSettings[key] : parseFloat(settings[key]);
      });

      const compostData = {
        suhu: parseFloat(latestData.suhu) || 0,
        volume: parseFloat(latestData.jarak1) || 0,
      };
      const trashData = { volume: parseFloat(latestData.jarak2) || 0 };

      const compostTempStatus =
        compostData.suhu >= validatedSettings.compostTempFull
          ? 'Penuh'
          : compostData.suhu >= validatedSettings.compostTempCheck
          ? 'Perlu Diperiksa'
          : 'Normal';
      const compostVolumeStatus =
        compostData.volume >= validatedSettings.compostVolumeFull
          ? 'Penuh'
          : compostData.volume >= validatedSettings.compostVolumeCheck
          ? 'Perlu Diperiksa'
          : 'Normal';
      const trashStatus =
        trashData.volume >= validatedSettings.trashVolumeFull
          ? 'Penuh'
          : trashData.volume >= validatedSettings.trashVolumeCheck
          ? 'Perlu Diperiksa'
          : 'Normal';

      setHouse(prev => ({ ...prev, compostTempStatus, compostVolumeStatus, trashStatus }));
      console.log(`Dashboard - Calculated statuses: compostTemp=${compostTempStatus}, compostVolume=${compostVolumeStatus}, trash=${trashStatus}`);
    } catch (err) {
      console.error('Dashboard - Error calculating status:', err);
      setError('Gagal menghitung status: ' + err.message);
    }
  };

  useEffect(() => {
    if (latestData && house) {
      calculateStatus();
    }
  }, [latestData, house]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl flex items-center justify-center gap-4 border border-white/30"
        >
          <FaSpinner className="animate-spin text-teal-500 text-3xl" />
          <p className="text-2xl text-gray-800 font-semibold">Memuat data dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30"
        >
          <p className="text-2xl text-red-500 font-semibold">{error || 'Rumah tidak ditemukan'}</p>
          <div className="mt-8 flex justify-center gap-6">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md"
            >
              Coba Lagi
            </button>
            <Link
              to="/"
              className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 shadow-md"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
          <div className="flex items-center mb-4 sm:mb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="mr-4"
            >
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-3 bg-white/30 backdrop-blur-md rounded-xl border border-white/20 text-gray-800 font-semibold hover:bg-gradient-to-r hover:from-indigo-600 hover:to-teal-600 hover:text-white transition-all duration-300 shadow-md"
                aria-label="Kembali ke Beranda"
              >
                <FaArrowLeft className="text-xl animate-pulse" />
                <span>Kembali</span>
              </Link>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
              Dashboard: <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">{house.name}</span>
            </h1>
          </div>
          {latestData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600"
            >
              Terakhir diperbarui: {latestData.timestamp}
            </motion.div>
          )}
        </div>
        {latestData ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30 relative overflow-hidden transform-gpu">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-teal-500/20 to-blue-500/20 opacity-50 animate-pulse" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <FaTemperatureHigh className="text-orange-500 text-3xl" />
                      <h2 className="text-2xl font-semibold text-gray-800">Kompos</h2>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Suhu</span>
                        <span className="font-semibold text-lg">{(parseFloat(latestData.suhu) || 0).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status Suhu</span>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            house.compostTempStatus === 'Normal'
                              ? 'bg-green-100 text-green-700'
                              : house.compostTempStatus === 'Perlu Diperiksa'
                              ? 'bg-yellow-100 text-yellow-700'
                              : house.compostTempStatus === 'Penuh'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {house.compostTempStatus || 'Menunggu data'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Volume</span>
                          <span className="font-semibold text-lg">{(parseFloat(latestData.jarak1) || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              (parseFloat(latestData.jarak1) || 0) >= 100 ? 'bg-red-500' :
                              (parseFloat(latestData.jarak1) || 0) >= 75 ? 'bg-yellow-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(parseFloat(latestData.jarak1) || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status Volume</span>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            house.compostVolumeStatus === 'Normal'
                              ? 'bg-green-100 text-green-700'
                              : house.compostVolumeStatus === 'Perlu Diperiksa'
                              ? 'bg-yellow-100 text-yellow-700'
                              : house.compostVolumeStatus === 'Penuh'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {house.compostVolumeStatus || 'Menunggu data'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-teal-400 opacity-20 rounded-bl-full" />
                </div>
              </motion.div>
              <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30 relative overflow-hidden transform-gpu">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-blue-500/20 opacity-50 animate-pulse" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <FaTrashAlt className="text-red-500 text-3xl" />
                      <h2 className="text-2xl font-semibold text-gray-800">Sampah</h2>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Volume</span>
                          <span className="font-semibold text-lg">{(parseFloat(latestData.jarak2) || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              (parseFloat(latestData.jarak2) || 0) >= 100 ? 'bg-red-500' :
                              (parseFloat(latestData.jarak2) || 0) >= 75 ? 'bg-yellow-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(parseFloat(latestData.jarak2) || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            house.trashStatus === 'Normal'
                              ? 'bg-green-100 text-green-700'
                              : house.trashStatus === 'Perlu Diperiksa'
                              ? 'bg-yellow-100 text-yellow-700'
                              : house.trashStatus === 'Penuh'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {house.trashStatus || 'Menunggu data'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400 to-pink-400 opacity-20 rounded-bl-full" />
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Riwayat Data Sensor</h2>
              {historyData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/50 backdrop-blur-sm">
                        <th className="p-4 border-b text-sm font-semibold text-gray-800">Waktu</th>
                        <th className="p-4 border-b text-sm font-semibold text-gray-800">Suhu (°C)</th>
                        <th className="p-4 border-b text-sm font-semibold text-gray-800">Volume Kompos (%)</th>
                        <th className="p-4 border-b text-sm font-semibold text-gray-800">Volume Sampah (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((data) => (
                        <tr key={data.id} className="hover:bg-white/20 transition-all duration-200">
                          <td className="p-4 border-b text-sm text-gray-700">{data.timestamp}</td>
                          <td className="p-4 border-b text-sm text-gray-700">{data.suhu?.toFixed(1) || 'N/A'}</td>
                          <td className="p-4 border-b text-sm text-gray-700">{data.jarak1 || 'N/A'}</td>
                          <td className="p-4 border-b text-sm text-gray-700">{data.jarak2 || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 text-lg">Tidak ada riwayat data untuk rumah ini.</p>
              )}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30"
          >
            <p className="text-xl text-gray-600 font-medium">
              Tidak ada data sensor terbaru untuk {house.name}. Pastikan perangkat terhubung dan mengirim data ke Firestore.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;