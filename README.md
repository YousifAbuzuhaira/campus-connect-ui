# Campus Connect - University Marketplace

A modern full-stack university marketplace application built with React, TypeScript, FastAPI, and MongoDB. This platform allows university students to buy and sell items, chat with each other, and manage listings within a campus environment.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Component Library**: shadcn/ui components for consistent design
- **State Management**: TanStack Query for server state management
- **Responsive Design**: Mobile-first responsive design
- **Authentication**: JWT-based authentication with protected routes

### Backend (FastAPI + MongoDB)
- **Fast API**: High-performance Python web framework
- **MongoDB**: NoSQL database with Motor async driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time Chat**: Chat system for buyer-seller communication
- **Content Moderation**: Reporting system for inappropriate content
- **File Upload**: Image upload support for product listings

### Core Functionality
- **User Management**: Registration, login, profile management with university ID verification
- **Product Listings**: Create, read, update, delete product listings with images
- **Search & Filter**: Advanced search with category and price filtering
- **Chat System**: Real-time messaging between buyers and sellers
- **Reporting**: Report inappropriate content or users
- **Featured Products**: Homepage with featured and trending items
- **Categories**: Organized product categories for easy browsing

## Project Structure

- **Frontend**: React + TypeScript + Vite (in root directory)
- **Backend**: FastAPI + MongoDB (in `backend/` directory)

## Frontend (React)

**URL**: https://lovable.dev/projects/4e9834a9-46e7-4098-93ad-d3b02e917b05

## 🚀 How to Run the Complete Application

This is a full-stack application with both frontend and backend components. Follow these steps to run everything:

### Prerequisites
- **Node.js & npm**: [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Python 3.8+**: [Install Python](https://www.python.org/downloads/)
- **MongoDB**: [Install MongoDB Community Edition](https://docs.mongodb.com/manual/installation/)

### 📋 Quick Setup

#### 1. Clone and Setup Frontend
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd campus-connect-ui

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```
**Frontend will run on**: `http://localhost:8080`

#### 2. Setup and Run Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
**Backend will run on**: `http://localhost:8000`

#### 3. Setup MongoDB
```bash
# Start MongoDB service
mongod

# In another terminal, open MongoDB shell
mongosh

# Create database and add sample data
use campus_connect

# Insert sample listings (optional)
db.listings.insertMany([
  {
    title: "Calculus Textbook",
    description: "Like new condition",
    price: 45,
    category: "textbooks",
    condition: "like new",
    location: "Campus",
    images: [],
    user_id: "sample_user",
    created_at: new Date()
  }
])
```

### 🔧 Development Workflow

1. **Start MongoDB**: Ensure MongoDB is running
2. **Start Backend**: Run FastAPI server (`uvicorn app.main:app --reload --port 8000`)
3. **Start Frontend**: Run React app (`npm run dev`)
4. **Access Application**: Open `http://localhost:8080` in your browser

### 📱 Using the Application

1. **Register**: Create account with university email (.edu domain)
2. **Login**: Access your account
3. **Browse**: View all listings from other students
4. **Create Listing**: Sell your items
5. **Chat**: Message other users about items

### 🛠️ Alternative Development Methods

**Use Lovable (Frontend Only)**

Visit the [Lovable Project](https://lovable.dev/projects/4e9834a9-46e7-4098-93ad-d3b02e917b05) for frontend-only development.

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click "Code" → "Codespaces" → "New codespace"
- Follow the setup steps above within the Codespace environment

## 💻 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for API state management
- **React Router** for navigation

### Backend
- **FastAPI** Python web framework
- **MongoDB** with Motor async driver
- **JWT** authentication with bcrypt
- **Pydantic** for data validation
- **CORS** enabled for frontend integration

### Database
- **MongoDB** for storing users, listings, chats, and reports

## 🐛 Troubleshooting

### Common Issues

**Frontend not loading**:
- Ensure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 8080 is free

**Backend not starting**:
- Check Python version: `python --version` (needs 3.8+)
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`
- Ensure MongoDB is running

**Database connection issues**:
- Start MongoDB: `mongod`
- Check MongoDB is running: `mongosh`
- Verify connection string in backend config

**Authentication not working**:
- Check if backend is running on port 8000
- Verify API endpoints are accessible
- Check browser console for CORS errors

## 🚀 Deployment

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Build: `npm run build`
- Serve the `dist` folder

### Backend Deployment  
- Deploy to Railway, Render, or similar
- Set environment variables for MongoDB URI
- Use production ASGI server

### Database
- Use MongoDB Atlas for cloud database
- Update connection string in backend configuration
