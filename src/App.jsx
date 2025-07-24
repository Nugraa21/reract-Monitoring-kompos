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