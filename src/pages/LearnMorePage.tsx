import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { Features } from '../components/landing/Features';
import { Universities } from '../components/landing/Universities';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Shield } from 'lucide-react';

export const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-14">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
            >
              <GraduationCap className="mx-auto h-12 w-12 text-violet-500" />
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                About Our Community
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Discover how we're building the most exclusive academic network for Turkey's elite university students.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Features Grid from original LearnMore page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                <Users className="h-12 w-12 text-violet-500" />
                <h3 className="mt-6 text-2xl font-bold text-white">Exclusive Network</h3>
                <p className="mt-4 text-gray-300">
                  Connect with peers from Turkey's top universities in a curated, academic-focused environment.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                <BookOpen className="h-12 w-12 text-violet-500" />
                <h3 className="mt-6 text-2xl font-bold text-white">Knowledge Exchange</h3>
                <p className="mt-4 text-gray-300">
                  Share insights, collaborate on projects, and learn from fellow students across different disciplines.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                <Shield className="h-12 w-12 text-violet-500" />
                <h3 className="mt-6 text-2xl font-bold text-white">Verified Community</h3>
                <p className="mt-4 text-gray-300">
                  Every member is verified using their university email, ensuring a trusted and authentic network.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <Features />

        

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-violet-400">Our Mission</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Empowering Elite Education
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                We're creating a platform where Turkey's brightest minds can connect, collaborate, and excel together.
                Our community is built on the principles of academic excellence, peer support, and professional growth.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Universities Section */}
        <Universities />
      </main>

      <Footer />
    </div>
  );
};