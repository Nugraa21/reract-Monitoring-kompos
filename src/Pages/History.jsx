import { useState } from 'react';
import useHistoryStore from '../store/historyStore';
import useHouseStore from '../store/houseStore';

const History = () => {
  const { history, clearHistory } = useHistoryStore();
  const { houses } = useHouseStore();

  const [filterHouseId, setFilterHouseId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
        return <span className={`${base} bg-gray-100 text-gray-600`}>{status}</span>;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Riwayat Sensor</h1>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Rumah</label>
              <select
                value={filterHouseId}
                onChange={(e) => setFilterHouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearHistory}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Hapus Riwayat
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">Belum ada riwayat data sensor yang sesuai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                      {entry.type === 'Kompos' ? `${entry.suhu}°C` : `${entry.volume}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{entry.type === 'Kompos' ? '💧 Volume' : '📍 Status'}</p>
                    <p className="text-base font-medium">
                      {entry.type === 'Kompos' ? `${entry.volume}%` : getStatusBadge(entry.status)}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-500">⏰ Waktu</p>
                    <p className="text-base font-medium">{formatTimestamp(entry.timestamp)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Status:</span> {getStatusBadge(entry.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
