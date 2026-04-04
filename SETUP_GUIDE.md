# Complete Setup Guide - Professor Stock Market Backend

## Quick Start (5 minutes)

### 1. MongoDB Setup
- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/db`
- See [MongoDB_Connection_Guide.md](./MongoDB_Connection_Guide.md) for detailed steps

### 2. Backend Setup
```bash
# Clone/navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB URI
# (Replace MONGODB_URI with your connection string)

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB connected: cluster.mongodb.net
```

### 3. Test Connection
Visit http://localhost:5000/api/health - should return:
```json
{"status": "Backend is running"}
```

---

## Full Setup Walkthrough

### Step 1: Create MongoDB Atlas Account & Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Start Free" → Sign up with email
3. Create new organization and project
4. Click "Create" button
5. Choose "M0 Tier (Free)" - includes 512MB storage
6. Select your region (closest to UCSD - typically us-west-2 or us-west-1)
7. Click "Create Deployment" and wait 2-3 minutes

### Step 2: Configure Database Access

In MongoDB Atlas Dashboard:

1. Left sidebar → "Security" section → "Database Access"
2. Click "Add New Database User"
3. Enter username: `professor_app` (or your choice)
4. Enter password: Use a strong password (save this!)
5. Select "Read and write to any database"
6. Click "Add User"

### Step 3: Allow Network Access

1. Left sidebar → "Security" section → "Network Access"
2. Click "Add IP Address"
3. **For Development**: Click "Allow Access from Anywhere" (will show 0.0.0.0/0)
4. Click "Confirm"

**Note**: For production, whitelist specific IPs instead.

### Step 4: Get Connection String

1. From cluster page, click "Connect" button
2. Select "Connect your application"
3. Choose "Node.js" from driver dropdown
4. Copy the connection string (looks like):
```
mongodb+srv://professor_app:PASSWORD@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Important**: Replace:
- `professor_app` with your username
- `PASSWORD` with your actual password (URL encode special chars)
- Keep everything else as-is

### Step 5: Configure Backend

```bash
# In backend directory
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://professor_app:yourpassword@cluster0.abc123.mongodb.net/professor_market?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

### Step 6: Install & Run

```bash
npm install
npm run dev
```

Monitor output for `MongoDB connected: ✓`

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |
| `JWT_SECRET` | Token signing key | `super_secret_key_123` |
| `JWT_EXPIRE` | Token expiration | `7d` or `24h` |

---

## Database Schema Summary

### Collections Created Automatically:

1. **professors** - Professor data, scores, stock prices
2. **users** - User accounts, portfolios, balances
3. **ratemyprofs** - RateMyProfessor reviews
4. **setevals** - Official SET evaluations
5. **capeevals** - CAPE evaluations
6. **redditreviews** - Reddit post analysis
7. **stocks** - Live stock market data
8. **transactions** - Buy/sell transaction history

All collections use MongoDB's automatic indexing for optimal query performance.

---

## API Testing

### Using cURL:

**Get all professors:**
```bash
curl http://localhost:5000/api/professors
```

**Search professors:**
```bash
curl http://localhost:5000/api/professors/search/smith
```

**Health check:**
```bash
curl http://localhost:5000/api/health
```

### Using Postman:

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new collection "Professor Stock Market"
3. Add requests:
   - GET: `localhost:5000/api/professors`
   - GET: `localhost:5000/api/health`
   - POST: `localhost:5000/api/auth/login` (body JSON)

---

## Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"
**Solution:**
- Check MongoDB URI in .env
- Verify IP whitelist includes your IP
- Test connection: `mongosh "mongodb+srv://username:password@cluster.mongodb.net/test"`

### ❌ "Module not found: express"
**Solution:**
```bash
npm install
```

### ❌ "Invalid connection string"
**Solution:**
- Check special characters in password are URL encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `:` → `%3A`
- Use MongoDB Atlas URI directly (it auto-encodes)

### ❌ "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000    # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Change PORT in .env to 5001, 5002, etc.
```

---

## Next: Web Scraping Setup

The backend needs scrapers to collect data:

1. **CAPE/SET Scraper**
   - Requires UCSD email login
   - Location: `scripts/scraper.js`
   - Tech: Puppeteer (headless browser)

2. **RateMyProfessor Scraper**
   - Uses public API
   - Location: `scripts/scraper.js`
   - Tech: Axios HTTP client

3. **Reddit Scraper**
   - Uses Reddit API (PRAW library)
   - Location: `scripts/scraper.js`
   - Tech: Node Reddit API wrapper

See `scripts/scraper.js` for implementation templates.

---

## Connecting Frontend

### Frontend will use base URL:
```
http://localhost:5000/api
```

### Example fetch call:
```javascript
const response = await fetch('http://localhost:5000/api/professors');
const data = await response.json();
console.log(data);
```

### CORS is enabled in server.js:
Frontend on any port can access API.

---

## Deployment Preparation

Before production:

- [ ] Use strong JWT secret (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB IP whitelist (remove "Allow Access from Anywhere")
- [ ] Set up automated MongoDB backups
- [ ] Create separate production .env
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts

---

## Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload (nodemon)

# Scraping
npm run scrape           # Run data collection

# Testing
npm test                 # Run tests (setup needed)

# Production
npm start                # Start server
NODE_ENV=production npm start
```

---

## File Structure Reference

See [backend/README.md](./backend/README.md) for full project structure.

---

**You're all set!** 🚀 

Next steps:
1. Create frontend React app
2. Connect to backend API
3. Set up web scrapers
4. Implement authentication UI
5. Build stock trading interface
