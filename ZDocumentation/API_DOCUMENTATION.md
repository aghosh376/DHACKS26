# Stock Market Backend API Documentation

## Overview
A production-ready stock market trading backend with supply/demand-based dynamic pricing, user portfolio management, and transaction tracking. Designed to be frontend-agnostic and easily integrated with any frontend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Core Features

### 1. Supply/Demand-Based Pricing
- **Buy orders** increase stock prices (increased demand)
- **Sell orders** decrease stock prices (increased supply)
- Price impact scales with trading volume relative to market cap
- No automatic price changes—only activity-driven
- Prices persist across sessions

### 2. User Portfolio Management
- Track holdings with cost basis and gain/loss calculations
- Real-time portfolio valuation
- Average buy price calculations
- Performance tracking over time

### 3. Market Data & Analytics
- Price history tracking with timestamps
- Volatility and momentum calculations
- High/Low tracking for multiple time periods
- Trending stocks (by volume, momentum, gainers/losers)

### 4. Transaction History
- Complete audit trail of all trades
- Transaction timestamps and pricing
- Buy/Sell classification

---

## API Endpoints

### Market Data Endpoints (Public)

#### GET /stocks
Get all available stocks with market data.

**Query Parameters:**
- `sort` (string): Sort field and direction (default: `-currentPrice`)
- `limit` (number): Results per page (default: 50, max: 100)
- `page` (number): Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "professorId": {
        "_id": "...",
        "name": "Dr. Smith",
        "department": "Computer Science"
      },
      "currentPrice": 52.50,
      "volume24h": 150,
      "percentChange24h": 2.5,
      "trend": "bullish",
      "marketCap": 52500
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

#### GET /stocks/trending
Get trending stocks by specified metric.

**Query Parameters:**
- `metric` (string): `volume24h` | `momentum` | `gainers` | `losers` (default: `volume24h`)
- `limit` (number): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "metric": "gainers"
}
```

---

#### GET /stocks/:professorId
Get detailed stock information for a specific professor.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "professorId": {...},
    "currentPrice": 52.50,
    "baselinePrice": 50.00,
    "high24h": 55.00,
    "low24h": 50.00,
    "high7d": 60.00,
    "low7d": 48.00,
    "volume24h": 150,
    "volume7d": 800,
    "totalVolume": 5000,
    "percentChange24h": 2.5,
    "percentChange7d": 8.0,
    "percentChange1m": 15.0,
    "percentChange6m": 30.0,
    "marketCap": 52500,
    "sharesOutstanding": 1000,
    "trend": "bullish",
    "volatility": 3.45,
    "momentum": 2.1,
    "stats": {
      "currentPrice": 52.50,
      "volatility": 3.45,
      "momentum": 2.1,
      "trend": "bullish"
    }
  }
}
```

---

#### GET /stocks/:professorId/history
Get price history for a stock.

**Query Parameters:**
- `days` (number): Number of days to retrieve (default: 30)
- `limit` (number): Maximum results (default: 500)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "price": 50.00,
      "date": "2024-01-15T10:30:00Z"
    },
    {
      "price": 50.50,
      "date": "2024-01-15T11:00:00Z"
    }
  ],
  "dateRange": {
    "from": "2024-12-05T00:00:00Z",
    "to": "2025-01-04T00:00:00Z",
    "days": 30
  }
}
```

---

#### GET /stocks/search/query
Search stocks by professor name or department.

**Query Parameters:**
- `q` (string): Search term (minimum 2 characters)

**Response:**
```json
{
  "success": true,
  "data": [{...}],
  "query": "computer"
}
```

---

### Trading Endpoints (Authenticated)

#### POST /stocks/buy
Buy shares of a professor's stock.

**Request Body:**
```json
{
  "professorId": "507f1f77bcf86cd799439011",
  "quantity": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully bought 10 shares at $50.00",
  "data": {
    "transaction": {
      "id": "...",
      "type": "buy",
      "quantity": 10,
      "pricePerShare": 50.00,
      "totalAmount": 500.00,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "stock": {
      "professorId": "507f1f77bcf86cd799439011",
      "oldPrice": "50.0000",
      "newPrice": "50.2500",
      "percentChange": "0.50",
      "marketCap": "50250.00"
    },
    "user": {
      "newBalance": "9500.00",
      "portfolioValue": "10000.00",
      "holdings": {
        "professorId": "507f1f77bcf86cd799439011",
        "shares": 10,
        "averageBuyPrice": 50.00,
        "costBasis": 500.00,
        "currentValue": 502.50
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Insufficient balance. Required: $5000.00, Available: $1000.00",
  "required": 5000.00,
  "available": 1000.00
}
```

---

#### POST /stocks/sell
Sell shares of a professor's stock.

**Request Body:**
```json
{
  "professorId": "507f1f77bcf86cd799439011",
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully sold 5 shares at $50.25",
  "data": {
    "transaction": {
      "id": "...",
      "type": "sell",
      "quantity": 5,
      "pricePerShare": 50.25,
      "totalAmount": 251.25,
      "timestamp": "2024-01-15T11:00:00Z"
    },
    "stock": {
      "professorId": "507f1f77bcf86cd799439011",
      "oldPrice": "50.2500",
      "newPrice": "50.0000",
      "percentChange": "-0.50",
      "marketCap": "50000.00"
    },
    "user": {
      "newBalance": "9751.25",
      "portfolioValue": "9751.25",
      "gainLoss": "1.25",
      "holdings": {
        "professorId": "507f1f77bcf86cd799439011",
        "shares": 5,
        "averageBuyPrice": 50.00,
        "costBasis": 250.00,
        "currentValue": 250.00
      }
    }
  }
}
```

---

### User Portfolio Endpoints (Authenticated)

#### GET /users/profile
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 9751.25,
    "portfolioValue": 10000.00,
    "totalInvested": 500.00,
    "stocksOwned": [
      {
        "professorId": {...},
        "shares": 5,
        "averageBuyPrice": 50.00,
        "costBasis": 250.00,
        "currentValue": 250.00,
        "gainLoss": 0,
        "percentReturn": 0
      }
    ],
    "watchlist": [...],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "ucsdId": "A12345678",
  "graduationYear": 2025
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {...}
}
```

---

#### GET /users/portfolio
Get user's complete portfolio with holdings and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "cash": 9751.25,
    "holdings": [
      {
        "professorId": {...},
        "shares": 5,
        "costBasis": 250.00,
        "currentPrice": 50.00,
        "currentValue": 250.00,
        "gainLoss": 0,
        "percentGainLoss": 0,
        "marketCap": 50000,
        "volume24h": 100,
        "percentChange24h": 0.5,
        "stats": {
          "volatility": 2.5,
          "momentum": 1.2,
          "trend": "neutral"
        }
      }
    ],
    "summary": {
      "totalPortfolioValue": 10000.00,
      "holdingsValue": 250.00,
      "cash": 9751.25,
      "costBasis": 250.00,
      "gainLoss": 0,
      "gainLossPercent": 0,
      "numberOfHoldings": 1
    }
  }
}
```

---

#### GET /users/portfolio/performance
Get portfolio performance metrics.

**Query Parameters:**
- `period` (string): `1w` | `1m` | `3m` | `1y` | `all` (default: `1m`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "1m",
    "transactions": {
      "count": 5,
      "buys": 3,
      "sells": 2,
      "totalBought": 1500.00,
      "totalSold": 750.00,
      "netInvested": 750.00
    },
    "portfolio": {
      "currentValue": 10000.00,
      "cash": 9750.00,
      "holdings": 2
    }
  }
}
```

---

### Transaction History Endpoints (Authenticated)

#### GET /users/transactions
Get user's transaction history.

**Query Parameters:**
- `type` (string): `buy` | `sell` | `all` (default: `all`)
- `limit` (number): Results per page (default: 50)
- `page` (number): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "buy",
      "quantity": 10,
      "pricePerShare": 50.00,
      "totalAmount": 500.00,
      "date": "2024-01-15T10:30:00Z",
      "professorId": {
        "_id": "...",
        "name": "Dr. Smith",
        "department": "Computer Science"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

#### GET /users/transactions/:transactionId
Get detailed transaction information.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "type": "buy",
    "quantity": 10,
    "pricePerShare": 50.00,
    "totalAmount": 500.00,
    "date": "2024-01-15T10:30:00Z",
    "status": "completed",
    "userId": {...},
    "professorId": {...}
  }
}
```

---

### Watchlist Endpoints (Authenticated)

#### GET /users/watchlist
Get user's watchlist.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "professor": {
        "_id": "...",
        "name": "Dr. Smith",
        "department": "Computer Science",
        "imageUrl": "..."
      },
      "stock": {
        "currentPrice": 52.50,
        "percentChange24h": 2.5,
        "volume24h": 150,
        "marketCap": 52500,
        "trend": "bullish"
      }
    }
  ],
  "count": 1
}
```

---

#### POST /users/watchlist
Add professor to watchlist.

**Request Body:**
```json
{
  "professorId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to watchlist",
  "data": [...]
}
```

---

#### DELETE /users/watchlist/:professorId
Remove professor from watchlist.

**Response:**
```json
{
  "success": true,
  "message": "Removed from watchlist",
  "data": [...]
}
```

---

## Data Models

### Stock
```javascript
{
  _id: ObjectId,
  professorId: ObjectId,
  currentPrice: Number,
  baselinePrice: Number,
  high24h: Number,
  low24h: Number,
  high7d: Number,
  low7d: Number,
  high1m: Number,
  low1m: Number,
  high6m: Number,
  low6m: Number,
  priceHistory: [{ price: Number, date: Date }],
  volume24h: Number,
  volume7d: Number,
  totalVolume: Number,
  marketCap: Number,
  sharesOutstanding: Number,
  totalSharesBought: Number,
  totalSharesSold: Number,
  percentChange24h: Number,
  percentChange7d: Number,
  percentChange1m: Number,
  percentChange6m: Number,
  volatility: Number,
  momentum: Number,
  trend: String, // 'bullish', 'neutral', 'bearish'
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  name: String,
  ucsdId: String,
  graduationYear: Number,
  balance: Number,
  portfolioValue: Number,
  totalInvested: Number,
  stocksOwned: [{
    professorId: ObjectId,
    shares: Number,
    averageBuyPrice: Number,
    totalInvested: Number,
    costBasis: Number,
    currentValue: Number,
    gainLoss: Number,
    percentReturn: Number
  }],
  transactionHistory: [ObjectId],
  watchlist: [ObjectId],
  isVerified: Boolean,
  createdAt: Date,
  lastLogin: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  professorId: ObjectId,
  type: String, // 'buy' or 'sell'
  quantity: Number,
  pricePerShare: Number,
  totalAmount: Number,
  date: Date,
  status: String, // 'completed', 'pending', 'failed'
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Description of the error",
  "error": "Detailed error message"
}
```

### Common Error Codes
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Frontend Integration Guide

### 1. Authentication
```javascript
// Get token on login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '...', password: '...' })
});
const { token } = await response.json();

// Use token for authenticated requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Real-time Updates
Implement WebSocket listeners for:
- Stock price updates
- User balance changes
- Portfolio value updates
- New transactions

### 3. Display Components
- **Market Overview**: List stocks sorted by price/volume/gainers
- **Stock Detail**: Show price history, statistics, trading controls
- **Portfolio**: Display holdings with current values and gains/losses
- **Transaction History**: Table of all user trades
- **Watchlist**: Quick tracking of favorited stocks

---

## Rate Limiting & Best Practices

1. **Batch Requests**: Group multiple stock queries when possible
2. **Caching**: Cache market data locally (1-5 minute TTL)
3. **Real-time Updates**: Use WebSocket for price updates instead of polling
4. **Error Handling**: Always check `success` field and handle error messages
5. **Pagination**: Use pagination for large result sets

---

## Environment Configuration

Required environment variables in `.env`:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

---

## Testing the API

### Buy Stock
```bash
curl -X POST http://localhost:5000/api/stocks/buy \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"professorId": "507f1f77bcf86cd799439011", "quantity": 10}'
```

### Get Portfolio
```bash
curl http://localhost:5000/api/users/portfolio \
  -H "Authorization: Bearer {token}"
```

### Get Market Data
```bash
curl http://localhost:5000/api/stocks?limit=20&sort=-currentPrice
```

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Configure MongoDB connection string for production
- [ ] Enable CORS only for your frontend domain
- [ ] Set `PORT` environment variable
- [ ] Run database indexes
- [ ] Set up error logging
- [ ] Configure rate limiting middleware
- [ ] Test all endpoints with production data
- [ ] Set up monitoring and alerts

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Frontend-Agnostic**: ✅ Works with any JavaScript framework (React, Vue, Svelte, etc.)
