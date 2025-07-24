import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [houses, setHouses] = useState([]);
  const [filterHouseId, setFilterHouseId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribeHouses = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('History - Fetched houses:', houseList);
        setHouses(houseList);
      },
      (err) => {
        console.error('History - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
      }
    );

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const historyData = [];
        const monitoringRef = collection(db, 'monitoring');
        const snapshot = await getDocs(monitoringRef);
        for (const houseDoc of snapshot.docs) {
          const houseId = houseDoc.id.replace('rumah', '');
          const dataQuery = query(collection(db, `monitoring/rumah${houseId}/data`));
          const dataSnapshot = await getDocs(dataQuery);
          const house = houses.find(h => h.id === houseId) || { name: `Rumah ${houseId}`, compostStatus: 'Normal', trashStatus: 'Normal' };
          console.log(`History - Fetched data for rumah${houseId}:`, dataSnapshot.docs.map(doc => doc.data()));
          dataSnapshot.forEach(doc => {
            const data = doc.data();
            historyData.push({
              id: doc.id,
              houseId,
              houseName: house.name,
              type: 'Kompos',
              suhu: parseFloat(data.suhu) || 0,
              volume: parseFloat(data.jarak1) || 0,
              status: house.compostStatus || 'Normal',
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
            historyData.push({
              id: doc.id + '-trash',
              houseId,
              houseName: house.name,
              type: 'Sampah',
              volume: parseFloat(data.jarak2) || 0,
              status: house.trashStatus || 'Normal',
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
          });
        }
        console.log('History - All history data:', historyData);
        setHistory(historyData.sort((a, b) => b.timestamp - a.timestamp));
        setError('');
      } catch (err) {
        console.error('History - Error fetching history:', err);
        setError('Gagal memuat riwayat data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    return () => unsubscribeHouses();
  }, [houses]);

  const filteredHistory = history.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

    return (
      (!filterHouseId || entry.houseId === filterHouseId) &&
      (!filterStatus || entry.status === filterStatus) &&
      (!fromDate || entryDate >= fromDate) &&
      (!toDate || entryDate <= toDate)
    );
  });

  const clearHistory = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
      try {
        const monitoringRef = collection(db, 'monitoring');
        const snapshot = await getDocs(monitoringRef);
        for (const houseDoc of snapshot.docs) {
          const dataQuery = collection(db, `monitoring/${houseDoc.id}/data`);
          const dataSnapshot = await getDocs(dataQuery);
          for (const doc of dataSnapshot.docs) {
            await deleteDoc(doc.ref);
            console.log(`History - Deleted document: monitoring/${houseDoc.id}/data/${doc.id}`);
          }
        }
        setHistory([]);
        console.log('History - Cleared all history');
      } catch (err) {
        console.error('History - Error clearing history:', err);
        setError('Gagal menghapus riwayat: ' + err.message);
      }
    }
  };

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  const getStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'Normal':
        return <span className={`${base} bg-green-100 text-green-700`}>{status}</span>;
      case 'Perlu Diperiksa':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>;
      case 'Penuh':
        return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-600`}>{status || 'Menunggu data'}</span>;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-8">Riwayat Sensor</h1>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-red-600">{error}</p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-lg mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Rumah</label>
              <select
                value={filterHouseId}
                onChange={(e) => setFilterHouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Semua Rumah</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Semua Status</option>
                <option value="Normal">Normal</option>
                <option value="Perlu Diperiksa">Perlu Diperiksa</option>
                <option value="Penuh">Penuh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                onClick={clearHistory}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hapus Riwayat
              </motion.button>
            </div>
          </div>
        </motion.div>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-gray-600">Memuat riwayat data...</p>
          </motion.div>
        ) : filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-gray-600">Belum ada riwayat data sensor yang sesuai. Pastikan data tersedia di Firestore.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <motion.div
                key={entry.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">🏠 Rumah</p>
                    <p className="text-base font-medium">{entry.houseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">🧪 Jenis</p>
                    <p className="text-base font-medium">{entry.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{entry.type === 'Kompos' ? '🌡️ Suhu' : '🗑️ Volume'}</p>
                    <p className="text-base font-medium">
                      {entry.type === 'Kompos' ? `${entry.suhu.toFixed(1)}°C` : `${entry.volume}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{entry.type === 'Kompos' ? '💧 Volume' : '📍 Status'}</p>
                    <p className="text-base font-medium">
                      {entry.type === 'Kompos' ? `${entry.volume}%` : getStatusBadge(entry.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">⏰ Waktu</p>
                    <p className="text-base font-medium">{formatTimestamp(entry.timestamp)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Status:</span> {getStatusBadge(entry.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;