# Dummy Data Instructions

## Overview
The application is currently configured to use **dummy/mock data** instead of making real API calls. This allows you to develop and test the UI without a backend server running.

## Current Status
✅ **DUMMY DATA IS ENABLED**

## What's Included

### Dummy Data (src/data/dummyData.js)
- **5 Groups** with different members and balances
- **11 Expenses** distributed across groups
- **1 Dummy User** (John Doe)

### Features Working with Dummy Data
- ✅ Dashboard statistics
- ✅ Group listing
- ✅ Group details
- ✅ **Create new groups**
- ✅ **Update group information**
- ✅ **Delete groups**
- ✅ **Add members to groups**
- ✅ **Remove members from groups**
- ✅ Expense viewing
- ✅ **Create new expenses**
- ✅ **Update expenses**
- ✅ **Delete expenses**
- ✅ **Settle expenses**
- ✅ Balance calculations
- ✅ User information in sidebar
- ✅ **Login functionality** (any email/password works)
- ✅ **Register functionality** (creates new user)
- ✅ User profile management

## How to Switch to Real API

When your backend API is ready, follow these steps:

### Step 1: Update Group Slice
**File:** `src/store/slices/groupSlice.js`

Find this line (around line 6):
```javascript
const USE_DUMMY_DATA = true;
```

Change it to:
```javascript
const USE_DUMMY_DATA = false;
```

### Step 2: Update Expense Slice
**File:** `src/store/slices/expenseSlice.js`

Find this line (around line 6):
```javascript
const USE_DUMMY_DATA = true;
```

Change it to:
```javascript
const USE_DUMMY_DATA = false;
```

### Step 3: Update Auth Slice
**File:** `src/store/slices/authSlice.js`

Find this line (around line 6):
```javascript
const USE_DUMMY_DATA = true;
```

Change it to:
```javascript
const USE_DUMMY_DATA = false;
```

### Step 4: Re-enable Authentication
**File:** `src/components/Layout.jsx`

Uncomment the authentication checks (currently commented out)

**File:** `src/App.jsx`

Change the route redirects back to actual Login/Register components

### Step 5: Update API Base URL
**File:** `src/services/api.js`

Update the `baseURL` in the Axios instance to point to your backend API:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Dummy User Info
When dummy data is enabled, you're logged in as:
- **Name:** John Doe
- **Email:** john@example.com
- **Username:** johndoe
- **User ID:** user1

## Dummy Groups
1. **Roommates** - 3 members, apartment expenses
2. **Weekend Trip** - 4 members, vacation to Lake Tahoe
3. **Office Lunch** - 3 members, team lunch expenses
4. **Gym Membership** - 2 members, shared gym costs
5. **Birthday Party** - 5 members, Sarah's birthday celebration

## Notes
- All dummy data includes realistic balances, expenses, and member information
- The dummy API calls include simulated delays (300-500ms) to mimic real API behavior
- You can modify the dummy data in `src/data/dummyData.js` to test different scenarios

## Testing Tips
1. Navigate through different groups to see expenses
2. Check the Dashboard for aggregated statistics
3. View individual group details and balances
4. Test the UI with different data scenarios by modifying `dummyData.js`

---
**Created:** For development purposes
**Remove:** This file when moving to production
