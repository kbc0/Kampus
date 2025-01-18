import React from 'react';
import { Reply } from './Reply';
import { useReplies } from '../../hooks/useReplies';

interface ReplyListProps {
  topicId: string;
}

export const ReplyList: React.FC<ReplyListProps> = ({ topicId }) => {
  const { replies, loading } = useReplies(topicId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-8 w-8 bg-gray-700 rounded-lg" />
              <div className="h-4 bg-gray-700 rounded w-32" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!replies.length) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <p className="text-gray-400">No replies yet. Be the first to reply!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <Reply key={reply.id} reply={reply} />
      ))}
    </div>
  );
};