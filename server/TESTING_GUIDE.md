# QuickSplit Server - Quick Start Testing Guide

## Prerequisites
- MongoDB running locally or connection string ready
- Node.js installed
- Environment variables configured

## Environment Setup

Create a `.env` file in the server directory with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quicksplit
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret_here_make_it_long_and_random
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_make_it_long_and_random
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
npm start
# or with nodemon
npx nodemon index.js
```

## Testing the API

### Step 1: Register Two Test Users

**User 1:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**User 2:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Step 2: Login as User 1

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the accessToken from the response!**

### Step 3: Create a Group

```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Roommates",
    "description": "Apartment expenses",
    "baseCurrency": "USD"
  }'
```

**Save the group _id from the response!**

### Step 4: Add User 2 to the Group

```bash
curl -X POST http://localhost:5000/api/groups/GROUP_ID/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "jane@example.com"
  }'
```

### Step 5: Create an Expense

```bash
curl -X POST http://localhost:5000/api/groups/GROUP_ID/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "description": "Rent - January",
    "amount": 1500.00,
    "currency": "USD",
    "category": "Housing",
    "splitType": "equal"
  }'
```

### Step 6: Get Group Expenses

```bash
curl -X GET http://localhost:5000/api/groups/GROUP_ID/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 7: Get Group Balances

```bash
curl -X GET http://localhost:5000/api/groups/GROUP_ID/balances \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 8: Settle Up

```bash
curl -X POST http://localhost:5000/api/groups/GROUP_ID/expenses/settle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "from": "USER_2_ID",
    "to": "USER_1_ID",
    "amount": 750.00,
    "currency": "USD"
  }'
```

## Testing with Postman

1. Import the collection using the API_DOCUMENTATION.md
2. Create an environment with variables:
   - `baseUrl`: http://localhost:5000/api
   - `accessToken`: (will be set after login)
   - `groupId`: (will be set after creating a group)

3. Use the "Login" request to get a token
4. Postman will automatically use the token for subsequent requests

## Common Issues

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### MongoDB connection error
- Make sure MongoDB is running
- Check your MONGODB_URI in .env
- Verify network connectivity

### CORS errors
- Check CORS_ORIGIN in .env matches your client URL
- Ensure credentials are included in client requests

### Token errors
- Make sure ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
- Check that the Authorization header is properly formatted
- Verify the token hasn't expired

## API Endpoints Summary

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user
- POST `/auth/logout` - Logout user

### Groups
- GET `/groups` - Get all groups
- POST `/groups` - Create group
- GET `/groups/:groupId` - Get group details
- PUT `/groups/:groupId` - Update group
- DELETE `/groups/:groupId` - Delete group
- POST `/groups/:groupId/members` - Add member
- DELETE `/groups/:groupId/members/:memberId` - Remove member
- GET `/groups/:groupId/balances` - Get balances

### Expenses
- GET `/groups/:groupId/expenses` - Get group expenses
- POST `/groups/:groupId/expenses` - Create expense
- POST `/groups/:groupId/expenses/settle` - Settle expense
- GET `/expenses/:expenseId` - Get expense details
- PUT `/expenses/:expenseId` - Update expense
- DELETE `/expenses/:expenseId` - Delete expense

## Expected Behavior

1. **User Registration**: Creates a new user with hashed password
2. **Login**: Returns JWT tokens and user data
3. **Group Creation**: User becomes admin automatically
4. **Add Member**: Member is added with default "member" role
5. **Create Expense**: Splits are calculated based on splitType
6. **Balances**: Automatically calculated from all expenses
7. **Settlement**: Creates a special expense to record payment

## Testing Different Split Types

### Equal Split
Everyone pays the same amount.

### Percentage Split
Each person pays a percentage of the total.

### Custom Split
Each person pays a specific amount.

### Settlement
One person pays another directly.

See API_DOCUMENTATION.md for detailed examples of each split type.
