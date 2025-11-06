# QuickSplit

**Auth:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

**Groups:**
- `GET /api/groups`
- `POST /api/groups`
- `GET /api/groups/:id`
- `PUT /api/groups/:id`
- `DELETE /api/groups/:id`
- `POST /api/groups/:id/members`
- `DELETE /api/groups/:id/members/:memberId`
- `GET /api/groups/:id/balances`

**Expenses:**
- `GET /api/groups/:id/expenses`
- `POST /api/groups/:id/expenses`
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `POST /api/groups/:id/settle`

**Currency:**
- `GET /api/currency/rates`
- `GET /api/currency/convert?amount=X&from=USD&to=EUR`