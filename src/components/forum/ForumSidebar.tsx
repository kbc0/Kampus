import React from 'react';
import { MessageSquare, Layout, Lock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface ForumSidebarProps {
  categories?: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
}) => {
  // Group categories by parent_id
  const categoryGroups = React.useMemo(() => {
    const groups = new Map<string | null, Category[]>();
    categories.forEach(category => {
      const parentId = category.parent_id;
      if (!groups.has(parentId)) {
        groups.set(parentId, []);
      }
      groups.get(parentId)!.push(category);
    });
    return groups;
  }, [categories]);

  const renderCategory = (category: Category) => {
    const hasChildren = categoryGroups.has(category.id);
    const isSelected = selectedCategory === category.id;

    return (
      <div key={category.id} style={{ marginLeft: `${category.depth * 1}rem` }}>
        <button
          onClick={() => onCategoryChange(category.id)}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-left
            ${isSelected
              ? 'bg-violet-500/20 text-violet-300 font-medium'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            } transition-colors duration-200`}
        >
          <Layout className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="truncate">{category.name}</span>
              {category.is_private && (
                <Lock className="h-3 w-3 ml-1.5 text-violet-400 flex-shrink-0" />
              )}
              {hasChildren && (
                <ChevronRight className="h-4 w-4 ml-1.5 text-gray-400 flex-shrink-0" />
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {category.total_topics} topics · {category.total_replies} replies
              {category.last_post_at && (
                <div className="mt-0.5">
                  Last post {formatDistanceToNow(new Date(category.last_post_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Render subcategories */}
        {hasChildren && categoryGroups.get(category.id)!.map(subcategory => (
          renderCategory(subcategory)
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:pr-6">
      {/* All Discussions */}
      <div className="mb-6">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-left
            ${!selectedCategory
              ? 'bg-violet-500/20 text-violet-300 font-medium' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            } transition-colors duration-200`}
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          All Discussions
        </button>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
          Categories
        </h3>
        <div className="space-y-1">
          {/* Render top-level categories */}
          {categoryGroups.get(null)?.map(category => renderCategory(category))}
        </div>
      </div>
    </div>
  );
};