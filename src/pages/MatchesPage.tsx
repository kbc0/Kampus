import React from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MatchesSection } from '../components/dashboard/matches/MatchesSection';

export const MatchesPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <MatchesSection />
        </div>
      </main>
    </div>
  );
};