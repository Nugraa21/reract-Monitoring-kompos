import { useState } from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [formData, setFormData] = useState({
    compostTempNormal: 30,
    compostTempCheck: 35,
    compostTempFull: 40,
    compostVolumeNormal: 50,
    compostVolumeCheck: 65,
    compostVolumeFull: 80,
    trashVolumeNormal: 50,
    trashVolumeCheck: 65,
    trashVolumeFull: 80,
    mqttBroker: 'broker.hivemq.com:1883',
    mqttTopic: 'kompos/monitoring',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Pengaturan Sistem</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg space-y-6"
        >
          {/* Section: Ambang Batas Sensor */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ambang Batas Sensor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Suhu Kompos (°C)</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Normal</label>
                    <input
                      type="number"
                      name="compostTempNormal"
                      value={formData.compostTempNormal}
                      onChange={handleInputChange}
                      placeholder="20-60°C"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="20"
                      max="60"
                      step="0.1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                    <input
                      type="number"
                      name="compostTempCheck"
                      value={formData.compostTempCheck}
                      onChange={handleInputChange}
                      placeholder="20-60°C"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="20"
                      max="60"
                      step="0.1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                    <input
                      type="number"
                      name="compostTempFull"
                      value={formData.compostTempFull}
                      onChange={handleInputChange}
                      placeholder="20-60°C"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="20"
                      max="60"
                      step="0.1"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Volume Kompos (%)</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Normal</label>
                    <input
                      type="number"
                      name="compostVolumeNormal"
                      value={formData.compostVolumeNormal}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                    <input
                      type="number"
                      name="compostVolumeCheck"
                      value={formData.compostVolumeCheck}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                    <input
                      type="number"
                      name="compostVolumeFull"
                      value={formData.compostVolumeFull}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Volume Sampah (%)</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Normal</label>
                    <input
                      type="number"
                      name="trashVolumeNormal"
                      value={formData.trashVolumeNormal}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Perlu Diperiksa</label>
                    <input
                      type="number"
                      name="trashVolumeCheck"
                      value={formData.trashVolumeCheck}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Penuh</label>
                    <input
                      type="number"
                      name="trashVolumeFull"
                      value={formData.trashVolumeFull}
                      onChange={handleInputChange}
                      placeholder="0-100%"
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      step="1"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: MQTT Connection */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pengaturan Koneksi MQTT</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Broker MQTT</label>
                <input
                  type="text"
                  name="mqttBroker"
                  value={formData.mqttBroker}
                  onChange={handleInputChange}
                  placeholder="contoh: broker.hivemq.com:1883"
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Topik MQTT</label>
                <input
                  type="text"
                  name="mqttTopic"
                  value={formData.mqttTopic}
                  onChange={handleInputChange}
                  placeholder="contoh: kompos/monitoring"
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Buttons (Disabled) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              whileHover={{ scale: 1.0 }}
              whileTap={{ scale: 1.0 }}
            >
              Simpan
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              whileHover={{ scale: 1.0 }}
              whileTap={{ scale: 1.0 }}
            >
              Reset ke Default
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;