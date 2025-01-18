import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileHeader } from './ProfileHeader';
import { PersonalInfoSection } from './PersonalInfoSection';
import { AcademicInfoSection } from './AcademicInfoSection';
import { SubjectsSection } from './SubjectsSection';

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <ProfileHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PersonalInfoSection />
          <AcademicInfoSection />
          <SubjectsSection />
        </div>
      </main>
    </div>
  );
};