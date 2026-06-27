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

// Get tradesman profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tradesmen = await pool.query(
      'SELECT t.id, t.user_id, t.trade_category, t.experience_years, t.certifications, t.average_rating, t.total_reviews, t.covers_all_cities, u.first_name, u.last_name, u.profile_picture_url, u.bio FROM tradesmen t JOIN users u ON t.user_id = u.id WHERE t.id = $1',
      [id]
    );

    if (tradesmen.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman not found' });
    }

    const tradesman = tradesmen.rows[0];

    // Get service areas
    let serviceAreas = [];
    if (!tradesman.covers_all_cities) {
      const areas = await pool.query(
        'SELECT c.id, c.name, c.state FROM tradesman_service_areas tsa JOIN cities c ON tsa.city_id = c.id WHERE tsa.tradesman_id = $1',
        [id]
      );
      serviceAreas = areas.rows;
    }

    res.json({
      success: true,
      data: {
        ...tradesman,
        service_areas: serviceAreas,
      },
    });
  } catch (error) {
    console.error('Error fetching tradesman:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tradesman' });
  }
});

// Update tradesman profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { trade_category, experience_years, certifications } = req.body;

    const result = await pool.query(
      'UPDATE tradesmen SET trade_category = COALESCE($1, trade_category), experience_years = COALESCE($2, experience_years), certifications = COALESCE($3, certifications), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [trade_category, experience_years, certifications, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman not found' });
    }

    res.json({
      success: true,
      message: 'Tradesman profile updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating tradesman:', error);
    res.status(500).json({ success: false, message: 'Failed to update tradesman' });
  }
});

// Update service areas
router.put('/:id/service-areas', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { covers_all_cities, city_ids } = req.body;

    // Update covers_all_cities flag
    await pool.query(
      'UPDATE tradesmen SET covers_all_cities = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [covers_all_cities, id]
    );

    // Clear existing service areas
    await pool.query('DELETE FROM tradesman_service_areas WHERE tradesman_id = $1', [id]);

    // Add new service areas if not covering all cities
    if (!covers_all_cities && city_ids && city_ids.length > 0) {
      for (const city_id of city_ids) {
        await pool.query(
          'INSERT INTO tradesman_service_areas (tradesman_id, city_id) VALUES ($1, $2)',
          [id, city_id]
        );
      }
    }

    // Get updated service areas
    let serviceAreas = [];
    if (!covers_all_cities) {
      const areas = await pool.query(
        'SELECT c.id, c.name, c.state FROM tradesman_service_areas tsa JOIN cities c ON tsa.city_id = c.id WHERE tsa.tradesman_id = $1',
        [id]
      );
      serviceAreas = areas.rows;
    }

    res.json({
      success: true,
      message: 'Service areas updated',
      data: {
        tradesman_id: id,
        covers_all_cities,
        service_areas: serviceAreas,
      },
    });
  } catch (error) {
    console.error('Error updating service areas:', error);
    res.status(500).json({ success: false, message: 'Failed to update service areas' });
  }
});

// Get matching jobs for tradesman
router.get('/:id/matching-jobs', async (req, res) => {
  try {
    const { id } = req.params;

    // Get tradesman's service areas
    const tradesman = await pool.query('SELECT covers_all_cities FROM tradesmen WHERE id = $1', [id]);
    if (tradesman.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman not found' });
    }

    let query;
    let params;

    if (tradesman.rows[0].covers_all_cities) {
      // Get all jobs matching tradesman's category
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state, j.budget, j.status, j.created_at
        FROM jobs j
        JOIN cities c ON j.city_id = c.id
        JOIN tradesmen t ON t.id = $1
        WHERE j.category = t.trade_category AND j.status = 'open'
        ORDER BY j.created_at DESC
      `;
      params = [id];
    } else {
      // Get jobs matching tradesman's category and service areas
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state, j.budget, j.status, j.created_at
        FROM jobs j
        JOIN cities c ON j.city_id = c.id
        JOIN tradesmen t ON t.id = $1
        WHERE j.category = t.trade_category AND j.status = 'open'
        AND EXISTS (
          SELECT 1 FROM tradesman_service_areas tsa
          WHERE tsa.tradesman_id = t.id AND tsa.city_id = j.city_id
        )
        ORDER BY j.created_at DESC
      `;
      params = [id];
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching matching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matching jobs' });
  }
});

export default router;
