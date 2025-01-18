import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useMatches } from '../../../hooks/useMatches';
import { MatchCard } from './MatchCard';
import { MatchListSkeleton } from './MatchListSkeleton';
import { toast } from 'react-hot-toast';
import { findExistingConversation, createConversation } from '../../../services/conversationService';

interface MatchListProps {
  title: string;
  description: string;
  type: 'canHelp' | 'needsHelp';
  subjects: string[];
}

export const MatchList: React.FC<MatchListProps> = ({
  title,
  description,
  type,
  subjects
}) => {
  const { matches, loading, error } = useMatches(type, subjects);
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [matches]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleMessage = async (matchId: string) => {
    if (!user) return;

    try {
      const existingConv = await findExistingConversation(user.id, matchId);
      let conversationId = existingConv?.id;

      if (!conversationId) {
        const newConv = await createConversation(user.id, matchId);
        conversationId = newConv.id;
      }

      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  if (loading) {
    return <MatchListSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 sm:p-6">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-red-400 text-sm">
          Failed to load matches. Please try again later.
        </p>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 sm:p-6">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">
          {type === 'canHelp' 
            ? 'Add subjects you can help with to find students who need your help!'
            : 'Add subjects you need help with to find study buddies!'}
        </p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 sm:p-6">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">
          {type === 'canHelp'
            ? 'No students currently need help with these subjects.'
            : 'No students currently available to help with these subjects.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-lg border transition-colors duration-300
                ${!canScrollLeft 
                  ? 'bg-gray-800/30 border-gray-700/30 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-violet-500/30'}`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-lg border transition-colors duration-300
                ${!canScrollRight
                  ? 'bg-gray-800/30 border-gray-700/30 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-violet-500/30'}`}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
        onScroll={checkScrollButtons}
      >
        {matches.map((match) => (
          <div key={match.id} className="snap-start flex-shrink-0">
            <MatchCard
              id={match.id}
              name={match.name}
              university={match.university}
              major={match.major}
              minor={match.minor}
              avatar_url={match.avatar_url}
              matchingSubjects={match.matchingSubjects}
              onMessage={() => handleMessage(match.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};