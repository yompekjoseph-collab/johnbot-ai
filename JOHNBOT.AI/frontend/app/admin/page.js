'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/api/user/me`, { withCredentials: true }),
      axios.get(`${BACKEND_URL}/api/admin/clients`, { withCredentials: true }),
      axios.get(`${BACKEND_URL}/api/admin/leads`, { withCredentials: true }),
    ])
      .then(([userRes, clientsRes, leadsRes]) => {
        setUser(userRes.data.user);
        setClients(clientsRes.data.clients);
        setLeads(leadsRes.data.leads);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute role="admin">
      <div className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '980px' }}>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            This is the admin control panel. Only users with the <strong>admin</strong> role can access this area.
          </p>

          {error && (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', borderColor: 'rgba(255, 85, 85, 0.3)' }}>
              <p style={{ color: 'rgba(255, 102, 102, 0.9)' }}>{error}</p>
            </div>
          )}

          {user && (
            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <h2 style={{ marginTop: 0 }}>Hello, {user.email}</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>
                Your role is <strong>{user.role}</strong>. Manage clients, chatbots, and review leads from here.
              </p>
            </div>
          )}

          <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Create a new client</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <input
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="Client email"
                type="email"
                style={{
                  flex: '1 1 240px',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.2rem' }}
                onClick={async () => {
                  try {
                    const res = await axios.post(
                      `${BACKEND_URL}/api/admin/clients`,
                      { email: newClientEmail },
                      { withCredentials: true }
                    );
                    setClients((prev) => [res.data.user, ...prev]);
                    setNewClientEmail('');
                  } catch (err) {
                    setError(err.response?.data?.error || 'Failed to create client');
                  }
                }}
              >
                Create client
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Clients</h3>
            {clients.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>No clients yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {clients.map((client) => (
                  <div
                    key={client._id}
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>{client.email}</p>
                    <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                      Created: {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Recent leads</h3>
            {leads.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>No leads yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {lead.firstName} {lead.surname} • {lead.email}
                    </p>
                    <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                      Client: {lead.client?.email || 'Unknown'} • Status: {lead.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
