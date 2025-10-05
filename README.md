# Reclaim - Digital Habit Tracker

A Next.js application to help users track their digital habits, manage focus sessions, and reclaim their time through AI-powered insights.

## Features

- **Usage Tracking**: Log daily app usage and screen time
- **Focus Sessions**: Start and track focus sessions to build better habits
- **AI Insights**: Get personalized recommendations based on your usage patterns
- **Reports**: View weekly reports with usage trends and statistics
- **Authentication**: Secure user authentication with Supabase

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── focus/             # Focus session page
│   ├── insights/          # AI insights page
│   ├── report/            # Reports page
│   ├── usage/             # Usage logging page
│   └── login/             # Login page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── db.ts             # Database helpers
│   └── ai.ts             # AI recommendation logic
├── hooks/                 # Custom React hooks
├── types.ts              # TypeScript type definitions
└── public/               # Static assets
```

## Database Schema

The application uses the following Supabase tables:

- `users` - User profiles with goals and preferences
- `usage_logs` - Daily app usage tracking
- `focus_sessions` - Focus session records
- `insights_daily` - AI-generated recommendations

## API Routes

- `POST /api/usage` - Log daily usage
- `GET /api/dashboard` - Get dashboard data
- `GET /api/report` - Get weekly report
- `POST /api/focus/start` - Start focus session
- `POST /api/focus/end` - End focus session
- `POST /api/generate-insights` - Generate AI insights

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
