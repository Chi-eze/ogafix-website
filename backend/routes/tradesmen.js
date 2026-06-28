import express from 'express';
import { pool } from '../server.js';
import { verifyToken } from '../lib/auth.js';

const router = express.Router();

router.get('/me', verifyToken, async (req, res) => {
  try {
    const tradesmen = await pool.query(
      `SELECT t.id, t.user_id, t.trade_category, t.experience_years, t.certifications,
              t.average_rating, t.total_reviews, t.covers_all_cities,
              u.first_name, u.last_name, u.profile_picture_url, u.bio
       FROM tradesmen t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1`,
      [req.user.id]
    );

    if (tradesmen.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman profile not found' });
    }

    const tradesman = tradesmen.rows[0];
    let serviceAreas = [];

    if (!tradesman.covers_all_cities) {
      const areas = await pool.query(
        `SELECT c.id, c.name, c.state FROM tradesman_service_areas tsa
         JOIN cities c ON tsa.city_id = c.id WHERE tsa.tradesman_id = $1`,
        [tradesman.id]
      );
      serviceAreas = areas.rows;
    }

    res.json({
      success: true,
      data: { ...tradesman, service_areas: serviceAreas },
    });
  } catch (error) {
    console.error('Error fetching tradesman profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tradesman profile' });
  }
});

router.get('/me/matching-jobs', verifyToken, async (req, res) => {
  try {
    const tradesman = await pool.query('SELECT id, covers_all_cities FROM tradesmen WHERE user_id = $1', [req.user.id]);
    if (tradesman.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman profile not found' });
    }

    const { id, covers_all_cities } = tradesman.rows[0];
    let query;
    let params;

    if (covers_all_cities) {
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state,
               j.budget, j.status, j.created_at
        FROM jobs j
        JOIN cities c ON j.city_id = c.id
        JOIN tradesmen t ON t.id = $1
        WHERE j.category = t.trade_category AND j.status = 'open'
        ORDER BY j.created_at DESC
      `;
      params = [id];
    } else {
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state,
               j.budget, j.status, j.created_at
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
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching matching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matching jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tradesmen = await pool.query(
      `SELECT t.id, t.user_id, t.trade_category, t.experience_years, t.certifications,
              t.average_rating, t.total_reviews, t.covers_all_cities,
              u.first_name, u.last_name, u.profile_picture_url, u.bio
       FROM tradesmen t JOIN users u ON t.user_id = u.id WHERE t.id = $1`,
      [id]
    );

    if (tradesmen.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman not found' });
    }

    const tradesman = tradesmen.rows[0];
    let serviceAreas = [];

    if (!tradesman.covers_all_cities) {
      const areas = await pool.query(
        `SELECT c.id, c.name, c.state FROM tradesman_service_areas tsa
         JOIN cities c ON tsa.city_id = c.id WHERE tsa.tradesman_id = $1`,
        [id]
      );
      serviceAreas = areas.rows;
    }

    res.json({
      success: true,
      data: { ...tradesman, service_areas: serviceAreas },
    });
  } catch (error) {
    console.error('Error fetching tradesman:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tradesman' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { trade_category, experience_years, certifications } = req.body;

    const owner = await pool.query('SELECT user_id FROM tradesmen WHERE id = $1', [id]);
    if (owner.rows.length === 0 || owner.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await pool.query(
      `UPDATE tradesmen SET
        trade_category = COALESCE($1, trade_category),
        experience_years = COALESCE($2, experience_years),
        certifications = COALESCE($3, certifications),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [trade_category, experience_years, certifications, id]
    );

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

router.put('/:id/service-areas', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { covers_all_cities, city_ids } = req.body;

    const owner = await pool.query('SELECT user_id FROM tradesmen WHERE id = $1', [id]);
    if (owner.rows.length === 0 || owner.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await pool.query(
      'UPDATE tradesmen SET covers_all_cities = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [covers_all_cities, id]
    );

    await pool.query('DELETE FROM tradesman_service_areas WHERE tradesman_id = $1', [id]);

    if (!covers_all_cities && city_ids?.length > 0) {
      for (const city_id of city_ids) {
        await pool.query(
          'INSERT INTO tradesman_service_areas (tradesman_id, city_id) VALUES ($1, $2)',
          [id, city_id]
        );
      }
    }

    let serviceAreas = [];
    if (!covers_all_cities) {
      const areas = await pool.query(
        `SELECT c.id, c.name, c.state FROM tradesman_service_areas tsa
         JOIN cities c ON tsa.city_id = c.id WHERE tsa.tradesman_id = $1`,
        [id]
      );
      serviceAreas = areas.rows;
    }

    res.json({
      success: true,
      message: 'Service areas updated',
      data: { tradesman_id: id, covers_all_cities, service_areas: serviceAreas },
    });
  } catch (error) {
    console.error('Error updating service areas:', error);
    res.status(500).json({ success: false, message: 'Failed to update service areas' });
  }
});

router.get('/:id/matching-jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const tradesman = await pool.query('SELECT covers_all_cities FROM tradesmen WHERE id = $1', [id]);
    if (tradesman.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tradesman not found' });
    }

    let query;
    let params;

    if (tradesman.rows[0].covers_all_cities) {
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state,
               j.budget, j.status, j.created_at
        FROM jobs j
        JOIN cities c ON j.city_id = c.id
        JOIN tradesmen t ON t.id = $1
        WHERE j.category = t.trade_category AND j.status = 'open'
        ORDER BY j.created_at DESC
      `;
      params = [id];
    } else {
      query = `
        SELECT j.id, j.title, j.description, j.category, j.city_id, c.name as city, c.state,
               j.budget, j.status, j.created_at
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
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching matching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matching jobs' });
  }
});

export default router;
