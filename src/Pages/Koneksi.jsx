import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Koneksi = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectId: 'kompos-dcb8a',
    apiKey: 'AIzaSyBak8XwAcbQHs6PGkqJ-ZrZYIuuHiC2ke4',
  });
  const [connectionError, setConnectionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateInput = () => {
    const { projectId, apiKey } = formData;
    if (!projectId.trim()) {
      return 'Project ID tidak boleh kosong';
    }
    if (!apiKey.trim()) {
      return 'API Key tidak boleh kosong';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(projectId)) {
      return 'Project ID hanya boleh berisi huruf, angka, atau tanda hubung';
    }
    if (!/^AIza[A-Za-z0-9-_]+$/.test(apiKey)) {
      return 'API Key format tidak valid';
    }
    return '';
  };

  const handleSave = async () => {
    setConnectionError('');
    setSuccessMessage('');
    const validationError = validateInput();
    if (validationError) {
      setConnectionError(validationError);
      return;
    }
    try {
      await setDoc(doc(db, 'config', 'firebase'), {
        projectId: formData.projectId,
        apiKey: formData.apiKey,
        isValid: true,
        updatedAt: new Date()
      });
      setSuccessMessage('Konfigurasi Firebase berhasil disimpan.');
      console.log('Koneksi - Firebase config saved:', formData);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Koneksi - Error saving Firebase config:', err);
      setConnectionError('Gagal menyimpan konfigurasi: ' + err.message);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'config', 'firebase');
        const configDoc = await getDoc(configRef);
        if (configDoc.exists()) {
          const data = configDoc.data();
          setFormData({
            projectId: data.projectId || 'kompos-dcb8a',
            apiKey: data.apiKey || 'AIzaSyBak8XwAcbQHs6PGkqJ-ZrZYIuuHiC2ke4',
          });
          console.log('Koneksi - Fetched Firebase config:', data);
        } else {
          console.log('Koneksi - No Firebase config found, using defaults');
        }
      } catch (err) {
        console.error('Koneksi - Error fetching Firebase config:', err);
        setConnectionError('Gagal memuat konfigurasi: ' + err.message);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col md:flex-row md:gap-8 md:justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-green-600 mb-8">Koneksi Firebase</h1>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-red-600">{connectionError}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-green-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-green-600">{successMessage}</p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Atur Koneksi Firebase</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                placeholder="Masukkan Project ID (contoh: kompos-dcb8a)"
                className={`border p-3 w-full rounded-lg focus:outline-none focus:ring-2 ${
                  connectionError.includes('Project ID') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Masukkan API Key"
                className={`border p-3 w-full rounded-lg focus:outline-none focus:ring-2 ${
                  connectionError.includes('API Key') ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Database URL
              </label>
              <input
                type="text"
                value="https://kompos-dcb8a.firebaseio.com"
                disabled
                className="border p-3 w-full rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex space-x-3">
              <motion.button
                onClick={handleSave}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Simpan
              </motion.button>
              <motion.button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Kembali ke Beranda
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Koneksi;