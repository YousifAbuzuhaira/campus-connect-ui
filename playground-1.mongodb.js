/* global use, db */
// MongoDB Playground for Campus Connect
// Database schema and sample data for the campus marketplace application

// Select the campus_connect database
use('campus_connect')

// Drop existing collections for clean setup (uncomment when needed)
// db.users.drop();
// db.products.drop();
// db.chats.drop();
// db.messages.drop();
// db.reports.drop();
// db.featuredProducts.drop();

// ===== USERS COLLECTION =====
// Create users with enhanced schema
db.users.insertMany([
  {
    _id: ObjectId(),
    universityId: 'STU001',
    fullName: 'John Smith',
    userName: 'johnsmith',
    email: 'john.smith@university.edu',
    phone: '+1234567890',
    bio: 'Computer Science student, love tech gadgets',
    gender: 'male',
    university: 'Tech University',
    hashed_password:
      '$2b$12$LQv3c1yqBwBFcXq.zYcq8.8YgGz5HQ5N5HQ5N5HQ5N5HQ5N5HQ5N5',
    is_active: true,
    isBanned: false,
    blockedIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    universityId: 'STU002',
    fullName: 'Sarah Johnson',
    userName: 'sarahj',
    email: 'sarah.johnson@university.edu',
    phone: '+1234567891',
    bio: 'Business student, selling textbooks and supplies',
    gender: 'female',
    university: 'Tech University',
    hashed_password:
      '$2b$12$LQv3c1yqBwBFcXq.zYcq8.8YgGz5HQ5N5HQ5N5HQ5N5HQ5N5HQ5N5',
    is_active: true,
    isBanned: false,
    blockedIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ===== PRODUCTS COLLECTION =====
// Create products/listings with comprehensive schema
db.products.insertMany([
  {
    _id: ObjectId(),
    sellerId: db.users.findOne({ userName: 'johnsmith' })._id,
    title: 'MacBook Pro 2023 - Like New',
    description:
      'Excellent condition MacBook Pro, barely used. Perfect for students.',
    price: 1200.0,
    condition: 'Like New',
    pickupLocation: 'Campus Library',
    category: 'electronics',
    stock: 1,
    buyerIds: [],
    isSold: false,
    isReported: false,
    isHidden: false,
    images: ['laptop1.jpg', 'laptop2.jpg'],
    tags: ['laptop', 'apple', 'student'],
    views: 45,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    sellerId: db.users.findOne({ userName: 'sarahj' })._id,
    title: 'Calculus Textbook - 12th Edition',
    description:
      'Calculus textbook in great condition. No highlighting or writing.',
    price: 80.0,
    condition: 'Good',
    pickupLocation: 'Student Center',
    category: 'books',
    stock: 1,
    buyerIds: [],
    isSold: false,
    isReported: false,
    isHidden: false,
    images: ['textbook1.jpg'],
    tags: ['textbook', 'math', 'calculus'],
    views: 23,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ===== CHATS COLLECTION =====
// Create chat conversations
db.chats.insertMany([
  {
    _id: ObjectId(),
    participantAId: db.users.findOne({ userName: 'johnsmith' })._id,
    participantBId: db.users.findOne({ userName: 'sarahj' })._id,
    lastMessage: 'Is the textbook still available?',
    lastMessageAt: new Date(),
    unreadCount: { a: 0, b: 1 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ===== MESSAGES COLLECTION =====
// Create messages for the chat
db.messages.insertMany([
  {
    _id: ObjectId(),
    chatId: db.chats.findOne()._id,
    senderId: db.users.findOne({ userName: 'sarahj' })._id,
    text: "Hi! I'm interested in your MacBook Pro.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000),
    readAt: new Date(Date.now() - 3500000)
  },
  {
    _id: ObjectId(),
    chatId: db.chats.findOne()._id,
    senderId: db.users.findOne({ userName: 'johnsmith' })._id,
    text: "Hello! Yes, it's still available. When would you like to see it?",
    isRead: true,
    createdAt: new Date(Date.now() - 3000000),
    readAt: new Date(Date.now() - 2900000)
  }
])

// ===== REPORTS COLLECTION =====
// Create sample reports
db.reports.insertMany([
  {
    _id: ObjectId(),
    reporterId: db.users.findOne({ userName: 'sarahj' })._id,
    type: 'product',
    targetId: db.products.findOne({ title: /MacBook/ })._id,
    description: 'Suspicious pricing, might be a scam',
    status: 'pending',
    createdAt: new Date(),
    assignedTo: null,
    resolvedAt: null
  }
])

// ===== FEATURED PRODUCTS COLLECTION =====
// Create featured products for home page
db.featuredProducts.insertMany([
  {
    _id: ObjectId(),
    productId: db.products.findOne({ title: /MacBook/ })._id,
    featured: true,
    order: 1,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    productId: db.products.findOne({ title: /Textbook/ })._id,
    featured: true,
    order: 2,
    createdAt: new Date()
  }
])

console.log('=== Database Setup Complete! ===')
console.log(`Users: ${db.users.countDocuments()}`)
console.log(`Products: ${db.products.countDocuments()}`)
console.log(`Chats: ${db.chats.countDocuments()}`)
console.log(`Messages: ${db.messages.countDocuments()}`)
console.log(`Reports: ${db.reports.countDocuments()}`)
console.log(`Featured Products: ${db.featuredProducts.countDocuments()}`)
