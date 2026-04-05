# Quick Start Guide - Running the Backend

## Prerequisite Check

Make sure you have:
- Node.js v16 or higher: `node -v`
- npm or yarn: `npm -v`
- MongoDB connection (cloud or local)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs all required packages:
- express (web server)
- mongoose (MongoDB)
- jsonwebtoken (auth)
- bcryptjs (password hashing)
- dotenv (environment config)
- cors (cross-origin requests)
- axios (HTTP client)

## Step 2: Configure Environment

Create a `.env` file in the `backend/` directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://alecLichtenberger:Irt2KTCDVFfgswLL@cluster.bdx0apr.mongodb.net/?appName=cluster

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Optional (for future features)
UCSD_EMAIL=your_email@ucsd.edu
UCSD_PASSWORD=your_password_here
RMP_API_KEY=your_rmp_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
```

## Step 3: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

**Expected output:**
```
MongoDB connected: cluster.mongodb.net
Server running on port 5000
```

## Step 4: Verify Server is Running

In a new terminal, test the health check:

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "Backend is running"
}
```

## Step 5: Test Authentication

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save this token for authenticated requests.

## Step 6: Test Market Data Endpoints

### Get all stocks
```bash
curl http://localhost:5000/api/stocks
```

### Get trending stocks (gainers)
```bash
curl "http://localhost:5000/api/stocks/trending?metric=gainers&limit=10"
```

## Step 7: Test Trading

### Buy stock
```bash
curl -X POST http://localhost:5000/api/stocks/buy \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "professorId": "507f1f77bcf86cd799439011",
    "quantity": 10
  }'
```

### Get portfolio
```bash
curl http://localhost:5000/api/users/portfolio \
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

### Sell stock
```bash
curl -X POST http://localhost:5000/api/stocks/sell \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "professorId": "507f1f77bcf86cd799439011",
    "quantity": 5
  }'
```

## Common Issues

### "MongoDB connection failed"
- Check MONGODB_URI in .env is correct
- Verify username/password in connection string
- Check IP whitelist in MongoDB Atlas (should include 0.0.0.0/0 for development)
- Test connection: `mongosh "mongodb+srv://..."`

### "Port 5000 already in use"
- Kill the process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)
- Or change PORT in `.env` to a different port (e.g., 5001)

### "Token invalid or expired"
- Make sure you're using the token from login response
- Token format: `Authorization: Bearer {token}` (not just token)
- Tokens expire after 7 days (set by JWT_EXPIRE)

### "Insufficient balance" when buying
- The test user starts with $10,000
- Make multiple small purchases or buy fewer shares
- Get portfolio to see current balance: `GET /api/users/portfolio`

### Database errors when buying/selling
- Ensure MongoDB connection string is correct
- Check that the professorId exists in database
- Run a stock query first to get valid professorIds

## Testing with Postman or Insomnia

### 1. Import Collection
Create these requests in Postman/Insomnia:

**Authentication**
- POST `http://localhost:5000/api/auth/register`
- POST `http://localhost:5000/api/auth/login`

**Market Data**
- GET `http://localhost:5000/api/stocks`
- GET `http://localhost:5000/api/stocks/trending?metric=gainers`
- GET `http://localhost:5000/api/stocks/:professorId`

**Trading**
- POST `http://localhost:5000/api/stocks/buy` (requires token)
- POST `http://localhost:5000/api/stocks/sell` (requires token)

**Portfolio**
- GET `http://localhost:5000/api/users/portfolio` (requires token)
- GET `http://localhost:5000/api/users/transactions` (requires token)

### 2. Store Token as Environment Variable
In Postman:
1. Go to "Manage Environments"
2. Create new environment
3. Add variable: `token` = (value from login response)
4. Use in headers: `Authorization: Bearer {{token}}`

## Understanding the Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Description of error",
  "error": "Detailed error message"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

## Next Steps

1. **Initialize database with sample data**
   - Create at least 5 professors/stocks
   - Set initial prices to $50

2. **Test full workflow:**
   - Register user
   - Get stock list
   - Buy multiple stocks
   - Check portfolio
   - Sell some shares
   - View transaction history

3. **Connect frontend:**
   - Update frontend API endpoint to `http://localhost:5000/api`
   - Pass JWT token from localStorage in all authenticated requests
   - Handle error messages displayed to users

4. **Deploy to production:**
   - Update MONGODB_URI to production database
   - Generate strong JWT_SECRET
   - Set NODE_ENV=production
   - Deploy to Heroku, AWS, Azure, or similar

## Performance Tips

- First request may be slow (cold start)
- Subsequent requests are faster due to MongoDB connection pooling
- All calculations happen server-side for accuracy
- Price history is limited to 1000 entries per stock

## Resources

- **Full API Documentation**: See `API_DOCUMENTATION.md`
- **Implementation Deep Dive**: See `BACKEND_IMPLEMENTATION_GUIDE.md`
- **Express.js Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **JWT Docs**: https://jwt.io

---

**Backend Status**: ✅ Ready to run  
**Version**: 1.0.0  
**Last Updated**: January 2025
