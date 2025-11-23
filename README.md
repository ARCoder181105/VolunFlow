# 🌟 VolunFlow

> **Connecting Hearts, Building Communities**  
> A modern platform bridging volunteers and NGOs to create meaningful social impact.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![GraphQL](https://img.shields.io/badge/GraphQL-16.12-e10098)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**VolunFlow** is a comprehensive volunteer management platform designed to streamline the connection between passionate volunteers and impactful NGOs. Our mission is to make volunteering accessible, rewarding, and measurable while empowering organizations to efficiently manage their community engagement initiatives.

### 🎨 The Vision

In today's world, countless individuals want to contribute to meaningful causes, yet struggle to find the right opportunities. Simultaneously, NGOs face challenges in recruiting, organizing, and retaining volunteers. VolunFlow bridges this gap by providing:

- **For Volunteers**: A centralized hub to discover events, track contributions, and earn recognition
- **For NGOs**: Powerful tools to create events, manage volunteers, and build engaged communities
- **For Communities**: A transparent platform that amplifies social impact and fosters collaboration

---

## ✨ Key Features

### 👥 For Volunteers

- **🔍 Event Discovery**: Browse and filter volunteering opportunities by location, cause, and availability
- **📅 Smart Signup**: Register for events with real-time availability tracking
- **🏆 Gamification**: Earn badges and recognition for your contributions
- **📊 Personal Dashboard**: Track your volunteering journey, upcoming events, and achievements
- **🔔 Notifications**: Stay updated on event confirmations and new opportunities

### 🏢 For NGO Administrators

- **🎪 Event Management**: Create, edit, and manage volunteering events with rich media support
- **👨‍👩‍👧‍👦 Volunteer Tracking**: Monitor signups, mark attendance, and manage participant lists
- **🏅 Badge System**: Design custom achievement badges to reward and motivate volunteers
- **📍 Multi-Branch Support**: Manage multiple physical locations with integrated mapping
- **📈 Analytics Dashboard**: Gain insights into volunteer engagement and event performance
- **🤖 AI-Powered Tools**: Auto-generate event tags and content suggestions using Gemini AI

### 🔐 Authentication & Security

- **🔒 Secure JWT Authentication**: Cookie-based sessions with access/refresh token rotation
- **🌐 OAuth Integration**: Login with Google or Facebook for seamless onboarding
- **🛡️ Role-Based Access Control**: Granular permissions for Volunteers, NGO Admins, and Super Admins
- **🔐 Password Hashing**: Industry-standard bcrypt encryption

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.2.0 |
| **TypeScript** | Type Safety | 5.9.3 |
| **Vite** | Build Tool | 7.2.2 |
| **TailwindCSS** | Styling | 4.1.17 |
| **React Router** | Navigation | 7.9.5 |
| **Apollo Client** | GraphQL Client | 4.0.9 |
| **React Hook Form** | Form Management | 7.66.0 |
| **Zod** | Schema Validation | 4.1.12 |
| **date-fns** | Date Utilities | 4.1.0 |
| **Lucide React** | Icons | 0.553.0 |

### Backend (Server)

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 20+ |
| **Express** | Web Framework | 5.1.0 |
| **TypeScript** | Type Safety | 5.9.3 |
| **Apollo Server** | GraphQL Server | 5.0.0 |
| **Prisma** | ORM | 6.18.0 |
| **MongoDB** | Database | Latest |
| **Passport.js** | OAuth | 0.7.0 |
| **bcryptjs** | Password Hashing | 3.0.2 |
| **jsonwebtoken** | JWT Auth | 9.0.2 |
| **Cloudinary** | Image Storage | 2.8.0 |
| **Google GenAI** | AI Features | 1.28.0 |
| **Axios** | HTTP Client | 1.12.2 |

### DevOps & Tools

- **Docker** (Optional): Containerization
- **n8n**: Workflow automation for email notifications
- **Jest**: Unit testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## 🏗️ Architecture

VolunFlow follows a modern **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Components │  │  GraphQL     │  │  State Mgmt      │  │
│  │  Pages      │  │  Apollo      │  │  React Hooks     │  │
│  │  Hooks      │  │  Queries     │  │  Context API     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/GraphQL
                            │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST       │  │  GraphQL     │  │  Middleware      │  │
│  │  /auth      │  │  Apollo      │  │  Auth            │  │
│  │  /upload    │  │  Resolvers   │  │  CORS            │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Services   │  │  Validation  │  │  External APIs   │  │
│  │  Resolvers  │  │  Zod         │  │  Gemini AI       │  │
│  │  Utils      │  │  JWT         │  │  Cloudinary      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Users      │  │  NGOs        │  │  Events          │  │
│  │  Signups    │  │  Branches    │  │  Badges          │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **GraphQL-First API Design**
   - Type-safe schema definitions
   - Efficient data fetching with no over/under-fetching
   - Real-time subscriptions ready

2. **Modular Resolver Structure**
   - Each domain (User, Event, NGO, Badge) has isolated resolvers
   - Shared context for authentication
   - Field-level resolvers for optimal data loading

3. **Secure Authentication Flow**
   ```
   Client → Login/OAuth → Server validates → 
   Generate JWT (Access + Refresh) → 
   Store hashed refresh token in DB → 
   Send tokens as HTTP-only cookies → 
   Client includes cookies in requests → 
   Server validates access token → 
   Refresh token rotation on expiry
   ```

4. **Database Schema (Prisma + MongoDB)**
   - **Users**: Core user data, auth provider, role
   - **NGOs**: Organization profiles with slug-based URLs
   - **Events**: Volunteering opportunities with tags
   - **Signups**: Many-to-many relationship (User ↔ Event)
   - **Badges**: Achievement templates created by NGOs
   - **EarnedBadges**: Records of user achievements
   - **Branches**: Physical locations for NGOs

5. **Image Upload Pipeline**
   ```
   Client → Upload to /api/v1/upload → 
   Multer middleware → 
   Stream to Cloudinary → 
   Return secure URL → 
   Store URL in database
   ```

---

## 📁 Project Structure

```
volunflow/
├── client/                      # Frontend React application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/            # Authentication forms
│   │   │   ├── badges/          # Badge-related components
│   │   │   ├── common/          # Shared components (Header, Footer)
│   │   │   ├── dashboard/       # Dashboard layouts
│   │   │   ├── events/          # Event components
│   │   │   └── ngo/             # NGO components
│   │   ├── graphql/             # GraphQL queries & mutations
│   │   │   ├── client.ts        # Apollo Client setup
│   │   │   ├── mutations/       # GraphQL mutations
│   │   │   └── queries/         # GraphQL queries
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts       # Authentication context
│   │   │   └── useLocalStorage.ts
│   │   ├── pages/               # Route-level page components
│   │   ├── styles/              # Global styles & Tailwind
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Helper functions
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── .env.sample
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                      # Backend Node.js application
│   ├── prisma/
│   │   └── schema.prisma        # Database schema definition
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── apollo.ts        # Apollo Server setup
│   │   │   ├── cloudinary.ts    # Cloudinary config
│   │   │   └── passport.ts      # OAuth strategies
│   │   ├── graphql/             # GraphQL schema & resolvers
│   │   │   ├── schemas/         # Type definitions (.graphql)
│   │   │   ├── resolvers/       # Resolver implementations
│   │   │   └── index.ts         # Schema aggregator
│   │   ├── middleware/          # Express middleware
│   │   │   └── multer.middleware.ts
│   │   ├── rest/                # REST API routes
│   │   │   ├── auth.routes.ts   # Authentication endpoints
│   │   │   └── upload.routes.ts # File upload endpoint
│   │   ├── services/            # Business logic layer
│   │   │   ├── auth.service.ts  # Auth utilities
│   │   │   ├── prisma.service.ts # Prisma client
│   │   │   └── webhook.service.ts # n8n integration
│   │   ├── types/               # TypeScript type definitions
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # Server entry point
│   ├── .env.sample
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm** or **yarn**
- **MongoDB** instance (local or Atlas)
- **Cloudinary** account for image hosting
- **Google/Facebook** OAuth credentials (optional)
- **Gemini AI** API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/volunflow.git
   cd volunflow
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Server: Copy and fill .env.sample
   cd server
   cp .env.sample .env
   # Edit .env with your credentials

   # Client: Copy and fill .env.sample
   cd ../client
   cp .env.sample .env
   # Edit .env with API URLs
   ```

4. **Setup database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - GraphQL Playground: http://localhost:5000/api/v1/graphql

---

## 🔐 Environment Variables

### Server (.env)

```env
# Database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/volunflow"

# Server
PORT=5000
NODE_ENV="development"
SERVER_URL="http://localhost:5000"
CLIENT_URL="http://localhost:5173"

# JWT Secrets (Generate strong random strings)
ACCESS_TOKEN_SECRET="your-access-secret-here"
ACCESS_TOKEN_EXPIRY="1d"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
REFRESH_TOKEN_EXPIRY="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# AI Features (Optional)
GEMINI_API_KEY="your-gemini-api-key"

# Webhooks (Optional - n8n)
N8N_WEBHOOK_EVENT_SIGNUP="your-n8n-webhook-url"
N8N_WEBHOOK_AWARD_BADGE="your-n8n-webhook-url"
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GRAPHQL_URL=http://localhost:5000/api/v1/graphql
VITE_CLIENT_URL=http://localhost:5173
```

---

## 📚 API Documentation

### REST Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| POST | `/api/v1/auth/refresh_token` | Refresh access token | Yes |
| GET | `/api/v1/auth/google` | Google OAuth | No |
| GET | `/api/v1/auth/facebook` | Facebook OAuth | No |
| POST | `/api/v1/upload` | Upload image | Yes |

### GraphQL Queries

```graphql
# Get current user
query Me {
  me {
    id
    name
    email
    role
  }
}

# Get user's complete profile
query MyProfile {
  myProfile {
    id
    name
    email
    signups {
      id
      status
      event {
        title
        date
      }
    }
    earnedBadges {
      badge {
        name
        imageUrl
      }
    }
  }
}

# Get all events
query GetAllEvents {
  getAllEvents {
    id
    title
    description
    date
    location
    tags
    ngo {
      name
      logoUrl
    }
  }
}

# Get NGO by slug
query GetNgoBySlug($slug: String!) {
  getNgoBySlug(slug: $slug) {
    id
    name
    description
    events {
      title
      date
    }
    badges {
      name
      imageUrl
    }
  }
}
```

### GraphQL Mutations

```graphql
# Sign up for event
mutation SignupForEvent($eventId: ID!) {
  signupForEvent(eventId: $eventId) {
    id
    status
    event {
      title
    }
  }
}

# Create event (NGO Admin only)
mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    date
  }
}

# Award badge (NGO Admin only)
mutation AwardBadge($userId: ID!, $badgeId: ID!) {
  awardBadge(userId: $userId, badgeId: $badgeId) {
    id
    awardedAt
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Apollo GraphQL** for the excellent GraphQL implementation
- **Prisma** for the intuitive ORM
- **TailwindCSS** for beautiful, utility-first styling
- **Cloudinary** for reliable image hosting
- **Google** for the Gemini AI API
- All open-source contributors who made this project possible

---

## 📞 Support

For questions, issues, or support, please:

- 💬 **Discord**: Reach out to me at `@ranay0`
- 🐛 **Bug Reports**: [Open an issue](https://github.com/ARCoder181105/Volunflow/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/ARCoder181105/Volunflow/discussions) 

---

<div align="center">

**Made with ❤️ by the VolunFlow Team**

[Website](https://volunflow.onrender.com) • [X(Author)](https://x.com/rana61618)

</div>
