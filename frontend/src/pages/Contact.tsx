import React from 'react';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';
import BouncyButton from '../components/BouncyButton';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={15} />
      
      <motion.h1 
        className="text-5xl font-bold mb-12 text-center text-rainbow animate-float relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        📞 Get In Touch! 💌
      </motion.h1>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl">
              <motion.div
                className="text-center mb-8"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-8xl">📬</span>
              </motion.div>

              <h2 className="text-3xl font-bold text-purple-600 mb-8 text-center">
                We'd Love to Hear From You!
              </h2>

              {/* Social Media Links */}
              <div className="space-y-6 mb-8">
                <motion.a
                  href="https://facebook.com/charactermattersng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-blue-100 rounded-2xl border-4 border-blue-300 hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-5xl">👍</span>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600">Facebook</h3>
                    <p className="text-gray-700">Follow us on Facebook</p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://instagram.com/charactermattersng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-pink-100 rounded-2xl border-4 border-pink-300 hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-5xl">📸</span>
                  <div>
                    <h3 className="text-2xl font-bold text-pink-600">Instagram</h3>
                    <p className="text-gray-700">Follow us on Instagram</p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://twitter.com/charactermatters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-cyan-100 rounded-2xl border-4 border-cyan-300 hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-5xl">🐦</span>
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-600">Twitter</h3>
                    <p className="text-gray-700">Follow us on Twitter</p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://youtube.com/@charactermatters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-red-100 rounded-2xl border-4 border-red-300 hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-5xl">🎥</span>
                  <div>
                    <h3 className="text-2xl font-bold text-red-600">YouTube</h3>
                    <p className="text-gray-700">Subscribe to our channel</p>
                  </div>
                </motion.a>
              </div>

              {/* Email */}
              <motion.div
                className="p-6 bg-green-100 rounded-2xl border-4 border-green-300 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">✉️</span>
                  <div>
                    <h3 className="text-2xl font-bold text-green-600">Email Us</h3>
                    <a 
                      href="mailto:Charactermattersng@gmail.com"
                      className="text-xl text-gray-700 hover:text-green-600 font-semibold"
                    >
                      charactermattersng@gmail.com
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Phone Numbers */}
              <motion.div
                className="p-6 bg-purple-100 rounded-2xl border-4 border-purple-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">📱</span>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600 mb-2">Call Us</h3>
                    <div className="space-y-1">
                      <a 
                        href="tel:+2348028289610"
                        className="block text-xl text-gray-700 hover:text-purple-600 font-semibold"
                      >
                        📞 08028289610
                      </a>
                      <a 
                        href="tel:+2340813"
                        className="block text-xl text-gray-700 hover:text-purple-600 font-semibold"
                      >
                        📞 0813...
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mt-8 text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-2xl font-bold text-gray-700">
                  Let's build character together! 🌟✨
                </p>
              </motion.div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Media Partners */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border-4 border-yellow-300">
              <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
                📺 Our Media Partners 🎬
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['WAP TV', 'RAVE TV', 'R2TV'].map((partner, index) => (
                  <motion.div
                    key={partner}
                    className="p-6 bg-white rounded-2xl text-center font-bold text-2xl text-orange-600 border-3 border-orange-300 shadow-lg"
                    whileHover={{ y: -10, rotate: 5 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="text-4xl mb-2">📡</div>
                    {partner}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
