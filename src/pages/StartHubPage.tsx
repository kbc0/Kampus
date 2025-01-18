import React from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Rocket, Construction } from 'lucide-react';
import { motion } from 'framer-motion';

export const StartHubPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-50" />
            <Rocket className="relative h-16 w-16 text-violet-400 mx-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            StartHub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-lg text-gray-400"
          >
            Your gateway to student entrepreneurship and innovation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 inline-flex items-center gap-2 px-6 py-4 rounded-xl 
              bg-gray-800/50 border border-gray-700/50 text-gray-300"
          >
            <Construction className="h-5 w-5 text-violet-400" />
            <span>Coming soon in beta</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 max-w-2xl mx-auto text-gray-400 text-sm"
          >
            <p>
              StartHub will be your platform to connect with fellow student entrepreneurs,
              find co-founders, get mentorship, and access resources to bring your ideas to life.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};