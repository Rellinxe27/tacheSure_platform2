# TâcheSûre - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [User Roles & Features](#user-roles--features)
5. [Technical Documentation](#technical-documentation)
6. [API Reference](#api-reference)
7. [Development Guide](#development-guide)
8. [Deployment](#deployment)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**TâcheSûre** is a secure marketplace mobile application designed specifically for Côte d'Ivoire, connecting clients with verified service providers. The platform ensures safety through comprehensive verification systems, real-time tracking, and secure payment processing.

### 🎯 Mission
To create a trusted ecosystem where Ivorians can safely hire and provide services with complete confidence and security.

### 🌟 Key Features
- **Multi-role Platform**: Clients, Service Providers, and Administrators
- **Comprehensive Verification**: Background checks, document verification, community validation
- **Real-time Communication**: Secure messaging with safety features
- **Payment Protection**: Escrow system with dispute resolution
- **Location Services**: GPS tracking and proximity-based matching
- **AI-Powered Moderation**: Content and user behavior monitoring

---

## Architecture

### 🏗️ Technical Stack

#### Frontend
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Custom Hooks
- **Styling**: Native StyleSheet with TailwindCSS integration
- **UI Components**: Custom components with Lucide icons
- **Fonts**: Inter font family via Expo Google Fonts

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for files/images
- **Edge Functions**: Supabase Functions for serverless logic

#### Third-party Services
- **Maps**: Expo Location + MapView
- **Payments**: Integration ready for mobile money
- **Camera**: Expo Camera for document scanning
- **Push Notifications**: Expo Notifications

### 🔄 Application Flow

```
1. Welcome/Landing → 
2. Authentication (Login/Register) → 
3. Role Selection & Onboarding → 
4. Profile Completion → 
5. Main Application (Role-based UI) → 
6. Feature Access (Tasks, Services, Admin)
```

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI
- Git
- Supabase Account
- iOS Simulator or Android Emulator (for testing)

### 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/tachesure.git
cd tachesure

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start the development server
npm run dev

# 5. Choose your platform
# Press 'w' for web
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

### 🔧 Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional Services
EXPO_PUBLIC_ANALYTICS_KEY=your-analytics-key
EXPO_PUBLIC_MAPS_API_KEY=your-maps-api-key
EXPO_PUBLIC_PAYMENT_API_KEY=your-payment-key
```

---

## User Roles & Features

### 👤 Client (Task Poster)

#### Core Features
- **Task Creation**: Post detailed service requests
- **Provider Search**: Find and filter service providers
- **Booking System**: Schedule and manage appointments
- **Payment Management**: Secure payment processing
- **Review System**: Rate and review providers
- **Real-time Chat**: Communicate with providers

#### User Journey
1. Register/Login → Profile Setup → Browse Services → Book Provider → Complete Payment → Rate Experience

### 🔧 Service Provider

#### Core Features
- **Service Management**: Create and manage service offerings
- **Availability Calendar**: Set working hours and availability
- **Task Bidding**: Respond to client requests
- **Earnings Dashboard**: Track income and payments
- **Verification Process**: Complete background checks
- **Client Communication**: Chat and coordination tools

#### Verification Requirements
- **Identity Verification**: Government ID upload
- **Background Check**: Criminal history verification
- **Professional Credentials**: Skill certificates
- **References**: Previous client testimonials
- **Insurance Coverage**: Liability protection

### ⚖️ Administrator/Moderator

#### Management Features
- **User Management**: Approve, suspend, or ban users
- **Content Moderation**: Review reports and disputes
- **Verification Oversight**: Approve provider applications
- **Analytics Dashboard**: Platform metrics and insights
- **System Configuration**: App settings and parameters
- **Financial Oversight**: Payment monitoring and disputes

---

## Technical Documentation

### 📱 App Structure

```
tachesure/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation pages
│   │   ├── index.tsx            # Home screen
│   │   ├── search.tsx           # Search/Browse
│   │   ├── post-task.tsx        # Create task
│   │   ├── messages.tsx         # Chat list
│   │   ├── profile.tsx          # User profile
│   │   ├── admin.tsx            # Admin panel
│   │   └── calendar.tsx         # Provider calendar
│   ├── auth/                    # Authentication flows
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx     # Authentication state
│   ├── index.tsx               # Welcome screen
│   ├── onboarding.tsx          # Role selection
│   ├── verification.tsx        # Provider verification
│   └── [feature].tsx          # Feature-specific screens
├── components/                  # Reusable UI components
├── hooks/                      # Custom React hooks
├── lib/                        # External service configs
├── utils/                      # Utility functions
└── assets/                     # Static assets
```

### 🔗 Database Schema

#### Core Tables

##### Users & Profiles
```sql
-- profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('client', 'provider', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  location JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

##### Tasks & Services
```sql
-- tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min DECIMAL,
  budget_max DECIMAL,
  location JSONB,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- services table  
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_min DECIMAL,
  price_max DECIMAL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

##### Bookings & Payments
```sql
-- bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  provider_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  scheduled_date TIMESTAMP,
  amount DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔌 Custom Hooks

#### useAuth
```typescript
const { 
  session, 
  user, 
  profile, 
  loading, 
  signIn, 
  signUp, 
  signOut,
  updateProfile 
} = useAuth();
```

#### useTasks
```typescript
const { 
  tasks, 
  loading, 
  createTask, 
  updateTask, 
  deleteTask,
  fetchTasks 
} = useTasks();
```

#### useServices
```typescript
const { 
  services, 
  loading, 
  createService, 
  updateService, 
  deleteService,
  fetchServices 
} = useServices();
```

---

## API Reference

### Authentication Endpoints

#### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'User Name',
      role: 'client'
    }
  }
});
```

#### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Database Operations

#### Create Task
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Task Title',
    description: 'Task Description',
    category: 'cleaning',
    budget_min: 10000,
    budget_max: 20000,
    client_id: user.id
  });
```

#### Fetch Services
```typescript
const { data, error } = await supabase
  .from('services')
  .select(`
    *,
    provider:profiles(full_name, avatar_url, rating)
  `)
  .eq('is_active', true);
```

### Real-time Subscriptions

#### Messages
```typescript
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [conversationId]);
```

---

## Development Guide

### 🛠️ Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   npm run dev
   # Develop and test
   npm run lint
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Testing**
   ```bash
   # Unit tests
   npm run test
   
   # E2E tests
   npm run test:e2e
   
   # Type checking
   npm run type-check
   ```

3. **Building**
   ```bash
   # Web build
   npm run build:web
   
   # Native builds
   npx expo build:ios
   npx expo build:android
   ```

### 📝 Code Standards

#### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Pages: `kebab-case.tsx`

#### Component Structure
```typescript
// ComponentName.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

export default function ComponentName({ title, onPress }: ComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
```

### 🔄 State Management Pattern

```typescript
// Context + Reducer Pattern
const initialState = {
  items: [],
  loading: false,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function useItems() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const fetchItems = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase.from('items').select('*');
      if (error) throw error;
      dispatch({ type: 'SET_ITEMS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  return { ...state, fetchItems };
}
```

---

## Deployment

### 🌐 Web Deployment

#### Netlify/Vercel
```bash
# Build for web
npm run build:web

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Deploy to Vercel
npm install -g vercel
vercel --prod
```

### 📱 Mobile Deployment

#### iOS App Store
```bash
# Configure app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tachesure.app",
      "buildNumber": "1.0.0"
    }
  }
}

# Build and submit
npx expo build:ios
npx expo upload:ios
```

#### Google Play Store
```bash
# Configure app.json
{
  "expo": {
    "android": {
      "package": "com.tachesure.app",
      "versionCode": 1
    }
  }
}

# Build and submit
npx expo build:android
npx expo upload:android
```

### 🔧 Environment Setup

#### Production Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
EXPO_PUBLIC_ANALYTICS_KEY=your-prod-analytics-key
```

---

## Security

### 🔒 Authentication Security

#### Row Level Security (RLS)
```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### JWT Token Management
```typescript
// Automatic token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
});
```

### 🛡️ Data Protection

#### Input Validation
```typescript
// Use validation utilities
import { validateEmail, validatePassword } from '@/utils/validation';

const handleSignUp = async (email: string, password: string) => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Proceed with sign up
};
```

#### File Upload Security
```typescript
const uploadFile = async (file: File) => {
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${user.id}/${file.name}`, file);
};
```

---

## Troubleshooting

### 🐛 Common Issues

#### Build Errors
```bash
# Clear Metro cache
npx expo start --clear

# Reset node modules
rm -rf node_modules
npm install

# Clear Expo cache
npx expo install --fix
```

#### Environment Variables Not Loading
```bash
# Verify .env file exists in project root
ls -la .env

# Restart development server
npx expo start --clear
```

#### Supabase Connection Issues
```typescript
// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .single();
    
  if (error) {
    console.error('Supabase connection failed:', error);
  } else {
    console.log('Supabase connected successfully');
  }
};
```

### 📱 Platform-Specific Issues

#### iOS Simulator
```bash
# Reset iOS Simulator
xcrun simctl erase all

# Install iOS dependencies
cd ios && pod install && cd ..
```

#### Android Emulator
```bash
# Start Android emulator
emulator -avd Pixel_4_API_30

# Clear Android cache
cd android && ./gradlew clean && cd ..
```

### 🔍 Debugging Tools

#### React Native Debugger
```bash
# Install React Native Debugger
npm install -g react-native-debugger

# Enable remote debugging in app
# Shake device → Debug → Debug with Chrome
```

#### Flipper Integration
```bash
# Install Flipper
# Download from https://fbflipper.com/

# Enable Flipper in development
import { enableFlipper } from 'react-native-flipper';
enableFlipper();
```

---

## 📊 Performance Optimization

### 🚀 Code Optimization

#### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./ExpensiveComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### Image Optimization
```typescript
import { Image } from 'expo-image';

// Use Expo Image for better performance
<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={1000}
/>
```

### 📈 Monitoring

#### Performance Tracking
```typescript
import * as Analytics from 'expo-analytics';

// Track screen views
Analytics.track('screen_view', {
  screen_name: 'Home',
  user_role: profile.role
});

// Track user actions
Analytics.track('task_created', {
  category: task.category,
  budget_range: getBudgetRange(task.budget_min, task.budget_max)
});
```

---

## 🤝 Contributing

### Development Process
1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests for new features
5. Update documentation
6. Submit a pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: [docs.tachesure.com](https://docs.tachesure.com)
- **Bug Reports**: [GitHub Issues](https://github.com/username/tachesure/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/username/tachesure/discussions)
- **Email**: support@tachesure.com

---

*Last updated: 2024-01-17*