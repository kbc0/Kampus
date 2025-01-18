import React, { useState, useEffect } from 'react';
import { Layout, Plus, Lock, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  parent_id: string | null;
  total_topics: number;
  total_replies: number;
  last_post_at: string | null;
  depth: number;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    is_private: false,
    parent_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_categories_with_stats');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const { error } = await supabase.rpc('create_category', {
        name_param: newCategory.name,
        description_param: newCategory.description,
        is_private_param: newCategory.is_private,
        parent_id_param: newCategory.parent_id || null
      });

      if (error) throw error;

      toast.success('Category created successfully');
      fetchCategories();
      setNewCategory({
        name: '',
        description: '',
        is_private: false,
        parent_id: ''
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const getFullPath = (category: Category): string => {
    const path: string[] = [category.name];
    let currentCat = category;
    
    while (currentCat.parent_id) {
      const parent = categories.find(c => c.id === currentCat.parent_id);
      if (!parent) break;
      path.unshift(parent.name);
      currentCat = parent;
    }
    
    return path.join(' → ');
  };

  const renderCategoryList = (parentId: string | null = null, level = 0) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(category => (
        <React.Fragment key={category.id}>
          <div className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 
            hover:bg-gray-800 hover:border-gray-700 transition-all duration-300
            ${level > 0 ? 'ml-6' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  {category.is_private && (
                    <Lock className="h-4 w-4 text-violet-400" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span>{category.total_topics} topics</span>
                  <span>{category.total_replies} replies</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-violet-400 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {renderCategoryList(category.id, level + 1)}
        </React.Fragment>
      ));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Create Category"
        icon={Layout}
        description="Add a new forum category or subcategory"
      >
        <form className="space-y-4">
          <Input
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          <Select
            label="Parent Category"
            value={newCategory.parent_id}
            onChange={(e) => setNewCategory(prev => ({ ...prev, parent_id: e.target.value }))}
            options={[
              { value: '', label: '📁 None (Top Level)' },
              ...categories.map(cat => ({
                value: cat.id,
                label: `${'  '.repeat(cat.depth)}${cat.depth > 0 ? '└─' : ''}${cat.name}${
                  cat.is_private ? ' 🔒' : ''
                } (${getFullPath(cat)})`
              }))
            ]}
            description="Select where to place this category in the hierarchy"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_private"
              checked={newCategory.is_private}
              onChange={(e) => setNewCategory(prev => ({ ...prev, is_private: e.target.checked }))}
              className="rounded border-gray-600 text-violet-500 focus:ring-violet-500"
            />
            <label htmlFor="is_private" className="text-sm text-gray-300">
              Private Category
            </label>
          </div>

          <Button
            onClick={handleCreateCategory}
            disabled={!newCategory.name}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </form>
      </Card>

      <Card
        title="Categories"
        icon={Layout}
        description="Manage existing categories"
      >
        <div className="space-y-4">
          {renderCategoryList()}
        </div>
      </Card>
    </div>
  );
};