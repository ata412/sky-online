# Sky Online

E-commerce web application with a React frontend and an Express/PostgreSQL backend.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, react-i18next (TH/EN), Three.js (`@react-three/fiber`)
- **Backend**: Node.js, Express, PostgreSQL (`pg`), bcrypt
- **Infra**: Docker Compose (Postgres + backend + frontend/nginx)

## Project Structure

```
.
├── backend/            # Express API
│   ├── src/
│   │   ├── db/          # schema, seed, migrations
│   │   ├── routes/       # products, orders, members, promotions, ...
│   │   └── index.js
│   └── Dockerfile
├── frontend/            # React app
│   ├── src/
│   │   ├── pages/         # Home, Products, Checkout, Login, ...
│   │   ├── components/
│   │   ├── context/        # Auth, Cart
│   │   └── i18n/
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Run locally without Docker

**Backend**

```bash
cd backend
cp .env.example .env   # adjust DB credentials as needed
npm install
npm run dev             # nodemon, http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

**Database**

Create a PostgreSQL database matching your `.env`, then run:

```bash
psql -U postgres -d sky_online -f backend/src/db/schema.sql
psql -U postgres -d sky_online -f backend/src/db/seed.sql
```

## Environment Variables

Backend (`backend/.env`, see `backend/.env.example`):

| Variable      | Description            |
|---------------|-------------------------|
| `PORT`        | API server port         |
| `DB_HOST`     | PostgreSQL host         |
| `DB_PORT`     | PostgreSQL port         |
| `DB_NAME`     | Database name           |
| `DB_USER`     | Database user           |
| `DB_PASSWORD` | Database password       |
