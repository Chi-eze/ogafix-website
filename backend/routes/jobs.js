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

// Create job
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, category, city_id, address, budget, image_urls } = req.body;

    const result = await pool.query(
      'INSERT INTO jobs (customer_id, title, description, category, city_id, address, budget, image_urls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, title, description, category, city_id, address, budget, image_urls || []]
    );

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { city_id, category, status } = req.query;
    let query = 'SELECT j.*, c.name as city, c.state FROM jobs j JOIN cities c ON j.city_id = c.id WHERE 1=1';
    const params = [];

    if (city_id) {
      query += ` AND j.city_id = $${params.length + 1}`;
      params.push(city_id);
    }
    if (category) {
      query += ` AND j.category = $${params.length + 1}`;
      params.push(category);
    }
    if (status) {
      query += ` AND j.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ' ORDER BY j.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT j.*, c.name as city, c.state, u.first_name, u.last_name FROM jobs j JOIN cities c ON j.city_id = c.id JOIN users u ON j.customer_id = u.id WHERE j.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

// Update job status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      message: 'Job status updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Failed to update job' });
  }
});

// Post job response (tradesman quote)
router.post('/:id/responses', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quote, message } = req.body;

    // Get tradesman ID
    const tradesman = await pool.query('SELECT id FROM tradesmen WHERE user_id = $1', [req.user.id]);
    if (tradesman.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User is not a tradesman' });
    }

    const result = await pool.query(
      'INSERT INTO job_responses (job_id, tradesman_id, quote, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, tradesman.rows[0].id, quote, message]
    );

    res.status(201).json({
      success: true,
      message: 'Job response submitted',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting job response:', error);
    res.status(500).json({ success: false, message: 'Failed to submit job response' });
  }
});

// Get job responses
router.get('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT jr.*, t.id as tradesman_id, u.first_name, u.last_name, u.profile_picture_url FROM job_responses jr JOIN tradesmen t ON jr.tradesman_id = t.id JOIN users u ON t.user_id = u.id WHERE jr.job_id = $1 ORDER BY jr.created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching job responses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job responses' });
  }
});

export default router;
