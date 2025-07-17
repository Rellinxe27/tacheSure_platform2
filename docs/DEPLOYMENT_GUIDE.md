# TâcheSûre - Deployment Guide

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Backend Deployment (Supabase)](#backend-deployment-supabase)
3. [Web Deployment](#web-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)

---

## Environment Setup

### 🌍 Environment Tiers

#### Development
```env
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_API_BASE_URL=https://api-dev.tachesure.ci
EXPO_PUBLIC_WEB_URL=https://dev.tachesure.ci
```

#### Staging
```env
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
EXPO_PUBLIC_ENVIRONMENT=staging
EXPO_PUBLIC_API_BASE_URL=https://api-staging.tachesure.ci
EXPO_PUBLIC_WEB_URL=https://staging.tachesure.ci
```

#### Production
```env
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_BASE_URL=https://api.tachesure.ci
EXPO_PUBLIC_WEB_URL=https://tachesure.ci
EXPO_PUBLIC_ANALYTICS_KEY=prod-analytics-key
EXPO_PUBLIC_SENTRY_DSN=https://sentry-dsn
```

### 🔐 Secret Management

#### Using Environment Variables
```bash
# Local development
cp .env.example .env.local

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

#### Expo Environment Configuration
```javascript
// app.config.js
export default ({ config }) => {
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  return {
    ...config,
    name: env === 'production' ? 'TâcheSûre' : `TâcheSûre (${env})`,
    slug: 'tachesure',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      environment: env,
    },
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  };
};
```

---

## Backend Deployment (Supabase)

### 🏗️ Database Setup

#### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create tachesure-prod --region eu-west-1
```

#### 2. Initialize Local Development
```bash
# Initialize Supabase in project
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

#### 3. Database Schema Migration
```sql
-- migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 4. Deploy to Production
```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Push schema changes
supabase db push

# Deploy functions
supabase functions deploy
```

### 🔧 Edge Functions

#### Create Authentication Hook
```typescript
// supabase/functions/auth-hook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { record, type } = await req.json();
    
    if (type === 'INSERT') {
      // Create profile for new user
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase.from('profiles').insert({
        id: record.id,
        email: record.email,
        full_name: record.raw_user_meta_data?.full_name,
        role: record.raw_user_meta_data?.role || 'client',
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

#### Deploy Functions
```bash
supabase functions deploy auth-hook --no-verify-jwt
supabase functions deploy notification-sender
supabase functions deploy payment-processor
```

### 📁 Storage Configuration

#### Create Storage Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('task-images', 'task-images', true),
('service-images', 'service-images', true),
('documents', 'documents', false),
('verification-docs', 'verification-docs', false);

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Web Deployment

### 🌐 Build Configuration

#### 1. Optimize for Production
```javascript
// app.config.js - Web optimizations
export default {
  expo: {
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'single',
      build: {
        babel: {
          include: ['@supabase/supabase-js'],
        },
      },
    },
    optimization: {
      minify: true,
      tree_shaking: {
        enabled: true,
      },
    },
  },
};
```

#### 2. Build for Web
```bash
# Install dependencies
npm ci

# Build for production
npm run build:web

# Verify build
npx serve dist
```

### 🚀 Deployment Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Configure vercel.json
cat > vercel.json << EOF
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "react",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "@supabase-url",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
EOF

# Deploy to Vercel
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Configure netlify.toml
cat > netlify.toml << EOF
[build]
  publish = "dist"
  command = "npm run build:web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  EXPO_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
  EXPO_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key"
EOF

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront
```bash
# Build for production
npm run build:web

# Upload to S3
aws s3 sync dist/ s3://tachesure-web-prod --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"
```

### 🔧 Web Optimization

#### Service Worker Configuration
```javascript
// public/sw.js
const CACHE_NAME = 'tachesure-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

---

## Mobile App Deployment

### 📱 iOS Deployment

#### 1. App Store Connect Setup
```bash
# Configure app.json for iOS
{
  "expo": {
    "ios": {
      "bundleIdentifier": "ci.tachesure.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true,
      "icon": "./assets/icon.png",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#FF7A00"
      },
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs location access to find nearby service providers.",
        "NSCameraUsageDescription": "This app needs camera access to scan documents and take photos.",
        "NSPhotoLibraryUsageDescription": "This app needs photo library access to upload images."
      }
    }
  }
}
```

#### 2. Build and Submit
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### 3. EAS Build Configuration
```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "buildType": "release",
        "enterpriseProvisioning": "universal",
        "autoIncrement": "buildNumber"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    },
    "staging": {
      "extends": "production",
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "staging"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAM123456"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json",
        "track": "production"
      }
    }
  }
}
```

### 🤖 Android Deployment

#### 1. Google Play Console Setup
```bash
# Configure app.json for Android
{
  "expo": {
    "android": {
      "package": "ci.tachesure.app",
      "versionCode": 1,
      "icon": "./assets/icon.png",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#FF7A00"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### 2. Build and Submit
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

#### 3. Keystore Management
```bash
# Generate new keystore
keytool -genkey -v -keystore tachesure-release-key.keystore \
  -alias tachesure-key -keyalg RSA -keysize 2048 -validity 10000

# Upload keystore to EAS
eas credentials
```

### 🔄 Over-the-Air Updates

#### Configure EAS Update
```bash
# Install EAS Update
npm install @expo/eas-update

# Configure updates
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

#### Update Configuration
```json
// app.config.js
export default {
  expo: {
    updates: {
      url: "https://u.expo.dev/your-project-id",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
      requestHeaders: {
        "expo-channel-name": "production"
      }
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};
```

---

## CI/CD Pipeline

### 🔄 GitHub Actions

#### 1. Main Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy TâcheSûre

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  build-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npm run build:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --non-interactive --profile production
      
      - name: Build Android
        run: eas build --platform android --non-interactive --profile production
```

#### 2. Update Workflow
```yaml
# .github/workflows/update.yml
name: Publish Update

on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '*.md'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish update
        run: eas update --branch production --message "Auto-deploy from commit ${{ github.sha }}"
```

### 🏗️ Build Optimization

#### Bundle Analyzer
```bash
# Analyze bundle size
npx expo export --source-maps --dump-assetmap

# Install bundle analyzer
npm install -g @expo/bundle-analyzer

# Analyze bundle
npx @expo/bundle-analyzer dist/metadata.json
```

#### Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## Monitoring & Analytics

### 📊 Application Monitoring

#### Sentry Configuration
```bash
# Install Sentry
npm install @sentry/react-native

# Configure Sentry
npx @sentry/wizard -i reactNative -p ios android
```

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

#### Performance Monitoring
```typescript
// hooks/usePerformance.ts
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';

export function usePerformanceMonitoring(screenName: string) {
  useEffect(() => {
    const transaction = Sentry.startTransaction({
      name: `${screenName} Screen Load`,
      op: 'navigation',
    });

    Sentry.getCurrentHub().configureScope(scope => {
      scope.setTag('screen', screenName);
    });

    return () => {
      transaction.finish();
    };
  }, [screenName]);
}
```

### 📈 Analytics Setup

#### Expo Analytics
```typescript
// lib/analytics.ts
import * as Analytics from 'expo-analytics';
import Constants from 'expo-constants';

const analytics = new Analytics.Analytics({
  trackingId: process.env.EXPO_PUBLIC_GA_TRACKING_ID!,
  clientId: Constants.installationId,
});

export const trackEvent = (action: string, category: string, label?: string) => {
  analytics.event(action, { category, label });
};

export const trackScreenView = (screenName: string) => {
  analytics.screen(screenName);
};

export default analytics;
```

#### Custom Analytics Hook
```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { trackScreenView, trackEvent } from '../lib/analytics';

export function useAnalytics(screenName: string) {
  useEffect(() => {
    trackScreenView(screenName);
  }, [screenName]);

  return {
    trackEvent,
    trackScreenView,
  };
}
```

### 🚨 Health Checks

#### Application Health
```typescript
// lib/healthCheck.ts
export const healthCheck = async () => {
  const checks = {
    api: false,
    database: false,
    storage: false,
  };

  try {
    // Test API connectivity
    const response = await fetch('/api/health');
    checks.api = response.ok;

    // Test database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    checks.database = !error;

    // Test storage connectivity
    const { data: storageData, error: storageError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    checks.storage = !storageError;

  } catch (error) {
    console.error('Health check failed:', error);
  }

  return checks;
};
```

---

## Security Configuration

### 🔒 Environment Security

#### Secrets Management
```bash
# Use GitHub Secrets for CI/CD
EXPO_TOKEN=
VERCEL_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_SERVICES_JSON=
APPLE_CERTIFICATES=
```

#### Supabase Security
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can only see own data" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Tasks are viewable by all authenticated users" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can only edit own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = client_id);
```

### 🛡️ API Security

#### Rate Limiting
```typescript
// middleware/rateLimiter.ts
import { rateLimit } from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 auth requests per hour
  message: 'Too many authentication attempts',
});
```

#### Input Validation
```typescript
// utils/validation.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(100),
  role: z.enum(['client', 'provider']),
});

export const taskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.string(),
  budget_min: z.number().positive(),
  budget_max: z.number().positive(),
});
```

---

## Performance Optimization

### ⚡ Frontend Optimization

#### Bundle Optimization
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.resolver.platforms = ['native', 'web', 'ios', 'android'];
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
```

#### Image Optimization
```typescript
// components/OptimizedImage.tsx
import { Image } from 'expo-image';
import { useState } from 'react';

interface OptimizedImageProps {
  source: string;
  width: number;
  height: number;
  placeholder?: string;
}

export function OptimizedImage({ source, width, height, placeholder }: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);

  const optimizedSource = {
    uri: `${source}?w=${width}&h=${height}&q=80&f=webp`,
  };

  return (
    <Image
      source={optimizedSource}
      style={{ width, height }}
      placeholder={placeholder}
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
      transition={200}
      contentFit="cover"
    />
  );
}
```

### 🔄 Caching Strategy

#### React Query Configuration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Service Worker Caching
```javascript
// public/sw.js
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Cache strategies
const cacheFirst = [
  '/static/',
  '/images/',
  '/fonts/',
];

const networkFirst = [
  '/api/',
  '/auth/',
];
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security policies tested
- [ ] Performance benchmarks met
- [ ] Error tracking configured
- [ ] Analytics implemented

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Performance testing done
- [ ] Security testing completed

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Backup procedures verified
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Documentation updated

---

*For deployment support, contact: devops@tachesure.ci*