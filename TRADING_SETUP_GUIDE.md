# Professor Stock Trading - Setup & Testing Guide

## ✅ What's Been Implemented

### Backend (Pre-existing)
- REST API for buying/selling professor stocks
- Supply/demand-based dynamic pricing
- Portfolio management with gain/loss tracking
- Transaction history logging
- Price history tracking

### Frontend (New Components)

**1. ProfessorCard Component** (`src/components/ProfessorCard.tsx`)
- Displays professor profile cards with:
  - Professor name, department, image
  - Current stock price and 24h price change
  - User's current holdings (if any)
  - Buy/Sell buttons with intelligent disabling

**2. BuyModal Component** (`src/components/BuyModal.tsx`)
- Modal for purchasing stocks:
  - Quantity input with affordability validation
  - Real-time cost calculation
  - Balance checking and warnings
  - Error handling and user feedback

**3. SellModal Component** (`src/components/SellModal.tsx`)
- Modal for selling stocks:
  - Quantity input with ownership validation
  - Gain/loss calculations shown in real-time
  - Cost basis comparison
  - Remaining holdings display

**4. Updated Dashboard Page** (`src/pages/Dashboard.tsx`)
- Displays professor stock cards in a grid
- Live portfolio stats (balance, portfolio value, stocks owned)
- Manages buy/sell modals
- Updates user data after transactions
- Real-time price updates

**5. API Utility Functions** (`src/utils/api.ts`)
- `buyStocks(professorId, quantity)` - Buy stocks
- `sellStocks(professorId, quantity)` - Sell stocks
- `getStocks()` - Fetch all stocks
- `getTrendingStocks()` - Get trending stocks
- `getUserPortfolio()` - Get user portfolio
- `getTransactionHistory()` - Get transaction history
- And more...

## 🚀 Getting Started

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend Server
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
- Open http://localhost:5173 in your browser
- Log in with your credentials
- You should see the Dashboard with professor trading cards

## 📋 Testing the Trading Feature

### Test Case 1: Viewing Professor Cards
1. Navigate to Dashboard after login
2. You should see professor cards displaying:
   - Professor image (or professor emoji)
   - Name and department
   - Current stock price
   - 24h price change (red/green indicator)
   - Your current holdings (if any)
   - Buy and Sell buttons

### Test Case 2: Buying Stocks
1. Click the "Buy" button on any professor card
2. A modal should open showing:
   - Current price per share
   - Your available balance
3. Enter the quantity of shares you want to buy
4. Review the total cost
5. Click "Confirm Purchase"
6. You should see:
   - Success message
   - Your balance decreases
   - Your holdings update on the card
   - Stock price may change (supply/demand)

### Test Case 3: Selling Stocks
1. Click the "Sell" button on a professor card where you own shares
2. A modal should open showing:
   - Your average buy price
   - Current price per share
   - Your holdings count
3. Enter the quantity to sell
4. Review gain/loss calculation
5. Click "Confirm Sale"
6. You should see:
   - Success message
   - Your balance increases
   - Your holdings decrease
   - Card may disappear if you sell all shares

### Test Case 4: Error Handling
- Try to buy with insufficient balance (button should be disabled)
- Try to sell without ownership (button should be disabled)
- Try entering invalid quantities (should show error messages)
- Network errors should display appropriate messages

## 💡 Key Features

### Smart Button Management
- **Buy Button** disabled if user balance < 1 share price
- **Sell Button** disabled if user owns 0 shares
- Real-time validation

### Price Updates
- Prices update based on supply/demand
- Each buy increases prices slightly
- Each sell decreases prices slightly
- Changes are calculated based on trading volume

### Portfolio Tracking
- Shows total shares owned
- Calculates average buy price
- Displays current holdings value
- Tracks gain/loss percentage

### Market Dynamics
- 24h price change displayed
- Volume tracking
- Price history available (via API)
- Volatility measurements

## 🔧 API Endpoints Used

### Public (No Auth)
- `GET /api/stocks` - List all stocks
- `GET /api/stocks/trending` - Trending stocks
- `GET /api/stocks/:professorId` - Stock details
- `GET /api/professors` - List professors

### Protected (Requires Auth Token)
- `POST /api/stocks/:professorId/buy` - Buy stocks
- `POST /api/stocks/:professorId/sell` - Sell stocks
- `GET /api/users/portfolio` - User portfolio
- `GET /api/users/transactions` - Transaction history

## 📊 Database Changes

No database changes needed! The system uses existing models:
- **Stock** - Tracks prices and trading volumes
- **User** - Stores balance and holdings
- **Professor** - Professor information
- **Transaction** - Audit trail

## 🎯 Next Steps / Enhancements

Consider adding:
1. **Watchlist** - Mark favorite professors to track
2. **Buy Orders** - Schedule purchases for specific prices
3. **Chart Visualization** - Display price history graphs
4. **Leaderboard** - Compare performance with other traders
5. **Portfolio History** - Track portfolio value over time
6. **Alerts** - Notify when prices hit targets
7. **Search/Filter** - Find professors by department, rating, etc.
8. **Trade Execution History** - Detailed transaction view

## 🐛 Troubleshooting

### Buy/Sell buttons not working
- Ensure you're logged in
- Check browser console for errors
- Verify backend is running

### Prices not updating
- Refresh the page to fetch latest data
- Check network tab in developer tools
- Ensure you have sufficient balance/shares

### Portfolio not updating
- Try refreshing the page
- Check localStorage has valid token
- Verify user data is being persisted

## 📝 Component Structure

```
Dashboard (main page)
├── ProfessorCard (for each stock/professor)
├── BuyModal (opens when Buy clicked)
├── SellModal (opens when Sell clicked)
└── User Stats Panel
```

## 🔐 Security Notes

- All trading operations require authentication
- User balance is validated server-side
- Shares owned are verified before selling
- Transaction audit trail maintained
- Token-based authentication used
