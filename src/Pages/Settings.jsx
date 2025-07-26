import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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

  const getStatusColor = (value, normal, check, full) => {
    const val = parseFloat(value);
    if (val >= full) return 'bg-red-500';
    if (val >= check) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-10">
          <motion.div
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
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Pengaturan Sistem
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30 space-y-8"
        >
          {/* Section: Ambang Batas Sensor */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ambang Batas Sensor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Suhu Kompos (°C)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Normal</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostTempNormal"
                        value={formData.compostTempNormal}
                        onChange={handleInputChange}
                        placeholder="20-60°C"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="20"
                        max="60"
                        step="0.1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostTempNormal, formData.compostTempNormal, formData.compostTempCheck, formData.compostTempFull)}`}
                          style={{ width: `${Math.min((parseFloat(formData.compostTempNormal) / 60) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Perlu Diperiksa</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostTempCheck"
                        value={formData.compostTempCheck}
                        onChange={handleInputChange}
                        placeholder="20-60°C"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="20"
                        max="60"
                        step="0.1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostTempCheck, formData.compostTempNormal, formData.compostTempCheck, formData.compostTempFull)}`}
                          style={{ width: `${Math.min((parseFloat(formData.compostTempCheck) / 60) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Penuh</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostTempFull"
                        value={formData.compostTempFull}
                        onChange={handleInputChange}
                        placeholder="20-60°C"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="20"
                        max="60"
                        step="0.1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostTempFull, formData.compostTempNormal, formData.compostTempCheck, formData.compostTempFull)}`}
                          style={{ width: `${Math.min((parseFloat(formData.compostTempFull) / 60) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Volume Kompos (%)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Normal</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostVolumeNormal"
                        value={formData.compostVolumeNormal}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostVolumeNormal, formData.compostVolumeNormal, formData.compostVolumeCheck, formData.compostVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.compostVolumeNormal), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Perlu Diperiksa</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostVolumeCheck"
                        value={formData.compostVolumeCheck}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostVolumeCheck, formData.compostVolumeNormal, formData.compostVolumeCheck, formData.compostVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.compostVolumeCheck), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Penuh</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="compostVolumeFull"
                        value={formData.compostVolumeFull}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.compostVolumeFull, formData.compostVolumeNormal, formData.compostVolumeCheck, formData.compostVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.compostVolumeFull), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Volume Sampah (%)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Normal</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="trashVolumeNormal"
                        value={formData.trashVolumeNormal}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.trashVolumeNormal, formData.trashVolumeNormal, formData.trashVolumeCheck, formData.trashVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.trashVolumeNormal), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Perlu Diperiksa</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="trashVolumeCheck"
                        value={formData.trashVolumeCheck}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.trashVolumeCheck, formData.trashVolumeNormal, formData.trashVolumeCheck, formData.trashVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.trashVolumeCheck), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Penuh</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="trashVolumeFull"
                        value={formData.trashVolumeFull}
                        onChange={handleInputChange}
                        placeholder="0-100%"
                        className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                        min="0"
                        max="100"
                        step="1"
                        disabled
                      />
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStatusColor(formData.trashVolumeFull, formData.trashVolumeNormal, formData.trashVolumeCheck, formData.trashVolumeFull)}`}
                          style={{ width: `${Math.min(parseFloat(formData.trashVolumeFull), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: MQTT Connection */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pengaturan Koneksi MQTT</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Broker MQTT</label>
                <input
                  type="text"
                  name="mqttBroker"
                  value={formData.mqttBroker}
                  onChange={handleInputChange}
                  placeholder="contoh: broker.hivemq.com:1883"
                  className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                  disabled
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Topik MQTT</label>
                <input
                  type="text"
                  name="mqttTopic"
                  value={formData.mqttTopic}
                  onChange={handleInputChange}
                  placeholder="contoh: kompos/monitoring"
                  className="w-full bg-white/30 backdrop-blur-md border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-800"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Buttons (Disabled) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl opacity-50 cursor-not-allowed shadow-md"
              whileHover={{ scale: 1.0 }}
              whileTap={{ scale: 1.0 }}
            >
              Simpan
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white rounded-xl opacity-50 cursor-not-allowed shadow-md"
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