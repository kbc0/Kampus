import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    title: 'Expert Tutoring',
    description: 'Get support from knowledgeable peers in subjects you need help with.',
    icon: BookOpen,
  },
  {
    title: 'Community',
    description: 'Connect with students who share your academic goals and interests.',
    icon: Users,
  },
  {
    title: 'Flexible Scheduling',
    description: 'Plan study sessions that fit your schedule and learning pace.',
    icon: Calendar,
  },
  {
    title: 'Instant Messaging',
    description: 'Communicate seamlessly with other students in real-time.',
    icon: MessageCircle,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const FeatureGrid = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <motion.div key={feature.title} variants={item}>
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};