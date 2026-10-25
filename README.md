# Blog Codomax

A modern, full-featured blogging platform built with Node.js, Express, and Supabase. Blog Codomax enables writers and creators to publish articles, track analytics, and build an engaged audience.

## Features

### Authentication & Security
- **JWT-based authentication** with secure token management
- **User registration** with email validation and password hashing (bcrypt)
- **User login/logout** with session management via localStorage
- **Protected routes** - dashboard and create blog require authentication
- **Profile management** - update first name, last name, username, email
- **Password reset** with current password verification

### Blog Management
- **Create, edit, delete** blog posts with full CRUD operations
- **Status tracking** - draft, published, archived states
- **Image upload** with Supabase storage integration
- **Author filtering** - each user can only manage their own blogs
- **Published blogs feed** - public endpoint shows all published posts

### User Dashboard
- **Personal dashboard** displaying user's blogs with stats
- **Blog statistics** - total posts, views, likes, comments
- **Tab filtering** - view all, published, drafts, archived posts
- **Logout functionality** with secure token cleanup

### Frontend Experience
- **Responsive design** - works mobile and desktop
- **Live preview** while writing blog posts
- **Image preview** before upload
- **Search functionality** across articles
- **Category filtering** by topic
- **Smooth navigation** with mobile menu toggle

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **JSON Web Tokens** (jwt) for authentication
- **bcryptjs** for password hashing
- **dotenv** for environment variable management
- **CORS** for cross-origin resource sharing
- **@supabase/supabase-js** for database and storage

### Frontend
- **Vanilla JavaScript** with modular architecture
- **localStorage** for client-side token persistence
- **Fetch API** for all backend communication
- **Responsive CSS** with custom properties

### Database
- **Supabase** PostgreSQL for blogs storage
- **JSON files** for user data (users.json, data directory)
- **Supabase Storage** for image uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Supabase project with:
  - `blogs` table created
  - Storage bucket configured (default: `Blogs`)
  - API keys (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/blog-codomax.git
   cd blog-codomax
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   JWT_SECRET=your-secure-jwt-secret-change-in-production
   JWT_EXPIRES_IN=7d

   # Supabase Configuration
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_BUCKET=Blogs
   ```

4. **Initialize the database:**
   Run the Supabase setup SQL script:
   ```bash
   # Or execute via Supabase dashboard SQL editor
   supabase db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev   # with nodemon (recommended)
   # or
   npm start
   ```

6. **Access the application:**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api
   - Health check: http://localhost:5000/api/health

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | User login, returns JWT token |
| `GET` | `/me` | Get current user profile (requires auth) |
| `PUT` | `/me` | Update profile (firstName, lastName, username, email) |
| `PUT` | `/me/password` | Change password (requires current password) |

### Blog Routes (`/api/blogs`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|-------------|-------------|
| `GET` | `/` | No | Get all published blogs |
| `GET` | `/user` | Yes | Get current user's blogs |
| `GET` | `/:id` | No | Get blog by ID |
| `POST` | `/` | Yes | Create new blog post |
| `PUT` | `/:id` | Yes | Update blog post (author-only) |
| `DELETE` | `/:id` | Yes | Delete blog post (author-only) |
| `POST` | `/upload-image` | Yes | Upload blog thumbnail image |

## Project Structure

```
blog-codomax/
├── assets/           # Static files (CSS, JS, images)
│   ├── css/          # Stylesheets
│   ├── images/       # Blog post images
│   └── js/           # Client-side JavaScript
│       └── app.js    # Main frontend logic
├── config/           # Configuration files
│   ├── db.js         # JSON file read/write helpers
│   └── supabase.js   # Supabase client initialization
├── data/             # Local JSON data files
│   ├── users.json    # Registered users ( persists across restarts)
│   └── blogs.json    # Blog posts data
├── middleware/       # Express middleware
│   └── auth.js       # JWT authentication middleware
├── models/           # Business logic models
│   ├── Blog.js       # Blog database operations
│   └── User.js       # User authentication & management
├── routes/           # Express routes
│   ├── auth.js       # Authentication routes
│   └── blogs.js      # Blog CRUD routes
├── .env              # Environment variables (gitignored)
├── .gitignore        # Git ignore rules
├── package.json      # Dependencies and scripts
├── server.js         # Express app entry point
├── vercel.json       # Vercel deployment config
└── supabase-setup.sql # Database schema setup
```

## Security Features

- **Password hashing** with bcrypt (10 rounds)
- **JWT secrets** from environment variables (not hardcoded)
- **Token expiration** (7 days configurable via JWT_EXPIRES_IN)
- **Input validation** on all user-submitted data
- **SQL injection prevention** via Supabase parameterized queries
- **CORS** configured for production domains
- **HTTP-only** security headers via vercel.json

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub** your repository
2. **Import to Vercel** - connect your GitHub repository
3. **Add environment variables** in Vercel dashboard:
   - `PORT` (default: 5000)
   - `JWT_SECRET` (your secure secret)
   - `JWT_EXPIRES_IN` (default: 7d)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_BUCKET` (default: Blogs)

4. **Vercel will automatically:**
   - Install dependencies via `npm install`
   - Deploy the Node.js serverless function
   - Configure API routes under `/api/*`
   - Serve static frontend files from root

The `vercel.json` config handles:
- API route mapping to `api/index.js`
- CORS headers for authenticated requests
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Rewrites for SPA fallback (if needed)

### Local Vercel-like Testing

You can test the Vercel deployment locally:

```bash
vercel dev
# or
vercel --ill
```

## License

MIT License - Copyright (c) 2026 Blog Codomax

## Contact

- GitHub: [@your-username](https://github.com/your-username)
- Project: [Blog Codomax](https://blog-codomax.com)