import Link from 'next/link';

const features = [
  {
    title: 'OpenAI Powered',
    description: 'Smart greetings, intelligent answers, demo booking automation.',
  },
  {
    title: 'FAQ Hybrid Engine',
    description: 'Instant answers from predefined knowledge base before AI triggers.',
  },
  {
    title: 'Demo Booking Form',
    description: 'Collect surname, first name, email, phone, company automatically.',
  },
  {
    title: 'Client Dashboard',
    description: 'Clients view bookings without editing chatbot.',
  },
  {
    title: 'Admin Control',
    description: 'Full backend system control for developer.',
  },
  {
    title: 'Secure Authentication',
    description: 'Google login, email verification, protected routes, JWT security.',
  },
];

const steps = [
  { label: 'Create Client Account', description: 'Set up your workspace and create a client profile.' },
  { label: 'Deploy Chatbot On Website', description: 'Install the embeddable script snippet on any site.' },
  { label: 'Visitors Chat & Book Demo', description: 'Leads book demos directly from the chatbot flow.' },
  { label: 'Client Views Bookings', description: 'Clients review and manage their booked demos.' },
];

export default function Home() {
  return (
    <>
      <section className="section" style={{ paddingTop: '7rem' }}>
        <div className="container" style={{ display: 'grid', gap: '2.5rem' }}>
          <div style={{ maxWidth: '55ch' }}>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(1rem, 1.08vw, 1.1rem)',
                letterSpacing: '0.04em',
                color: 'rgba(255,255,255,0.68)',
                textTransform: 'uppercase',
              }}
            >
              AI chatbots built for conversion
            </p>
            <h1
              style={{
                margin: '1.05rem 0 1.5rem',
                fontSize: 'clamp(2.6rem, 5vw, 3.4rem)',
                lineHeight: 1.1,
              }}
            >
              Build Smart AI Chatbots That Capture Leads &amp; Book Demos Automatically
            </h1>
            <p style={{ margin: 0, maxWidth: '38ch', lineHeight: 1.75, color: 'rgba(255,255,255,0.78)' }}>
              Deploy powerful OpenAI + FAQ hybrid chatbots on client websites. Let clients view demo bookings while you stay in full control.
            </p>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary">
                Start Free
              </Link>
              <a href="#features" className="btn btn-secondary">
                See Features
              </a>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(94,75,255,0.23), rgba(85,194,255,0.12))',
              borderRadius: '28px',
              padding: '2.4rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
              Bring smarter chatbots to life.
            </p>
            <p style={{ margin: '0.9rem 0 0', color: 'rgba(255,255,255,0.76)', lineHeight: 1.6 }}>
              Live preview, lead capture, booking workflows and role-based dashboards — all in one platform.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-heading">
          <h2>Everything You Need In One Platform</h2>
        </div>

        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.3rem',
          }}
        >
          {features.map((feature) => (
            <div key={feature.title} className="card">
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>{feature.title}</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="section-heading">
          <h2>How It Works</h2>
          <p>From signup to live demo booking in minutes — a modern workflow designed for agencies and teams.</p>
        </div>

        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
            textAlign: 'center',
          }}
        >
          {steps.map((step, index) => (
            <div key={step.label} className="card" style={{ padding: '2rem 1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'rgba(94, 75, 255, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                {index + 1}
              </div>
              <h3 style={{ margin: '0 0 0.65rem', fontSize: '1.05rem' }}>{step.label}</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '64ch', textAlign: 'center' }}>
          <h2>Unlike traditional chatbot tools, Johnblex AI gives developers full backend control while allowing clients to only view demo bookings and messages — without access to tamper with chatbot configuration.</h2>
        </div>
      </section>

      <section className="section" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '54ch' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Ready to Launch Your AI Chatbot Platform?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem' }}>
            Start building and deploying intelligent chatbots today.
          </p>
          <Link href="/login" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </section>
    </>
  );
}
