import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { id: 1, name: 'Active Users', value: '1,000+', gradient: 'from-violet-500 to-fuchsia-500' },
  { id: 2, name: 'Successful Matches', value: '500+', gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 3, name: 'Subjects', value: '50+', gradient: 'from-pink-500 to-rose-500' },
  { id: 4, name: 'Satisfaction Rate', value: '98%', gradient: 'from-rose-500 to-violet-500' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Stats = () => {
  return (
    <div className="relative py-16 sm:py-24 lg:py-32 bg-gray-900">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-none"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Impact in Numbers
            </h2>
          </div>
          <motion.dl 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                variants={item}
                className="relative flex flex-col p-8 group"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gray-800/80 transition-colors duration-300 group-hover:bg-gray-800/90" />
                
                {/* Gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative">
                  <dt className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                    {stat.name}
                  </dt>
                  <dd className="mt-2 text-4xl font-semibold tracking-tight">
                    <div className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                  </dd>
                </div>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </div>
    </div>
  );
};