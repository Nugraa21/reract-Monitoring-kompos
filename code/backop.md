grog bisa simpan ini dulu 

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './Pages/Home';
import History from './Pages/History';
import Koneksi from './Pages/Koneksi';
import Settings from './Pages/Settings';
import Dashboard from './Pages/Dashboard';
import { useState } from 'react';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <BrowserRouter>
      <div className={`pb-16 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-16'} min-h-screen transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/koneksi" element={<Koneksi />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard/:rumahId" element={<Dashboard />} />
        </Routes>
      </div>
      <NavBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </BrowserRouter>
  );
};

export default App;

import { useParams, Link, Navigate } from 'react-router-dom';
import { FaArrowLeft, FaTemperatureHigh, FaTrashAlt } from 'react-icons/fa';
import useHouseStore from '../store/houseStore';

const Dashboard = () => {
  const { rumahId } = useParams();
  const { houses, connectionStatus } = useHouseStore();
 
  const house = houses.find((house) => house.id === rumahId);

  if (!house) {
    return <Navigate to="/" replace />;
  }

  const compostData = house.compostData || { suhu: 0, volume: 0 };
  const trashData = house.trashData || { volume: 0 };
  const compostStatus = house.compostStatus || 'Normal';
  const trashStatus = house.trashStatus || 'Normal';

  const getStatusBadge = (status) => {
    let color = '';
    switch (status) {
      case 'Normal':
        color = 'bg-green-100 text-green-700';
        break;
      case 'Perlu Diperiksa':
        color = 'bg-yellow-100 text-yellow-700';
        break;
      case 'Penuh':
        color = 'bg-red-100 text-red-700';
        break;
      default:
        color = 'bg-gray-100 text-gray-700';
        break;
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-10">
          <Link
            to="/"
            className="mr-4 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
            aria-label="Kembali ke Beranda"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Dashboard: <span className="text-green-600">{house.name}</span>
          </h1>
        </div>
        <div className="mb-6">
          <p className="text-base font-medium text-gray-700">
            Status Koneksi MQTT:{' '}
            <span
              className={`font-semibold ${
                connectionStatus === 'connected'
                  ? 'text-primary'
                  : connectionStatus === 'connecting'
                  ? 'text-warning'
                  : 'text-danger'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'Terhubung'
                : connectionStatus === 'connecting'
                ? 'Menghubungkan'
                : 'Terputus'}
            </span>
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaTemperatureHigh className="text-orange-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-700">Kompos</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Suhu</span>
                <span className="font-medium">{compostData.suhu.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="font-medium">{compostData.volume}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status</span>
                {getStatusBadge(compostStatus)}
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaTrashAlt className="text-red-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-700">Sampah</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="font-medium">{trashData.volume}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status</span>
                {getStatusBadge(trashStatus)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import useHouseStore from '../store/houseStore';

const Home = () => {
  const { houses, addHouse, editHouse, deleteHouse } = useHouseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');
  const [editHouseId, setEditHouseId] = useState(null);
  const [error, setError] = useState('');

  const handleAddHouse = () => {
    const result = editHouseId
      ? editHouse(editHouseId, newHouseName)
      : addHouse(newHouseName);

    if (result?.error) {
      setError(result.error);
    } else {
      setNewHouseName('');
      setEditHouseId(null);
      setIsModalOpen(false);
      setError('');
    }
  };

  const handleDeleteHouse = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rumah ini?')) {
      deleteHouse(id);
    }
  };

  const handleEditHouse = (house) => {
    setNewHouseName(house.name);
    setEditHouseId(house.id);
    setIsModalOpen(true);
    setError('');
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Daftar Rumah</h1>
          <button
            onClick={() => {
              setNewHouseName('');
              setEditHouseId(null);
              setIsModalOpen(true);
              setError('');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
          >
            <FaPlus /> Tambah Rumah
          </button>
        </div>

        {/* List Rumah */}
        {houses.length === 0 ? (
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <p className="text-lg text-gray-600">
              Tidak ada rumah yang terdaftar. Silakan tambahkan rumah baru.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {houses.map((house) => (
              <div
                key={house.id}
                className="relative group p-5 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300"
              >
                <Link to={`/dashboard/${house.id}`} className="block space-y-3">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:underline">
                    {house.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* Status Kompos */}
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium">Kompos</p>
                      <p
                        className={`font-semibold ${
                          house.compostStatus === 'Normal'
                            ? 'text-green-600'
                            : house.compostStatus === 'Perlu Diperiksa'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {house.compostStatus}
                      </p>
                    </div>
                    {/* Status Sampah */}
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium">Sampah</p>
                      <p
                        className={`font-semibold ${
                          house.trashStatus === 'Normal'
                            ? 'text-green-600'
                            : house.trashStatus === 'Perlu Diperiksa'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {house.trashStatus}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Tombol Aksi Edit/Hapus */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEditHouse(house)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-green-100 text-green-600"
                    aria-label={`Edit ${house.name}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteHouse(house.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-600"
                    aria-label={`Hapus ${house.name}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah/Edit Rumah */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {editHouseId ? 'Edit Rumah' : 'Tambah Rumah'}
              </h2>
              <input
                type="text"
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                placeholder="Nama Rumah (maks. 50 karakter)"
                maxLength={50}
                className={`w-full p-3 rounded-lg border mb-4 focus:outline-none focus:ring-2 ${
                  error ? 'border-red-500 focus:ring-red-400' : 'focus:ring-green-400'
                }`}
              />
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleAddHouse}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setNewHouseName('');
                    setEditHouseId(null);
                    setIsModalOpen(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useHouseStore from '../store/houseStore';

const Koneksi = () => {
  const navigate = useNavigate();
  const { setBrokerSettings, connectionError } = useHouseStore();
  const [formData, setFormData] = useState({
    broker: 'broker.hivemq.com',
    port: '8000',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const validateInput = () => {
    const { broker, port } = formData;
    if (!broker.trim()) {
      return 'Broker tidak boleh kosong';
    }
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return 'Port harus angka antara 1-65535';
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(broker)) {
      return 'Broker hanya boleh berisi huruf, angka, titik, atau tanda hubung';
    }
    return '';
  };

  const handleSave = () => {
    const validationError = validateInput();
    if (validationError) {
      useHouseStore.setState({ connectionError: validationError });
      setSuccessMessage('');
      return;
    }
    const portNum = parseInt(formData.port, 10);
    console.log('Saving MQTT settings:', { broker: formData.broker, port: portNum });
    setBrokerSettings(formData.broker, portNum);
    localStorage.setItem('mqttBroker', formData.broker);
    localStorage.setItem('mqttPort', formData.port);
    setSuccessMessage('Pengaturan MQTT berhasil disimpan.');
    setTimeout(() => setSuccessMessage(''), 3000); // Hilangkan pesan setelah 3 detik
  };

  useEffect(() => {
    const savedBroker = localStorage.getItem('mqttBroker') || 'broker.hivemq.com';
    const savedPort = localStorage.getItem('mqttPort') || '8000';
    setFormData({ broker: savedBroker, port: savedPort });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col md:flex-row md:gap-8 md:justify-center">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-primary mb-8">Koneksi MQTT</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Atur Koneksi MQTT</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Broker
              </label>
              <input
                type="text"
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                placeholder="Masukkan broker (contoh: broker.hivemq.com)"
                className={`border p-3 w-full rounded-lg focus:outline-none focus:ring-2 ${
                  connectionError.includes('Broker') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="Masukkan port (contoh: 8000)"
                className={`border p-3 w-full rounded-lg focus:outline-none focus:ring-2 ${
                  connectionError.includes('Port') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="1"
                max="65535"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                value="iot/monitoring"
                disabled
                className="border p-3 w-full rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            {successMessage && <p className="text-sm text-primary">{successMessage}</p>}
            {connectionError && <p className="text-sm text-danger">{connectionError}</p>}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                Simpan
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Koneksi;

import { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';

const Settings = () => {
  const { thresholds, updateThresholds } = useSettingsStore();
  const [formData, setFormData] = useState({
    compostTemp: thresholds.compostTemp,
    compostVolume: thresholds.compostVolume,
    trashVolume: thresholds.trashVolume,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (success && Notification.permission === 'granted') {
      new Notification('Ambang batas diperbarui', {
        body: `Suhu Kompos: ${formData.compostTemp}°C, Volume Kompos: ${formData.compostVolume}%, Volume Sampah: ${formData.trashVolume}%`,
      });
    }
  }, [success, formData]);

  const validateInput = ({ compostTemp, compostVolume, trashVolume }) => {
    if (isNaN(compostTemp) || compostTemp < 20 || compostTemp > 60) {
      return 'Suhu kompos harus antara 20-60°C';
    }
    if (isNaN(compostVolume) || compostVolume < 0 || compostVolume > 100) {
      return 'Volume kompos harus antara 0-100%';
    }
    if (isNaN(trashVolume) || trashVolume < 0 || trashVolume > 100) {
      return 'Volume sampah harus antara 0-100%';
    }
    return '';
  };

  const handleSubmit = () => {
    const newThresholds = {
      compostTemp: parseFloat(formData.compostTemp),
      compostVolume: parseFloat(formData.compostVolume),
      trashVolume: parseFloat(formData.trashVolume),
    };

    const validationError = validateInput(newThresholds);
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    updateThresholds(newThresholds);
    setError('');
    setSuccess('Ambang batas berhasil disimpan');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    const defaultThresholds = { compostTemp: 40, compostVolume: 80, trashVolume: 80 };
    setFormData(defaultThresholds);
    updateThresholds(defaultThresholds);
    setError('');
    setSuccess('Ambang batas direset ke default');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Pengaturan Ambang Batas</h1>
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Suhu Kompos (°C)</label>
              <input
                type="number"
                value={formData.compostTemp}
                onChange={(e) => setFormData({ ...formData, compostTemp: e.target.value })}
                placeholder="Masukkan suhu (20-60°C)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('Suhu') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="20"
                max="60"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Volume Kompos (%)</label>
              <input
                type="number"
                value={formData.compostVolume}
                onChange={(e) => setFormData({ ...formData, compostVolume: e.target.value })}
                placeholder="Masukkan volume (0-100%)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('kompos') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Volume Sampah (%)</label>
              <input
                type="number"
                value={formData.trashVolume}
                onChange={(e) => setFormData({ ...formData, trashVolume: e.target.value })}
                placeholder="Masukkan volume (0-100%)"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  error.includes('sampah') ? 'border-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger font-medium">{error}</p>}
          {success && <p className="text-sm text-primary font-medium">{success}</p>}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-all duration-300"
            >
              Simpan
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              Reset ke Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;




ini simpan dulu semuanya ini code web aku aku mau kasih perbahan di codenya 

ono cpde backend 
dari server aku 

code ini menerima data dari mqtt lalu di kirim ke firebase 

import mqtt from 'mqtt';
import admin from 'firebase-admin';
import fs from 'fs';
import chalk from 'chalk';
import readline from 'readline';
import process from 'process';

// === Inisialisasi Firebase Admin SDK ===
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// === Daftar Broker MQTT Publik ===
const publicMqttBrokers = [
  { name: "HiveMQ Public Broker", url: "mqtt://broker.hivemq.com", port: "1883", tls: "8883", ws: "8000" },
  { name: "Mosquitto Test Server", url: "mqtt://test.mosquitto.org", port: "1883", tls: "8883", ws: "8080" },
  { name: "Eclipse Projects Broker", url: "mqtt://mqtt.eclipseprojects.io", port: "1883", tls: "8883" }
];

let blinkingInterval;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startBlinkingIndicator() {
  let frame = 0;
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  blinkingInterval = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(chalk.gray(`Menunggu data... ${frames[frame = ++frame % frames.length]} `));
  }, 100);
}

function stopBlinkingIndicator() {
  clearInterval(blinkingInterval);
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

async function promptMqttConfig() {
  console.log(chalk.bold.blue('\n--- Pilih Broker MQTT ---'));
  publicMqttBrokers.forEach((broker, index) => {
    console.log(chalk.yellow(`${index + 1}. ${broker.name} (${broker.url}:${broker.port})`));
  });
  console.log(chalk.bold.blue('-------------------------'));

  let selectedBrokerIndex;
  while (true) {
    const answer = await new Promise(resolve => rl.question(chalk.green('Masukkan angka pilihan broker: '), resolve));
    selectedBrokerIndex = parseInt(answer) - 1;
    if (selectedBrokerIndex >= 0 && selectedBrokerIndex < publicMqttBrokers.length) {
      break;
    } else {
      console.log(chalk.red('Pilihan tidak valid. Silakan masukkan angka yang benar.'));
    }
  }

  const selectedBroker = publicMqttBrokers[selectedBrokerIndex];
  const defaultTopic = 'kompos/monitoring';

  const topicAnswer = await new Promise(resolve => rl.question(chalk.green(`Masukkan topik (default: ${defaultTopic}): `), resolve));
  const mqttTopic = topicAnswer || defaultTopic;

  rl.close();

  return {
    brokerUrl: `${selectedBroker.url}:${selectedBroker.port}`,
    topic: mqttTopic
  };
}

async function main() {
  const { brokerUrl, topic } = await promptMqttConfig();

  console.log(chalk.bold.blue('\n--- Pengaturan MQTT Terpilih ---'));
  console.log(chalk.cyan(`Broker: ${brokerUrl}`));
  console.log(chalk.cyan(`Topik: ${topic}`));
  console.log(chalk.bold.blue('--------------------------------'));

  const mqttClient = mqtt.connect(brokerUrl);

  mqttClient.on('connect', () => {
    console.log(chalk.green('\n✅ Terhubung ke MQTT broker'));
    mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(chalk.magenta(`📡 Berlangganan topik: ${topic}`));
        startBlinkingIndicator();
      } else {
        console.error(chalk.red('❌ Gagal subscribe:'), chalk.red(err.message));
      }
    });
  });

  mqttClient.on('message', async (messageTopic, message) => {
    stopBlinkingIndicator();
    try {
      const data = JSON.parse(message.toString());
      const timestamp = new Date().toLocaleTimeString();

      console.log(chalk.bgGreen.black(`\n ${timestamp} `) + chalk.bold.blue(` 📥 DATA DITERIMA `) + chalk.bgWhite.black(` ${messageTopic} `));
      console.log(chalk.yellow(`  ${JSON.stringify(data, null, 2)}`));

      // Validasi apakah field rumah ada dan valid
      const rumahId = data.rumah && typeof data.rumah === 'string' ? data.rumah : 'unknown';
      
      // Simpan data ke subkoleksi berdasarkan nomor rumah
      await firestore.collection('monitoring')
        .doc(`rumah${rumahId}`)
        .collection('data')
        .add({
          suhu: data.suhu || "0",
          jarak1: data.jarak1 || "0",
          jarak2: data.jarak2 || "0",
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(chalk.green(`✅ Data berhasil dikirim ke Firestore (rumah${rumahId})`));
    } catch (err) {
      console.error(chalk.red('❌ Error memproses pesan atau mengirim ke Firestore:'), chalk.red(err.message));
    } finally {
      startBlinkingIndicator();
    }
  });

  mqttClient.on('error', (err) => {
    stopBlinkingIndicator();
    console.error(chalk.red('❗ Error koneksi MQTT:'), chalk.red(err.message));
    startBlinkingIndicator();
  });

  mqttClient.on('offline', () => {
    stopBlinkingIndicator();
    console.warn(chalk.yellow('⚠️ MQTT client offline. Mencoba menyambung kembali...'));
    startBlinkingIndicator();
  });

  mqttClient.on('reconnect', () => {
    stopBlinkingIndicator();
    console.info(chalk.blue('🔄 Mencoba menyambung kembali ke MQTT broker...'));
    startBlinkingIndicator();
  });
}

main();


dan ini code api firebasenya aku udah siapin firebase.js 

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBak8XwAcbQHs6PGkqJ-ZrZYIuuHiC2ke4",
  authDomain: "kompos-dcb8a.firebaseapp.com",
  projectId: "kompos-dcb8a",
  storageBucket: "kompos-dcb8a.firebasestorage.app",
  messagingSenderId: "847391249254",
  appId: "1:847391249254:web:2294729a5eb41923f7aea7",
  measurementId: "G-TD67FEL3CD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


Tugas kamu sekarang code dari web nya sesuwaikan agar menerima data dari firebase jadi bukan mqtt sama histori dashboardnya datanya ambil dari firebase dan untuk indikasi rumah sesuwaikan sama code server nya di jsonya kan di situ ada rumah 1 nanti sesuwaikan jadi di bagian seting juga itu ganti jadi seting rumah aja seting rumah aja dan datanya semuanya di simpan di firebase firestore semua datanya saat nambah dan lainya seting dll dan bagian histori juga sesuwaikan sama koneksi itu ganti jadi apa bebas yang penting dashboard web nya mengambil data dari firebase 
