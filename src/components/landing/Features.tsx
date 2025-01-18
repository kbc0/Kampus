import React from 'react';
import { motion } from 'framer-motion';
import { FeatureGrid } from './features/FeatureGrid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const Features = () => {
  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
      {/* Enhanced gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent_50%)]"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05),transparent_50%)]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-base font-semibold leading-7 text-violet-400"
          >
            Features
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Your Path to Academic Success
          </motion.p>
        </motion.div>
        
        <FeatureGrid />
      </div>
    </section>
  );
};