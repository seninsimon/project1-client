import React from 'react';
import { motion } from 'framer-motion';
import ZenztoreNav from '../components/ZenztoreNav';

const Thankyou = () => {
  return (
    <>
      <ZenztoreNav />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-green-500 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </motion.div>
          <h1 className="text-4xl font-bold text-orange-500 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-700 mb-6">Your order has been placed successfully.</p>
          <p className="text-gray-600">We appreciate your business and hope you enjoy your purchase.</p>
          <div className="mt-8">
            <a href="/" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 transition duration-300">
              Continue Shopping
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Thankyou;