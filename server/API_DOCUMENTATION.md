# QuickSplit API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except register and login) require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "payload": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "john"
  },
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true
}
```

---

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "payload": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "john"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "statusCode": 200,
  "message": "Login successful",
  "success": true
}
```

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "john"
  },
  "statusCode": 200,
  "message": "User fetched successfully",
  "success": true
}
```

---

### 4. Logout User
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": null,
  "statusCode": 200,
  "message": "User Logout successful",
  "success": true
}
```

---

## Group Endpoints

### 5. Get All Groups
**GET** `/groups`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": [
    {
      "_id": "group_id",
      "name": "Roommates",
      "description": "Apartment expenses",
      "members": [
        {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "admin",
          "balance": 150.50
        }
      ],
      "createdBy": "user_id",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "baseCurrency": "USD",
      "totalSpent": 1500.00,
      "balances": [
        {
          "user": "user_id",
          "amount": 150.50
        }
      ]
    }
  ],
  "statusCode": 200,
  "message": "Groups fetched successfully",
  "success": true
}
```

---

### 6. Get Group by ID
**GET** `/groups/:groupId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": {
    "_id": "group_id",
    "name": "Roommates",
    "description": "Apartment expenses",
    "members": [...],
    "createdBy": "user_id",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "baseCurrency": "USD",
    "totalSpent": 1500.00,
    "balances": [...],
    "inviteCode": "ABC123"
  },
  "statusCode": 200,
  "message": "Group fetched successfully",
  "success": true
}
```

---

### 7. Create Group
**POST** `/groups`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Weekend Trip",
  "description": "Vacation expenses",
  "baseCurrency": "USD",
  "members": [
    {
      "email": "jane@example.com"
    }
  ]
}
```

**Response (201):**
```json
{
  "payload": {
    "_id": "group_id",
    "name": "Weekend Trip",
    "description": "Vacation expenses",
    "members": [...],
    "createdBy": "user_id",
    "createdAt": "2024-01-15T10:00:00Z",
    "baseCurrency": "USD",
    "totalSpent": 0,
    "balances": [],
    "inviteCode": "XYZ789"
  },
  "statusCode": 201,
  "message": "Group created successfully",
  "success": true
}
```

---

### 8. Update Group
**PUT** `/groups/:groupId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "baseCurrency": "EUR"
}
```

**Response (200):**
```json
{
  "payload": {
    "_id": "group_id",
    "name": "Updated Group Name",
    "description": "Updated description",
    ...
  },
  "statusCode": 200,
  "message": "Group updated successfully",
  "success": true
}
```

---

### 9. Delete Group
**DELETE** `/groups/:groupId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": null,
  "statusCode": 200,
  "message": "Group deleted successfully",
  "success": true
}
```

---

### 10. Add Member to Group
**POST** `/groups/:groupId/members`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```
OR
```json
{
  "userId": "user_id_here"
}
```

**Response (200):**
```json
{
  "payload": {
    "_id": "group_id",
    "name": "Roommates",
    "members": [...],
    ...
  },
  "statusCode": 200,
  "message": "Member added successfully",
  "success": true
}
```

---

### 11. Remove Member from Group
**DELETE** `/groups/:groupId/members/:memberId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": {
    "_id": "group_id",
    "name": "Roommates",
    "members": [...],
    ...
  },
  "statusCode": 200,
  "message": "Member removed successfully",
  "success": true
}
```

---

### 12. Get Group Balances
**GET** `/groups/:groupId/balances`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": [
    {
      "user": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "amount": 150.50
    },
    {
      "user": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "amount": -75.25
    }
  ],
  "statusCode": 200,
  "message": "Balances fetched successfully",
  "success": true
}
```

---

## Expense Endpoints

### 13. Get Group Expenses
**GET** `/groups/:groupId/expenses`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": [
    {
      "_id": "expense_id",
      "groupId": "group_id",
      "group": "group_id",
      "description": "Rent - January",
      "amount": 1500.00,
      "currency": "USD",
      "paidBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "splitBetween": ["user_id_1", "user_id_2"],
      "splitType": "equal",
      "splitDetails": [],
      "category": "Housing",
      "date": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "notes": "",
      "isSettlement": false,
      "settled": false
    }
  ],
  "statusCode": 200,
  "message": "Expenses fetched successfully",
  "success": true
}
```

---

### 14. Create Expense
**POST** `/groups/:groupId/expenses`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Equal Split):**
```json
{
  "description": "Groceries",
  "amount": 100.00,
  "currency": "USD",
  "category": "Food",
  "date": "2024-01-15T00:00:00Z",
  "notes": "Weekly groceries",
  "splitType": "equal",
  "splitBetween": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Request Body (Custom Split):**
```json
{
  "description": "Dinner",
  "amount": 100.00,
  "currency": "USD",
  "category": "Food",
  "splitType": "custom",
  "splitBetween": ["user_id_1", "user_id_2"],
  "splitDetails": [
    {
      "userId": "user_id_1",
      "amount": 60.00
    },
    {
      "userId": "user_id_2",
      "amount": 40.00
    }
  ]
}
```

**Request Body (Percentage Split):**
```json
{
  "description": "Hotel",
  "amount": 200.00,
  "currency": "USD",
  "category": "Travel",
  "splitType": "percentage",
  "splitBetween": ["user_id_1", "user_id_2"],
  "splitDetails": [
    {
      "userId": "user_id_1",
      "percentage": 60
    },
    {
      "userId": "user_id_2",
      "percentage": 40
    }
  ]
}
```

**Response (201):**
```json
{
  "payload": {
    "_id": "expense_id",
    "groupId": "group_id",
    "group": "group_id",
    "description": "Groceries",
    "amount": 100.00,
    "currency": "USD",
    "paidBy": {...},
    "splitBetween": [...],
    "splitType": "equal",
    "category": "Food",
    "date": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "notes": "Weekly groceries",
    "isSettlement": false
  },
  "statusCode": 201,
  "message": "Expense created successfully",
  "success": true
}
```

---

### 15. Get Expense by ID
**GET** `/expenses/:expenseId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": {
    "_id": "expense_id",
    "groupId": "group_id",
    "group": "group_id",
    "description": "Groceries",
    "amount": 100.00,
    ...
  },
  "statusCode": 200,
  "message": "Expense fetched successfully",
  "success": true
}
```

---

### 16. Update Expense
**PUT** `/expenses/:expenseId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "description": "Updated description",
  "amount": 150.00,
  "category": "Shopping"
}
```

**Response (200):**
```json
{
  "payload": {
    "_id": "expense_id",
    "description": "Updated description",
    "amount": 150.00,
    "category": "Shopping",
    ...
  },
  "statusCode": 200,
  "message": "Expense updated successfully",
  "success": true
}
```

---

### 17. Delete Expense
**DELETE** `/expenses/:expenseId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "payload": null,
  "statusCode": 200,
  "message": "Expense deleted successfully",
  "success": true
}
```

---

### 18. Settle Expense
**POST** `/groups/:groupId/expenses/settle`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "from": "user_id_1",
  "to": "user_id_2",
  "amount": 50.00,
  "currency": "USD",
  "description": "Settlement payment"
}
```

**Response (201):**
```json
{
  "payload": {
    "_id": "settlement_id",
    "groupId": "group_id",
    "group": "group_id",
    "description": "Settlement: John Doe paid Jane Smith",
    "amount": 50.00,
    "currency": "USD",
    "paidBy": {...},
    "splitBetween": [...],
    "splitType": "settlement",
    "category": "Settlement",
    "date": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "isSettlement": true,
    "settled": true
  },
  "statusCode": 201,
  "message": "Settlement recorded successfully",
  "success": true
}
```

---

## Error Responses

All endpoints return error responses in the following format:

**Response (4xx or 5xx):**
```json
{
  "payload": null,
  "statusCode": 400,
  "message": "Error message here",
  "success": false
}
```

### Common Error Codes:
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - User doesn't have permission
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error

---

## Testing Guide

### 1. Register a User
Use the register endpoint to create test users.

### 2. Login
Use the login endpoint to get the access token.

### 3. Create a Group
Create a group with the logged-in user.

### 4. Add Members
Add other test users to the group.

### 5. Create Expenses
Add various expenses to test different split types.

### 6. Check Balances
Verify that balances are calculated correctly.

### 7. Settle Up
Test the settlement functionality.

---

## Notes

- All dates should be in ISO 8601 format
- Currency codes follow ISO 4217 standard
- Amounts are stored as floating-point numbers
- Balances are automatically calculated from expenses
- Positive balance = they are owed money
- Negative balance = they owe money
- The user who creates a group automatically becomes an admin
- Only admins can update or delete groups
- Only expense creators or payers can update/delete expenses
