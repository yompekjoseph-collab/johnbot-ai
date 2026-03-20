'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    Promise.all([
      axios.get(`${BACKEND_URL}/api/user/me`, { withCredentials: true }),
      axios.get(`${BACKEND_URL}/api/client/leads`, { withCredentials: true }),
    ])
      .then(([userRes, leadsRes]) => {
        setUser(userRes.data.user);
        setLeads(leadsRes.data.leads);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute role="client">
      <div className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '980px' }}>
          <h1>Client Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>View your demo bookings and leads here.</p>

          {loading && (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <p>Loading profile…</p>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', borderColor: 'rgba(255, 85, 85, 0.3)' }}>
              <p style={{ color: 'rgba(255, 102, 102, 0.9)' }}>{error}</p>
            </div>
          )}

          {user && (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <h2 style={{ marginTop: 0 }}>Welcome, {user.email}</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>
                You are signed in as a <strong>{user.role}</strong> user. Below are the leads collected by your chatbots.
              </p>
            </div>
          )}

          {leads.length > 0 ? (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <h3 style={{ marginTop: 0 }}>Recent Leads</h3>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {lead.firstName} {lead.surname}
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {lead.status === 'new' ? 'New' : 'Contacted'}
                        </span>
                      </p>
                      <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.72)' }}>{lead.email}</p>
                      <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {lead.companyName || 'No company'} • {lead.phone || 'No phone'}
                      </p>
                    </div>
                    {lead.status === 'new' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap' }}
                        onClick={async () => {
                          try {
                            await axios.post(
                              `${BACKEND_URL}/api/client/leads/${lead._id}/contacted`,
                              {},
                              { withCredentials: true }
                            );
                            setLeads((current) =>
                              current.map((l) => (l._id === lead._id ? { ...l, status: 'contacted' } : l))
                            );
                          } catch (err) {
                            setError(err.response?.data?.error || 'Failed to update lead');
                          }
                        }}
                      >
                        Mark contacted
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)' }}>
                No leads yet. Once visitors book demos via your chatbot, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
