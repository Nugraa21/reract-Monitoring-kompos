import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaHistory, FaBars, FaTimes, FaCog } from 'react-icons/fa';

const navItems = [
  { name: 'Beranda', path: '/', icon: <FaHome />, ariaLabel: 'Beranda' },
  { name: 'Riwayat', path: '/history', icon: <FaHistory />, ariaLabel: 'Riwayat' },
  { name: 'Pengaturan', path: '/settings', icon: <FaCog />, ariaLabel: 'Pengaturan' },
];

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

const NavBar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const hideNavbar = ['/login'].includes(location.pathname);

  if (hideNavbar) return null;

  return (
    <>
      <motion.nav
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full bg-white/20 backdrop-blur-2xl shadow-lg p-4 border-r border-white/30 z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {isSidebarOpen && (
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-xl font-bold text-green-600">IoT Dashboard</h1>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-white/30 hover:bg-white/50 text-gray-800"
              aria-label="Tutup Sidebar"
            >
              <FaTimes />
            </motion.button>
          </div>
        )}
        {!isSidebarOpen && (
          <div className="flex justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-white/30 hover:bg-white/50 text-gray-800"
              aria-label="Buka Sidebar"
            >
              <FaBars />
            </motion.button>
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
                } rounded-xl ${
                  isActive
                    ? 'bg-green-500/70 text-white backdrop-blur-sm'
                    : 'text-gray-800 hover:bg-white/30 hover:text-green-600'
                } transition-all duration-300 relative`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="text-xl"
              >
                {item.icon}
              </motion.div>
              {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              {location.pathname === item.path && isSidebarOpen && (
                <motion.div
                  className="absolute left-0 top-0 h-full w-1  rounded-r"
                  layoutId="sidebarIndicator"
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              )}
            </NavLink>
          ))}
        </div>
      </motion.nav>

      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-2xl shadow-lg p-4 flex items-center border-t border-white/30 z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="flex justify-around items-center w-full">
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 group relative ${
                  isActive ? 'text-green-600' : 'text-gray-800 hover:text-green-600'
                } transition-all duration-300`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={bottomNavItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-full bg-white/30 group-hover:bg-white/50"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium group-hover:text-green-600">{item.name}</span>
              <motion.div
                className="absolute -bottom-2 w-6 h-1 rounded-full bg-green-600"
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

export default NavBar;