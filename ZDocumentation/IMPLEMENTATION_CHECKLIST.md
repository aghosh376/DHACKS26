# Implementation Checklist & Quick Reference

## 📋 Project Status

### ✅ Completed
- [x] Backend boilerplate structure
- [x] MongoDB schemas & models (8 collections)
- [x] Express routes (4 route groups with 10+ endpoints)
- [x] Authentication middleware
- [x] Error handling
- [x] Environment configuration
- [x] Score calculation utilities
- [x] Scraper templates
- [x] Aggregation engine template
- [x] Documentation (6 guides)

### ⬜ Next Steps - Priority Order

#### Phase 1: Core Backend (1-2 weeks)
- [ ] Implement authentication controller
  - [ ] Register endpoint (email, password, validate)
  - [ ] Login endpoint (JWT token generation)
  - [ ] Password hashing with bcryptjs
- [ ] Implement professor controller
  - [ ] Get all professors with pagination
  - [ ] Get single professor with all reviews
  - [ ] Search by name/department
- [ ] Implement user controller
  - [ ] User profile retrieval
  - [ ] Portfolio calculations
  - [ ] Watchlist management
- [ ] Implement stock controller
  - [ ] Buy shares logic (debit balance, add to portfolio)
  - [ ] Sell shares logic (credit balance, remove from portfolio)
  - [ ] Get stock market data
- [ ] Test all endpoints with Postman

#### Phase 2: Web Scrapers (2-3 weeks)
- [ ] CAPE/SET Scraper
  - [ ] Puppeteer setup for UCSD login
  - [ ] 2FA/Duo handling
  - [ ] Parse HTML for professor data
  - [ ] Store in database
- [ ] RateMyProfessor Scraper
  - [ ] API authentication
  - [ ] Query UCSD professors
  - [ ] Scheduled daily runs
  - [ ] Deduplication logic
- [ ] Reddit Scraper
  - [ ] Reddit API authentication (PRAW)
  - [ ] Search r/UCSD for professor mentions
  - [ ] Sentiment analysis integration
  - [ ] Comment extraction
- [ ] Schedule all scrapers with node-scheduler

#### Phase 3: Score Aggregation (1 week)
- [ ] Complete aggregation engine
  - [ ] Calculate component scores
  - [ ] Apply weighted formula
  - [ ] Handle edge cases (no data)
  - [ ] Update quarterly records
- [ ] Stock price engine
  - [ ] Move prices toward aggregate score
  - [ ] Calculate % changes
  - [ ] Update price history
- [ ] Set up cron job for daily 12 AM run
- [ ] Add logging & error notifications

#### Phase 4: Frontend Integration (2-3 weeks)
- [ ] Create React component library
- [ ] Build professor listing page
  - [ ] Search/filter component
  - [ ] Sorting (by score, name, dept)
  - [ ] Professor card component
- [ ] Build professor detail page
  - [ ] Show all scores
  - [ ] Display reviews
  - [ ] Show stock chart (past 7d, 1m, 6m)
  - [ ] Buy/Sell buttons
- [ ] Build portfolio page
  - [ ] Holdings list
  - [ ] Portfolio value chart
  - [ ] Transaction history
- [ ] Build authentication UI
  - [ ] Login form
  - [ ] Register form
  - [ ] UCSD email verification (optional)
- [ ] Build stock market dashboard
  - [ ] Trending professors
  - [ ] Market movers
  - [ ] Leaderboard

#### Phase 5: Polish & Deployment (1 week)
- [ ] Performance optimization
  - [ ] Add database indexes
  - [ ] Implement caching
  - [ ] Optimize queries
- [ ] Security hardening
  - [ ] HTTPS enforcement
  - [ ] Rate limiting
  - [ ] CORS configuration
  - [ ] SQL injection prevention
- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] End-to-end tests
- [ ] Documentation
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] Deployment guide
  - [ ] Team onboarding guide
- [ ] Deploy to production
  - [ ] Heroku/Railway for backend
  - [ ] Vercel for frontend
  - [ ] MongoDB Atlas cluster
  - [ ] CI/CD pipeline

---

## 📁 Project File Structure

```
DHACKS26/
├── backend/
│   ├── server.js                          ✅ DONE
│   ├── package.json                       ✅ DONE
│   ├── .env.example                       ✅ DONE
│   ├── config/
│   │   ├── db.js                          ✅ DONE
│   │   └── constants.js                   ✅ DONE
│   ├── models/                            ✅ DONE (8 files)
│   │   ├── professor.js
│   │   ├── user.js
│   │   ├── rateMyProf.js
│   │   ├── setEval.js
│   │   ├── capeEval.js
│   │   ├── redditReview.js
│   │   ├── transaction.js
│   │   └── stock.js
│   ├── routes/                            ✅ DONE (4 files)
│   │   ├── auth.js
│   │   ├── professors.js
│   │   ├── users.js
│   │   └── stocks.js
│   ├── middleware/                        ✅ DONE (2 files)
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── controllers/                       ⬜ TODO
│   │   ├── authController.js
│   │   ├── professorController.js
│   │   ├── userController.js
│   │   └── stockController.js
│   ├── utils/                             ✅ DONE
│   │   └── scoreCalculation.js
│   ├── scripts/                           ✅ DONE (templates)
│   │   ├── scraper.js                    (template)
│   │   ├── aggregationEngine.js          (template)
│   │   └── seed.js                       ⬜ TODO
│   └── README.md                          ✅ DONE
├── frontend/                              ⬜ TODO
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── MongoDB_Connection_Guide.md            ✅ DONE
├── MongoDB_Schema_Documentation.md        ✅ DONE
├── System_Architecture.md                 ✅ DONE
├── SETUP_GUIDE.md                         ✅ DONE
└── README.md                              ⬜ TODO (project overview)
```

---

## 🚀 Getting Started Right Now

### Step 1: Set Up Backend (Today - 30 mins)
```bash
# 1. Create MongoDB Atlas cluster
# Follow: MongoDB_Connection_Guide.md

# 2. Clone code and setup
cd DHACKS26/backend
cp .env.example .env

# 3. Edit .env with your MongoDB URI
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/professor_market

# 4. Install dependencies
npm install

# 5. Start server
npm run dev

# 6. Test health endpoint
curl http://localhost:5000/api/health
```

### Step 2: Understand the Code (Today - 1 hour)
Read in this order:
1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Quick overview
2. [MongoDB_Connection_Guide.md](./MongoDB_Connection_Guide.md) - DB setup
3. [MongoDB_Schema_Documentation.md](./MongoDB_Schema_Documentation.md) - Data models
4. [System_Architecture.md](./System_Architecture.md) - Flow diagrams
5. [backend/README.md](./backend/README.md) - Code structure

### Step 3: First Implementation Task
Start with **Authentication**:
1. Open [backend/routes/auth.js](./backend/routes/auth.js)
2. Implement `/api/auth/register` endpoint
3. Use `bcryptjs` for password hashing
4. Generate JWT token on success
5. Test with Postman

---

## 🔑 Key Endpoints Reference

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Professors
```
GET    /api/professors                     # List all with filters
GET    /api/professors/:id                 # Get with details
GET    /api/professors/search/:query       # Search by name
```

### Users
```
GET    /api/users/profile                  # Get logged-in user
GET    /api/users/portfolio                # Get holdings
POST   /api/users/watchlist                # Add to favorites
```

### Stocks
```
GET    /api/stocks                         # All stock data
GET    /api/stocks/:professorId            # Single stock
POST   /api/stocks/buy                     # Buy shares
POST   /api/stocks/sell                    # Sell shares
```

---

## 💾 Database Collections Quick Reference

| Collection | Purpose | Key Fields | Count |
|-----------|---------|-----------|-------|
| professors | Professor master data | name, scores, stock | ~200 |
| users | User accounts | email, balance, stocks | TBD |
| ratemyprofs | RMP reviews | content, rating, upvotes | ~1000s |
| setevals | Official SET evals | scores, enrollment | ~100s |
| capeevals | CAPE evaluations | scores, grades | ~100s |
| redditreviews | Reddit posts | content, sentiment | ~1000s |
| stocks | Stock market data | price, volume, history | ~200 |
| transactions | Buy/sell trades | userId, type, qty | TBD |

---

## 📊 Score Calculation Formula

```
AGGREGATED SCORE = (
    (0.5 × Average(SET, CAPE)) +           # Official scores (50%)
    (0.3 × RateMyProfessor avg) +          # Public reputation (30%)
    (0.2 × Reddit sentiment)                # Social sentiment (20%)
) / 1.0
```

**Example:**
```
SET Score:          75 (from 3.75/5)
CAPE Score:         72 (from 3.60/5)
RMP Score:          78 (from 3.90/5)
Reddit Sentiment:   65 (average -0.3 sentiment)

Official Avg: (75 + 72) / 2 = 73.5

Final Score: ((0.5 × 73.5) + (0.3 × 78) + (0.2 × 65)) / 1.0
           = (36.75 + 23.4 + 13) / 1.0
           = 73.15 rounded to 73
```

---

## 🔗 API Response Format

All responses follow this structure:

### Success (200)
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "status": 400,
  "message": "Error description"
}
```

---

## 🛠️ Essential Dependencies

```json
{
  "express": "API framework",
  "mongoose": "MongoDB ORM",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables",
  "axios": "HTTP client (for scrapers)"
}
```

---

## 📅 Development Timeline Estimate

| Phase | Duration | Output |
|-------|----------|--------|
| 1. Core Backend | 1-2 weeks | Working API |
| 2. Web Scrapers | 2-3 weeks | Daily data updates |
| 3. Aggregation | 1 week | Live scores |
| 4. Frontend | 2-3 weeks | UI/UX complete |
| 5. Polish | 1 week | Production ready |
| **TOTAL** | **7-10 weeks** | **Full launch** |

---

## 🐛 Common Issues & Solutions

**Port 5000 already in use:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000 | grep LISTEN
kill -9 <PID>
```

**MongoDB connection error:**
```bash
# Check .env file exists and has MongoDB URI
# Test connection with mongosh:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/professor_market"
```

**JWT token invalid:**
```bash
# Generate new secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update JWT_SECRET in .env
```

---

## 📚 Useful Links

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Express Docs**: https://expressjs.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **JWT Docs**: https://jwt.io/
- **Node.js Docs**: https://nodejs.org/docs/

---

## 🎯 Quick Wins (Start Here)

1. **Get frontend running** - Clone a React template, connect to health endpoint
2. **Create seed data** - Generate fake professors in database for testing
3. **Build professor list UI** - Display professors from API with sorting
4. **Implement login form** - Wire up auth endpoints with JWT
5. **Create portfolio page** - Show mock holdings/balance

These will give you visible progress fast! 🚀

---

## ❓ Questions?

- **Architecture**: See [System_Architecture.md](./System_Architecture.md)
- **Database**: See [MongoDB_Schema_Documentation.md](./MongoDB_Schema_Documentation.md)
- **Setup**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Code**: See [backend/README.md](./backend/README.md)
