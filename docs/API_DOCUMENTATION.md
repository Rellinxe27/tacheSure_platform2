# TâcheSûre API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Database Schema](#database-schema)
4. [REST API Endpoints](#rest-api-endpoints)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [File Upload & Storage](#file-upload--storage)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [SDKs & Libraries](#sdks--libraries)

---

## Overview

### Base URL
```
Production: https://your-project.supabase.co
Development: https://your-dev-project.supabase.co
```

### API Version
Current version: `v1`

### Content Type
All API requests should include:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Response Format
All responses follow this structure:
```json
{
  "data": {},
  "error": null,
  "status": 200,
  "message": "Success"
}
```

---

## Authentication

### 🔐 Authentication Flow

#### 1. User Registration
```typescript
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "data": {
    "full_name": "John Doe",
    "role": "client",
    "phone": "+225XXXXXXXX"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "user_metadata": {
      "full_name": "John Doe",
      "role": "client"
    }
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

#### 2. User Login
```typescript
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### 3. Token Refresh
```typescript
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

#### 4. Logout
```typescript
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

### 🔑 JWT Token Structure

Tokens contain:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "authenticated",
  "user_metadata": {
    "role": "client",
    "full_name": "John Doe"
  },
  "exp": 1234567890
}
```

---

## Database Schema

### 📊 Core Tables

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('client', 'provider', 'admin', 'moderator')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  location JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  location JSONB,
  address TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  skills_required TEXT[],
  images TEXT[],
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Services Table
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'negotiable')),
  duration_estimate INTEGER, -- in minutes
  service_area JSONB, -- geographic boundaries
  is_active BOOLEAN DEFAULT TRUE,
  skills TEXT[],
  images TEXT[],
  portfolio JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  service_id UUID REFERENCES services(id),
  provider_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'system')),
  attachments JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## REST API Endpoints

### 👤 User Management

#### Get Current User Profile
```typescript
GET /rest/v1/profiles?select=*&id=eq.{user_id}
Authorization: Bearer <token>
```

#### Update User Profile
```typescript
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+225XXXXXXXX",
  "location": {
    "lat": 5.3364,
    "lng": -4.0267,
    "address": "Abidjan, Côte d'Ivoire"
  }
}
```

### 📝 Task Management

#### Create Task
```typescript
POST /rest/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cleaning Service Required",
  "description": "Need house cleaning for 3-bedroom apartment",
  "category": "cleaning",
  "budget_min": 25000,
  "budget_max": 40000,
  "location": {
    "lat": 5.3364,
    "lng": -4.0267
  },
  "address": "Cocody, Abidjan",
  "urgency": "normal",
  "skills_required": ["deep_cleaning", "kitchen_cleaning"],
  "due_date": "2024-02-01T10:00:00Z"
}
```

#### Get Tasks (with filters)
```typescript
GET /rest/v1/tasks?select=*,client:profiles(full_name,avatar_url)&status=eq.open&category=eq.cleaning&order=created_at.desc
Authorization: Bearer <token>
```

#### Update Task
```typescript
PATCH /rest/v1/tasks?id=eq.{task_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "assigned",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 🔧 Service Management

#### Create Service
```typescript
POST /rest/v1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Professional House Cleaning",
  "description": "Comprehensive cleaning service for homes and offices",
  "category": "cleaning",
  "subcategory": "residential",
  "price_min": 20000,
  "price_max": 50000,
  "price_type": "hourly",
  "duration_estimate": 120,
  "service_area": {
    "radius": 10,
    "center": {"lat": 5.3364, "lng": -4.0267}
  },
  "skills": ["deep_cleaning", "eco_friendly", "insured"]
}
```

#### Get Services (with provider info)
```typescript
GET /rest/v1/services?select=*,provider:profiles(full_name,avatar_url,rating)&is_active=eq.true&category=eq.cleaning
Authorization: Bearer <token>
```

### 📅 Booking Management

#### Create Booking
```typescript
POST /rest/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "task_id": "task_uuid",
  "service_id": "service_uuid",
  "provider_id": "provider_uuid",
  "scheduled_date": "2024-02-01T14:00:00Z",
  "amount": 35000,
  "notes": "Please bring cleaning supplies"
}
```

#### Update Booking Status
```typescript
PATCH /rest/v1/bookings?id=eq.{booking_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "actual_start": "2024-02-01T14:05:00Z"
}
```

### 💬 Messaging

#### Send Message
```typescript
POST /rest/v1/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "conv_uuid",
  "receiver_id": "receiver_uuid",
  "content": "Hello, I'm interested in your cleaning service",
  "message_type": "text"
}
```

#### Get Conversation Messages
```typescript
GET /rest/v1/messages?select=*,sender:profiles(full_name,avatar_url)&conversation_id=eq.{conv_id}&order=created_at.asc
Authorization: Bearer <token>
```

#### Mark Messages as Read
```typescript
PATCH /rest/v1/messages?conversation_id=eq.{conv_id}&receiver_id=eq.{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_read": true
}
```

### ⭐ Reviews & Ratings

#### Create Review
```typescript
POST /rest/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "booking_uuid",
  "reviewee_id": "provider_uuid",
  "rating": 5,
  "comment": "Excellent service, very professional and thorough",
  "images": ["image_url_1", "image_url_2"]
}
```

#### Get Reviews for Provider
```typescript
GET /rest/v1/reviews?select=*,reviewer:profiles(full_name,avatar_url)&reviewee_id=eq.{provider_id}&order=created_at.desc
Authorization: Bearer <token>
```

---

## Real-time Subscriptions

### 🔄 Supabase Realtime

#### Subscribe to New Messages
```typescript
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

#### Subscribe to Booking Updates
```typescript
const channel = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: `client_id=eq.${userId}`
  }, (payload) => {
    console.log('Booking updated:', payload.new);
  })
  .subscribe();
```

#### Subscribe to Task Updates
```typescript
const channel = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: `status=eq.open`
  }, (payload) => {
    console.log('Task change:', payload);
  })
  .subscribe();
```

### 📡 Presence Tracking

#### Track User Online Status
```typescript
const channel = supabase
  .channel('online_users')
  .on('presence', { event: 'sync' }, () => {
    const newState = channel.presenceState();
    console.log('Online users:', newState);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key, newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key, leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## File Upload & Storage

### 📁 Storage Buckets

#### Upload Profile Avatar
```typescript
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) throw error;
  return data;
};
```

#### Upload Task Images
```typescript
const uploadTaskImages = async (files: File[], taskId: string) => {
  const uploads = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `tasks/${taskId}/image_${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('task-images')
      .upload(fileName, file);
      
    if (error) throw error;
    return data;
  });
  
  return Promise.all(uploads);
};
```

#### Get File URL
```typescript
const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};
```

### 🔒 Storage Security

#### Row Level Security Policies
```sql
-- Users can only upload to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view public files
CREATE POLICY "Public files are viewable" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'service-images'));
```

---

## Error Handling

### 🚨 Error Response Format

```json
{
  "error": {
    "message": "Invalid input",
    "details": "Email already exists",
    "hint": "Try using a different email address",
    "code": "23505"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `400` | Bad Request | 400 |
| `401` | Unauthorized | 401 |
| `403` | Forbidden | 403 |
| `404` | Not Found | 404 |
| `409` | Conflict | 409 |
| `422` | Validation Error | 422 |
| `429` | Rate Limited | 429 |
| `500` | Internal Server Error | 500 |

### Error Handling Examples

```typescript
try {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData);
    
  if (error) {
    switch (error.code) {
      case '23505':
        throw new Error('Task with this title already exists');
      case '23503':
        throw new Error('Invalid reference provided');
      default:
        throw new Error(error.message);
    }
  }
  
  return data;
} catch (error) {
  console.error('Task creation failed:', error);
  throw error;
}
```

---

## Rate Limiting

### 📊 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 60 requests | 1 hour |
| REST API | 100 requests | 1 minute |
| Realtime | 200 messages | 1 minute |
| Storage Upload | 10 uploads | 1 minute |

### Rate Limit Headers

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Handling Rate Limits

```typescript
const makeApiCall = async (endpoint: string, options: RequestInit) => {
  const response = await fetch(endpoint, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }
  
  return response.json();
};
```

---

## SDKs & Libraries

### 📚 Official SDKs

#### JavaScript/TypeScript
```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabase = createClient<Database>(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

#### React Native
```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 🔧 Custom Hooks

#### useSupabaseQuery
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseQuery<T>(
  table: string,
  query?: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let queryBuilder = supabase.from(table).select(query || '*');
        
        const { data, error } = await queryBuilder;
        
        if (error) throw error;
        setData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}
```

#### useSupabaseMutation
```typescript
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseMutation<T>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    operation: 'insert' | 'update' | 'delete',
    data?: Partial<T>,
    filters?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table);

      switch (operation) {
        case 'insert':
          query = query.insert(data!);
          break;
        case 'update':
          query = query.update(data!);
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;
        case 'delete':
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          query = query.delete();
          break;
      }

      const { data: result, error } = await query;
      
      if (error) throw error;
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
```

---

## 📚 Additional Resources

### Postman Collection
Import our Postman collection for easy API testing:
```json
{
  "info": {
    "name": "TâcheSûre API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://your-project.supabase.co"
    },
    {
      "key": "authToken",
      "value": "Bearer <your_token>"
    }
  ]
}
```

### OpenAPI Specification
Full OpenAPI 3.0 specification available at:
```
https://your-project.supabase.co/rest/v1/?apikey=<anon_key>
```

### Type Definitions
Generate TypeScript types from your database:
```bash
npx supabase gen types typescript --project-id your-project-id > database.types.ts
```

---

*For support and questions, contact: api-support@tachesure.ci*