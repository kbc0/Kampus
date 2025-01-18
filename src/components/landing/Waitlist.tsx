import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { validateUniversityEmail } from '../../utils/emailValidation';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!university) {
      toast.error('Please select your university');
      return;
    }

    const emailError = validateUniversityEmail(email, university);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, university }]);

      if (error) throw error;

      toast.success('You have been added to the waitlist!');
      setEmail('');
      setUniversity('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Join the Waitlist
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Be among the first to join our exclusive community when we launch.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-xl"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="university" className="block text-sm font-medium text-gray-300">
                University
              </label>
              <select
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                className="mt-2 block w-full rounded-md border-0 bg-gray-700 py-2.5 px-3.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-violet-500"
              >
                <option value="">Select your university</option>
                <option value="Boğaziçi">Boğaziçi University</option>
                <option value="ODTÜ">Middle East Technical University</option>
                <option value="İTÜ">Istanbul Technical University</option>
                <option value="Bilkent">Bilkent University</option>
                <option value="Koç">Koç University</option>
                <option value="Sabancı">Sabancı University</option>
                <option value="Galatasaray">Galatasaray University</option>
                <option value="Hacettepe">Hacettepe University</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                University Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-gray-700 py-2.5 pl-10 pr-3.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-violet-500"
                  placeholder="your.name@university.edu.tr"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-violet-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </section>
  );
};