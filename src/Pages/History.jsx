import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { FaArrowLeft } from 'react-icons/fa';
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
        const houseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      limit(50) // Batasi hingga 50 entri terbaru untuk efisiensi
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
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600">Memuat riwayat data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-red-100 p-6 rounded-xl shadow-md"
        >
          <p className="text-lg text-red-600">{error}</p>
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
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link
              to="/"
              className="mr-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md"
              aria-label="Kembali ke Beranda"
            >
              <FaArrowLeft />
            </Link>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Data Sensor</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Pilih Rumah</label>
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Pilih Rumah</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>{house.name}</option>
              ))}
            </select>
          </div>
          {selectedHouseId && historyData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b">Waktu</th>
                    <th className="p-3 border-b">Suhu (°C)</th>
                    <th className="p-3 border-b">Volume Kompos (%)</th>
                    <th className="p-3 border-b">Volume Sampah (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((data) => (
                    <tr key={data.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{data.timestamp}</td>
                      <td className="p-3 border-b">{data.suhu?.toFixed(1) || 'N/A'}</td>
                      <td className="p-3 border-b">{data.jarak1 || 'N/A'}</td>
                      <td className="p-3 border-b">{data.jarak2 || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedHouseId ? (
            <p className="text-center text-gray-600">Tidak ada riwayat data untuk rumah ini.</p>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default History;