# AI-Powered Certificate Management System

Production-oriented full-stack certificate management platform with:

- React + Tailwind CSS frontend using a neumorphism design system
- FastAPI backend with JWT authentication
- MongoDB persistence
- Cloudinary-based file storage
- SHA-256 hashing and QR code generation for certificates
- Docker-based local deployment

## Step-by-Step Implementation Plan

1. Scaffold separate `frontend`, `backend`, `database`, and `docker` workspaces.
2. Build FastAPI configuration, MongoDB connection management, and startup bootstrap for a single admin user.
3. Add JWT login, bcrypt password hashing, and admin-only route dependencies.
4. Implement domain CRUD with public read access and admin-only mutation access.
5. Implement certificate CRUD with multipart upload, unique certificate number generation, QR code generation, SHA-256 hashing, and public/private visibility rules.
6. Create a public profile API that aggregates visible certificates and domain stats.
7. Build the React client with token persistence, protected admin routing, public profile browsing, and admin-only action rendering.
8. Apply a consistent neumorphism UI system for cards, buttons, inputs, sidebar, dashboard, and profile pages.
9. Add MongoDB initialization assets, Dockerfiles, Docker Compose, and run/deployment documentation.

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   ├── mongo-init.js
│   └── schema.md
├── docker/
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Core Backend Features

- `POST /api/login`
- `GET /api/domains`
- `POST /api/domains`
- `DELETE /api/domains/{id}`
- `GET /api/certificates`
- `POST /api/certificates`
- `PUT /api/certificates/{id}`
- `DELETE /api/certificates/{id}`
- `GET /api/profile`

Behavior:

- Unauthenticated users can only access public GET data.
- Authenticated admin sessions can manage domains and certificates.
- The backend auto-upserts the single admin user from environment variables at startup.
- Certificate records include a unique ID, SHA-256 hash, Cloudinary file URL, and QR code.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload
```

If `python -m venv .venv` is interrupted on Windows and `.venv` already exists, finish pip setup with:

```bash
.\.venv\Scripts\python.exe -m ensurepip --upgrade
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### MongoDB

Run MongoDB locally on `mongodb://localhost:27017` or use Docker Compose below.
The sample backend `.env.example` is configured for local development, and Docker Compose overrides `MONGO_URI` to use the `mongodb` service name inside containers.

## Docker Setup

```bash
cd docker
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## Deployment Steps

1. Replace placeholder values in `backend/.env.example` or create a secure production `.env`.
2. Set a strong `JWT_SECRET_KEY`.
3. Configure Cloudinary credentials so certificate uploads work.
4. Build the frontend with `VITE_API_BASE_URL=/api` behind a reverse proxy or CDN.
5. Run the FastAPI backend behind a process manager or container orchestrator.
6. Run MongoDB with persistent storage and backups enabled.
7. Expose the frontend through Nginx, Caddy, or a cloud load balancer with HTTPS.

## Notes

- The admin account is seeded from environment variables. There is no public registration flow by design.
- Domain deletion is blocked when certificates still reference that domain.
- Public profile pages only expose certificates whose `visibility` is `public`.
