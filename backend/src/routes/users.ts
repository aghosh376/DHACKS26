import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/user.js';
import Stock from '../models/stock.js';
import Transaction from '../models/transaction.js';
import { calculateStockStats } from '../utils/marketEngine.js';
import { IUserDocument } from '../models/user.js';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('stocksOwned.professorId', 'name department imageUrl')
      .select('-password -verificationToken -resetPasswordToken');

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, ucsdId, graduationYear } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(ucsdId && { ucsdId }),
        ...(graduationYear && { graduationYear }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/users/portfolio
router.get('/portfolio', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('stocksOwned.professorId', 'name department imageUrl')
      .lean() as Partial<IUserDocument>;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const holdings = await Promise.all(
      (user.stocksOwned || [])
        .filter((h) => h.shares > 0)
        .map(async (holding) => {
          const stock = await Stock.findOne({
            professorId: (holding.professorId as any)._id,
          });

          if (!stock) {
            return null;
          }

          const stats = calculateStockStats(stock);
          const currentValue = holding.shares * stock.currentPrice;

          return {
            ...holding,
            currentPrice: stock.currentPrice,
            currentValue,
            gainLoss: currentValue - (holding.costBasis || 0),
            percentGainLoss:
              (holding.costBasis || 1) > 0
                ? ((currentValue - (holding.costBasis || 0)) / (holding.costBasis || 1)) * 100
                : 0,
            stats,
          };
        })
    );

    const validHoldings = holdings.filter((h) => h !== null);

    const totalHoldingsValue = validHoldings.reduce((sum, h) => sum + (h?.currentValue || 0), 0);
    const totalCostBasis = validHoldings.reduce((sum, h) => sum + (h?.costBasis || 0), 0);
    const totalGainLoss = totalHoldingsValue - totalCostBasis;
    const portfolioReturnPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    res.json({
      success: true,
      data: {
        cash: user.balance,
        holdings: validHoldings,
        summary: {
          totalPortfolioValue: (user.balance || 0) + totalHoldingsValue,
          holdingsValue: totalHoldingsValue,
          cash: user.balance,
          costBasis: totalCostBasis,
          gainLoss: totalGainLoss,
          gainLossPercent: portfolioReturnPercent,
          numberOfHoldings: validHoldings.length,
        },
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/users/transactions
router.get('/transactions', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const type = (req.query.type as string) || 'all';
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let filter: any = { userId: req.userId };
    if (type && type !== 'all') {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .populate('professorId', 'name department')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
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

// GET /api/users/watchlist
router.get('/watchlist', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('watchlist', 'name department imageUrl email')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const watchlistWithStocks = await Promise.all(
      (user.watchlist || []).map(async (professor: any) => {
        const stock = await Stock.findOne({
          professorId: professor._id,
        }).lean();

        return {
          professor,
          stock: stock
            ? {
                currentPrice: stock.currentPrice,
                percentChange24h: stock.percentChange24h,
                volume24h: stock.volume24h,
                marketCap: stock.marketCap,
                trend: stock.trend,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: watchlistWithStocks,
      count: watchlistWithStocks.length,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// POST /api/users/watchlist
router.post('/watchlist', authenticate, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { professorId } = req.body;

    if (!professorId) {
      return res.status(400).json({
        success: false,
        message: 'professorId is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { watchlist: professorId } },
      { new: true }
    ).populate('watchlist', 'name department imageUrl');

    res.json({
      success: true,
      message: 'Added to watchlist',
      data: user?.watchlist,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// DELETE /api/users/watchlist/:professorId
router.delete('/watchlist/:professorId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { watchlist: req.params.professorId } },
      { new: true }
    ).populate('watchlist', 'name department imageUrl');

    res.json({
      success: true,
      message: 'Removed from watchlist',
      data: user?.watchlist,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

export default router;
