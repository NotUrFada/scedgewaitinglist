
export interface WaitlistEntry {
  id: string;
  email: string;
  timestamp: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const saveEmail = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Email already exists - treat as success
        return;
      }
      throw new Error(`Failed to save email: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error saving email to backend:', error);
    throw error;
  }
};

export const getEmails = async (): Promise<WaitlistEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`);
    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching emails from backend:', error);
    return [];
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
