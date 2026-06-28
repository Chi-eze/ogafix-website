import jwt from 'jsonwebtoken';
import { pool } from '../server.js';

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export async function getUserPayload(userId) {
  const result = await pool.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone_number,
            u.profile_picture_url, u.bio, u.user_type, u.is_verified,
            t.id AS tradesman_id, t.trade_category, t.experience_years,
            t.average_rating, t.total_reviews, t.covers_all_cities
     FROM users u
     LEFT JOIN tradesmen t ON t.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const isTradesman = row.tradesman_id != null;

  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    phone_number: row.phone_number,
    profile_picture_url: row.profile_picture_url,
    bio: row.bio,
    is_verified: row.is_verified,
    primary_role: row.user_type,
    is_tradesman: isTradesman,
    tradesman_id: row.tradesman_id,
    tradesman: isTradesman
      ? {
          id: row.tradesman_id,
          trade_category: row.trade_category,
          experience_years: row.experience_years,
          average_rating: row.average_rating,
          total_reviews: row.total_reviews,
          covers_all_cities: row.covers_all_cities,
        }
      : null,
  };
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_tradesman: user.is_tradesman,
      tradesman_id: user.tradesman_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}
