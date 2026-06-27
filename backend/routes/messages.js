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

// Send message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { recipient_id, job_id, content } = req.body;

    const result = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, job_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, recipient_id, job_id || null, content]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Get conversation
router.get('/conversation/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM messages WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1) ORDER BY created_at ASC',
      [req.user.id, user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

// Get inbox
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END)
        CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END as other_user_id,
        m.* FROM messages m
      WHERE sender_id = $1 OR recipient_id = $1
      ORDER BY CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END, m.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inbox' });
  }
});

// Mark message as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
});

export default router;
