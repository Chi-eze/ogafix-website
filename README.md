# OgaFix Website

Complete web application for the OgaFix platform - connecting customers with trusted tradesmen across Nigeria.

## Project Structure

```
ogafix-website/
├── backend/          # Node.js/Express API
│   ├── routes/       # API endpoints
│   ├── db/           # Database schema
│   ├── server.js     # Main server file
│   └── Dockerfile    # Docker configuration
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── services/ # API service layer
│   │   ├── store/    # State management
│   │   └── App.jsx   # Main app component
│   └── vite.config.js # Vite configuration
└── README.md
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3001`

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **File Storage:** AWS S3
- **Email:** AWS SES

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get public user profile

### Tradesmen
- `GET /api/tradesmen/:id` - Get tradesman profile
- `PUT /api/tradesmen/:id` - Update tradesman profile
- `PUT /api/tradesmen/:id/service-areas` - Update service areas
- `GET /api/tradesmen/:id/matching-jobs` - Get matching jobs

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id/status` - Update job status
- `POST /api/jobs/:id/responses` - Submit job response
- `GET /api/jobs/:id/responses` - Get job responses

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:user_id` - Get conversation
- `GET /api/messages/inbox` - Get inbox
- `PUT /api/messages/:id/read` - Mark as read

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:user_id` - Get user reviews
- `GET /api/reviews/job/:job_id` - Get job review

### Cities
- `GET /api/cities` - Get all cities
- `GET /api/cities/:id` - Get city details
- `GET /api/cities/states/list` - Get all states

## Deployment

### Backend Deployment (AWS Lightsail)

1. SSH into your Lightsail instance
2. Clone the repository
3. Navigate to backend directory
4. Build Docker image: `docker build -t ogafix-api:latest .`
5. Run container with environment variables
6. Set up Nginx reverse proxy

See `backend/README.md` for detailed instructions.

### Frontend Deployment (GoDaddy)

1. Build the project: `npm run build`
2. Upload `dist` folder contents to GoDaddy `public_html`
3. Configure `.htaccess` for React Router

See `frontend/README.md` for detailed instructions.

## Environment Variables

### Backend (.env)
```
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=ogafix
DB_USER=ogafixadmin
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
AWS_REGION=eu-west-1
S3_BUCKET=ogafix-images-prod-eu-west-1
CLOUDFRONT_URL=https://d123456.cloudfront.net
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

## Database Schema

The database includes the following tables:
- `users` - User accounts (customers and tradesmen)
- `tradesmen` - Tradesman profiles
- `cities` - Nigerian cities and locations
- `tradesman_service_areas` - Service areas for each tradesman
- `portfolio` - Tradesman work portfolio
- `jobs` - Job postings
- `job_responses` - Tradesman quotes for jobs
- `messages` - In-app messaging
- `reviews` - Customer reviews and ratings

## Features

### For Customers
- ✅ Post jobs with descriptions and photos
- ✅ Browse available tradesmen
- ✅ Filter by location and trade category
- ✅ Message tradesmen directly
- ✅ View tradesman portfolios and reviews
- ✅ Rate and review completed work

### For Tradesmen
- ✅ Create professional profile
- ✅ Showcase work portfolio
- ✅ Choose service areas (specific cities or nationwide)
- ✅ Browse available jobs
- ✅ Submit quotes and proposals
- ✅ Communicate with customers
- ✅ Build reputation through reviews

## Security Considerations

- Passwords are hashed with bcryptjs
- JWT tokens for authentication
- CORS configured for frontend domain
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries
- Input validation on all endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License

## Support

For issues or questions, please contact support@ogafix.com

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Advanced search and filtering
- [ ] Notification system
- [ ] Admin dashboard
- [ ] Analytics and reporting
