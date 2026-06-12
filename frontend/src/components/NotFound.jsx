import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full text-center z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Animated 404 Text */}
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-widest">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-rounded text-3xl">gpp_maybe</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Shield Alert: Page Not Found</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            The path you are trying to access is either restricted, moved, or does not exist in the threat database. Let's get you back to safety.
          </p>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <span className="material-symbols-rounded">home</span>
              Return to Safety
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
