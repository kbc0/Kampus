import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { TopicContent } from '../components/forum/TopicContent';
import { ReplyList } from '../components/forum/ReplyList';
import { ReplyForm } from '../components/forum/ReplyForm';
import { useTopic } from '../hooks/useTopic';

export const TopicPage = () => {
  const { topicId } = useParams();
  const { topic, loading, error } = useTopic(topicId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="h-32 bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-medium text-white">Topic not found</h2>
            <p className="text-gray-400 mt-2">
              The topic you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Discussions
          </Link>
        </div>

        <div className="space-y-6">
          <TopicContent topic={topic} />
          <ReplyList topicId={topic.id} />
          <ReplyForm topicId={topic.id} />
        </div>
      </main>
    </div>
  );
};