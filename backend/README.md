# Campus Connect API

FastAPI backend for the Campus Connect application with MongoDB integration.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: Profile management and user operations
- **Listings Management**: CRUD operations for marketplace listings
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data pagination
- **MongoDB Integration**: Async MongoDB operations with Motor
- **Input Validation**: Pydantic schemas for data validation
- **CORS Support**: Configured for frontend integration

## Prerequisites

- Python 3.8+
- MongoDB (local or cloud instance)
- pip (Python package manager)

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   - Copy `.env` file and update with your settings
   - Update `MONGODB_URL` with your MongoDB connection string
   - Generate a secure `SECRET_KEY`

## Configuration

Update the `.env` file with your settings:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=campus_connect

# JWT Configuration
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Running the Application

### Development Mode

1. **Using the run script:**
   ```bash
   python run.py
   ```

2. **Using uvicorn directly:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Using Python module:**
   ```bash
   python -m app.main
   ```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{user_id}` - Get user by ID
- `DELETE /api/users/account` - Delete user account

### Listings
- `GET /api/listings/` - Get listings with filtering and pagination
- `GET /api/listings/{listing_id}` - Get specific listing
- `POST /api/listings/` - Create new listing
- `PUT /api/listings/{listing_id}` - Update listing
- `DELETE /api/listings/{listing_id}` - Delete listing
- `GET /api/listings/user/my-listings` - Get current user's listings

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── database.py          # MongoDB connection
│   ├── models/              # MongoDB document models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── listing.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── listings.py
│   └── schemas/             # Pydantic schemas
│       ├── __init__.py
│       ├── user.py
│       ├── listing.py
│       ├── auth.py
│       └── response.py
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
├── run.py                  # Development server runner
└── README.md               # This file
```

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "username": "string",
  "full_name": "string",
  "university": "string?",
  "phone": "string?",
  "hashed_password": "string",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Listings Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "string?",
  "location": "string?",
  "images": "string[]?",
  "tags": "string[]?",
  "status": "string",
  "views": "number",
  "created_at": "datetime",
  "updated_at": "datetime",
  "user_email": "string?",
  "user_name": "string?"
}
```

## Development

### Adding New Features

1. **Add schemas** in `app/schemas/`
2. **Add models** in `app/models/`
3. **Add routes** in `app/routers/`
4. **Update main.py** to include new routers

### Testing

The API documentation is available at `/docs` when running the server, which provides an interactive interface for testing all endpoints.

## Integration with Frontend

The backend is configured to work with the React frontend running on `http://localhost:5173`. The CORS settings allow the frontend to make requests to the API.

Example frontend API call:
```typescript
// Using fetch
const response = await fetch('http://localhost:8000/api/listings/');
const data = await response.json();

// Using TanStack Query (already in your frontend)
const { data: listings } = useQuery({
  queryKey: ['listings'],
  queryFn: () => fetch('http://localhost:8000/api/listings/').then(res => res.json())
});
```