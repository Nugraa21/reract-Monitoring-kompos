import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import NavBar from './components/NavBar';
import NavBar from './components/Navbar';
import Home from './Pages/Home';
import Settings from './Pages/Settings';
import Dashboard from './Pages/Dashboard';
import History from './Pages/History';
import { useState } from 'react';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('Sidebar toggled:', isSidebarOpen ? 'Closed' : 'Opened');
  };

  return (
    <BrowserRouter>
      <div className={`pb-16 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-16'} min-h-screen transition-all duration-300 bg-gray-50`} style={{ fontFamily: 'Poppins, sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard/:rumahId" element={<Dashboard />} />
        </Routes>
      </div>
      <NavBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </BrowserRouter>
  );
};

export default App;
// ========