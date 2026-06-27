import express from 'express';
import { pool } from '../server.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { job_id, reviewee_id, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [job_id, req.user.id, reviewee_id, rating, comment]
    );

    // Update tradesman average rating
    const tradesman = await pool.query('SELECT id FROM tradesmen WHERE user_id = $1', [reviewee_id]);
    if (tradesman.rows.length > 0) {
      const stats = await pool.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE reviewee_id = $1',
        [reviewee_id]
      );

      await pool.query(
        'UPDATE tradesmen SET average_rating = $1, total_reviews = $2 WHERE id = $3',
        [parseFloat(stats.rows[0].avg_rating), parseInt(stats.rows[0].total), tradesman.rows[0].id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
});

// Get reviews for user
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.profile_picture_url
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Get review for specific job
router.get('/job/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM reviews WHERE job_id = $1',
      [job_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching job review:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job review' });
  }
});

export default router;
