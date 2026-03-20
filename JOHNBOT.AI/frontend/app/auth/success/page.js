'use client';

import { useEffect, useState } from 'react';

export default function OAuthSuccess() {
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const role = url.searchParams.get('role');
    const next = url.searchParams.get('next');

    if (!token) {
      setMessage('Missing token. Please sign in again.');
      return;
    }

    if (role) {
      localStorage.setItem('johnblex_role', role);
    }

    const destination = next || (role === 'admin' ? '/admin' : '/dashboard');

    setMessage('Redirecting...');
    window.location.replace(destination);
  }, []);

  return (
    <div className="section" style={{ paddingTop: '10rem', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2>{message}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            If you are not redirected automatically, please refresh or close and reopen.
          </p>
        </div>
      </div>
    </div>
  );
}
