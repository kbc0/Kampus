import React from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { CategoryManagement } from '../components/forum/admin/CategoryManagement';

export const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <p className="text-gray-400 mt-1">
            Create and manage forum categories and subcategories
          </p>
        </div>
        <CategoryManagement />
      </main>
    </div>
  );
};