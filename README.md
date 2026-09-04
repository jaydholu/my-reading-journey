# My Reading Journey

> Your personal companion for tracking, rating, and organizing your reading life.

![Version](https://img.shields.io/badge/version-5.1.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Node](https://img.shields.io/badge/node-18+-green)

---

## Overview

**My Reading Journey** is a full-stack web application that helps readers track every book they read, rate and review them, manage a wishlist, view reading statistics, and import/export their data. Built with a FastAPI backend and a React frontend, it's designed to be fast, beautiful, and private.

---

##  Project Structure

```
my-reading-journey/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes/       # Auth, books, users, wishlist, data
│   │   ├── core/             # Config, database, security, email
│   │   ├── models/           # Pydantic models
│   │   ├── schemas/          # Request/response schemas
│   │   └── utils/            # File handlers, validators
│   ├── migrations/           # DB migration scripts
│   ├── main.py               # FastAPI app entry point
│   └── requirements.txt
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth & Theme context
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route-level page components
│   │   ├── router/           # React Router config
│   │   └── utils/            # Formatters, validators, constants
│   └── package.json
│
└── README.md                 # You are here
```

---

## Features

| Feature | Description |
|---|---|
| Book Tracking | Add, edit, and delete books with rich metadata |
| Ratings & Reviews | Rate books with a half-star precision star system |
| Favorites | Mark and filter your favorite reads |
| Wishlist | Manage books you want to read with priority levels |
| Statistics | Reading stats, genre breakdowns, monthly trends |
| Export | Export your library (JSON/CSV) with selective sections |
| Import | Import books from JSON or CSV files |
| Dark Mode | Full light/dark theme support |
| Auth | JWT-based auth with email verification & password reset |
| Cover Images | Upload book covers via Cloudinary |

---

## Quick Start

### Prerequisites

- Python 3.12.6 (or 3.11+)
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Gmail account (for transactional emails)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/my-reading-journey.git
cd my-reading-journey
```

### 2. Set up the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your credentials
uvicorn main:app --reload --port 8000
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
cp .env.example .env            # Set VITE_API_URL
npm run dev
```

The app will be available at **http://localhost:3000** with the API at **http://localhost:8000**.

---

## Environment Variables

### Backend `.env`

```env
SECRET_KEY=your-super-secret-key
MONGODB_URI=mongodb+srv://...
MONGODB_DBNAME=myreadingjourney
MONGODB_USER=your-db-user
MONGODB_PASSWORD=your-db-password

MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://...

FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=My Reading Journey
```

---

## Tech Stack

### Backend
- **FastAPI** — High-performance Python web framework
- **MongoDB** + **Motor** — Async NoSQL database
- **Cloudinary** — Image storage & CDN
- **FastAPI-Mail** — Email sending
- **python-jose** — JWT authentication
- **Passlib + bcrypt** — Password hashing
- **Pydantic v2** — Data validation

### Frontend
- **React 18** — UI framework
- **React Router 6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Framer Motion** — Animations
- **Axios** — HTTP client
- **date-fns** — Date formatting
- **Lucide React** — Icon library
- **Vite** — Build tool

---

## API Overview

Base URL: `/api/v1`

| Group | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/verify-email/:token`, `/auth/forgot-password`, `/auth/reset-password/:token` |
| Books | `GET/POST /books`, `GET/PUT/DELETE /books/:id`, `PATCH /books/:id/favorite`, `POST /books/:id/cover-image` |
| Wishlist | `GET/POST /wishlist`, `GET/PUT/DELETE /wishlist/:id`, `POST /wishlist/:id/move-to-library` |
| Users | `GET/PUT /users/me`, `POST /users/me/picture`, `PUT /users/me/password`, `DELETE /users/me/delete` |
| Data | `GET /data/export/selective`, `POST /data/import`, `GET /data/export/json`, `GET /data/export/csv` |

Interactive docs available at **http://localhost:8000/docs** (development mode).

---

## Roadmap

- [ ] Responsive mobile UI improvements
- [ ] README files (backend, frontend)
- [ ] Add book / Edit book UI/UX improvements
- [ ] Reading challenges & goal tracking
- [ ] Book recommendations
- [ ] Social sharing

---

## License

MIT © 2026 [Jay Dholu](https://jaydholu.in/)

---

## Contact

- Mail:  [jaydholu92@gmail.com](mailto:jaydholu92@gmail.com)
- GitHub:  [jaydholu](https://gitub.com/jaydholu)
- LinkedIn:  [jaydholu](https://linkedin.com/in/jaydholu)
- Instagram:  [\_jaydholu\_](https://instagram.com)
- Twitter (X):  [@jay_dholu](https://x.com/jay_dholu)
