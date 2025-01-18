import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff80b5]/20 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* Animated gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
            rotate: [0, 45, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full 
            bg-gradient-to-r from-[#ff80b5]/30 to-[#9089fc]/30 blur-[128px]"
        />
      </div>

      <div className="relative flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff80b5] to-[#9089fc] rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative bg-gray-900 rounded-lg p-2">
                <ArrowRight className="h-8 w-8 text-[#ff80b5] group-hover:text-[#9089fc] transition-colors duration-300" />
              </div>
            </div>
          </Link>

          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="relative bg-gray-800/50 backdrop-blur-xl py-8 px-4 shadow-xl sm:rounded-xl sm:px-10
            before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-[#ff80b5]/10 before:to-[#9089fc]/10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};