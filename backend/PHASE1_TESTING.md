# Phase 1 - API Key Setup

## Backend Setup ✅
API key is now **required** for all requests (except health check).

## Frontend Setup

### 1. Create `.env` file
```bash
cd frontend
cp .env.example .env
```

### 2. Verify `.env` contents
```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=saturn-dashboard-key-2024
```

### 3. Restart frontend dev server
```bash
npm run dev
```

## Default Project Created ✅
- **Project Name:** Saturn Dashboard
- **API Key:** `saturn-dashboard-key-2024`
- **Project ID:** 2

## Testing

### Test API Key Requirement
```bash
# Without API key - should fail with 401
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}'

# With API key - should work
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: saturn-dashboard-key-2024" \
  -d '{"email":"test@test.com","password":"pass"}'
```

### Frontend Testing
1. Open http://localhost:5173
2. Try to login/register
3. Check browser DevTools → Network tab
4. Verify `x-api-key` header is sent with all requests

## Disable a Function

```sql
-- Disable auth.login for Saturn Dashboard
INSERT INTO ProjectFunctions (project_id, function_id, is_enabled)
VALUES (
    2,
    (SELECT id FROM FunctionRegistry WHERE function_name = 'auth.login'),
    false
);
```

Now login will return 403!

## Enable it Back

```sql
UPDATE ProjectFunctions 
SET is_enabled = true 
WHERE project_id = 2 
AND function_id = (SELECT id FROM FunctionRegistry WHERE function_name = 'auth.login');
```
