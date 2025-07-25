import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';

const Home = () => {
  const [houses, setHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newHouseName, setNewHouseName] = useState('');

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

  const addHouse = async () => {
    if (!newHouseName.trim()) {
      setError('Nama rumah tidak boleh kosong!');
      return;
    }
    try {
      const nextId = houses.length > 0 ? parseInt(houses[houses.length - 1].id.replace(/^rumah/, '')) + 1 : 1;
      const houseId = `rumah${nextId}`;
      const houseDocRef = await addDoc(collection(db, 'houses'), {
        name: newHouseName,
        createdAt: new Date()
      });
      console.log('Home - Added house with ID:', houseId);
      setNewHouseName('');
      setError('');
    } catch (err) {
      console.error('Home - Error adding house:', err);
      setError('Gagal menambahkan rumah: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600">Memuat daftar rumah...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-red-100 p-6 rounded-xl shadow-md"
        >
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Daftar Rumah</h1>
        {/* <div className="mb-4">
          <input
            type="text"
            value={newHouseName}
            onChange={(e) => setNewHouseName(e.target.value)}
            placeholder="Masukkan nama rumah baru"
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={addHouse}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Tambah Rumah
          </button>
        </div> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <motion.div
              key={house.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{house.name}</h2>
              <Link
                to={`/dashboard/${house.id}`}
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                Lihat Dashboard
              </Link>
            </motion.div>
          ))}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center flex items-center justify-center cursor-not-allowed"
          >
            <FaPlus className="text-green-600 text-2xl" />
            <span className="ml-2 text-gray-600">Tambah Rumah</span>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
};

export default Home;