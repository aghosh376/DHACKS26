# TypeScript Migration Guide

The backend has been successfully converted to TypeScript. Here's what changed and how to use it.

## What Changed

### File Structure
```
backend/
├── src/                    # TypeScript source files
│   ├── server.ts          # Main application entry
│   ├── config/
│   │   ├── db.ts          # Database connection
│   │   └── constants.ts   # Application constants
│   ├── models/
│   │   ├── user.ts        # User schema with types
│   │   ├── stock.ts       # Stock schema with types
│   │   ├── professor.ts   # Professor schema with types
│   │   └── transaction.ts # Transaction schema with types
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   └── errorHandler.ts# Error handling middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── stocks.ts      # Stock trading routes
│   │   ├── users.ts       # User portfolio routes
│   │   └── professors.ts  # Professor data routes
│   ├── utils/
│   │   └── marketEngine.ts# Supply/demand pricing engine
│   └── types/
│       └── index.ts       # Shared TypeScript types
├── dist/                  # Compiled JavaScript (generated)
├── tsconfig.json         # TypeScript configuration
├── package.json          # Updated with TypeScript deps
└── .env                  # Environment variables
```

### Package.json Changes
- **Dependencies**: Added `@types/*` packages for all libraries
- **DevDependencies**: Added `typescript`, `tsx`, and `ts-node`
- **Scripts**: Updated to use TypeScript compiler and tsx for development

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

### Option 1: Using tsx (Recommended - Hot Reload)
```bash
npm run dev
```
This automatically transpiles and runs TypeScript files with hot reload support.

### Option 2: Build then Run
```bash
# Compile TypeScript to JavaScript
npm run build

# Run compiled code
npm start
```

## Production Build

```bash
npm run build
npm start
```

This will:
1. Compile TypeScript to JavaScript in the `dist/` directory
2. Run the compiled `dist/server.js` file

## Key TypeScript Improvements

### 1. **Strong Type Safety**
All endpoints and functions have proper type annotations:

```typescript
router.post('/:professorId/buy', authenticate, async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  // TypeScript ensures type safety
});
```

### 2. **Database Model Types**
Mongoose models export TypeScript interfaces:

```typescript
import { IUserDocument } from '../models/user';
import { IStockDocument } from '../models/stock';

const user: IUserDocument = await User.findById(id);
const stock: IStockDocument = await Stock.findOne({ ... });
```

### 3. **Express Middleware Types**
Middleware includes proper type guards:

```typescript
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
```

### 4. **Shared Types**
Common types are defined in `src/types/index.ts`:

```typescript
type TradeType = 'buy' | 'sell';
type TrendType = 'bullish' | 'neutral' | 'bearish';
type PeriodType = '24h' | '7d' | '1m' | '6m';
```

## API Routes (Unchanged)

All API routes work exactly the same as before:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/trending` - Get trending stocks
- `GET /api/stocks/:professorId` - Get stock details
- `GET /api/stocks/:professorId/history` - Get price history
- `POST /api/stocks/:professorId/buy` - Buy shares
- `POST /api/stocks/:professorId/sell` - Sell shares

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/portfolio` - Get portfolio
- `GET /api/users/transactions` - Get transactions
- `GET /api/users/watchlist` - Get watchlist
- `POST /api/users/watchlist` - Add to watchlist
- `DELETE /api/users/watchlist/:professorId` - Remove from watchlist

### Professors
- `GET /api/professors` - Get all professors
- `GET /api/professors/:id` - Get professor details
- `GET /api/professors/search/:query` - Search professors

## Configuration

### TypeScript Configuration (tsconfig.json)
- **Target**: ES2020
- **Module**: ES2020 (ES Modules)
- **Strict Mode**: Enabled (full type checking)
- **Declaration Files**: Generated for type safety

### Development Environment
- Auto-compilation with tsx
- Source maps support for debugging
- Full type checking enabled

## Debugging

### With VS Code
1. Breakpoints work automatically in `.ts` files
2. Hover over variables to see type information
3. IntelliSense provides full type-aware autocompletion

### Error Messages
TypeScript provides detailed error messages at compile time:
```
src/routes/auth.ts:25:10 - error TS7006: Parameter 'err' implicitly has an 'any' type.

25 catch (err) {
          ~~~
```

## Migration Notes

- All JavaScript files are now TypeScript
- The original `.js` files in `backend/` directory are deprecated
- New development should use only files in `backend/src/`
- The `backend/dist/` folder is auto-generated (don't commit)

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Ensure you've run `npm install` and all TypeScript dependencies are installed.

### Issue: Port already in use
**Solution**: Change the PORT in `.env` or kill the process using port 5000.

### Issue: MongoDB connection fails
**Solution**: Verify `MONGODB_URI` is set correctly in `.env`.

## Next Steps

1. Run `npm run dev` to start development
2. The TypeScript compiler will catch any type errors
3. Use the database seeding if needed (create seed script in `src/scripts/seed.ts`)
4. All type checking happens at compile time
5. No more runtime type errors due to strict TypeScript checking
