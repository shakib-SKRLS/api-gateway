# api-gateway

An API gateway for Shakib's booking microservices — a single entry point that checks authentication and proxies requests to the booking service.

## Tech
- Node.js, Express
- `http-proxy-middleware` for proxying
- `axios` for the auth check
- `express-rate-limit` and `morgan` for rate limiting and logging

## How it works
- Rate limit: 5 requests per IP per 2 minutes.
- Requests to `/bookingservice` first call `GET http://localhost:3000/api/v1/isauthenticated` with the `x-access-token` header. If that check fails, the gateway returns 401.
- Authenticated requests are proxied to the booking service at `http://localhost:3002/` (the `/bookingservice` prefix is stripped, since the booking service mounts its routes at `/api`).
- `GET /` returns a welcome message for the booking service proxy.

## How to run
```bash
npm install
npm start   # port 3006 by default (PORT env var)
```
The auth service must be running on port 3000 and the booking service on port 3002 for the gateway to work as written (override with `AUTH_SERVICE_URL` and `BOOKING_SERVICE_URL`; see `.env.example`).

## License
MIT
