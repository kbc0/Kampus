import React from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { ForumPage } from '../pages/ForumPage';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Forum Discussions</h1>
          <p className="text-gray-400 mt-1">
            Join the conversation and share your knowledge
          </p>
        </div>
        <ForumPage />
      </main>
    </div>
  );
};