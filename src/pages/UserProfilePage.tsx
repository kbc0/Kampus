import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ProfileHeader } from '../components/profile/sections/ProfileHeader';
import { FriendsSection } from '../components/profile/sections/FriendsSection';
import { ProfileAcademicInfo } from '../components/profile/sections/ProfileAcademicInfo';
import { ProfileSubjects } from '../components/profile/sections/ProfileSubjects';
import { LevelProgress } from '../components/profile/sections/LevelProgress';
import { LastActivitySection } from '../components/profile/sections/LastActivitySection';
import { useProfileDetails } from '../hooks/useProfileDetails';
import { supabase } from '../lib/supabase';

interface Activity {
  id: string;
  type: 'topic' | 'reply' | 'like' | 'level_up';
  title?: string;
  content?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
  data?: {
    old_level?: number;
    new_level?: number;
    level_title?: string;
  };
}

export const UserProfilePage = () => {
  const { userId } = useParams();
  const { profile, loading } = useProfileDetails(userId || '');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;

      try {
        // Fetch recent topics with category info
        const { data: topics } = await supabase
          .from('forum_topics')
          .select(`
            id, 
            title, 
            content, 
            created_at,
            category:forum_categories(id, name)
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent replies with topic and category info
        const { data: replies } = await supabase
          .from('forum_replies')
          .select(`
            id, 
            content, 
            created_at,
            topic:forum_topics(
              id,
              title,
              category:forum_categories(id, name)
            )
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        // Format activities
        const formattedActivities: Activity[] = [
          ...(topics || []).map(topic => ({
            id: topic.id,
            type: 'topic' as const,
            title: topic.title,
            content: topic.content,
            created_at: topic.created_at,
            category: topic.category
          })),
          ...(replies || []).map(reply => ({
            id: reply.id,
            type: 'reply' as const,
            title: reply.topic?.title,
            content: reply.content,
            created_at: reply.created_at,
            category: reply.topic?.category
          }))
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);

        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-800 rounded-xl" />
            <div className="h-40 bg-gray-800 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-60 bg-gray-800 rounded-xl" />
              <div className="h-60 bg-gray-800 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <ProfileHeader 
            profile={profile} 
            isOwnProfile={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              <LevelProgress 
                level={profile.level}
                levelTitle={profile.level_title}
                xp={profile.xp}
              />
              
              <ProfileAcademicInfo profile={profile} />
              
              <LastActivitySection 
                activities={activities}
                loading={loadingActivities}
              />
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              <FriendsSection userId={profile.id} />
              <ProfileSubjects profile={profile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};