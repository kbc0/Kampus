import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReplyFormProps {
  topicId: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ topicId }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: topicId,
          content: content.trim(),
          author_id: user.id
        });

      if (error) throw error;

      setContent('');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        rows={4}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
          text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
        disabled={submitting}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="inline-flex items-center px-4 py-2 border border-transparent 
            rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 
            hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post Reply
            </>
          )}
        </button>
      </div>
    </form>
  );
};