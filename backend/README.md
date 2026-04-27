# My Reading Journey — Backend

> FastAPI + MongoDB backend powering the My Reading Journey application.

![Python](https://img.shields.io/badge/python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Motor-brightgreen)
![Version](https://img.shields.io/badge/version-4.0.0-blue)

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py         # Registration, login, email verification, password reset
│   │       ├── books.py        # Book CRUD, favorites, cover upload, stats
│   │       ├── users.py        # Profile management, picture upload, password change
│   │       ├── wishlist.py     # Wishlist CRUD, move-to-library
│   │       └── data.py         # Import/export (JSON, CSV)
│   ├── core/
│   │   ├── config.py           # Pydantic settings (reads from .env)
│   │   ├── database.py         # Motor async MongoDB client + indexes
│   │   ├── dependencies.py     # JWT auth dependency injection
│   │   ├── email.py            # FastAPI-Mail email sending
│   │   ├── cloudinary.py       # Image upload/delete helpers
│   │   ├── security.py         # Password hashing, JWT creation/decode
│   │   └── settings.py         # Settings re-export module
│   ├── models/
│   │   ├── book.py             # Book Pydantic model
│   │   ├── token.py            # Token payload models
│   │   └── user.py             # User Pydantic model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py             # Signup, Login, ForgotPassword schemas
│   │   ├── book.py             # BookCreate, BookUpdate, BookResponse schemas
│   │   ├── user.py             # UserResponse, UserUpdate, ChangePassword schemas
│   │   └── wishlist.py         # WishlistCreate, WishlistUpdate, WishlistResponse
│   └── utils/
│       ├── __init__.py
│       ├── file_handlers.py    # JSONHandler, CSVHandler for import/export
│       └── validators.py       # ISBN, date range, age validators
├── migrations/
│   └── migrate_user_fields.py  # One-time migration script
├── main.py                     # FastAPI app, middleware, routers, exception handlers
├── runtime.txt                 # Python version
└── requirements.txt
```

---

## Getting Started

### Prerequisites

- Python 3.12.6 (or 3.11+)
- MongoDB (local instance or MongoDB Atlas)
- Cloudinary account
- Gmail account (with App Password enabled)

### Installation

```bash
# Clone and navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Running the Server

```bash
# Development (with auto-reload)
uvicorn main:app --reload --port 8000

# Production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

The API will be available at **http://localhost:8000/api/v1**

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Application
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
MONGODB_DBNAME=myreadingjourney
MONGODB_USER=your-db-username
MONGODB_PASSWORD=your-db-password

# Email (Gmail with App Password)
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_SSL_TLS=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Frontend (for email links)
FRONTEND_URL=http://localhost:3000
```

---

## API Reference

Base path: `/api/v1`

### Authentication — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create a new user account |
| `POST` | `/login` | ❌ | Login with email or username |
| `GET` | `/me` | ✅ | Get current user info |
| `POST` | `/refresh` | Cookie | Refresh access token |
| `POST` | `/logout` | ✅ | Clear refresh token cookie |
| `POST` | `/verify-email/{token}` | ❌ | Verify email with token |
| `POST` | `/resend-verification` | ❌ | Resend verification email |
| `POST` | `/forgot-password` | ❌ | Request password reset |
| `POST` | `/reset-password/{token}` | ❌ | Reset password with token |

### Books — `/books`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List books (with filters, sorting, pagination) |
| `POST` | `/` | Create a new book |
| `GET` | `/stats` | Get reading statistics |
| `GET` | `/favorites` | List favorite books |
| `GET` | `/{id}` | Get a single book |
| `PUT` | `/{id}` | Update a book |
| `DELETE` | `/{id}` | Delete a book |
| `PATCH` | `/{id}/favorite` | Toggle favorite status |
| `POST` | `/{id}/cover-image` | Upload cover image |
| `GET` | `/{id}/next` | Get next book in library |

**Query Parameters for `GET /books`:**
- `search` — Search title or author
- `genre`, `author` — Filter by genre/author
- `rating_min`, `rating_max` — Filter by rating range
- `year` — Filter by year read
- `favorite` — Filter favorites only
- `sort` — `date_desc`, `date_asc`, `title_asc`, `title_desc`, `rating_desc`, `author_asc`, `author_desc`
- `page`, `limit` — Pagination

### Wishlist — `/wishlist`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List wishlist items (filtered, paginated) |
| `POST` | `/` | Add a book to wishlist |
| `GET` | `/{id}` | Get a single wishlist item |
| `PUT` | `/{id}` | Update a wishlist item |
| `DELETE` | `/{id}` | Remove from wishlist |
| `POST` | `/{id}/move-to-library` | Move to reading library |

### Users — `/users/me`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get user profile |
| `PUT` | `/` | Update profile |
| `POST` | `/picture` | Upload profile picture |
| `DELETE` | `/picture` | Remove profile picture |
| `PUT` | `/password` | Change password |
| `DELETE` | `/delete` | Delete account and all data |

### Data — `/data`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/export/selective` | Export selected data sections as JSON |
| `POST` | `/import?format_type=json\|csv` | Import books/wishlist |
| `GET` | `/export/json` | Export books (legacy flat array) |
| `GET` | `/export/csv` | Export books as CSV |
| `GET` | `/template/csv` | Download CSV import template |
| `GET` | `/export/user/json` | Export all user data |
| `GET` | `/export/user/csv` | Export profile as CSV |

---

## Database Collections

### `users`
```
_id, full_name, user_name, email, password (hashed),
theme, is_verified, is_active, bio, birthdate, gender,
country, city, favorite_genre, favorite_book, reading_goal,
hobbies, profile_picture, created_at, updated_at, last_login
```

### `books`
```
_id, user_id, title, author, isbn, genre, rating,
description, cover_image, reading_started, reading_finished,
is_favorite, page_count, publisher, publication_year,
language, format, created_at, updated_at
```

### `wishlist`
```
_id, user_id, title, author, isbn, genre, priority (1–5),
notes, price, acquisition_type, where_to_buy,
borrowed_from, created_at, updated_at
```

---

## Authentication Flow

1. **Register** → account created, verification email sent
2. **Verify Email** → token validated, account activated
3. **Login** → returns `access_token` (JSON) + `refresh_token` (httpOnly cookie)
4. **Access Protected Routes** → send `Authorization: Bearer <access_token>`
5. **Token Refresh** → `POST /auth/refresh` uses cookie to issue new access token
6. **Logout** → clears refresh token cookie

Access tokens expire in **60 minutes**. Refresh tokens expire in **30 days**.

---

## Image Upload

Images are uploaded to **Cloudinary**:
- Book covers → `book_covers/` folder, resized to `400×600`
- Profile pictures → `profile_pictures/` folder, resized to `500×500` (face crop)
- Max file size: **10MB** for covers, **5MB** for profile pictures
- Accepted formats: PNG, JPG, JPEG, GIF, WebP

---

## Middleware & Error Handling

- **CORS** — Configured for `http://localhost:3000` and `http://localhost:5173`
- **Upload Size Limit** — Requests over 50MB are rejected with `413`
- **Custom Exception Handlers** — Consistent JSON error responses for `400`, `401`, `403`, `404`, `422`, `500`
- **Validation Errors** — Bytes and non-serializable inputs are safely stripped

---

## Key Dependencies

```
fastapi==0.109.2
motor==3.3.2              # Async MongoDB driver
python-jose[cryptography] # JWT tokens
passlib[bcrypt]           # Password hashing
fastapi-mail              # Email sending
cloudinary                # Image storage
pydantic==2.6.1           # Data validation
pydantic-settings         # .env loading
```

---

## Running Tests

```bash
pip install pytest pytest-asyncio httpx
pytest
```

---
