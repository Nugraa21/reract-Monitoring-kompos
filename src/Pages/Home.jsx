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
