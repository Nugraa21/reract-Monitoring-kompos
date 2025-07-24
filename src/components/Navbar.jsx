import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaHistory, FaCog, FaPlug, FaBars, FaTimes } from 'react-icons/fa';

// Define navigation items
const navItems = [
  { name: 'Beranda', path: '/', icon: <FaHome />, ariaLabel: 'Beranda' },
  { name: 'Koneksi', path: '/koneksi', icon: <FaPlug />, ariaLabel: 'Koneksi' },
  { name: 'History', path: '/history', icon: <FaHistory />, ariaLabel: 'History' },
  { name: 'Pengaturan', path: '/settings', icon: <FaCog />, ariaLabel: 'Pengaturan' },
];

// Animation variants for nav items
const navItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      delay: index * 0.1,
    },
  }),
};

// Animation variants for bottom navbar items
const bottomNavItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      delay: index * 0.1,
    },
  }),
};

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const hideNavbar = ['/login'].includes(location.pathname);

  if (hideNavbar) return null;

  return (
    <>
      {/* Sidebar for Web (md and above) */}
      <motion.nav
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full md:bg-white/10 md:backdrop-blur-xl md:shadow-2xl md:p-4 md:border-r md:border-white/10 md:z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {isSidebarOpen && (
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-xl font-bold text-primary">IoT Dashboard</h1>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Tutup Sidebar"
            >
              <FaTimes />
            </button>
          </div>
        )}
        {!isSidebarOpen && (
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Buka Sidebar"
            >
              <FaBars />
            </button>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${
                  isSidebarOpen ? 'space-x-3 p-3' : 'justify-center p-2'
                } rounded-lg ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-primary'
                } transition-all duration-300`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-xl"
              >
                {item.icon}
              </motion.div>
              {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </motion.nav>

      {/* Bottom Navbar for Mobile */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl shadow-2xl p-4 flex items-center border-t border-white/10 z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="flex justify-around items-center w-full">
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 group relative ${
                  isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                } transition-all duration-300`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={bottomNavItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="p-2.5 rounded-full group-hover:bg-gradient-to-r group-hover:from-emerald-50 group-hover:to-teal-50"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium group-hover:text-primary">{item.name}</span>
              <motion.div
                className="absolute -bottom-2 w-6 h-1 rounded-full bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: location.pathname === item.path ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;