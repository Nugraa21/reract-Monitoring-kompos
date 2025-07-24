import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, getDocs, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';

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
        const houseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || `Rumah ${doc.id}`,
        }));
        console.log('History - Fetched houses:', houseList);
        setHouses(houseList);
        setIsLoading(false);
      },
      (err) => {
        console.error('History - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
        setIsLoading(false);
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
          const settingsRef = doc(db, 'settings', `rumah${houseId}`);
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
          console.log(`History - Fetched settings for rumah${houseId}:`, settings);

          const dataQuery = query(collection(db, `monitoring/rumah${houseId}/data`));
          const dataSnapshot = await getDocs(dataQuery);
          const house = houses.find(h => h.id === houseId) || { name: `Rumah ${houseId}` };

          dataSnapshot.forEach(doc => {
            const data = doc.data();
            const suhu = parseFloat(data.suhu) || 0;
            const jarak1 = parseFloat(data.jarak1) || 0;
            const jarak2 = parseFloat(data.jarak2) || 0;

            const compostStatus =
              suhu >= settings.compostTempFull || jarak1 >= settings.compostVolumeFull
                ? 'Penuh'
                : suhu >= settings.compostTempCheck || jarak1 >= settings.compostVolumeCheck
                ? 'Perlu Diperiksa'
                : 'Normal';
            const trashStatus =
              jarak2 >= settings.trashVolumeFull
                ? 'Penuh'
                : jarak2 >= settings.trashVolumeCheck
                ? 'Perlu Diperiksa'
                : 'Normal';

            historyData.push({
              id: doc.id,
              houseId,
              houseName: house.name,
              type: 'Kompos',
              suhu,
              volume: jarak1,
              status: compostStatus,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            });
            historyData.push({
              id: doc.id + '-trash',
              houseId,
              houseName: house.name,
              type: 'Sampah',
              volume: jarak2,
              status: trashStatus,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
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

    if (houses.length > 0) {
      fetchHistory();
    }

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
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
      return;
    }
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
      setSuccess('Riwayat berhasil dihapus');
      console.log('History - Cleared all history');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('History - Error clearing history:', err);
      setError('Gagal menghapus riwayat: ' + err.message);
    }
  };

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  const getStatusBadge = (status) => {
    const base = 'inline-block px-3 py-1 rounded-full text-sm font-medium';
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
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-green-700 mb-8"
        >
          Riwayat Sensor
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Rumah</label>
              <select
                value={filterHouseId}
                onChange={(e) => setFilterHouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                onClick={clearHistory}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Hapus semua riwayat sensor"
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
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-600">Memuat riwayat data...</p>
          </motion.div>
        ) : houses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-600">Tidak ada rumah terdeteksi. Pastikan backend berjalan.</p>
          </motion.div>
        ) : filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-600">Belum ada riwayat data sensor yang sesuai. Pastikan data tersedia di Firestore.</p>
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
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">🏠 Rumah</p>
                    <p className="text-base font-medium text-gray-800">{entry.houseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">🧪 Jenis</p>
                    <p className="text-base font-medium text-gray-800">{entry.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{entry.type === 'Kompos' ? '🌡️ Suhu' : '🗑️ Volume'}</p>
                    <p className="text-base font-medium text-gray-800">
                      {entry.type === 'Kompos' ? `${entry.suhu.toFixed(1)}°C` : `${entry.volume}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{entry.type === 'Kompos' ? '💧 Volume' : '📍 Status'}</p>
                    <p className="text-base font-medium text-gray-800">
                      {entry.type === 'Kompos' ? `${entry.volume}%` : getStatusBadge(entry.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">⏰ Waktu</p>
                    <p className="text-base font-medium text-gray-800">{formatTimestamp(entry.timestamp)}</p>
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