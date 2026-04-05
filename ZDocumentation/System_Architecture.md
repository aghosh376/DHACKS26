# System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    Tailwind CSS UI Components                    │
└──────────────────────────┬──────────────────────────────────────┘
                          │ HTTP/WebSocket
                          │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Express.js Backend                           │
│  ─────────────────────────────────────────────────────────────  │
│  Routes:                                                        │
│  • /api/auth      - User authentication & JWT                  │
│  • /api/professors - Professor search & details                │
│  • /api/users     - Profile, portfolio, watchlist              │
│  • /api/stocks    - Stock prices, buy/sell orders              │
└──────────────────────┬──────────────┬──────────────────────────┘
                       │              │
        ┌──────────────┴──┐  ┌───────┴────────────┐
        │                 │  │                    │
        ▼                 ▼  ▼                    ▼
   ┌─────────┐      ┌────────────┐      ┌──────────────┐
   │Scrapers │      │Aggregation │      │ API Handlers │
   └────┬────┘      │  Engine    │      └──────────────┘
        │           └────────────┘
        │
        ├─────────────────┬───────────────┬──────────────┐
        │                 │               │              │
        ▼                 ▼               ▼              ▼
   ┌─────────┐  ┌──────────────┐  ┌─────────┐  ┌──────────────┐
   │  CAPE   │  │ RateMyProf   │  │ Reddit  │  │Stock Market  │
   │   /     │  │   Scraper    │  │Scraper  │  │   Engine     │
   │  SET    │  │              │  │         │  │              │
   │Scraper  │  │(Public API)  │  │(Reddit  │  │(Price Updates│
   │         │  │              │  │ API)    │  │)             │
   └────┬────┘  └──────┬───────┘  └────┬────┘  └──────┬───────┘
        │              │               │            │
        └──────────────┴───────────────┴────────────┘
                       │
                       ▼
            ┌─────────────────────────┐
            │   MongoDB Atlas         │
            │   (Cloud Database)      │
            ├─────────────────────────┤
            │ Collections:            │
            │ • professors            │
            │ • users                 │
            │ • ratemyprofs           │
            │ • setevals              │
            │ • capeevals             │
            │ • redditreviews         │
            │ • stocks                │
            │ • transactions          │
            └─────────────────────────┘
```

---

## Data Flow: Score Aggregation (Daily at 12 AM)

```
┌─────────────────────────────────────────────────────┐
│     12 AM Daily Aggregation Engine Triggered        │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Query all professors from DB │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────────────┐
            │ For each professor:                  │
            │ 1. Get all SET evaluations          │
            │ 2. Get all CAPE evaluations         │
            │ 3. Get all RateMyProf reviews       │
            │ 4. Get all Reddit sentiment scores  │
            └──────────────┬───────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    Calculate        Calculate          Calculate
    SET Score        RMP Score          Reddit Score
    (Avg 1-5)        (Avg 1-5)          (Sentiment avg)
    Convert 0-100    Convert 0-100      Normalize -1→1
           │               │               │ to 0-100
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
            ┌──────────────────────────────────┐
            │ Apply Weighted Formula:          │
            │ Score = (0.5×SET +               │
            │          0.3×RMP +               │
            │          0.2×Reddit) / 1.0       │
            └──────────────┬───────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ Store Aggregate Score in     │
            │ Professor Document:          │
            │ • overallScore               │
            │ • setScore                   │
            │ • rateMyProfScore            │
            │ • redditScore                │
            │ • capeEvalScore              │
            │ • lastUpdated (timestamp)    │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ Update Stock Price (optional)│
            │ - Gradually trend towards    │
            │   aggregate score            │
            │ - Max ±2% daily movement     │
            │ - Add to priceHistory        │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ Calculate Period % Changes   │
            │ • 24h % change               │
            │ • 7d % change                │
            │ • 1m % change                │
            │ • 6m % change                │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ Update all user portfolios    │
            │ Calculate new portfolio      │
            │ values based on stock price  │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ Log completion & timestamp   │
            │"Aggregation completed for    │
            │ X professors at 12:XX AM"    │
            └──────────────────────────────┘
```

---

## Data Flow: User Stock Purchase

```
┌─────────────────────────────────────┐
│   User clicks "BUY" button          │
│   Frontend sends POST to backend     │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ POST /api/stocks/buy                    │
│ {                                       │
│   professorId: "123",                   │
│   quantity: 50                          │
│ }                                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│ Verify user is authenticated       │
│ (Check JWT token)                  │
└─────────────────┬──────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
  Valid                      Invalid
    │                           │
    ▼                           ▼
┌─────────┐            ┌──────────────┐
│Continue │            │Return 401    │
└────┬────┘            │Unauthorized  │
     │                 └──────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Get current stock price from DB     │
│ price = stock.currentPrice          │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ Calculate total cost                │
│ totalCost = price × quantity        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ Get user balance                    │
│ balance = user.balance              │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │                            │
    ▼                            ▼
balance>totalCost?           NO
    │                            │
    ▼                            ▼
   YES                    ┌─────────────┐
    │                     │ Return 400  │
    │                     │Insufficient │
    │                     │Funds        │
    │                     └─────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Deduct from user balance         │
│ user.balance -= totalCost        │
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Add shares to user portfolio     │
│ stocksOwned.shares += quantity   │
│ Update avgBuyPrice               │
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Create Transaction record        │
│ {                                │
│   userId, professorId, quantity, │
│   pricePerShare, totalAmount,    │
│   type: "buy", status: "complete"│
│ }                                │
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Update stock volume              │
│ stock.volume += quantity         │
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Recalculate portfolio value      │
│ for all affected users           │
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Return success response to client│
│ {                                │
│   success: true,                 │
│   newBalance: 9500,              │
│   transaction: {...}             │
│ }                                │
└──────────────────────────────────┘
```

---

## Daily Scraper Schedule

```
Time          Scraper         Purpose
─────────────────────────────────────────────────────
12:00 AM      Aggregation     Calculate daily scores
              Engine

1:00 AM       RateMyProfessor  Sync new reviews from
              Scraper          RMP API

1:30 AM       Reddit Scraper   Monitor r/UCSD for
                               new posts about profs

2:00 AM       Stock Engine     Update stock prices
                               based on scores

Quarterly     CAPE/SET         Scrape official evals
(when         Scraper          (when released)
released)
```

---

## Stock Price Movement Logic

```
Aggregate Score = 82

Stock Current Price = 75, Target = 82
────────────────────────────────────────

Day 1: 75 + 2% adjustment = 76.50
Day 2: 76.50 + 2% adjustment = 78.06
Day 3: 78.06 + 2% adjustment = 79.62
Day 4: 79.62 + 2% adjustment = 81.22
Day 5: 81.22 + 1.1% adjustment = 82.11 (reaches target)

The price gradually converges toward the
aggregate score, preventing artificial spikes.

Max daily change = ±2%
(Configurable in scoreCalculation.js)
```

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│ Exception occurs in operation   │
└─────────────────┬───────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Error Handler   │
         │ Middleware      │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
Database      Auth Error   Validation
Error         (401)        Error (400)
(500)                      
│             │             │
└─────────────┼─────────────┘
              │
              ▼
      ┌──────────────────────┐
      │ Log Error            │
      │ • Timestamp          │
      │ • Error message      │
      │ • Stack trace        │
      │ • User ID (if auth)  │
      └──────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Return Error Response  │
    │ {                      │
    │  success: false,       │
    │  status: 400/500,      │
    │  message: "..."        │
    │ }                      │
    └────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Frontend: Vercel/Netlify        │
│         (React + Tailwind CSS)          │
└────────────────────────┬────────────────┘
                         │ HTTPS
                         │
┌─────────────────────────▼────────────────┐
│        Backend: Heroku/Railway            │
│        (Node.js + Express)               │
│  ═══════════════════════════════════     │
│  • Environment Variables (.env)         │
│  • MongoDB Connection Pool               │
│  • Scheduled Jobs (cron)                │
└─────────────────────────┬────────────────┘
                         │
┌─────────────────────────▼────────────────┐
│      MongoDB Atlas (Cloud Database)      │
│  ═════════════════════════════════════   │
│  • Cluster: professor-market-prod        │
│  • Region: US-West (closest to UCSD)    │
│  • Auto-backups enabled                  │
│  • IP Whitelist configured               │
└─────────────────────────────────────────┘
```

---

## Monitoring & Alerts

```
Metric               Target    Action if Failed
──────────────────────────────────────────
Aggregation         Once/day  Retry in 1 hour
Completion          ✓         Alert if > 2 failures

RMP Scraper         Daily     Notify admin
Success Rate        > 90%     Log failure reason

Reddit Scraper      Daily     Check API limits
Uptime              > 95%     Switch to cached data

MongoDB             24/7      Auto-failover
Connectivity        ✓         Page ops team

New Evals Detected  > 10/qt   Can proceed
Per Quarter         

Stock Price         < 5%      Verify calculation
Daily Variance      daily     Investigate outliers
```
