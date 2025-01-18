import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, GraduationCap, BookOpen, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { MultiSelect } from '../components/common/MultiSelect';
import { subjects, universityPrograms } from '../types/academic';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [major, setMajor] = useState(user?.user_metadata?.major || '');
  const [minor, setMinor] = useState(user?.user_metadata?.minor || '');
  const [canHelp, setCanHelp] = useState<string[]>(
    user?.user_metadata?.subjects?.canHelp || []
  );
  const [needsHelp, setNeedsHelp] = useState<string[]>(
    user?.user_metadata?.subjects?.needsHelp || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const university = user?.user_metadata?.university as keyof typeof universityPrograms;
  const programs = university ? universityPrograms[university] : null;

  const handleAvatarUpload = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const updates = {
        name: name.trim(),
        bio: bio.trim(),
        major,
        minor,
        subjects: { canHelp, needsHelp }
      };

      // Update profile
      await updateProfile(updates);
      
      // Show success message and navigate immediately
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/profile"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <Card
            title="Profile Picture"
            icon={Camera}
            description="Update your profile picture"
          >
            <div>
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-xl overflow-hidden bg-violet-500/20 border border-violet-500/30">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-violet-300">
                        {user.user_metadata?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-gray-900/80 
                    text-white hover:bg-gray-900/90 transition-colors duration-200"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
                className="hidden"
              />
            </div>
          </Card>

          {/* Personal Information */}
          <Card
            title="Personal Information"
            icon={User}
            description="Update your personal details"
          >
            <div className="space-y-6">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />

              <Input
                label="Email"
                value={user.email || ''}
                icon={Mail}
                disabled
                className="opacity-75"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                    text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          {programs && (
            <Card
              title="Academic Information"
              icon={GraduationCap}
              description="Update your academic program details"
            >
              <div className="space-y-6">
                <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
                  <div className="flex items-center text-violet-300">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <span className="font-medium">{university} University</span>
                  </div>
                </div>
                
                <Select
                  label="Major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  options={programs.majors.map(m => ({ value: m, label: m }))}
                  icon={BookOpen}
                  required
                  disabled={isSubmitting}
                />
                <Select
                  label="Minor (Optional)"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  options={programs.minors.map(m => ({ value: m, label: m }))}
                  icon={BookOpen}
                  disabled={isSubmitting}
                />
              </div>
            </Card>
          )}

          {/* Subject Preferences */}
          <Card
            title="Subject Preferences"
            icon={BookOpen}
            description="Select subjects you can help with and subjects you need help with"
          >
            <div className="space-y-6">
              <MultiSelect
                label="Subjects I Can Help With"
                value={canHelp}
                onChange={setCanHelp}
                options={subjects}
                icon={BookOpen}
                description="Select subjects you're confident in and can help others with"
                disabled={isSubmitting}
              />

              <MultiSelect
                label="Subjects I Need Help With"
                value={needsHelp}
                onChange={setNeedsHelp}
                options={subjects}
                icon={BookOpen}
                description="Select subjects you'd like to receive help with"
                disabled={isSubmitting}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};