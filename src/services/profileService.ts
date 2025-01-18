import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadProfileImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteProfileImage(fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}