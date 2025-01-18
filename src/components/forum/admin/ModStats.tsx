import React, { useState, useEffect } from 'react';
import { ChartBar, MessageSquare, Flag, AlertTriangle, Ban } from 'lucide-react';
import { Card } from '../../common/Card';
import { supabase } from '../../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalTopics: number;
  totalReplies: number;
  activeWarnings: number;
  activeBans: number;
  recentReports: number;
}

export const ModStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTopics: 0,
    totalReplies: 0,
    activeWarnings: 0,
    activeBans: 0,
    recentReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: topicsCount },
        { count: repliesCount },
        { count: warningsCount },
        { count: bansCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
        supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
        supabase.from('user_warnings').select('*', { count: 'exact', head: true }),
        supabase.from('user_bans').select('*', { count: 'exact', head: true })
          .is('lifted_at', null)
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalTopics: topicsCount || 0,
        totalReplies: repliesCount || 0,
        activeWarnings: warningsCount || 0,
        activeBans: bansCount || 0,
        recentReports: 0 // Placeholder for now
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="h-8 w-24 bg-gray-700 rounded mb-4" />
            <div className="h-12 w-16 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Total Topics"
        icon={MessageSquare}
        description="Total forum discussions"
      >
        <div className="mt-2">
          <span className="text-4xl font-bold text-white">{stats.totalTopics}</span>
          <div className="mt-2 text-sm text-gray-400">
            With {stats.totalReplies} total replies
          </div>
        </div>
      </Card>

      <Card
        title="Active Users"
        icon={ChartBar}
        description="Total registered users"
      >
        <div className="mt-2">
          <span className="text-4xl font-bold text-white">{stats.totalUsers}</span>
          <div className="mt-2 text-sm text-gray-400">
            Across all universities
          </div>
        </div>
      </Card>

      <Card
        title="Recent Reports"
        icon={Flag}
        description="Reports in the last 24 hours"
      >
        <div className="mt-2">
          <span className="text-4xl font-bold text-white">{stats.recentReports}</span>
          <div className="mt-2 text-sm text-gray-400">
            Pending review
          </div>
        </div>
      </Card>

      <Card
        title="Active Warnings"
        icon={AlertTriangle}
        description="Currently active warnings"
      >
        <div className="mt-2">
          <span className="text-4xl font-bold text-white">{stats.activeWarnings}</span>
          <div className="mt-2 text-sm text-gray-400">
            Users with active warnings
          </div>
        </div>
      </Card>

      <Card
        title="Active Bans"
        icon={Ban}
        description="Currently banned users"
      >
        <div className="mt-2">
          <span className="text-4xl font-bold text-white">{stats.activeBans}</span>
          <div className="mt-2 text-sm text-gray-400">
            Temporary and permanent bans
          </div>
        </div>
      </Card>
    </div>
  );
};