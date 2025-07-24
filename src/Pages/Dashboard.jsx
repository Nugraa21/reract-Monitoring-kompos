import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTemperatureHigh, FaTrashAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, getDoc, setDoc } from 'firebase/firestore';

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

  useEffect(() => {
    const houseRef = doc(db, 'houses', rumahId.replace('rumah', ''));
    const unsubscribeHouse = onSnapshot(
      houseRef,
      (doc) => {
        if (doc.exists()) {
          setHouse({ id: doc.id, ...doc.data(), name: doc.data().name || `Rumah ${doc.id}` });
          console.log('Dashboard - Fetched house:', { id: doc.id, ...doc.data() });
        } else {
          setHouse(null);
          console.log(`Dashboard - House ${rumahId} not found in houses collection`);
          setError(`Rumah ${rumahId} tidak ditemukan`);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Dashboard - Error fetching house:', err);
        setError('Gagal memuat data rumah: ' + err.message);
        setIsLoading(false);
      }
    );

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
          setLatestData(data);
          console.log('Dashboard - Latest data:', data);
        } else {
          setLatestData(null);
          console.log(`Dashboard - No data found in monitoring/${rumahId}/data`);
          setError(`Tidak ada data sensor untuk ${rumahId}`);
        }
      },
      (err) => {
        console.error('Dashboard - Error fetching data:', err);
        setError('Gagal memuat data sensor: ' + err.message);
      }
    );

    return () => {
      unsubscribeHouse();
      unsubscribeData();
    };
  }, [rumahId]);

  const calculateStatus = async () => {
    if (!latestData || !house) return;

    try {
      const settingsRef = doc(db, 'settings', rumahId);
      const settingsDoc = await getDoc(settingsRef);
      const settings = settingsDoc.exists() ? settingsDoc.data() : {
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
      console.log(`Dashboard - Fetched settings for ${rumahId}:`, settings);

      const compostData = {
        suhu: parseFloat(latestData.suhu) || 0,
        volume: parseFloat(latestData.jarak1) || 0,
      };
      const trashData = { volume: parseFloat(latestData.jarak2) || 0 };

      const compostStatus =
        compostData.suhu >= settings.compostTempFull || compostData.volume >= settings.compostVolumeFull
          ? 'Penuh'
          : compostData.suhu >= settings.compostTempCheck || compostData.volume >= settings.compostVolumeCheck
          ? 'Perlu Diperiksa'
          : 'Normal';
      const trashStatus =
        trashData.volume >= settings.trashVolumeFull
          ? 'Penuh'
          : trashData.volume >= settings.trashVolumeCheck
          ? 'Perlu Diperiksa'
          : 'Normal';

      await setDoc(
        doc(db, 'houses', rumahId.replace('rumah', '')),
        {
          name: house.name,
          compostStatus,
          trashStatus,
          lastUpdated: new Date(),
        },
        { merge: true }
      );
      console.log(`Dashboard - Updated house ${rumahId} with statuses: compost=${compostStatus}, trash=${trashStatus}`);
    } catch (err) {
      console.error('Dashboard - Error calculating status:', err);
      setError('Gagal memperbarui status: ' + err.message);
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

  if (!house) {
    return <Navigate to="/" replace />;
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
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-2xl shadow-lg mb-6"
          >
            <p className="text-lg text-red-700">{error}</p>
          </motion.div>
        )}
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
              Tidak ada data sensor terbaru untuk {house.name}. Pastikan backend mengirim data ke Firestore.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;