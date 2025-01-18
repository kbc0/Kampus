import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Calendar, Layout } from 'lucide-react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  starts_at: string;
  ends_at?: string;
  created_at: string;
  category_id?: string;
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
    category_id: ''
  });

  useEffect(() => {
    Promise.all([fetchAnnouncements(), fetchCategories()]);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_announcements')
        .select(`
          *,
          category:forum_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_announcements')
        .insert({
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          starts_at: new Date(newAnnouncement.starts_at).toISOString(),
          ends_at: newAnnouncement.ends_at ? new Date(newAnnouncement.ends_at).toISOString() : null,
          category_id: newAnnouncement.category_id || null,
          is_active: true,
          author_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success('Announcement created successfully');
      await fetchAnnouncements();
      setNewAnnouncement({
        title: '',
        content: '',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: '',
        category_id: ''
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('forum_announcements')
        .update({
          title: announcement.title,
          content: announcement.content,
          is_active: announcement.is_active,
          category_id: announcement.category_id
        })
        .eq('id', announcement.id);

      if (error) throw error;

      toast.success('Announcement updated successfully');
      await fetchAnnouncements();
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast.success('Announcement deleted successfully');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Create Announcement"
        icon={Bell}
        description="Create a new system announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
            />
          </div>
          <Select
            label="Category (Optional)"
            value={newAnnouncement.category_id}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, category_id: e.target.value }))}
            icon={Layout}
            options={[
              { value: '', label: 'All Categories (Global)' },
              ...categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))
            ]}
            description="Select a specific category or leave empty for a global announcement"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={newAnnouncement.starts_at}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, starts_at: e.target.value }))}
              required
            />
            <Input
              type="date"
              label="End Date (Optional)"
              value={newAnnouncement.ends_at}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, ends_at: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={submitting}
              disabled={!newAnnouncement.title || !newAnnouncement.content || submitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Active Announcements"
        icon={Bell}
        description="Manage existing announcements"
      >
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 bg-gray-700/50 rounded-lg space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{announcement.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{announcement.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(announcement.starts_at).toLocaleDateString()}
                    </div>
                    {announcement.ends_at && (
                      <div>
                        Until {new Date(announcement.ends_at).toLocaleDateString()}
                      </div>
                    )}
                    {announcement.category && (
                      <div className="text-violet-400">
                        Category: {announcement.category.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingAnnouncement(announcement)}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Edit Announcement</h3>
            <form className="space-y-4">
              <Input
                label="Title"
                value={editingAnnouncement.title}
                onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, title: e.target.value }))}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, content: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                    text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
              </div>
              <Select
                label="Category (Optional)"
                value={editingAnnouncement.category_id || ''}
                onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, category_id: e.target.value }))}
                icon={Layout}
                options={[
                  { value: '', label: 'All Categories (Global)' },
                  ...categories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))
                ]}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingAnnouncement.is_active}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, is_active: e.target.checked }))}
                  className="rounded border-gray-600 text-violet-500 focus:ring-violet-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setEditingAnnouncement(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateAnnouncement(editingAnnouncement)}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};