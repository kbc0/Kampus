import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <motion.div 
      className="relative flex flex-col group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 
          group-hover:bg-violet-500/20 transition-colors duration-300 ring-1 ring-violet-400/20">
          <Icon className="h-6 w-6 text-violet-400" aria-hidden="true" />
        </div>
        <span className="text-lg">{title}</span>
      </dt>
      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300 pl-15">
        <p className="flex-auto">{description}</p>
      </dd>
    </motion.div>
  );
};