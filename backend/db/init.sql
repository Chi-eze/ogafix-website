-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'tradesman')),
  profile_picture_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tradesmen Table
CREATE TABLE IF NOT EXISTS tradesmen (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  trade_category VARCHAR(100) NOT NULL,
  experience_years INTEGER,
  certifications TEXT,
  portfolio_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  covers_all_cities BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, state)
);

-- Create Tradesman Service Areas Table
CREATE TABLE IF NOT EXISTS tradesman_service_areas (
  id SERIAL PRIMARY KEY,
  tradesman_id INTEGER NOT NULL REFERENCES tradesmen(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tradesman_id, city_id)
);

-- Create Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  tradesman_id INTEGER NOT NULL REFERENCES tradesmen(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  city_id INTEGER REFERENCES cities(id),
  work_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  address TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  budget DECIMAL(10, 2),
  image_urls TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Job Responses Table
CREATE TABLE IF NOT EXISTS job_responses (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tradesman_id INTEGER NOT NULL REFERENCES tradesmen(id) ON DELETE CASCADE,
  quote DECIMAL(10, 2),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, tradesman_id)
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, reviewer_id)
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_tradesmen_user_id ON tradesmen(user_id);
CREATE INDEX idx_tradesmen_trade_category ON tradesmen(trade_category);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_city_id ON jobs(city_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_job_responses_job_id ON job_responses(job_id);
CREATE INDEX idx_job_responses_tradesman_id ON job_responses(tradesman_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_portfolio_tradesman_id ON portfolio(tradesman_id);
CREATE INDEX idx_tradesman_service_areas_tradesman_id ON tradesman_service_areas(tradesman_id);
