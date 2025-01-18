import React, { useState, useEffect, useRef } from 'react';
import { Search, User, MessageSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserAvatar } from '../common/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  type: 'profile' | 'topic';
  id: string;
  title?: string;
  name?: string;
  university?: string;
  avatar_url?: string;
  created_at: string;
  content?: string;
  author_name?: string;
}

interface GlobalSearchProps {
  onClose: () => void;
}

type SearchTab = 'profiles' | 'topics';

export const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('profiles');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    const input = document.getElementById('global-search-input');
    if (input) {
      input.focus();
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle search
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_forum', {
          search_query: query.toLowerCase()
        });

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Filter results based on active tab
  const filteredResults = results.filter(result => result.type === activeTab);

  const TabButton = ({ tab, label, count }: { tab: SearchTab; label: string; count: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg
        transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      {tab === 'profiles' ? (
        <User className="h-4 w-4 mr-1.5" />
      ) : (
        <MessageSquare className="h-4 w-4 mr-1.5" />
      )}
      <span>{label}</span>
      <span className="bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="search-title" role="dialog" aria-modal="true">
      <div className="min-h-screen text-center">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 sm:p-0">
            <div ref={searchRef} className="relative w-full transform overflow-hidden rounded-xl bg-gray-800/95 backdrop-blur-xl text-left shadow-xl transition-all sm:my-8 sm:max-w-4xl border border-gray-700/50">
              <div className="p-4">
                {/* Search Input */}
                <div className="relative group">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 
                    group-hover:from-violet-500/30 group-hover:via-fuchsia-500/30 group-hover:to-violet-500/30
                    blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Glass morphism background */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 
                    group-hover:opacity-100 transition-all duration-500" />

                  {/* Input field */}
                  <input
                    ref={inputRef}
                    id="global-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for anything..."
                    className="relative w-full bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl 
                      pl-12 pr-4 py-3 text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                      shadow-[0_0_30px_-5px_rgba(124,58,237,0.1)] transition-all duration-300
                      hover:border-violet-500/30 hover:bg-gray-800/90 group-hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.2)]"
                  />
                  
                  {/* Search icon with gradient */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-300 
                    group-hover:scale-110 group-focus-within:scale-110">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 
                        group-hover:opacity-20 group-focus-within:opacity-20 blur-md transition-opacity duration-300" />
                      <Search className="h-5 w-5 text-gray-400 transition-colors duration-300 
                        group-hover:text-violet-400 group-focus-within:text-violet-400" />
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mt-4">
                  <TabButton 
                    tab="profiles" 
                    label="People" 
                    count={results.filter(r => r.type === 'profile').length} 
                  />
                  <TabButton 
                    tab="topics" 
                    label="Topics" 
                    count={results.filter(r => r.type === 'topic').length} 
                  />
                </div>

                {/* Results */}
                <div className="mt-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 
                          animate-pulse blur-md opacity-50" />
                        <div className="relative animate-spin rounded-full h-8 w-8 
                          border-2 border-violet-500/30 border-t-violet-500" />
                      </div>
                      <p className="text-gray-400 mt-4">Searching...</p>
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        {query.trim() ? 'No results found' : 'Start typing to search'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {filteredResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          to={result.type === 'profile' ? `/profile/${result.id}` : `/forum/topic/${result.id}`}
                          onClick={onClose}
                          className="block p-4 hover:bg-gray-700/30 transition-all duration-300 relative group"
                        >
                          {/* Result item gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 
                            group-hover:from-violet-500/5 group-hover:via-violet-500/10 group-hover:to-violet-500/5 
                            transition-all duration-500 opacity-0 group-hover:opacity-100" />
                          
                          <div className="flex items-start space-x-3 relative">
                            {result.type === 'profile' ? (
                              <>
                                <UserAvatar 
                                  user={{
                                    id: result.id,
                                    name: result.name!,
                                    avatar_url: result.avatar_url
                                  }}
                                  size="sm"
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-violet-400" />
                                    <span className="font-medium text-white group-hover:text-violet-300 transition-colors duration-300">
                                      {result.name}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {result.university} University
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-5 w-5 text-violet-400 mt-1" />
                                <div>
                                  <h4 className="font-medium text-white group-hover:text-violet-300 transition-colors duration-300">
                                    {result.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    by {result.author_name} • {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                                  </p>
                                  {result.content && (
                                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                      {result.content}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};