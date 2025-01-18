import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../common/Button';

interface AddFriendModalProps {
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  userName: string;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  onClose,
  onSubmit,
  userName
}) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(message);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Add {userName} as Friend
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Add a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
            >
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};