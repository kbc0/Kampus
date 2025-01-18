import { motion } from 'framer-motion';
import { 
  GraduationCap, Users, BookOpen, Shield, ArrowRight, Sparkles, 
  Zap, Target, MessageCircle, Brain, Rocket, Award, Globe2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { Stats } from '../components/landing/Stats';
import { Universities } from '../components/landing/Universities';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main>

{/* Hero Section */}
<div className="relative isolate min-h-[80vh] sm:min-h-screen">
  {/* Enhanced Animated Background */}
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff80b5]/20 via-gray-900 to-gray-900" />
    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-soft-light" />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
    
    {/* Animated Gradient Orbs - Adjusted for mobile */}
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
      className="absolute top-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full 
        bg-gradient-to-r from-[#ff80b5]/30 to-[#9089fc]/30 blur-[128px]"
    />
  </div>

  {/* Content */}
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-24 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8 items-center">
      {/* Left Side - Text Content */}
      <div className="relative z-10 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-x-3 rounded-full px-4 py-1.5 
            text-sm font-semibold 
            bg-gradient-to-r from-[#ff80b5]/10 to-[#9089fc]/10 
            text-[#ff80b5] ring-1 ring-inset ring-[#ff80b5]/20 
            hover:ring-[#ff80b5]/40 transition-all duration-300 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-[#ff80b5]" />
            <span className="bg-gradient-to-r from-[#ff80b5] to-[#9089fc] bg-clip-text text-transparent">
              Beta Access Soon
            </span>
          </div>
        </motion.div>

        {/* Enhanced Title - Responsive font sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 sm:mt-10"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight">
            <span className="text-white">Kampus</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff80b5] via-[#9089fc] to-[#ff80b5] 
              text-3xl sm:text-5xl lg:text-7xl block sm:inline-block">
              .chat
            </span>
          </h1>
        </motion.div>

        {/* Description - Adjusted padding */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl leading-8 text-gray-300 font-light
            max-w-sm sm:max-w-md mx-auto lg:mx-0"
        >
          Connect with fellow students from Turkey's top universities. Share knowledge, collaborate, 
          and build meaningful connections in an exclusive academic community.
        </motion.p>

        {/* CTA Button - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 sm:mt-12"
        >
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-x-3 rounded-full 
              bg-gradient-to-r from-[#ff80b5] to-[#9089fc]
              px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white shadow-lg 
              shadow-[#ff80b5]/25 hover:shadow-[#ff80b5]/40 
              transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <span className="bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-all duration-300">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </Link>
        </motion.div>
      </div>

      
    </div>
  </div>
</div>

        {/* Features Grid */}
        <div className="relative py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center mb-12"
            >
              <h2 className="text-base font-semibold leading-7 text-[#ff80b5]">Why Choose Us</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for Turkish University Students
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Exclusive Network",
                  description: "Connect with verified students from top universities in a trusted environment.",
                  icon: Users,
                  gradient: "from-[#ff80b5] to-[#9089fc]"
                },
                {
                  title: "Smart Matching",
                  description: "Find study partners based on your academic strengths and learning goals.",
                  icon: Target,
                  gradient: "from-[#9089fc] to-[#ff80b5]"
                },
                {
                  title: "Real-time Collaboration",
                  description: "Join study sessions, share notes, and work on projects together.",
                  icon: Zap,
                  gradient: "from-[#ff80b5] to-[#9089fc]"
                },
                {
                  title: "Group Discussions",
                  description: "Participate in subject-specific study groups and academic discussions.",
                  icon: MessageCircle,
                  gradient: "from-[#9089fc] to-[#ff80b5]"
                },
                {
                  title: "Peer Learning",
                  description: "Learn from experienced peers and share your knowledge with others.",
                  icon: Brain,
                  gradient: "from-[#ff80b5] to-[#9089fc]"
                },
                {
                  title: "Career Growth",
                  description: "Connect with alumni and get insights into career opportunities.",
                  icon: Rocket,
                  gradient: "from-[#9089fc] to-[#ff80b5]"
                },
                {
                  title: "Academic Excellence",
                  description: "Access resources and support to excel in your studies.",
                  icon: Award,
                  gradient: "from-[#ff80b5] to-[#9089fc]"
                },
                {
                  title: "Verified Community",
                  description: "Join a trusted network of verified university students.",
                  icon: Shield,
                  gradient: "from-[#ff80b5] to-[#9089fc]"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative flex flex-col bg-gray-800/50 rounded-2xl overflow-hidden
                    border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300
                    hover:shadow-lg p-6"
                  >
                    <div className="mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10 
                        backdrop-blur-md border border-gray-700/50`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <Stats />

        {/* Universities Section */}
        <Universities />

        {/* CTA Section */}
        <div className="relative py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-gray-800/50 px-6 py-12 sm:px-12 sm:py-16 rounded-2xl border border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff80b5]/10 via-[#9089fc]/10 to-transparent" />
              
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to join your university's network?
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Be among the first to experience the future of university networking. Sign up now to get early access when we launch.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    to="/register"
                    className="relative inline-flex items-center"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff80b5] to-[#9089fc] rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200" />
                    <div className="relative px-6 py-3 bg-gray-900 rounded-lg leading-none flex items-center">
                      <span className="text-[#ff80b5] group-hover:text-[#ff9cc5] transition duration-200">
                        Sign Up
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2 text-[#9089fc] group-hover:text-[#a5a0fc] transition duration-200" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};