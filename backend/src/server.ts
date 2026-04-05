import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import Stock from './models/stock.js';
import { applyMarketEntropy, updatePriceHistory, calculatePercentChange } from './utils/marketEngine.js';

dotenv.config();

const app: Express = express();

connectDB();

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
 * Market Entropy Engine: Apply random price fluctuations every 30 seconds
 * Each stock moves independently with ±1-2% random movements
 */
const startMarketEntropyEngine = (): void => {
  setInterval(async () => {
    try {
      const stocks = await Stock.find().populate('professorId', 'name');
      let updatedCount = 0;
      
      for (const stock of stocks) {
        const oldPrice = stock.currentPrice;
        const newPrice = applyMarketEntropy(oldPrice);
        
        // Only update if there's a price change
        if (Math.abs(newPrice - oldPrice) > 0.001) {
          stock.currentPrice = newPrice;
          
          // Update price history
          stock.priceHistory = updatePriceHistory(stock.priceHistory, newPrice);
          
          // Update 24h change
          const percentChange24h = calculatePercentChange(oldPrice, newPrice);
          stock.percentChange24h = percentChange24h;
          
          // Update market cap
          stock.marketCap = newPrice * stock.sharesOutstanding;
          
          // Update last modified timestamp
          stock.lastUpdated = new Date();
          
          await stock.save();
          updatedCount++;
          
          // Log each stock's independent movement
          const professorName = (stock.populatedPaths().includes('professorId') ? 
            (stock.professorId as any)?.name : 'Unknown');
          const percentageChange = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
          console.log(
            `📊 ${professorName}: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${percentageChange}%)`
          );
        }
      }
      
      if (updatedCount > 0) {
        console.log(`✅ Market entropy: Updated ${updatedCount}/${stocks.length} stocks`);
      }
    } catch (error) {
      console.error('Market entropy engine error:', error);
    }
  }, 30000); // Run every 30 seconds
};

// Start market entropy engine after a short delay to allow DB connection
setTimeout(() => {
  startMarketEntropyEngine();
  console.log('Market entropy engine started - prices will fluctuate every 30 seconds');
}, 2000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
