
export interface WaitlistEntry {
  id: string;
  email: string;
  timestamp: number;
}

// Get API URL from environment or use default
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure it doesn't end with /api (we add that below)
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // Default to localhost for development
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiUrl();

// Log API URL (helps with debugging in both dev and production)
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 VITE_API_URL env:', import.meta.env.VITE_API_URL || 'NOT SET');

// Check if we're in production and using localhost (which won't work)
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    console.error('⚠️ WARNING: API URL is set to localhost in production! Set VITE_API_URL in Vercel to: https://scedge-backend.onrender.com/api');
  }
}

export const saveEmail = async (email: string): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/waitlist`;
    console.log('📤 Saving email to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Email already exists - treat as success
        console.log('✅ Email already exists');
        return;
      }
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      throw new Error(`Failed to save email: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Email saved successfully:', data);
  } catch (error) {
    console.error('❌ Error saving email to backend:', error);
    // If it's a network error, provide more helpful message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend API. Please check that the backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const getEmails = async (): Promise<WaitlistEntry[]> => {
  try {
    const url = `${API_BASE_URL}/waitlist`;
    console.log('📥 Fetching emails from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      throw new Error(`Failed to fetch emails: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Fetched emails:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error fetching emails from backend:', error);
    // Re-throw the error so the UI can show it
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend. Check that VITE_API_URL is set to: https://scedge-backend.onrender.com/api`);
    }
    throw error;
  }
};

export const clearEmails = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to clear emails: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error clearing emails:', error);
    throw error;
  }
};
