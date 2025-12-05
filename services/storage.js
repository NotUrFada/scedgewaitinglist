import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not set. Cloud storage unavailable.');
}

// Create Supabase client for storage
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const storage = {
  // Check if storage is configured
  isConfigured: () => supabase !== null,

  // Upload a file to Supabase Storage
  async uploadFile(bucket, filePath, fileBuffer, contentType) {
    if (!supabase) {
      throw new Error('Supabase storage not configured');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  },

  // Delete a file from storage
  async deleteFile(bucket, filePath) {
    if (!supabase) {
      throw new Error('Supabase storage not configured');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get public URL for a file
  getPublicUrl(bucket, filePath) {
    if (!supabase) {
      throw new Error('Supabase storage not configured');
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // List files in a bucket
  async listFiles(bucket, folder = '') {
    if (!supabase) {
      throw new Error('Supabase storage not configured');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('Error listing files:', error);
      throw error;
    }

    return data;
  }
};

