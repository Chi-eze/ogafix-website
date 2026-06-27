# OgaFix Frontend

This is the React frontend for the OgaFix platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000/api
```

For production:

```
VITE_API_URL=https://api.ogafix.com/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## Project Structure

```
src/
├── components/       # Reusable components (Header, Footer, etc.)
├── pages/           # Page components (Home, Login, Dashboard, etc.)
├── services/        # API service layer
├── store/           # Zustand stores (auth, etc.)
├── App.jsx          # Main app component with routing
├── main.jsx         # React entry point
└── index.css        # Global styles with Tailwind
```

## Key Features

- **Authentication:** Login/Register with JWT tokens
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **State Management:** Zustand for auth state
- **API Integration:** Axios with interceptors for API calls
- **Toast Notifications:** React Hot Toast for user feedback
- **Routing:** React Router v6 for client-side routing

## Available Pages

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page (with customer/tradesman toggle)
- `/dashboard` - Main dashboard with job listings
- `/profile` - User profile management
- `/jobs/new` - Post a new job
- `/jobs/:id` - Job details
- `/tradesman/:id` - Tradesman profile
- `/messages` - Messaging interface

## Deployment to GoDaddy

### 1. Build the Project

```bash
npm run build
```

### 2. Upload to GoDaddy

1. Go to GoDaddy hosting control panel
2. Open File Manager
3. Navigate to `public_html` folder
4. Upload all files from the `dist` folder
5. Ensure `.htaccess` is configured for React Router (see below)

### 3. Configure .htaccess for React Router

Create a `.htaccess` file in the root directory with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3000/api |

## Troubleshooting

### API Calls Not Working

Ensure the backend API is running and the `VITE_API_URL` is correctly configured.

### 404 on Page Refresh

Make sure `.htaccess` is properly configured on GoDaddy hosting to handle React Router.

### Styles Not Loading

Clear browser cache and rebuild the project with `npm run build`.
