# Johnblex AI - Backend

This is the backend API for the Johnblex AI SaaS platform.

## Features
- Google OAuth 2.0 (Passport)
- JWT authentication (stateless)
- Email OTP signup with 6-digit code
- Password signup + login
- Role-based access control (admin / client)
- Secure JWT validation on every protected route
- Rate limiting + security headers

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development mode:

```bash
npm run dev
```

## Important Endpoints
- `GET /api/auth/google` - start Google OAuth flow
- `GET /api/auth/google/callback` - Google redirect URI
- `POST /api/auth/signup/email` - request OTP
- `POST /api/auth/signup/verify` - verify OTP
- `POST /api/auth/signup/password` - complete signup
- `POST /api/auth/login` - login with email/password
- `GET /api/user/me` - protected profile endpoint (requires `Authorization: Bearer <token>` or HTTP-only cookie)

### Admin API (requires admin role)
- `GET /api/admin/clients` - list client users
- `POST /api/admin/clients` - create a new client user
- `GET /api/admin/leads` - list leads (supports `?clientId=` and `?status=` filters)
- `GET /api/admin/widget-token?clientId=` - issue a short-lived widget token for embedding

### Client API (requires client role)
- `GET /api/client/leads` - list leads for current client
- `POST /api/client/leads/:id/contacted` - mark a lead as contacted

### Widget API
- `POST /api/widget/lead` - create a lead record via embeddable widget (requires widget token)
- `GET /widget.js` - script tag for embedding widget on external sites
- `GET /widget/embed` - iframe content for embedded widget

## Notes
- JWTs expire in 7 days.
- OTP expires in 5 minutes and allows up to 5 attempts.
