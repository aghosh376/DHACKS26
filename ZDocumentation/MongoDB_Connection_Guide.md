# MongoDB Connection Guide

## Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas Account (free tier available)

## Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in
3. Create a new project
4. Click "Create a Deployment" and select **M0 Tier (Free)**
5. Choose your preferred cloud provider and region (AWS, Google Cloud, or Azure)
6. Click "Create Deployment" and wait for cluster to be created (2-3 minutes)

## Step 2: Set Up Database Access

1. In the left sidebar, go to **"Security" > "Database Access"**
2. Click "Add New Database User"
3. Select **"Password"** as authentication method
4. Create a username and password (save these!)
5. Set permissions to **"Read and write to any database"**
6. Click "Add User"

## Step 3: Allow Network Access

1. Go to **"Security" > "Network Access"**
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0) - **NOT recommended for production**
4. For production: Add specific IP addresses
5. Click "Confirm"

## Step 4: Get Connection String

1. Go to your cluster overview page
2. Click the **"Connect"** button
3. Select **"Connect your application"**
4. Choose **"Node.js"** as driver
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Configure Your Backend

### Option A: Using .env File

1. In your backend root directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the MongoDB URI:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your-cluster.mongodb.net/professor_market?retryWrites=true&w=majority
   ```

3. Replace placeholders:
   - `your_username` - Database user created in Step 2
   - `your_password` - Database password (URL encode special characters with %XX)
   - `your-cluster` - Your cluster name from Atlas
   - `professor_market` - Database name (will be created automatically)

### Encoding Special Characters
If your password contains special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`
- `/` → `%2F`

Example: If password is `Pass@word#123`, encode as `Pass%40word%23123`

## Step 6: Install Dependencies

```bash
cd backend
npm install
```

## Step 7: Test the Connection

### Option A: Using npm script
```bash
npm run dev
```

If successful, you should see:
```
Server running on port 5000
MongoDB connected: cluster.mongodb.net
```

### Option B: Manual test in Node.js
```bash
node
```

Then paste:
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:password@cluster.mongodb.net/professor_market')
  .then(() => console.log('Connected!'))
  .catch(err => console.log(err));
```

## Step 8: Create Database Collections

The collections will be created automatically when you run operations through Mongoose models. To manually create them, use MongoDB Atlas Web Interface:

1. Click on your cluster
2. Go to "Collections" tab
3. Collections will appear as you create and save data

## Troubleshooting

### "authentication failed"
- Verify username and password are correct
- Ensure database user was created in Database Access tab
- Check that special characters are URL encoded

### "connection timed out"
- Check that your IP is whitelisted in Network Access
- Verify internet connection is stable
- Try adding `/admin?authSource=admin` to connection string

### "ENOTFOUND - DNS lookup failed"
- Check cluster name spelling
- Verify cluster is deployed (check Atlas dashboard)
- Try restarting the nodejs server

### "MongooseError: cannot connect"
- Ensure .env file is in the backend root directory
- Verify NODE_ENV is set correctly
- Check that dotenv is loaded before mongoose connection

## Production Deployment

For production, always:
1. Use strong, unique passwords
2. Restrict network access to specific IPs
3. Enable IP Whitelist
4. Use environment variables (never hardcode credentials)
5. Set up MongoDB backups
6. Consider using MongoDB Atlas VPC Peering for additional security

## Database Seed Data (Optional)

To populate initial data:
```bash
npm run seed
```

(You'll need to create a `scripts/seed.js` file with initial data)

## Useful MongoDB Atlas Features

- **Monitoring**: View database performance in "Metrics" tab
- **Backups**: Automated daily backups (free tier)
- **Alerts**: Set up notifications for cluster issues
- **Data Explorer**: GUI for viewing and modifying data
