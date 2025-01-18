import { motion } from 'framer-motion';

const universities = [
  { name: 'Boğaziçi University', gradient: 'from-violet-500 to-fuchsia-500' },
  { name: 'ODTÜ', gradient: 'from-fuchsia-500 to-pink-500' },
  { name: 'İTÜ', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Bilkent University', gradient: 'from-rose-500 to-orange-500' },
  { name: 'Koç University', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Sabancı University', gradient: 'from-amber-500 to-yellow-500' },
  { name: 'Galatasaray University', gradient: 'from-yellow-500 to-lime-500' },
  { name: 'Hacettepe University', gradient: 'from-lime-500 to-green-500' },
  { name: 'Yıldız Technical University', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Özyeğin University', gradient: 'from-emerald-500 to-violet-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const Universities = () => {
  return (
    <div className="relative py-24 sm:py-32 bg-gray-900">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-violet-400">Elite Network</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Turkey's Top Universities
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Join a vibrant community of students from Turkey's most prestigious academic institutions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 
            sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 
            lg:mx-0 lg:max-w-none lg:grid-cols-5"
        >
          {universities.map((university) => (
            <motion.div
              key={university.name}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 p-6 
                backdrop-blur-sm border border-gray-700/50 
                hover:border-violet-500/30 transition-all duration-300">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${university.gradient} opacity-5 
                  group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative flex flex-col items-center">
                  <span className={`text-sm font-medium bg-gradient-to-r ${university.gradient} 
                    bg-clip-text text-transparent text-center`}>
                    {university.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};