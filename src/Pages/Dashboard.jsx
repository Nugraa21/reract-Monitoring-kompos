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