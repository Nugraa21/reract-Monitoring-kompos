import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const History = () => {
  const [houses, setHouses] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribeHouses = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || doc.id.replace(/^rumah/, '')
        }));
        setHouses(houseList);
        if (houseList.length > 0 && !selectedHouseId) {
          setSelectedHouseId(houseList[0].id);
        }
      },
      (err) => {
        console.error('History - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
      }
    );

    return () => unsubscribeHouses();
  }, []);

  useEffect(() => {
    if (!selectedHouseId) return;

    setIsLoading(true);
    setError('');
    const q = query(
      collection(db, `monitoring/${selectedHouseId}/data`),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribeData = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toLocaleString('id-ID') || 'Tidak ada timestamp'
        }));
        setHistoryData(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('History - Error fetching data:', err);
        setError('Gagal memuat riwayat data: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribeData();
  }, [selectedHouseId]);

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
          <p className="text-2xl text-gray-800 font-semibold">Memuat riwayat data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30"
        >
          <p className="text-2xl text-red-500 font-semibold">{error}</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
          <div className="flex items-center mb-4 sm:mb-0">
            {/* <motion.div
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
            </motion.div> */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
              Riwayat Data Sensor
            </h1>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30"
        >
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Pilih Rumah</label>
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="w-full max-w-md bg-white/30 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300"
            >
              <option value="" disabled>Pilih Rumah</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>{house.name}</option>
              ))}
            </select>
          </div>
          {selectedHouseId && historyData.length > 0 ? (
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
                      <td className="p-4 border-b text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{data.jarak1 || 'N/A'}</span>
                          {data.jarak1 && (
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  parseFloat(data.jarak1) >= 100 ? 'bg-red-500' :
                                  parseFloat(data.jarak1) >= 75 ? 'bg-yellow-500' : 'bg-teal-500'
                                }`}
                                style={{ width: `${Math.min(parseFloat(data.jarak1) || 0, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{data.jarak2 || 'N/A'}</span>
                          {data.jarak2 && (
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  parseFloat(data.jarak2) >= 100 ? 'bg-red-500' :
                                  parseFloat(data.jarak2) >= 75 ? 'bg-yellow-500' : 'bg-teal-500'
                                }`}
                                style={{ width: `${Math.min(parseFloat(data.jarak2) || 0, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedHouseId ? (
            <p className="text-center text-gray-600 text-lg">Tidak ada riwayat data untuk rumah ini.</p>
          ) : (
            <p className="text-center text-gray-600 text-lg">Silakan pilih rumah untuk melihat riwayat data.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;