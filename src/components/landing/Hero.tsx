import React from 'react';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 pt-14 pb-16 sm:pb-20">
      {/* Background Effects */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-2xl opacity-20" />
            <GraduationCap className="relative mx-auto h-16 w-16 text-violet-400" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200"
          >
            Connect with Your Campus
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Join your university's exclusive network. Share knowledge, collaborate, 
            and build meaningful connections in an academic-focused community.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link
              to="/register"
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200" />
              <div className="relative px-6 py-3 bg-gray-900 rounded-lg leading-none flex items-center">
                <span className="text-violet-200 group-hover:text-violet-100 transition duration-200">
                  Get Started
                </span>
                <span className="text-violet-400 group-hover:text-violet-300 transition duration-200 ml-2">→</span>
              </div>
            </Link>
            <Link 
              to="/learn-more"
              className="text-base font-semibold leading-6 text-gray-300 hover:text-violet-300 transition-colors duration-200"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Gradient Accent */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-gray-900 to-transparent" />
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
};