'use client';

import { useEffect, useState } from 'react';
import { getCookieString } from '@/lib/api';

interface AuthExampleProps {
  serverAuth: (cookieString: string) => Promise<any>;
}

// This is a client component that wraps server auth functionality
export default function AuthExample({ serverAuth }: AuthExampleProps) {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        // Get the cookie string from the document
        const cookieStr = getCookieString();
        
        // Call the server action with the cookie string
        const data = await serverAuth(cookieStr);
        setAuthData(data);
      } catch (error) {
        console.error('Error fetching auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, [serverAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-example">
      <h2>Authentication Status</h2>
      <pre>{JSON.stringify(authData, null, 2)}</pre>
    </div>
  );
} 