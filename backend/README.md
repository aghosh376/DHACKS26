# Professor Stock Market - Backend Structure

## Project Overview
This is the backend for the Professor Stock Market platform, a prediction market where UCSD students can trade stocks tied to professor ratings and aggregate feedback.

## Directory Structure

```
backend/
├── server.js                 # Main Express application entry point
├── package.json              # Node.js dependencies
├── .env.example              # Environment variables template
│
├── config/
│   ├── db.js                 # MongoDB connection configuration
│   └── constants.js          # Application constants
│
├── models/                   # Mongoose schemas
│   ├── professor.js          # Professor data model
│   ├── user.js              # User account model
│   ├── rateMyProf.js        # RateMyProfessor review model
│   ├── setEval.js           # SET evaluation model
│   ├── capeEval.js          # CAPE evaluation model
│   ├── redditReview.js      # Reddit review model
│   ├── transaction.js       # Stock transaction model
│   └── stock.js             # Stock market data model
│
├── routes/                   # API route handlers
│   ├── auth.js              # Authentication endpoints
│   ├── professors.js        # Professor data endpoints
│   ├── users.js             # User profile endpoints
│   └── stocks.js            # Stock market endpoints
│
├── middleware/               # Express middleware
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Global error handling
│
├── controllers/              # (To be created) Business logic
│   ├── authController.js    # Auth logic
│   ├── professorController.js
│   ├── userController.js
│   └── stockController.js
│
├── utils/                    # Utility functions
│   └── scoreCalculation.js   # Score aggregation logic
│
└── scripts/                  # (To be created) Automation
    ├── scraper.js           # Web scraper for data collection
    ├── aggregationEngine.js  # Score calculation engine
    └── seed.js              # Database seeding
```

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other credentials
```

### 3. Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Professors
- `GET /api/professors` - List all professors with filters
- `GET /api/professors/:id` - Get professor details
- `GET /api/professors/search/:query` - Search professors

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/portfolio` - Get investment portfolio
- `POST /api/users/watchlist` - Add to watchlist

### Stocks
- `GET /api/stocks` - Get all stock data
- `GET /api/stocks/:professorId` - Get specific stock data
- `POST /api/stocks/buy` - Buy professor stock
- `POST /api/stocks/sell` - Sell professor stock

## Database Models

### Professor
Stores professor information and aggregated scores from all sources.

### User
Stores user account data, portfolio, balance, and transaction history.

### Evaluation Models (SetEval, CapeEval, RateMyProf, RedditReview)
Store raw review data from each source for auditing and historical analysis.

### Stock
Tracks stock market prices, volumes, and historical price data.

### Transaction
Records all buy/sell transactions for portfolio tracking.

## Score Calculation Formula

```
AggregateScore = ((WSET × RSET) + (WRMP × RRMP) + (WReddit × Ssentiment)) / Wtotal
```

Where:
- WSET = 0.5 (50% weight for official SET scores)
- WRMP = 0.3 (30% weight for RateMyProfessor)
- WReddit = 0.2 (20% weight for Reddit sentiment)

## Next Steps

### Immediate Priorities
1. ✅ Create base models and schemas
2. ✅ Set up routes structure
3. ⬜ Implement authentication (JWT)
4. ⬜ Build score aggregation engine
5. ⬜ Create web scrapers (CAPE/SET, RMP, Reddit)
6. ⬜ Implement stock trading logic
7. ⬜ Build admin dashboard

### Web Scraping Setup
The application requires scrapers for:
- **CAPE/SET**: Official UCSD evaluations (requires authentication)
- **RateMyProfessor**: Public API or web scraping
- **Reddit**: r/UCSD posts (using Reddit API)

See `/scripts` directory for scraper implementations.

## Technology Stack
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Development Tips

### Adding New Routes
1. Create route file in `/routes`
2. Import into `server.js`
3. Add to Express with `app.use('/api/endpoint', routeHandler)`

### Adding New Models
1. Create schema file in `/models`
2. Use Mongoose schema validation
3. Add indexes for frequently queried fields

### Debugging
- Use `console.log()` for debugging
- Check MongoDB Atlas "Data Explorer" to verify data
- Monitor network requests with browser DevTools

## Production Checklist
- [ ] Set environment variables in production
- [ ] Enable HTTPS
- [ ] Set up MongoDB backups
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Set up logging/monitoring
- [ ] Add database indexes for performance
