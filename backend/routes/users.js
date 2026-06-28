import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server.js';
import { verifyToken, getUserPayload, signToken } from '../lib/auth.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await getUserPayload(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_number, bio, profile_picture_url } = req.body;

    await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone_number = COALESCE($3, phone_number),
        bio = COALESCE($4, bio),
        profile_picture_url = COALESCE($5, profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [first_name, last_name, phone_number, bio, profile_picture_url, req.user.id]
    );

    const user = await getUserPayload(req.user.id);
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.post('/become-tradesman', verifyToken, [
  body('trade_category').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const existing = await pool.query('SELECT id FROM tradesmen WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have a tradesman profile' });
    }

    const { trade_category } = req.body;
    await pool.query(
      'INSERT INTO tradesmen (user_id, trade_category) VALUES ($1, $2)',
      [req.user.id, trade_category || null]
    );

    const user = await getUserPayload(req.user.id);
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Tradesman profile created. You can still post jobs as a customer.',
      token,
      user,
    });
  } catch (error) {
    console.error('Error creating tradesman profile:', error);
    res.status(500).json({ success: false, message: 'Failed to create tradesman profile' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.profile_picture_url, u.bio, u.user_type,
              t.id AS tradesman_id, t.trade_category
       FROM users u
       LEFT JOIN tradesmen t ON t.user_id = u.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        profile_picture_url: row.profile_picture_url,
        bio: row.bio,
        is_tradesman: row.tradesman_id != null,
        tradesman_id: row.tradesman_id,
        trade_category: row.trade_category,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

export default router;
