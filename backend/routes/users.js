import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('stocksOwned.professorId')
      .populate('watchlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/users/portfolio
// @desc    Get user's investment portfolio
router.get('/portfolio', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('stocksOwned.professorId');

    res.json({
      success: true,
      data: {
        balance: user.balance,
        portfolioValue: user.portfolioValue,
        stocks: user.stocksOwned,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/users/watchlist
// @desc    Add professor to watchlist
router.post('/watchlist', authenticate, async (req, res) => {
  try {
    const { professorId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { watchlist: professorId } },
      { new: true }
    ).populate('watchlist');

    res.json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
