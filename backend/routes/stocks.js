import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/user.js';
import Transaction from '../models/transaction.js';
import Stock from '../models/stock.js';
import Professor from '../models/professor.js';

const router = express.Router();

// @route   POST /api/stocks/buy
// @desc    Buy professor stock
router.post('/buy', authenticate, async (req, res) => {
  try {
    const { professorId, quantity } = req.body;

    // TODO: Implement buy logic
    // 1. Get current stock price
    // 2. Calculate total cost
    // 3. Verify user has sufficient balance
    // 4. Update user balance and portfolio
    // 5. Create transaction record
    // 6. Update professor stock count

    res.json({ message: 'Buy stock endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/stocks/sell
// @desc    Sell professor stock
router.post('/sell', authenticate, async (req, res) => {
  try {
    const { professorId, quantity } = req.body;

    // TODO: Implement sell logic
    // 1. Get current stock price
    // 2. Verify user owns shares
    // 3. Calculate proceeds
    // 4. Update user balance and portfolio
    // 5. Create transaction record
    // 6. Update professor stock count

    res.json({ message: 'Sell stock endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks
// @desc    Get all stock market data
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find()
      .populate('professorId')
      .sort({ currentPrice: -1 });

    res.json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks/:professorId
// @desc    Get stock data for specific professor
router.get('/:professorId', async (req, res) => {
  try {
    const stock = await Stock.findOne({
      professorId: req.params.professorId,
    }).populate('professorId');

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
