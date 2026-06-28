import express from 'express';
import { pool } from '../server.js';
import { verifyToken } from '../lib/auth.js';
import { emitToUser, emitToConversation } from '../lib/socket.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { recipient_id, job_id, content } = req.body;

    if (!recipient_id || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'recipient_id and content are required' });
    }

    if (recipient_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, job_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, recipient_id, job_id || null, content.trim()]
    );

    const message = result.rows[0];

    const enriched = await pool.query(
      `SELECT m.*, s.first_name AS sender_first_name, s.last_name AS sender_last_name,
              r.first_name AS recipient_first_name, r.last_name AS recipient_last_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.recipient_id = r.id
       WHERE m.id = $1`,
      [message.id]
    );

    const payload = enriched.rows[0];
    emitToUser(recipient_id, 'new_message', payload);
    emitToConversation(req.user.id, recipient_id, 'new_message', payload);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: payload,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

router.get('/conversation/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT m.*, s.first_name AS sender_first_name, s.last_name AS sender_last_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, user_id]
    );

    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
      [req.user.id, user_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH conversations AS (
        SELECT
          CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END AS other_user_id,
          MAX(m.created_at) AS last_message_at
        FROM messages m
        WHERE m.sender_id = $1 OR m.recipient_id = $1
        GROUP BY other_user_id
      )
      SELECT c.other_user_id, c.last_message_at,
             u.first_name, u.last_name, u.profile_picture_url,
             lm.id AS last_message_id, lm.content AS last_message,
             lm.sender_id AS last_sender_id, lm.is_read,
             (SELECT COUNT(*)::int FROM messages um
              WHERE um.recipient_id = $1 AND um.sender_id = c.other_user_id AND um.is_read = false) AS unread_count
      FROM conversations c
      JOIN users u ON u.id = c.other_user_id
      JOIN LATERAL (
        SELECT id, content, sender_id, is_read FROM messages m2
        WHERE (m2.sender_id = $1 AND m2.recipient_id = c.other_user_id)
           OR (m2.sender_id = c.other_user_id AND m2.recipient_id = $1)
        ORDER BY m2.created_at DESC LIMIT 1
      ) lm ON true
      ORDER BY c.last_message_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inbox' });
  }
});

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE messages SET is_read = true
       WHERE id = $1 AND recipient_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
});

export default router;
