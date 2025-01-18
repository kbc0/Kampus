import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Layout, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  depth: number;
}

export const NewTopicPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.rpc('get_categories_with_stats');

        if (error) throw error;
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          author_id: user.id,
          subject: 'general' // Add default subject since it's required
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Topic created successfully');
      navigate('/forum/topic/' + data.id);
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCategoryOptions = (categories: Category[]) => {
    const options: { value: string; label: string; depth: number }[] = [];
    
    // Helper function to recursively build options
    const addCategory = (category: Category, depth: number) => {
      options.push({
        value: category.id,
        label: category.name,
        depth: depth
      });
    };

    // First add top-level categories
    categories
      .filter(cat => !cat.parent_id)
      .forEach(cat => {
        addCategory(cat, 0);
        // Then add their children
        categories
          .filter(child => child.parent_id === cat.id)
          .forEach(child => {
            addCategory(child, 1);
            // Then add grandchildren
            categories
              .filter(grandchild => grandchild.parent_id === child.id)
              .forEach(grandchild => {
                addCategory(grandchild, 2);
              });
          });
      });

    return options;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            onClick={() => navigate('/forum')}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Forum
          </Link>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Create New Discussion</h1>
                <p className="text-gray-400 mt-1">Share your thoughts with the community</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter a descriptive title for your discussion"
            />

            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              icon={Layout}
              options={formatCategoryOptions(categories)}
              description="Select the most appropriate category for your discussion"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
                placeholder="Write your discussion content..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                  text-white placeholder-gray-400 focus:outline-none focus:border-violet-500
                  resize-vertical min-h-[200px]"
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Make sure to follow our community guidelines
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/forum')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Create Discussion
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};