import express from 'express';
import { pool } from '../server.js';

const router = express.Router();

// Get all cities
router.get('/', async (req, res) => {
  try {
    const { state } = req.query;
    let query = 'SELECT id, name, state, region FROM cities ORDER BY state, name';
    const params = [];

    if (state) {
      query = 'SELECT id, name, state, region FROM cities WHERE state = $1 ORDER BY name';
      params.push(state);
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
});

// Get city by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cities WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch city' });
  }
});

// Get unique states
router.get('/states/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT state FROM cities ORDER BY state');
    res.json({
      success: true,
      data: result.rows.map(row => row.state),
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch states' });
  }
});

export default router;
