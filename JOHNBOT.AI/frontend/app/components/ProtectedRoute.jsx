'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProtectedRoute({ role, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/me`, { withCredentials: true });
        if (role && res.data?.user?.role !== role) {
          router.replace('/login');
          return;
        }
        setReady(true);
      } catch (err) {
        router.replace('/login');
      }
    };

    check();
  }, [router, role]);

  if (!ready) {
    return (
      <div className="section" style={{ paddingTop: '10rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div className="card" style={{ padding: '2.8rem' }}>
            <h2>Loading...</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Verifying your session.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
