-- Supabase Setup SQL Script
-- Run this in your Supabase SQL Editor to create the waitlist table

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security (optional - for future use)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to do everything
-- (This is safe because we're using service role key on the backend)
CREATE POLICY "Service role can do everything" ON waitlist
  FOR ALL
  USING (true)
  WITH CHECK (true);

