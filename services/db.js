import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not set. Using fallback file storage.');
  console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Create Supabase client (use service role key for server-side operations)
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const db = {
  // Check if Supabase is configured
  isConfigured: () => supabase !== null,

  // Get all waitlist entries
  async getEmails() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emails from Supabase:', error);
      throw error;
    }

    // Transform to match existing format
    return data.map(entry => ({
      id: entry.id,
      email: entry.email,
      timestamp: new Date(entry.created_at).getTime()
    }));
  },

  // Add a new email
  async addEmail(email) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      throw new Error('Email already exists');
    }

    // Insert new email
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        { email: email.toLowerCase().trim() }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding email to Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      timestamp: new Date(data.created_at).getTime()
    };
  },

  // Clear all emails
  async clearEmails() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('waitlist')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (this condition is always true)

    if (error) {
      console.error('Error clearing emails from Supabase:', error);
      throw error;
    }
  }
};

