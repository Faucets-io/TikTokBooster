# TikTok Follower Landing Page

## Overview

This is a TikTok-styled landing page application that simulates a social media growth service. The application collects order information (username, service type, quantity) and sends notifications via Telegram. It features a modern React frontend with TikTok-inspired styling and animations, backed by an Express.js server.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom TikTok-themed color variables
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with esbuild for production
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Storage**: In-memory storage (MemStorage class) for orders - designed to be replaced with database storage
- **Schema Validation**: Zod schemas shared between frontend and backend via `@shared` path alias

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Database**: PostgreSQL (requires `DATABASE_URL` environment variable)
- **Current State**: Using in-memory storage; database integration prepared but not active

### Project Structure
```
client/          # React frontend application
  src/
    components/  # UI components including shadcn/ui
    pages/       # Route pages (Home, ThankYou, not-found)
    hooks/       # Custom React hooks
    lib/         # Utility functions and query client
server/          # Express backend
  index.ts       # Server entry point
  routes.ts      # API route definitions
  storage.ts     # Data storage abstraction
  vite.ts        # Vite dev server integration
shared/          # Shared code between client and server
  schema.ts      # Drizzle schema and Zod validation
```

### Build & Development
- **Development**: `npm run dev` - runs Vite dev server with HMR
- **Production Build**: `npm run build` - Vite builds frontend, esbuild bundles server
- **Database Migrations**: `npm run db:push` via Drizzle Kit

## External Dependencies

### Telegram Integration
- Bot token and chat ID configured via environment variables
- Sends formatted order notifications to specified Telegram chat
- Environment variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### Database
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Connection string required: `DATABASE_URL` environment variable
- Drizzle ORM handles schema management and queries

### Deployment
- Configured for Railway deployment (`railway.json`)
- Nixpacks builder with npm build/start commands
- Also compatible with Replit environment (includes Replit-specific Vite plugins)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `framer-motion` - Animation library
- `node-fetch` - HTTP client for Telegram API calls
- Radix UI primitives - Accessible component foundations