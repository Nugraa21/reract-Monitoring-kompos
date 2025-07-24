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