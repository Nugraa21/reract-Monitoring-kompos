import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FaSpinner, FaSearch, FaHome } from 'react-icons/fa';

const Home = () => {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || doc.id.replace(/^rumah/, '')
        }));
        console.log('Home - Fetched houses:', houseList.map(h => h.id));
        setHouses(houseList);
        setFilteredHouses(houseList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Home - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = houses.filter(house =>
      house.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHouses(filtered);
  }, [searchQuery, houses]);

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
          <p className="text-2xl text-gray-800 font-semibold">Memuat daftar rumah...</p>
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
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-10 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent text-center"
        >
          Daftar Rumah
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rumah..."
              className="w-full pl-12 pr-4 py-3 bg-white/30 backdrop-blur-md rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 placeholder-gray-500"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHouses.map((house, index) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateX: 2, 
                  rotateY: 2, 
                  boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                  transition: { duration: 0.3 }
                }}
                className="relative bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30 overflow-hidden transform-gpu"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-teal-500/20 to-blue-500/20 opacity-50 animate-gradient" />
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <FaHome className="text-5xl text-indigo-600 opacity-80" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">{house.name}</h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {house.description || '--------------'}
                  </p>
                  <Link
                    to={`/dashboard/${house.id}`}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl hover:from-indigo-700 hover:to-teal-700 transition-all duration-300 shadow-lg font-semibold"
                  >
                    Lihat Dashboard
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-teal-400 opacity-20 rounded-bl-full" />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filteredHouses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-xl text-gray-600">Tidak ada rumah yang ditemukan.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;