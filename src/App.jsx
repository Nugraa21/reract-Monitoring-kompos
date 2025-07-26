import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './Pages/Home';
import Settings from './Pages/Settings';
import Dashboard from './Pages/Dashboard';
import History from './Pages/History';
import { useState } from 'react';
import Blog from  './Pages/blog';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('Sidebar toggled:', isSidebarOpen ? 'Closed' : 'Opened');
  };

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-all duration-500 ease-in-out bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 ${
          isSidebarOpen ? 'md:pl-64' : 'md:pl-16'
        }`}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <NavBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/Blog" element={<Blog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard/:rumahId" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;