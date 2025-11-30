# Development Guide - Campus Connect

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (v18+) for frontend
- **Python** (3.8+) for backend  
- **MongoDB** (local or cloud instance)

### Setup & Run

1. **Clone and setup everything:**
   ```bash
   npm run setup
   ```

2. **Configure the backend:**
   - Navigate to `backend/` folder
   - Update `.env` file with your MongoDB connection string
   - Generate a secure SECRET_KEY

3. **Run both frontend and backend:**
   ```bash
   npm run dev:full
   ```

   This will start:
   - Frontend at `http://localhost:5173`
   - Backend API at `http://localhost:8000`
   - API Documentation at `http://localhost:8000/docs`

### Individual Commands

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run backend:dev
# OR
npm run backend:start  # Windows batch script
```

**Backend setup only:**
```bash
npm run backend:setup
```

## Project Structure

```
campus-connect-ui/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom hooks (including API hooks)
│   │   └── useApi.ts      # API integration with TanStack Query
│   ├── lib/               # Utilities
│   │   ├── api-config.ts  # API configuration
│   │   └── utils.ts       # General utilities
│   └── pages/             # Page components
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── models/        # MongoDB models
│   │   ├── routers/       # API routes
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── database.py    # Database connection
│   │   └── main.py        # FastAPI app
│   ├── .env               # Environment variables
│   ├── requirements.txt   # Python dependencies
│   └── run.py             # Development server
└── package.json           # Frontend dependencies & scripts
```

## API Integration

### Using the API hooks

```typescript
import { useListings, useCreateListing, useUser } from '@/hooks/useApi';

// Get current user
const { data: user, isLoading } = useUser();

// Get listings with filtering
const { data: listings } = useListings({
  category: 'books',
  search: 'textbook',
  page: 1,
  per_page: 10
});

// Create a new listing
const createListing = useCreateListing();

const handleSubmit = (listingData) => {
  createListing.mutate(listingData, {
    onSuccess: () => {
      console.log('Listing created!');
    },
    onError: (error) => {
      console.error('Error:', error.message);
    }
  });
};
```

### Direct API calls

```typescript
import { buildApiUrl, authHelpers } from '@/lib/api-config';

// Make authenticated requests
const response = await fetch(buildApiUrl('/api/listings/'), {
  headers: {
    ...authHelpers.getAuthHeaders(),
    'Content-Type': 'application/json',
  }
});
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=campus_connect
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use default connection: `mongodb://localhost:27017`

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com](https://mongodb.com)
2. Create cluster and get connection string
3. Update `MONGODB_URL` in backend `.env` file

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation where you can test all endpoints.

## Common Tasks

### Adding New API Endpoints

1. **Add schema** in `backend/app/schemas/`
2. **Add model** in `backend/app/models/`
3. **Add router** in `backend/app/routers/`
4. **Include router** in `backend/app/main.py`
5. **Add frontend hook** in `src/hooks/useApi.ts`

### Database Operations

View your data using MongoDB Compass or CLI:
```bash
# Connect to MongoDB
mongosh

# Switch to campus_connect database
use campus_connect

# View collections
show collections

# View users
db.users.find()

# View listings
db.listings.find()
```

## Troubleshooting

### Backend Issues
- Check Python virtual environment is activated
- Verify MongoDB is running
- Check `.env` configuration
- View logs in terminal

### Frontend Issues
- Clear browser cache
- Check API_CONFIG in browser DevTools
- Verify backend is running
- Check network requests in DevTools

### CORS Issues
If you see CORS errors:
1. Check `ALLOWED_ORIGINS` in backend `.env`
2. Make sure frontend URL is included
3. Restart backend after changes

## Deployment

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to your hosting service

### Backend
- Install dependencies: `pip install -r requirements.txt`
- Set production environment variables
- Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Database
- Use MongoDB Atlas for production
- Update connection string in production environment