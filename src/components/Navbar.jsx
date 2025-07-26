import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen ,FaHome, FaHistory, FaBars, FaTimes, FaCog, FaPlus } from 'react-icons/fa';
import { useState } from 'react';

const navItems = [
  { name: 'Beranda', path: '/', icon: <FaHome />, ariaLabel: 'Beranda' },
  { name: 'Riwayat', path: '/history', icon: <FaHistory />, ariaLabel: 'Riwayat' },
  { name: 'Blog', path: '/blog', icon: <FaBookOpen />, ariaLabel: 'Edukasi' },
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (hideNavbar) return null;

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <motion.nav
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full bg-white/30 backdrop-blur-xl shadow-xl p-4 border-r border-white/20 z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {isSidebarOpen && (
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              IoT Dashboard
            </h1>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-gray-800"
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
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-gray-800"
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
                    ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white backdrop-blur-sm'
                    : 'text-gray-800 hover:bg-white/20 hover:text-teal-600'
                } transition-all duration-300 relative`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="text-xl"
              >
                {item.icon}
              </motion.div>
              {isSidebarOpen && <span className="text-sm font-semibold">{item.name}</span>}
              {location.pathname === item.path && isSidebarOpen && (
                <motion.div
                  className="absolute left-0 top-0 h-full w-1  from-indigo-600 to-teal-600 rounded-r"
                  layoutId="sidebarIndicator"
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              )}
            </NavLink>
          ))}
        </div>
      </motion.nav>

      {/* Bottom Nav for Mobile */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/30 backdrop-blur-xl shadow-lg p-4 flex items-center justify-center border-t border-white/20 z-50"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="flex justify-around items-center w-full max-w-md relative">
          {navItems.slice(0, 2).map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 group relative ${
                  isActive ? 'text-teal-600' : 'text-gray-800 hover:text-teal-600'
                } transition-all duration-300`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index}
                variants={bottomNavItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.3, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-white/20 group-hover:bg-white/40"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-semibold group-hover:text-teal-600">{item.name}</span>
              <motion.div
                className="absolute -bottom-2 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: location.pathname === item.path ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          ))}
          {/* Floating Action Button */}
          {/* <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={toggleModal}
              className="p-4 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              aria-label="Aksi Cepat"
            >
              <FaPlus className="text-xl" />
            </button>
          </motion.div> */}
          {navItems.slice(2).map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 group relative ${
                  isActive ? 'text-teal-600' : 'text-gray-800 hover:text-teal-600'
                } transition-all duration-300`
              }
              aria-label={item.ariaLabel}
            >
              <motion.div
                custom={index + 2}
                variants={bottomNavItemVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.3, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-white/20 group-hover:bg-white/40"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-semibold group-hover:text-teal-600">{item.name}</span>
              <motion.div
                className="absolute -bottom-2 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: location.pathname === item.path ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          ))}
        </div>
      </motion.nav>

      {/* Modal for FAB (Placeholder) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
            onClick={toggleModal}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
              <p className="text-gray-600 mb-6">Fitur ini akan segera hadir! (Placeholder untuk fungsi seperti menambah rumah atau refresh data)</p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl shadow-md"
                >
                  Tutup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;