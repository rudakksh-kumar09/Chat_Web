# Real-Time Chat Application

A production-quality real-time messaging application built for an internship coding challenge.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript** (Strict Mode)
- **Convex** (Database + Backend + Real-time)
- **Clerk** (Authentication)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (UI Components)

## Features

✅ Authentication (Clerk)
✅ Real-time one-on-one messaging
✅ User discovery with search
✅ Online/offline presence
✅ Typing indicators
✅ Unread message counts
✅ Smart auto-scroll
✅ Responsive design (Desktop + Mobile)
✅ Message timestamps
✅ Clean, production-ready code

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Clerk keys
   - Add your Convex deployment URL

4. Initialize Convex:
```bash
npx convex dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   ├── (root)/         # Protected application routes
│   └── layout.tsx      # Root layout with providers
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── chat/          # Chat-specific components
│   ├── conversations/ # Conversation list components
│   └── users/         # User discovery components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── types/             # TypeScript type definitions

convex/
├── schema.ts          # Database schema
├── users.ts           # User queries/mutations
├── conversations.ts   # Conversation logic
├── messages.ts        # Message handling
├── presence.ts        # Online/offline status
├── typing.ts          # Typing indicators
└── http.ts            # Webhook handlers
```

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Make sure to:
1. Set environment variables in Vercel dashboard
2. Deploy Convex backend: `npx convex deploy`
3. Configure Clerk webhook for production

