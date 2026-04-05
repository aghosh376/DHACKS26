# MongoDB Database Schema Documentation

## Database: professor_market

### Collection: professors

Stores professor information and all aggregated scores.

```json
{
  "_id": ObjectId,
  
  // Basic Information
  "name": "Dr. Smith",
  "department": "Computer Science & Engineering",
  "email": "smith@ucsd.edu",
  "officeLocation": "CSE Building 3rd Floor",
  "imageUrl": "https://...",
  
  // Aggregate Scores (0-100)
  "overallScore": 75,
  "setScore": 80,
  "rateMyProfScore": 72,
  "redditScore": 68,
  "capeEvalScore": 78,
  
  // References to review documents
  "rateMyProfEvals": [ObjectId, ObjectId, ...],
  "setEvals": [ObjectId, ObjectId, ...],
  "capeEvals": [ObjectId, ObjectId, ...],
  "redditEvals": [ObjectId, ObjectId, ...],
  
  // Stock Market
  "stockPrice": 75.50,
  "stockPriceHistory": [
    { "price": 72.00, "date": ISODate("2024-01-15") },
    { "price": 73.50, "date": ISODate("2024-01-16") }
  ],
  "sharesOutstanding": 1000,
  
  // Quarterly data for trend analysis
  "quarterlyScores": [
    {
      "quarter": "F2023",
      "year": 2023,
      "score": 72,
      "dataPoints": 45,
      "date": ISODate("2023-12-15")
    }
  ],
  
  "lastUpdated": ISODate("2024-01-20"),
  "createdAt": ISODate("2024-01-01"),
  "updatedAt": ISODate("2024-01-20")
}
```

**Indexes:**
- `{ department: 1, overallScore: -1 }` - Browse by department
- `{ name: "text", department: "text" }` - Full text search

---

### Collection: users

Stores user account information and portfolio data.

```json
{
  "_id": ObjectId,
  
  // Authentication
  "email": "student@ucsd.edu",
  "password": "$2b$10$hashed...", // bcrypt hash
  "name": "John Doe",
  
  // UCSD Info
  "ucsdId": "A12345678",
  "graduationYear": 2025,
  
  // Virtual Currency (Kosla Currency)
  "balance": 10000, // Starting balance
  "portfolioValue": 10000,
  
  // Stock Holdings
  "stocksOwned": [
    {
      "professorId": ObjectId,
      "shares": 50,
      "averageBuyPrice": 48.50,
      "totalInvested": 2425,
      "currentValue": 2775
    }
  ],
  
  // Department Portfolio Aggregates
  "departmentInvestments": [
    {
      "department": "Computer Science & Engineering",
      "totalInvested": 5000,
      "currentValue": 5500
    }
  ],
  
  "transactionHistory": [ObjectId, ObjectId, ...],
  "watchlist": [ObjectId, ObjectId, ...],
  
  // Account Status
  "isVerified": true,
  "verificationToken": "token...",
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  
  "createdAt": ISODate("2024-01-01"),
  "lastLogin": ISODate("2024-01-20"),
  "updatedAt": ISODate("2024-01-20")
}
```

**Indexes:**
- `{ email: 1 }` - Unique email lookup

---

### Collection: ratemyprofs

Individual RateMyProfessor reviews.

```json
{
  "_id": ObjectId,
  
  "professorId": ObjectId, // Reference to professor
  "rmpId": "prof123abc", // External RMP ID
  
  "content": "Great instructor, very engaging lectures...",
  "rating": 4.5, // 1-5 scale
  "difficulty": 3, // 1-5 difficulty
  "author": "Anonymous",
  "wouldTakeAgain": true,
  "helpfulCount": 42,
  
  "tags": ["engaging", "helpful", "clear"],
  
  "date": ISODate("2024-01-15"),
  "createdAt": ISODate("2024-01-15"),
  "updatedAt": ISODate("2024-01-15")
}
```

**Indexes:**
- `{ professorId: 1, date: -1 }` - Get reviews for professor

---

### Collection: setevals

Official UCSD SET (Student Evaluation of Teaching) evaluations.

```json
{
  "_id": ObjectId,
  
  "professorId": ObjectId,
  "courseCode": "CSE 101",
  "courseName": "Intro to Computer Science",
  "term": "F2023",
  
  "enrollmentCount": 350,
  "responseCount": 210,
  "responseRate": 60,
  
  "scores": {
    "recommendProfessor": 4.2,
    "courseOrganization": 4.1,
    "courseContent": 4.3,
    "communicationSkills": 4.0,
    "assessmentFairness": 3.9,
    "studentEngagement": 4.2,
    "overallQuality": 4.1
  },
  
  "content": "Student feedback comments...",
  "date": ISODate("2023-12-15"),
  "createdAt": ISODate("2023-12-15"),
  "updatedAt": ISODate("2023-12-15")
}
```

**Indexes:**
- `{ professorId: 1, term: -1 }` - GET evals by professor & quarter

---

### Collection: capeevals

UCSD CAPE (Course and Professor Evaluation) evaluations.

```json
{
  "_id": ObjectId,
  
  "professorId": ObjectId,
  "courseCode": "CSE 101",
  "courseName": "Intro to Computer Science",
  "term": "F2023",
  
  "enrollmentCount": 350,
  "responseCount": 210,
  
  "scores": {
    "recommendProfessor": 4.1,
    "courseOrganization": 4.0,
    "courseContent": 4.2,
    "communicationSkills": 3.9,
    "workloadExpectation": 3.8,
    "gradeDistribution": 3.7,
    "overallQuality": 4.0
  },
  
  "letterGradeDistribution": {
    "a": 120,
    "b": 65,
    "c": 20,
    "d": 5,
    "f": 0
  },
  
  "content": "Detailed feedback...",
  "date": ISODate("2023-12-15"),
  "createdAt": ISODate("2023-12-15"),
  "updatedAt": ISODate("2023-12-15")
}
```

---

### Collection: redditreviews

Analyzed Reddit posts and comments about professors.

```json
{
  "_id": ObjectId,
  
  "professorId": ObjectId,
  "postId": "reddit123abc",
  
  "title": "Dr. Smith is an amazing professor",
  "content": "I just finished CSE 101 with Dr. Smith and...",
  "author": "u/StudentName",
  "url": "https://reddit.com/r/UCSD/comments/...",
  
  "sentimentScore": 0.85, // -1 to 1 (negative to positive)
  "sentimentLabel": "positive", // negative, neutral, positive
  
  "upvotes": 156,
  "comments": 23,
  
  "date": ISODate("2024-01-18"),
  "createdAt": ISODate("2024-01-18"),
  "updatedAt": ISODate("2024-01-18")
}
```

**Indexes:**
- `{ professorId: 1, date: -1 }` - Get comments for professor

---

### Collection: stocks

Live stock market data for each professor.

```json
{
  "_id": ObjectId,
  
  "professorId": ObjectId, // Unique per professor
  
  // Current Price
  "currentPrice": 75.50,
  "baselinePrice": 50.00,
  
  // Historical Ranges
  "high7d": 78.25,
  "low7d": 72.00,
  "high1m": 82.50,
  "low1m": 69.00,
  "high6m": 85.00,
  "low6m": 45.00,
  
  // Detailed Price History
  "priceHistory": [
    { "price": 75.50, "date": ISODate("2024-01-20") },
    { "price": 74.00, "date": ISODate("2024-01-19") }
  ],
  
  // Market Data
  "volume": 1250, // Shares traded
  "marketCap": 75500, // price × shares outstanding
  "sharesOutstanding": 1000,
  
  // Percent Changes
  "percentChange24h": 2.5,
  "percentChange7d": 5.0,
  "percentChange1m": -3.5,
  "percentChange6m": 50.0,
  
  "lastUpdated": ISODate("2024-01-20"),
  "createdAt": ISODate("2024-01-01"),
  "updatedAt": ISODate("2024-01-20")
}
```

---

### Collection: transactions

Buy and sell transaction history.

```json
{
  "_id": ObjectId,
  
  "userId": ObjectId,
  "professorId": ObjectId,
  
  "type": "buy", // or "sell"
  "quantity": 50,
  "pricePerShare": 48.50,
  "totalAmount": 2425,
  
  "status": "completed", // pending, failed
  
  "date": ISODate("2024-01-18"),
  "createdAt": ISODate("2024-01-18"),
  "updatedAt": ISODate("2024-01-18")
}
```

**Indexes:**
- `{ userId: 1, date: -1 }` - User transaction history
- `{ professorId: 1 }` - All trades for a professor

---

## Score Aggregation Formula

All scores normalized to **0-100 scale**

```
Aggregate Score = ((0.5 × SET Score) + (0.3 × RMP Score) + (0.2 × Reddit Score)) / 1.0
```

**Component Score Ranges:**
- SET/CAPE: 1-5 → Multiply by 20 to get 0-100
- RateMyProfessor: 1-5 → Multiply by 20 to get 0-100
- Reddit Sentiment: -1 to 1 → Add 1, divide by 2, multiply by 100 to get 0-100

**Weights:**
- Official (SET + CAPE average): 50%
- Public Reputation (RMP): 30%
- Social Sentiment (Reddit): 20%

---

## Query Examples

### Get all professors sorted by score
```javascript
db.professors.find().sort({ overallScore: -1 }).limit(100)
```

### Get professor with all reviews
```javascript
db.professors.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: { from: "ratemyprofs", localField: "_id", foreignField: "professorId", as: "rmpReviews" } },
  { $lookup: { from: "redditreviews", localField: "_id", foreignField: "professorId", as: "redditReviews" } }
])
```

### Get user portfolio value
```javascript
db.users.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $unwind: "$stocksOwned" },
  { $group: { _id: "$_id", totalValue: { $sum: "$stocksOwned.currentValue" } } }
])
```

### Find trending professors (increased score)
```javascript
db.professors.find({ 
  overallScore: { $gt: 70 },
  lastUpdated: { $gte: ISODate("2024-01-15") }
}).sort({ lastUpdated: -1 })
```

---

## Data Retention

- **Reviews**: Keep all historical data (audit trail)
- **Quarterly Scores**: Keep indefinitely (trend analysis)
- **Price History**: Keep last 6 months
- **Transactions**: Keep all (compliance)

---

## Backup Strategy

MongoDB Atlas Free Tier includes:
- Daily automatic backups (30-day retention)
- Point-in-time recovery
- No manual backup needed

For production: Enable 7-day+ backup retention.
