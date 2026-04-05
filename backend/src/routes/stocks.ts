import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/user.js';
import Stock from '../models/stock.js';
import Transaction from '../models/transaction.js';
import {
  calculateNewPrice,
  updatePriceHistory,
  calculatePercentChange,
  calculateMarketCap,
  calculateHighLow,
  calculateStockStats,
} from '../utils/marketEngine.js';
import { IStockDocument } from '../models/stock.js';
import { IUserDocument } from '../models/user.js';

const router = Router();

// GET /api/stocks
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const sort = (req.query.sort as string) || '-currentPrice';
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const stocks = await Stock.find()
      .populate('professorId', 'name department imageUrl email')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Stock.countDocuments();

    res.json({
      success: true,
      data: stocks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/stocks/trending
router.get('/trending', async (req: Request, res: Response): Promise<void> => {
  try {
    const metric = (req.query.metric as string) || 'volume24h';
    const limit = parseInt(req.query.limit as string) || 20;

    let sortOption: Record<string, number> = { lastUpdated: -1 };
    switch (metric) {
      case 'volume24h':
        sortOption = { volume24h: -1 };
        break;
      case 'momentum':
        sortOption = { momentum: -1 };
        break;
      case 'gainers':
        sortOption = { percentChange24h: -1 };
        break;
      case 'losers':
        sortOption = { percentChange24h: 1 };
        break;
    }

    const stocks = await Stock.find()
      .populate('professorId', 'name department imageUrl')
      .sort(sortOption as any)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: stocks,
      metric,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/stocks/:professorId
router.get('/:professorId', async (req: Request, res: Response): Promise<Response | void> => {
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

    const stats = calculateStockStats(stock);

    res.json({
      success: true,
      data: {
        ...stock.toObject(),
        stats,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/stocks/:professorId/history
router.get('/:professorId/history', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const limit = parseInt(req.query.limit as string) || 500;

    const stock = await Stock.findOne({
      professorId: req.params.professorId,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const history = stock.priceHistory
      .filter((entry) => new Date(entry.date) >= cutoffDate)
      .slice(-limit);

    res.json({
      success: true,
      data: history,
      dateRange: {
        from: cutoffDate,
        to: new Date(),
        days,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// POST /api/stocks/:professorId/buy
router.post('/:professorId/buy', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { quantity } = req.body;
    const { professorId } = req.params;

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const user = await User.findById(req.userId) as IUserDocument;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const stock = await Stock.findOne({ professorId }) as IStockDocument;
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    const costPerShare = stock.currentPrice;
    const totalCost = costPerShare * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${user.balance.toFixed(2)}`,
      });
    }

    const oldPrice = stock.currentPrice;
    const newPrice = calculateNewPrice(quantity, oldPrice, stock.sharesOutstanding, 'buy');

    stock.currentPrice = newPrice;
    stock.totalSharesBought += quantity;
    stock.totalVolume += quantity;
    stock.volume24h += quantity;
    stock.volume7d += quantity;
    stock.marketCap = calculateMarketCap(newPrice, stock.sharesOutstanding);

    const high24h = calculateHighLow(stock.priceHistory, '24h');
    stock.high24h = Math.max(high24h.high, newPrice);
    stock.low24h = Math.min(high24h.low, newPrice);

    const percentChange24h = calculatePercentChange(oldPrice, newPrice);
    stock.percentChange24h = percentChange24h;

    // 7d/1m/6m changes are recalculated from price history relative to the
    // historical price at each cutoff, not accumulated per-transaction.
    const now = Date.now();
    const priceAt = (msBack: number) => {
      const cutoff = now - msBack;
      const entry = [...stock.priceHistory].reverse().find((e) => new Date(e.date).getTime() <= cutoff);
      return entry?.price ?? stock.priceHistory[0]?.price ?? newPrice;
    };
    stock.percentChange7d = calculatePercentChange(priceAt(7 * 86400000), newPrice);
    stock.percentChange1m = calculatePercentChange(priceAt(30 * 86400000), newPrice);
    stock.percentChange6m = calculatePercentChange(priceAt(180 * 86400000), newPrice);

    stock.priceHistory = updatePriceHistory(stock.priceHistory, newPrice);
    stock.lastUpdated = new Date();

    user.balance -= totalCost;
    user.totalInvested = (user.totalInvested || 0) + totalCost;

    const stockOwnership = user.stocksOwned.find(
      (s) => s.professorId.toString() === professorId
    );

    if (stockOwnership) {
      const newTotalShares = stockOwnership.shares + quantity;
      const newTotalCost = (stockOwnership.costBasis || 0) + totalCost;

      stockOwnership.shares = newTotalShares;
      stockOwnership.averageBuyPrice = newTotalCost / newTotalShares;
      stockOwnership.totalInvested = newTotalCost;
      stockOwnership.costBasis = newTotalCost;
      stockOwnership.currentValue = newTotalShares * newPrice;
      stockOwnership.gainLoss = stockOwnership.currentValue - newTotalCost;
      stockOwnership.percentReturn = (stockOwnership.gainLoss / newTotalCost) * 100;
    } else {
      user.stocksOwned.push({
        professorId: stock.professorId,
        shares: quantity,
        averageBuyPrice: costPerShare,
        totalInvested: totalCost,
        costBasis: totalCost,
        currentValue: totalCost,
        gainLoss: 0,
        percentReturn: 0,
      });
    }

    user.portfolioValue = user.balance;
    for (const holding of user.stocksOwned) {
      if (holding.shares > 0) {
        user.portfolioValue += holding.currentValue;
      }
    }

    await Promise.all([user.save(), stock.save()]);

    const transaction = new Transaction({
      userId: req.userId,
      professorId,
      type: 'buy',
      quantity,
      pricePerShare: costPerShare,
      totalAmount: totalCost,
      status: 'completed',
    });
    await transaction.save();

    user.transactionHistory.push(transaction._id);
    await user.save();

    res.json({
      success: true,
      message: `Successfully bought ${quantity} shares at $${costPerShare.toFixed(2)}`,
      data: {
        transaction: {
          id: transaction._id,
          type: 'buy',
          quantity,
          pricePerShare: costPerShare,
          totalAmount: totalCost,
          timestamp: transaction.date,
        },
        stock: {
          professorId,
          oldPrice: oldPrice.toFixed(4),
          newPrice: newPrice.toFixed(4),
          percentChange: percentChange24h.toFixed(2),
          marketCap: stock.marketCap.toFixed(2),
        },
        user: {
          newBalance: user.balance.toFixed(2),
          portfolioValue: user.portfolioValue.toFixed(2),
          holdings: stockOwnership,
        },
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// POST /api/stocks/:professorId/sell
router.post('/:professorId/sell', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { quantity } = req.body;
    const { professorId } = req.params;

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const user = await User.findById(req.userId) as IUserDocument;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const stock = await Stock.findOne({ professorId }) as IStockDocument;
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    const stockOwnership = user.stocksOwned.find(
      (s) => s.professorId.toString() === professorId
    );

    if (!stockOwnership || stockOwnership.shares < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. Owned: ${stockOwnership?.shares || 0}, Requested: ${quantity}`,
      });
    }

    const pricePerShare = stock.currentPrice;
    const totalProceeds = pricePerShare * quantity;

    const oldPrice = stock.currentPrice;
    const newPrice = calculateNewPrice(quantity, oldPrice, stock.sharesOutstanding, 'sell');

    stock.currentPrice = newPrice;
    stock.totalSharesSold += quantity;
    stock.totalVolume += quantity;
    stock.volume24h += quantity;
    stock.volume7d += quantity;
    stock.marketCap = calculateMarketCap(newPrice, stock.sharesOutstanding);

    const low24h = calculateHighLow(stock.priceHistory, '24h');
    stock.high24h = Math.max(low24h.high, stock.high24h || 0) || oldPrice;
    stock.low24h = Math.min(low24h.low, newPrice);

    const percentChange24h = calculatePercentChange(oldPrice, newPrice);
    stock.percentChange24h = percentChange24h;

    const now = Date.now();
    const priceAt = (msBack: number) => {
      const cutoff = now - msBack;
      const entry = [...stock.priceHistory].reverse().find((e) => new Date(e.date).getTime() <= cutoff);
      return entry?.price ?? stock.priceHistory[0]?.price ?? newPrice;
    };
    stock.percentChange7d = calculatePercentChange(priceAt(7 * 86400000), newPrice);
    stock.percentChange1m = calculatePercentChange(priceAt(30 * 86400000), newPrice);
    stock.percentChange6m = calculatePercentChange(priceAt(180 * 86400000), newPrice);

    stock.priceHistory = updatePriceHistory(stock.priceHistory, newPrice);
    stock.lastUpdated = new Date();

    const gainLoss = totalProceeds - (stockOwnership.costBasis || 0);

    stockOwnership.shares -= quantity;
    if (stockOwnership.shares === 0) {
      stockOwnership.currentValue = 0;
      stockOwnership.gainLoss = 0;
      stockOwnership.percentReturn = 0;
    } else {
      stockOwnership.currentValue = stockOwnership.shares * newPrice;
      stockOwnership.gainLoss = stockOwnership.currentValue - (stockOwnership.costBasis || 0);
      stockOwnership.percentReturn = (stockOwnership.gainLoss / (stockOwnership.costBasis || 1)) * 100;
    }

    user.balance += totalProceeds;

    user.portfolioValue = user.balance;
    for (const holding of user.stocksOwned) {
      if (holding.shares > 0) {
        user.portfolioValue += holding.currentValue;
      }
    }

    await Promise.all([user.save(), stock.save()]);

    const transaction = new Transaction({
      userId: req.userId,
      professorId,
      type: 'sell',
      quantity,
      pricePerShare,
      totalAmount: totalProceeds,
      status: 'completed',
    });
    await transaction.save();

    user.transactionHistory.push(transaction._id);
    await user.save();

    res.json({
      success: true,
      message: `Successfully sold ${quantity} shares at $${pricePerShare.toFixed(2)}`,
      data: {
        transaction: {
          id: transaction._id,
          type: 'sell',
          quantity,
          pricePerShare,
          totalAmount: totalProceeds,
          timestamp: transaction.date,
        },
        stock: {
          professorId,
          oldPrice: oldPrice.toFixed(4),
          newPrice: newPrice.toFixed(4),
          percentChange: percentChange24h.toFixed(2),
          marketCap: stock.marketCap.toFixed(2),
        },
        user: {
          newBalance: user.balance.toFixed(2),
          portfolioValue: user.portfolioValue.toFixed(2),
          gainLoss: gainLoss.toFixed(2),
          holdings: stockOwnership,
        },
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

export default router;
