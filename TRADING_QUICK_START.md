# 🎓 Professor Stock Trading - Quick Start

## What's New?

You now have a **fully functional dynamic stock market** where you can **buy and sell professors as stocks**! 

The stock prices are driven by **supply and demand** - when many people buy a professor's stock, the price goes up. When people sell, it goes down.

## 🚀 Quick Start

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Open in Browser
- Go to `http://localhost:5173`
- Log in with your account

### 3. See Your Trading Dashboard
After logging in, you'll see:
- Your account balance (💰)
- Your portfolio value (📈)
- Number of stocks you own (📊)
- **Professor trading cards** showing all available professors

## 📈 How to Trade

### Buying Stocks

1. Find a professor card you like
2. Click the **"Buy"** button (green)
3. A dialog opens showing:
   - Current price per share
   - Your available balance
4. Enter how many shares you want
5. Review the total cost
6. Click **"Confirm Purchase"**
7. 🎉 Success! Your portfolio updates instantly

### Selling Stocks

1. Find a professor you own shares in
2. Click the **"Sell"** button (red)
3. A dialog opens showing:
   - Current price per share
   - Your cost basis (what you paid)
   - Your profit/loss calculation
4. Enter how many shares to sell
5. Review your gain or loss
6. Click **"Confirm Sale"**
7. 🎉 Done! Cash back in your account

## 💡 Key Features

### Real-Time Info on Each Card
- Professor name and department
- Current stock price
- 24-hour price change (% up or down)
- How many shares you own
- Your current portfolio value

### Smart Buttons
- "Buy" button disabled if you don't have enough money
- "Sell" button disabled if you don't own any shares
- Real-time feedback as you adjust quantities

### Dynamic Pricing
- Prices change based on buying/selling activity
- High demand = higher prices
- High supply = lower prices
- Just like a real stock market!

### Portfolio Tracking
- See your total balance at the top
- See total portfolio value
- See detailed gain/loss on each holding
- All data persists when you log out

## 🎯 Strategy Tips

1. **Diversify** - Don't put all your money in one professor
2. **Watch Trends** - Look at 24h price changes to spot trends
3. **Buy Low, Sell High** - Classic trading principle
4. **Monitor Volume** - High volume means more active trading
5. **Track Your Average** - The system shows your average buy price vs current price

## 🔢 Numbers You'll See

### On Each Professor Card
```
Price: $12.50                    (Current trading price)
↑ 5.25%                          (24h price change)
Your Holdings: 10 shares         (If you own any)
24h Volume: 150 shares           (Trading activity)
```

### In the Modals
```
Price per Share: $12.50
Your Balance: $500.00
Quantity: 3
Total Cost: $37.50
Balance After: $462.50

---OR---

Current Price: $12.50
Avg Buy Price: $11.00
Gain per Share: $1.50
Total Gain: $15.00 (13.64%)
```

## ⚠️ Important Notes

- **Minimum:** You need at least $1 in balance to buy any stock
- **Integer Shares:** You can only buy/sell whole shares (no fractional shares)
- **Price Updates:** Prices are based on current supply/demand, so they might be slightly different when you execute
- **Balance Verified:** The backend double-checks everything for security

## 🐛 Troubleshooting

### "Buy" button is grayed out?
→ You don't have enough balance for 1 share at current price

### Can't sell anything?
→ You don't own any shares of that professor

### Getting an error message?
→ Check:
- Your internet connection
- Backend server is running
- You have a valid login token

### Price looks wrong?
→ Refresh the page to get the latest market prices

## 🎓 Understanding Price Changes

### Why did the price go up?
- People are buying that professor's stock
- High demand = limited supply = higher price
- Buy 10 shares → price goes up 2%

### Why did the price go down?
- People are selling that professor's stock
- High supply = low demand = lower price
- Sell 20 shares → price goes down 1.5%

### Is there a limit?
- No hard limit, but prices are bounded reasonably
- Price can never go below $0.01
- Max price change per trade is about 5%

## 📱 Works Across Devices

The dashboard is responsive and works on:
- ✅ Desktop browsers (best experience)
- ✅ Tablets
- ✅ Mobile phones

## 🔒 Your Data is Secure

- Passwords are hashed and encrypted
- Trading is protected with authentication
- All transactions are logged and auditable
- Backend verifies every trade

## 📊 Components You're Using

```
Dashboard Page
├── Professor Cards (one per professor)
│   ├── Buy Button → Opens Buy Modal
│   └── Sell Button → Opens Sell Modal
├── Buy Modal
│   ├── Quantity Input
│   ├── Cost Display
│   └── Confirm Button
└── Sell Modal
    ├── Quantity Input
    ├── Gain/Loss Display
    └── Confirm Button
```

## 🎯 Next Features to Look Forward To

- 📊 Price charts and history
- 🔔 Price alerts
- ⭐ Watchlist feature
- 🏆 Leaderboard to compete with others
- 📈 Advanced portfolio analytics
- 🔍 Search and filter professors

## 💬 Having Issues?

1. **Check the console** - Open DevTools (F12) and look for errors
2. **Restart servers** - Sometimes helps with state
3. **Clear cache** - Try Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
4. **Check network** - Make sure both servers are running

## 🚀 You're All Set!

Time to start trading! Good luck building your professor stock portfolio! 📈

---

**Current Status: ✅ FULLY FUNCTIONAL AND READY TO USE**

For detailed documentation, see:
- `TRADING_SETUP_GUIDE.md` - Full setup instructions
- `TRADING_IMPLEMENTATION_SUMMARY.md` - Technical details
