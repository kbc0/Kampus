import React, { useState } from 'react';
import { Mail, Lock, User, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthInput } from './AuthInput';
import { AuthSelect } from './AuthSelect';
import { AuthButton } from './AuthButton';
import { University } from '../../types';
import { validateUniversityEmail, UNIVERSITY_EMAILS } from '../../utils/emailValidation';
import { toast } from 'react-hot-toast';
import { AuthError, AuthErrorCode } from '../../services/auth/types';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState<University | ''>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Track which password requirements are met
  const meetsRequirement = (requirement: typeof passwordRequirements[0]) => {
    return requirement.test(password);
  };

  const meetsAllRequirements = passwordRequirements.every(meetsRequirement);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUniversity = e.target.value as University;
    setUniversity(newUniversity);
    setEmailError(null);
    
    const universityInfo = UNIVERSITY_EMAILS.find(u => u.universityKey === newUniversity);
    if (universityInfo) {
      toast.success(`Please use your ${universityInfo.domain} email address`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!university) {
      toast.error('Please select your university');
      return;
    }

    if (!meetsAllRequirements) {
      toast.error('Please meet all password requirements');
      return;
    }

    const emailError = validateUniversityEmail(email, university);
    if (emailError) {
      setEmailError(emailError);
      toast.error(emailError);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, name, university);
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error instanceof AuthError) {
        switch (error.code) {
          case AuthErrorCode.USER_EXISTS:
            setEmailError('An account with this email already exists');
            toast.error('An account with this email already exists. Please sign in instead.');
            break;
          case AuthErrorCode.WEAK_PASSWORD:
            toast.error('Please choose a stronger password.');
            break;
          case AuthErrorCode.CONNECTION_ERROR:
            toast.error('Connection failed. Please check your internet connection and try again.');
            break;
          default:
            toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff80b5]/20 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* Animated gradient orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full 
          bg-gradient-to-r from-[#ff80b5]/30 to-[#9089fc]/30 blur-[128px]
          animate-pulse" />
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join our community of students helping students
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="relative bg-gray-800/50 backdrop-blur-xl py-8 px-4 shadow-xl sm:rounded-xl sm:px-10
            before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-[#ff80b5]/10 before:to-[#9089fc]/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput
                icon={User}
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />

              <AuthSelect
                icon={GraduationCap}
                label="University"
                required
                value={university}
                onChange={handleUniversityChange}
                options={[
                  { value: '', label: 'Select your university' },
                  { value: 'Boğaziçi', label: 'Boğaziçi University' },
                  { value: 'ODTÜ', label: 'Middle East Technical University' },
                  { value: 'İTÜ', label: 'Istanbul Technical University' },
                  { value: 'Bilkent', label: 'Bilkent University' },
                  { value: 'Koç', label: 'Koç University' },
                  { value: 'Sabancı', label: 'Sabancı University' },
                  { value: 'Galatasaray', label: 'Galatasaray University' },
                  { value: 'Hacettepe', label: 'Hacettepe University' }
                ]}
              />

              <AuthInput
                icon={Mail}
                label="University Email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="your.name@university.edu.tr"
                error={emailError}
              />

              <div className="space-y-2">
                <AuthInput
                  icon={Lock}
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                />

                {/* Password requirements */}
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-400">Password requirements:</p>
                  <div className="space-y-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`flex items-center space-x-2 text-sm ${
                          meetsRequirement(req) ? 'text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <Check className={`h-4 w-4 ${
                          meetsRequirement(req) ? 'opacity-100' : 'opacity-0'
                        }`} />
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AuthButton type="submit" isLoading={submitting}>
                Create account
              </AuthButton>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#ff80b5] hover:text-[#ff99c2] transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};