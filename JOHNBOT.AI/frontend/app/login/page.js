'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function EmailSignup({ onSuccess }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleEmail = async (evt) => {
    evt.preventDefault();
    setError('');
    setInfo('');

    try {
      await axios.post(`${BACKEND_URL}/api/auth/signup/email`, { email });
      setInfo('OTP sent to your email. Check your inbox.');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerify = async (evt) => {
    evt.preventDefault();
    setError('');
    setInfo('');

    try {
      await axios.post(`${BACKEND_URL}/api/auth/signup/verify`, { email, code });
      setInfo('Code verified. Create a password.');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  const handlePassword = async (evt) => {
    evt.preventDefault();
    setError('');
    setInfo('');

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/signup/password`, { email, password });
      const { role } = res.data;
      localStorage.setItem('johnblex_role', role);
      onSuccess(role);
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed');
    }
  };

  const renderStep = () => {
    if (step === 'email') {
      return (
        <form onSubmit={handleEmail} className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>Create an account</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)' }}>Start with your email to get a verification code.</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            required
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              marginTop: '1rem',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.4rem' }}>
            Send code
          </button>
          {info && <p style={{ color: 'rgba(115,238,203,0.9)', marginTop: '1rem' }}>{info}</p>}
          {error && <p style={{ color: 'rgba(255,102,102,0.95)', marginTop: '1rem' }}>{error}</p>}
        </form>
      );
    }

    if (step === 'verify') {
      return (
        <form onSubmit={handleVerify} className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>Enter verification code</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)' }}>
            We sent a 6-digit code to <strong>{email}</strong>.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
            inputMode="numeric"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              marginTop: '1rem',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.4rem' }}>
            Verify code
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => setStep('email')}
          >
            Use different email
          </button>
          {info && <p style={{ color: 'rgba(115,238,203,0.9)', marginTop: '1rem' }}>{info}</p>}
          {error && <p style={{ color: 'rgba(255,102,102,0.95)', marginTop: '1rem' }}>{error}</p>}
        </form>
      );
    }

    return (
      <form onSubmit={handlePassword} className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Create a password</h2>
        <p style={{ color: 'rgba(255,255,255,0.72)' }}>
          Minimum 8 characters, with uppercase, lowercase, number and symbol.
        </p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            marginTop: '1rem',
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.4rem' }}>
          Create account
        </button>
        {info && <p style={{ color: 'rgba(115,238,203,0.9)', marginTop: '1rem' }}>{info}</p>}
        {error && <p style={{ color: 'rgba(255,102,102,0.95)', marginTop: '1rem' }}>{error}</p>}
      </form>
    );
  };

  return <>{renderStep()}</>;
}

export default function LoginPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const msg = search.get('msg');
    if (msg) {
      setError(msg);
    }
  }, []);

  const handleSuccess = (role) => {
    const target = role === 'admin' ? '/admin' : '/dashboard';
    window.location.href = target;
  };

  return (
    <div className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            padding: '2.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ marginTop: 0 }}>Sign in to Johnblex AI</h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', marginBottom: '1.5rem' }}>
              Use Google or create an account with email verification.
            </p>

            <a
              href={`${BACKEND_URL}/api/auth/google`}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continue with Google
            </a>

            <div style={{ textAlign: 'center', margin: '1.6rem 0', color: 'rgba(255,255,255,0.55)' }}>
              OR
            </div>

            <EmailSignup onSuccess={handleSuccess} />

            {error && <p style={{ color: 'rgba(255,102,102,0.95)', marginTop: '1.2rem' }}>{error}</p>}

            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
              By continuing, you agree to our <a href="#" style={{ color: 'rgba(94,75,255,0.9)' }}>Terms</a> and{' '}
              <a href="#" style={{ color: 'rgba(94,75,255,0.9)' }}>Privacy Policy</a>.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '22px', background: 'rgba(255,255,255,0.04)' }}>
            <h3 style={{ marginTop: 0 }}>How it works</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              <li>Sign up with Google or email.</li>
              <li>Invite clients and deploy chatbots.</li>
              <li>Leads book demos via intelligent chat.</li>
              <li>Clients view bookings in a clean dashboard.</li>
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              Everything runs on JWT-based auth and secure APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
