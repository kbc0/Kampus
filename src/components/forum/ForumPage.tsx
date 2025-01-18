import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Menu, X } from 'lucide-react';
import { TopicList } from './TopicList';
import { ForumSidebar } from './ForumSidebar';
import { ForumSearch } from './ForumSearch';
import { useTopics } from '../../hooks/useTopics';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  total_topics: number;
  total_replies: number;
  last_post_at: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  category_name?: string;
}

export const ForumPage = () => {
  const navigate = useNavigate();
  const [sort, setSort] = useState<'latest' | 'trending'>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const { topics, loading: topicsLoading } = useTopics({ 
    sort,
    categoryId: selectedCategory 
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.rpc('get_categories_with_stats');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        setCategories([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Subscribe to category changes
    const channel = supabase
      .channel('forum_categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_categories'
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase.rpc('get_category_announcements', {
          category_id_param: selectedCategory
        });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast.error('Failed to load announcements');
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    setLoadingAnnouncements(true);
    fetchAnnouncements();
  }, [selectedCategory]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:min-h-0">
      {/* Mobile Controls */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50"
        >
          {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <button
          onClick={() => navigate('/forum/new')}
          className="inline-flex items-center px-4 py-2 rounded-lg
            bg-violet-500 text-white hover:bg-violet-600 
            transition-colors duration-200"
        >
          <MessageSquarePlus className="h-5 w-5 mr-2" />
          New Discussion
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-40 transform transition-transform duration-300 md:relative md:inset-auto md:transform-none
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-gray-900 md:bg-transparent
        w-64 md:w-64 flex-shrink-0
        overflow-y-auto
      `}>
        <ForumSidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(categoryId) => {
            setSelectedCategory(categoryId);
            setShowSidebar(false);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="p-4 space-y-4">
          {/* Desktop Header Actions */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 max-w-xl">
              <ForumSearch />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'latest' | 'trending')}
                className="bg-gray-700/50 border-0 rounded-lg text-sm py-2 px-3
                  text-white focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            <button
              onClick={() => navigate('/forum/new')}
              className="inline-flex items-center px-4 py-2 rounded-lg
                bg-violet-500 text-white hover:bg-violet-600 
                transition-colors duration-200"
            >
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              New Discussion
            </button>
          </div>

          {/* Mobile Sort and Search */}
          <div className="md:hidden space-y-4">
            <ForumSearch />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'latest' | 'trending')}
              className="w-full bg-gray-700/50 border-0 rounded-lg text-sm py-2 px-3
                text-white focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Topics List */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
            <TopicList 
              topics={topics} 
              loading={loading || topicsLoading || loadingAnnouncements} 
              announcements={announcements}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};