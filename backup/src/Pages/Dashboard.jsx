import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTemperatureHigh, FaTrashAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, getDoc } from 'firebase/firestore';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.03, transition: { duration: 0.2 } },
};

const Dashboard = () => {
  const { rumahId } = useParams();
  const [house, setHouse] = useState(null);
  const [latestData, setLatestData] = useState(null);
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
        setIsLoading(false); // Pastikan isLoading diatur ke false di sini
      },
      (err) => {
        console.error('Dashboard - Error fetching house:', err);
        setError('Gagal memuat data rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribeHouse();
  }, [rumahId, error]);

  // Mengambil data sensor terbaru
  useEffect(() => {
    if (error || !rumahId) return;

    const dataQuery = query(
      collection(db, `monitoring/${rumahId}/data`),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribeData = onSnapshot(
      dataQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setLatestData({ ...data, timestamp: data.timestamp?.toDate().toLocaleString('id-ID') || 'Tidak ada timestamp' });
          console.log('Dashboard - Latest data:', data);
        } else {
          setLatestData(null);
          setError(`Tidak ada data sensor untuk ${rumahId}.`);
        }
        // isLoading tidak diatur ulang di sini karena sudah ditangani di useEffect pertama
      },
      (err) => {
        console.error('Dashboard - Error fetching data:', err);
        setError('Gagal memuat data sensor: ' + err.message);
      }
    );

    return () => unsubscribeData();
  }, [rumahId, error]);

  // Menghitung status secara lokal
  const calculateStatus = () => {
    if (!latestData || !house) return;

    try {
      const settingsRef = doc(db, 'settings', rumahId);
      getDoc(settingsRef).then((settingsDoc) => {
        const defaultSettings = {
          compostTempNormal: 34,
          compostTempCheck: 39.5,
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

        const compostStatus =
          compostData.suhu >= validatedSettings.compostTempFull || compostData.volume >= validatedSettings.compostVolumeFull
            ? 'Penuh'
            : compostData.suhu >= validatedSettings.compostTempCheck || compostData.volume >= validatedSettings.compostVolumeCheck
            ? 'Perlu Diperiksa'
            : 'Normal';
        const trashStatus =
          trashData.volume >= validatedSettings.trashVolumeFull
            ? 'Penuh'
            : trashData.volume >= validatedSettings.trashVolumeCheck
            ? 'Perlu Diperiksa'
            : 'Normal';

        setHouse(prev => ({ ...prev, compostStatus, trashStatus }));
        console.log(`Dashboard - Calculated statuses locally: compost=${compostStatus}, trash=${trashStatus}`);
      }).catch((err) => {
        console.error('Dashboard - Error fetching settings:', err);
        setError('Gagal memuat pengaturan: ' + err.message);
      });
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
      <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-white rounded-2xl shadow-lg"
          >
            <p className="text-lg text-gray-600">Memuat data dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-2xl shadow-lg"
          >
            <p className="text-lg text-red-700">{error || 'Rumah tidak ditemukan'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Coba Lagi
            </button>
            <Link
              to="/"
              className="mt-4 ml-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-10">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link
              to="/"
              className="mr-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md"
              aria-label="Kembali ke Beranda"
            >
              <FaArrowLeft />
            </Link>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Dashboard: <span className="text-green-700">{house.name}</span>
          </h1>
        </div>
        {latestData ? (
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaTemperatureHigh className="text-orange-500 text-xl" />
                  <h2 className="text-lg font-semibold text-gray-800">Kompos</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Suhu</span>
                    <span className="font-medium">{(parseFloat(latestData.suhu) || 0).toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume</span>
                    <span className="font-medium">{(parseFloat(latestData.jarak1) || 0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        house.compostStatus === 'Normal'
                          ? 'bg-green-100 text-green-700'
                          : house.compostStatus === 'Perlu Diperiksa'
                          ? 'bg-yellow-100 text-yellow-700'
                          : house.compostStatus === 'Penuh'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {house.compostStatus || 'Menunggu data'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaTrashAlt className="text-red-500 text-xl" />
                  <h2 className="text-lg font-semibold text-gray-800">Sampah</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Volume</span>
                    <span className="font-medium">{(parseFloat(latestData.jarak2) || 0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-white rounded-2xl shadow-lg"
          >
            <p className="text-lg text-gray-600">
              Tidak ada data sensor terbaru untuk {house.name}. Pastikan perangkat terhubung dan mengirim data ke Firestore.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
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