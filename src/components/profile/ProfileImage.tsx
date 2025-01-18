import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface ProfileImageProps {
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ size = 'lg' }) => {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = user?.user_metadata?.avatar_url;

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await uploadImage(file);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden 
        bg-violet-500/20 border border-violet-500/30 flex items-center justify-center
        group-hover:border-violet-500/50 transition-colors duration-300`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.user_metadata?.name || 'Profile'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-violet-300">
            {user?.user_metadata?.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Upload Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
        {uploading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full bg-violet-500/20 border border-violet-500/30
              hover:bg-violet-500/30 transition-colors duration-300"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};