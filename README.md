# HotelPro HMS - Multi-tenant SaaS Hotel Management System

Production-ready full-stack baseline for a multi-tenant Hotel Management SaaS platform.

## Tech Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Auth/Security: JWT, bcrypt, role-based access, input validation, Helmet, CORS, rate limiting
- ORM: Prisma
- Databases:
  - Development: SQLite
  - Production: PostgreSQL
- Containers: Docker + Docker Compose

## Roles
- `SUPER_ADMIN`
- `OWNER`
- `MANAGER`
- `RECEPTIONIST`
- `HOUSEKEEPING`

## Implemented Modules
- Authentication: register, login, logout, change password, JWT auth, RBAC
- Hotel Management: create/update hotel, hotel settings
- Room Management: room types, rooms, pricing, status, amenities
- Reservations: create/modify/cancel, check-in/out
- Guest CRM: profiles, stay history
- Housekeeping: tasks and maintenance workflows
- Billing/Payments: invoices, payments, payment history
- Reports: occupancy, revenue, daily/monthly sales
- SaaS Admin: hotels, users, subscriptions, platform analytics

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   └── utils
│   ├── Dockerfile
│   └── package.json
├── server
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prisma Schema
Defined in `server/prisma/schema.prisma` with:
- Models: `User`, `Hotel`, `RoomType`, `Room`, `Guest`, `Reservation`, `Payment`, `Subscription`
- Additional model: `HousekeepingTask`
- Enums: `Role`, `RoomStatus`, `ReservationStatus`

## REST API Endpoints
Base URL: `/api`

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `PATCH /auth/change-password`

### Hotels
- `GET /hotels`
- `POST /hotels`
- `GET /hotels/:id`
- `PUT /hotels/:id`
- `PATCH /hotels/:id/settings`

### Rooms
- `POST /rooms/types`
- `GET /rooms/types`
- `POST /rooms`
- `GET /rooms`
- `PUT /rooms/:id`

### Reservations
- `GET /reservations`
- `POST /reservations`
- `PUT /reservations/:id`
- `PATCH /reservations/:id/cancel`
- `PATCH /reservations/:id/check-in`
- `PATCH /reservations/:id/check-out`

### Guests
- `GET /guests`
- `POST /guests`
- `GET /guests/:id`
- `PUT /guests/:id`

### Housekeeping
- `GET /housekeeping`
- `POST /housekeeping`
- `PUT /housekeeping/:id`

### Billing
- `GET /billing/invoices`
- `GET /billing/payments`
- `POST /billing/payments`

### Reports
- `GET /reports/dashboard`
- `GET /reports/revenue`

### SaaS Admin (Super Admin only)
- `GET /admin/analytics`
- `GET /admin/hotels`
- `GET /admin/users`
- `GET /admin/subscriptions`
- `POST /admin/subscriptions`

## Environment Variables
Use root `.env` (copy from `.env.example`):

```env
DB_PROVIDER="sqlite" # sqlite for dev, postgresql for prod
DATABASE_URL="file:./dev.db" # dev example
JWT_SECRET="change_this_to_a_long_random_secret"
PORT=5000
VITE_API_URL="http://localhost:5000/api"
```

Production Postgres example:

```env
DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hotelpro?schema=public"
```

## Local Development Setup

### 1. Backend
```bash
cd server
cp .env.example .env
# set DB_PROVIDER="sqlite" and DATABASE_URL="file:./dev.db" for development
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### 2. Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Docker Setup

```bash
cp .env.example .env
# set DB_PROVIDER=postgresql and DATABASE_URL postgres connection string
docker compose up --build
```

Services:
- Client: `http://localhost:5173`
- API: `http://localhost:5000/api`
- PostgreSQL: `localhost:5432`

## Deployment Notes
- Use PostgreSQL in production (`DB_PROVIDER=postgresql`)
- Run Prisma migrations with `npm run prisma:deploy`
- Set a strong `JWT_SECRET`
- Put API behind HTTPS reverse proxy (Nginx/Traefik)
- Add centralized logs/monitoring before go-live

## Seed Account
- Email: `superadmin@hotelpro.com`
- Password: `Admin@1234`

Change this password immediately after first login.
