'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="container" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div
        className="flex"
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 0',
          transition: 'background 0.2s ease, border 0.2s ease, backdrop-filter 0.2s ease',
          background: scrolled ? 'rgba(10, 12, 20, 0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <Link href="/" style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          Johnblex AI
        </Link>

        <nav className="flex" style={{ gap: '1.4rem', alignItems: 'center' }}>
          <a href="#features" className="navLink">
            Features
          </a>
          <a href="#how" className="navLink">
            How It Works
          </a>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.7rem 1.25rem' }}>
            Login
          </Link>
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.7rem 1.25rem' }}>
            Get Started
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .navLink {
          position: relative;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          padding: 0.2rem 0;
        }

        .navLink:hover {
          color: white;
        }

        @media (max-width: 780px) {
          header > div {
            flex-wrap: wrap;
            gap: 0.8rem;
          }

          nav {
            width: 100%;
            justify-content: space-between;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </header>
  );
}
