import express from 'express';
import { getPool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all watchlist routes
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT movie_id FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
      [req.user.id]
    );
    
    const watchlist = rows.map(row => row.movie_id);
    res.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { movieId } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    const pool = getPool();
    
    try {
      await pool.query(
        'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
        [req.user.id, movieId]
      );
      res.status(201).json({ message: 'Added to watchlist' });
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Movie is already in the watchlist' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const pool = getPool();
    
    const [result] = await pool.query(
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [req.user.id, movieId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movie not found in watchlist' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Delete from watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
