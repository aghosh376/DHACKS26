import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import Stock from './models/stock.js';
import { applyMarketEntropy, updatePriceHistory, calculatePercentChange } from './utils/marketEngine.js';
import { startDailyCron } from './scripts/dailyCronJob.js';

dotenv.config();

const app: Express = express();

// Initialize DB connection
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('DB ready - entropy engine will start');
}).catch(err => {
  console.error('DB connection failed:', err);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/auth.js';
import profRoutes from './routes/professors.js';
import userRoutes from './routes/users.js';
import stockRoutes from './routes/stocks.js';

app.use('/api/auth', authRoutes);
app.use('/api/professors', profRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use(errorHandler);

/**
 * Market Entropy Engine: Apply random price fluctuations every 10 seconds
 * Each stock moves independently with ±1-2% random movements
 */
let isEntropyRunning = false;

const startMarketEntropyEngine = async (): Promise<void> => {
  // Wait for DB to be ready
  while (!dbConnected) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('✅ Market entropy engine activated - starting price fluctuations every 10 seconds');
  
  setInterval(async () => {
    // Skip if already running to prevent overlapping updates
    if (isEntropyRunning) {
      console.log('⏭️  Entropy cycle skipped - previous cycle still running');
      return;
    }
    
    isEntropyRunning = true;
    
    try {
      const stocks = await Stock.find();
      let updatedCount = 0;
      
      for (const stock of stocks) {
        const oldPrice = stock.currentPrice;
        const newPrice = applyMarketEntropy(oldPrice);
        
        // Update using atomic operation to avoid concurrency issues
        const updatedPriceHistory = updatePriceHistory(stock.priceHistory, newPrice);
        const percentChange24h = calculatePercentChange(oldPrice, newPrice);
        const newMarketCap = newPrice * stock.sharesOutstanding;
        
        await Stock.findByIdAndUpdate(stock._id, {
          currentPrice: newPrice,
          priceHistory: updatedPriceHistory,
          percentChange24h: percentChange24h,
          marketCap: newMarketCap,
          lastUpdated: new Date(),
        });
        
        updatedCount++;
        
        // Log each stock's independent movement
        const percentageChange = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
        const direction = newPrice > oldPrice ? '📈' : '📉';
        console.log(
          `${direction} Stock #${stock._id.toString().slice(-4)}: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${percentageChange}%)`
        );
      }
      
      console.log(`✅ Market entropy cycle: Updated ${updatedCount} stocks`);
    } catch (error) {
      console.error('Market entropy engine error:', error);
    } finally {
      isEntropyRunning = false;
    }
  }, 10000); // Run every 10 seconds
};

// Start market entropy engine once DB connects
setTimeout(() => {
  startMarketEntropyEngine().catch(err => console.error('Entropy engine error:', err));
}, 1000);

// Start daily 12am cron (RMP + Reddit scrape → score + price updates)
startDailyCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
