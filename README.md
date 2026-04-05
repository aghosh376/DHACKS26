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

### 1. Setting up the program - Backend

#### 1a. Backend installation
```bash
npm install
```

#### 1b. Environment Setup
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other credentials
```

#### 1c. Run Development Server
```bash
npm start
```
Server will start on `http://localhost:5000`

### 2. Setting up the program - Frontend
#### 2a. Frontend installation
```bash
npm install
```

#### 2b. Run Frontend Server
```bash
npm run dev
```
Server will start on `http://localhost:8080`

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

## Technology Stack
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Next Steps

### Web Scraping
Currently utilized scrapers:
- **RateMyProfessor**: Web scraping via Browser Use

Scrapping to be added
- **CAPE/SET**: Official UCSD evaluations (requires authentication)
- **Reddit**: r/UCSD posts (using Reddit API/Browser Use)

See `/scripts` directory for scraper implementations.
