# TâcheSûre - Marketplace Sécurisé de Côte d'Ivoire

A secure marketplace mobile application built with React Native and Expo, featuring authentication, task management, and provider services.

## 🚀 Features

- **User Authentication** with Supabase
- **Role-based Access Control** (Client, Provider, Admin)
- **Task Management** with real-time updates
- **Service Provider Dashboard**
- **Secure Messaging System**
- **Document Verification**
- **Payment Integration**
- **Real-time Location Tracking**
- **Community Validation**

## 📱 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: Native StyleSheet (NativeWind ready)
- **Backend**: Supabase
- **Fonts**: Inter font family
- **Icons**: Lucide React Native

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tachesure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Update the `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   npx expo start
   ```

## 🔧 Recent Fixes Applied

### 1. Environment Configuration
- ✅ Created `.env` file with proper Supabase configuration
- ✅ Fixed environment variable loading in `app.config.js`

### 2. Asset Management
- ✅ Copied splash screen and favicon to correct locations
- ✅ All image assets properly referenced

### 3. Authentication System
- ✅ Fixed circular dependency in `utils/validation.ts`
- ✅ Corrected AuthWrapper navigation logic
- ✅ Proper auth route segment detection

### 4. Navigation Structure
- ✅ Fixed tabs layout with proper role-based navigation
- ✅ Created missing calendar tab route
- ✅ Resolved href routing issues in tab navigation

### 5. TypeScript Configuration
- ✅ Added NativeWind type declarations
- ✅ Proper path aliases configured in `tsconfig.json`

### 6. Build System
- ✅ Fixed Babel configuration for React Native Reanimated
- ✅ Proper Metro configuration setup
- ✅ TailwindCSS v3 compatibility

### 7. Utility Functions
- ✅ Complete validation utilities with proper error handling
- ✅ Formatting utilities for currency, dates, and distances
- ✅ Permission utilities for location access

## 📂 Project Structure

```
├── app/                    # Main application routes
│   ├── (tabs)/            # Tab navigation routes
│   ├── auth/              # Authentication routes
│   ├── contexts/          # React contexts
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # External service configurations
├── utils/                 # Utility functions
└── assets/               # Static assets
```

## 🎯 App Flow

1. **Welcome Screen** - Landing page with app introduction
2. **Authentication** - Login/Register with email
3. **Onboarding** - Role selection and profile setup
4. **Main App** - Role-based tab navigation
   - **Client**: Home, Search, Post Task, Messages, Profile
   - **Provider**: Home, Calendar, Services, Messages, Profile
   - **Admin**: All tabs + Admin panel

## 🔐 Authentication Flow

- Email/password authentication via Supabase
- Automatic session management
- Role-based routing and access control
- Profile completion validation

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build:web` - Build for web platform
- `npm run lint` - Run ESLint

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (PWA ready)

## 🔧 Development Notes

- The app uses Expo Router for file-based routing
- Supabase handles authentication and real-time features
- Role-based navigation adapts UI based on user type
- All fonts and assets are properly configured

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler fails to start**
   ```bash
   npx expo start --clear
   ```

2. **Environment variables not loading**
   - Check `.env` file exists in project root
   - Restart development server

3. **Font not loading**
   - Fonts are loaded via Expo Google Fonts
   - Check network connection

## 📚 Complete Documentation

This README provides a quick overview. For comprehensive documentation, visit:

- 📖 **[Complete Documentation Hub](docs/index.md)** - Start here for all documentation
- 👤 **[User Guide](docs/USER_GUIDE.md)** - Step-by-step guides for all user types
- 🔌 **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- 🚀 **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions

## 📞 Support

- **Technical Support**: [support@tachesure.ci](mailto:support@tachesure.ci)
- **Developer Support**: [dev-support@tachesure.ci](mailto:dev-support@tachesure.ci)
- **Bug Reports**: [GitHub Issues](https://github.com/username/tachesure/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/username/tachesure/discussions)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

---

**Note**: Make sure to configure your Supabase database schema according to the types defined in `lib/database.types.ts` for full functionality.