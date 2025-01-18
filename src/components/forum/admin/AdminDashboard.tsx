import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Layout, Bell, ChartBar, Shield } from 'lucide-react';
import { Card } from '../../common/Card';
import { useForumPermissions } from '../../../hooks/useForumPermissions';
import { Button } from '../../common/Button';
import { UserManagement } from './UserManagement';
import { ModStats } from './ModStats';
import { AnnouncementManagement } from './AnnouncementManagement';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stats' | 'announcements'>('overview');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isAdmin } = useForumPermissions();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await isAdmin();
      setIsAuthorized(hasAccess);
      setLoading(false);
      
      if (!hasAccess) {
        navigate('/dashboard');
      }
    };

    checkAccess();
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'stats':
        return <ModStats />;
      case 'announcements':
        return <AnnouncementManagement />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="User Management"
              icon={Users}
              description="Manage users, roles, and permissions"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  View and manage user accounts, assign roles, and handle user reports.
                </p>
                <Button onClick={() => setActiveTab('users')}>
                  Manage Users
                </Button>
              </div>
            </Card>

            <Card
              title="Announcements"
              icon={Bell}
              description="Manage system announcements"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  Create and manage system-wide announcements and notifications.
                </p>
                <Button onClick={() => setActiveTab('announcements')}>
                  Manage Announcements
                </Button>
              </div>
            </Card>

            <Card
              title="Moderation Stats"
              icon={ChartBar}
              description="View moderation activity and statistics"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  Track moderation actions, user reports, and community health metrics.
                </p>
                <Button onClick={() => setActiveTab('stats')}>
                  View Stats
                </Button>
              </div>
            </Card>

            <Card
              title="Security"
              icon={Shield}
              description="Security settings and audit logs"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  Review security settings, audit logs, and manage system-wide policies.
                </p>
                <Button onClick={() => navigate('/admin/security')}>
                  Security Settings
                </Button>
              </div>
            </Card>

            <Card
              title="Category Management"
              icon={Layout}
              description="Manage forum categories"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  Create, edit, and organize forum categories and subcategories.
                </p>
                <Button onClick={() => navigate('/admin/categories')}>
                  Manage Categories
                </Button>
              </div>
            </Card>

            <Card
              title="System Settings"
              icon={Settings}
              description="Configure forum settings"
            >
              <div className="space-y-4">
                <p className="text-gray-400">
                  Configure global forum settings, features, and preferences.
                </p>
                <Button onClick={() => navigate('/admin/settings')}>
                  Forum Settings
                </Button>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage and monitor your community</p>
          </div>

          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-violet-400 hover:border-violet-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'users'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-violet-400 hover:border-violet-400'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'announcements'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-violet-400 hover:border-violet-400'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'stats'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-violet-400 hover:border-violet-400'
              }`}
            >
              Stats
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};