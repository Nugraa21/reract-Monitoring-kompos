import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.03, transition: { duration: 0.2 } },
};

const Home = () => {
  const [houses, setHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'houses'),
      (snapshot) => {
        const houseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Home - Fetched houses:', houseList);
        setHouses(houseList);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        console.error('Home - Error fetching houses:', err);
        setError('Gagal memuat daftar rumah: ' + err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status) => {
    let color = '';
    switch (status) {
      case 'Normal':
        color = 'text-green-600';
        break;
      case 'Perlu Diperiksa':
        color = 'text-yellow-600';
        break;
      case 'Penuh':
        color = 'text-red-600';
        break;
      default:
        color = 'text-gray-600';
    }
    return <span className={`font-semibold ${color}`}>{status || 'Menunggu data'}</span>;
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-8">Daftar Rumah</h1>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-100 rounded-xl shadow-md mb-6"
          >
            <p className="text-lg text-red-600">{error}</p>
          </motion.div>
        )}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-white rounded-xl shadow-md"
          >
            <p className="text-lg text-gray-600">Memuat daftar rumah...</p>
          </motion.div>
        ) : houses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-white rounded-xl shadow-md"
          >
            <p className="text-lg text-gray-600">
              Tidak ada rumah terdeteksi. Pastikan backend mengirim data ke Firestore.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {houses.map((house) => (
              <motion.div
                key={house.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="p-5 bg-white rounded-xl shadow-md"
              >
                <Link to={`/dashboard/rumah${house.id}`} className="block space-y-3">
                  <h2 className="text-xl font-semibold text-gray-800 hover:underline">
                    {house.name || `Rumah ${house.id}`}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium">Kompos</p>
                      <p>{getStatusBadge(house.compostStatus)}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium">Sampah</p>
                      <p>{getStatusBadge(house.trashStatus)}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
// ========