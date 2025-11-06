# QuickSplit API - Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Quick Test Commands

### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123","confirmPassword":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 3. Create Group
```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Roommates","description":"Apartment expenses"}'
```

### 4. Create Expense
```bash
curl -X POST http://localhost:5000/api/groups/GROUP_ID/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"description":"Rent","amount":1500,"category":"Housing","splitType":"equal"}'
```

### 5. Get Balances
```bash
curl -X GET http://localhost:5000/api/groups/GROUP_ID/balances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Endpoints Summary

**Auth:**
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/logout

**Groups:**
- GET /groups
- POST /groups
- GET /groups/:id
- PUT /groups/:id
- DELETE /groups/:id
- POST /groups/:id/members
- DELETE /groups/:id/members/:memberId
- GET /groups/:id/balances

**Expenses:**
- GET /groups/:id/expenses
- POST /groups/:id/expenses
- POST /groups/:id/expenses/settle
- GET /expenses/:id
- PUT /expenses/:id
- DELETE /expenses/:id

## Split Types

**Equal:** Everyone pays same amount
```json
{"splitType": "equal", "splitBetween": ["userId1", "userId2"]}
```

**Percentage:** Custom percentage per person
```json
{
  "splitType": "percentage",
  "splitDetails": [
    {"userId": "user1", "percentage": 60},
    {"userId": "user2", "percentage": 40}
  ]
}
```

**Custom:** Specific amount per person
```json
{
  "splitType": "custom",
  "splitDetails": [
    {"userId": "user1", "amount": 100},
    {"userId": "user2", "amount": 50}
  ]
}
```

**Settlement:** Direct payment
```json
{
  "from": "userId1",
  "to": "userId2",
  "amount": 50
}
```

## Categories
Food, Transportation, Entertainment, Shopping, Housing, Utilities, Healthcare, Travel, Education, Fitness, Settlement, Other

## Response Format
```json
{
  "payload": <data>,
  "statusCode": <code>,
  "message": "<message>",
  "success": true/false
}
```

## Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
