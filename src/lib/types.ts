// Base types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  university_id?: string;
  university?: string;
  phone?: string;
  bio?: string;
  gender?: string;
  balance: number;
  is_active: boolean;
  is_banned?: boolean;
  is_admin?: boolean;
  blocked_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  password: string;
  phoneNumber?: string;
  bio?: string;
  gender?: string;
}

export interface UpdateUser {
  email?: string;
  username?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  university_id?: string;
  university?: string;
  phone?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: string;
  profilePicture?: string;
}

export interface AddFundsRequest {
  amount: number;
}

export interface AddFundsResponse {
  amount_added: number;
  new_balance: number;
  previous_balance: number;
}

// Product/Listing types
export interface Product {
  _id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  sellerId: string;
  sellerInfo?: User;
  images: string[];
  location: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  availabilityStatus: 'available' | 'sold' | 'pending';
  stock: number;
  tags: string[];
  pickupLocation: string;
  contactMethod: 'chat' | 'phone' | 'both';
  isActive?: boolean;
  isFeatured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProduct {
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  location: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  stock: number;
  tags: string[];
  pickupLocation: string;
  contactMethod: 'chat' | 'phone' | 'both';
}

export interface UpdateProduct {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  images?: string[];
  location?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  stock?: number;
  tags?: string[];
  pickupLocation?: string;
  contactMethod?: 'chat' | 'phone' | 'both';
  availabilityStatus?: 'available' | 'sold' | 'pending';
}

// Chat types
export interface Chat {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  participant_a_name?: string;
  participant_b_name?: string;
  productId?: string;
  productInfo?: Product;
  last_message?: string;
  last_message_at?: string;
  unread_count?: Record<string, number>;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id?: string;
  chat_id: string;
  sender_id: string;
  senderInfo?: User;
  text: string;
  messageType?: 'text' | 'image' | 'offer';
  offerAmount?: number;
  is_read?: boolean;
  created_at?: string;
  read_at?: string;
}

export interface CreateChat {
  participant_a_id: string;
  participant_b_id: string;
  productId?: string;
  initialMessage?: string;
}

export interface SendMessage {
  chat_id: string;
  text: string;
  messageType?: 'text' | 'image' | 'offer';
  offerAmount?: number;
}

// Report types
export interface Report {
  _id?: string;
  reporterId: string;
  reporterInfo?: User;
  reportedUserId?: string;
  reportedUserInfo?: User;
  reportedProductId?: string;
  reportedProductInfo?: Product;
  reason: 'spam' | 'inappropriate' | 'fraud' | 'harassment' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'under-review' | 'resolved' | 'dismissed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReport {
  reportedUserId?: string;
  reportedProductId?: string;
  reason: 'spam' | 'inappropriate' | 'fraud' | 'harassment' | 'copyright' | 'other';
  description: string;
}

// Home page types
export interface HomeData {
  featuredProducts: Product[];
  totalUsers: number;
  totalProducts: number;
  totalChats: number;
  totalActiveListings: number;
}

export interface Category {
  name: string;
  count: number;
}

// Authentication types
export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Admin types
export interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
  };
  listings: {
    total: number;
    active: number;
    sold: number;
    hidden: number;
  };
}

export interface AdminUserAction {
  user_id: string;
}

// API Response types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}