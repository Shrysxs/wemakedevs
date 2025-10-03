# 📱 Reclaim - Phone Addiction Management App

> **Take back control of your time with AI-powered insights and focus sessions**

Built for the **WeMakeDevs Hackathon** by [@Shrysxs](https://github.com/Shrysxs) and [@25Pradnyesh](https://github.com/25Pradnyesh)

## 🌟 Overview

Reclaim is a comprehensive phone addiction management platform that helps users understand their digital habits, receive personalized AI insights, and build healthier relationships with technology through guided focus sessions.

## ✨ Key Features

### 📊 **Usage Tracking & Analytics**
- Log daily app usage with detailed time tracking
- Visual reports showing 7-day usage patterns and trends  
- Streak tracking for consistent engagement
- Interactive charts powered by Recharts

### 🤖 **AI-Powered Insights** 
- Personalized recommendations using **Cerebras API** with LLaMA models
- Smart analysis of usage patterns and peak distraction times
- Contextual nudges based on user goals and habits
- Alternative activity suggestions (videos, tasks, resources)

### ⏱️ **Focus Sessions**
- Pomodoro-style focus timers (20min, 25min, 45min)
- Real-time progress tracking with visual indicators
- Session history and reclaimed time analytics
- Animated progress circles and completion feedback

### 👤 **Personalized Onboarding**
- Goal-based user profiling (Fitness, Coding, Reading, Sleep, Mental Health)
- Skill and inspiration preference mapping
- Distraction pattern identification
- Customized experience based on user inputs

### 🎨 **Modern Dark UI**
- Sleek black (#000000) background with high contrast text (#F5F5F5)
- Clean typography using Inter font family
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - User authentication and session management
- **API Routes** - Next.js serverless functions

### **AI Integration**
- **Cerebras API** - Fast AI inference with LLaMA models
- **Custom AI Pipeline** - Personalized insight generation
- **Smart Recommendations** - Context-aware suggestions

### **DevOps & Deployment**
- **Vercel** - Serverless deployment platform
- **Git** - Version control
- **ESLint** - Code linting and quality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Cerebras API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Shrysxs/wemakedevs.git
cd wemakedevs
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
CEREBRUS_API_KEY=your_cerebrus_api_key
CEREBRUS_API_URL=https://api.cerebrus.ai/v1/generate
```

4. **Set up the database**
```bash
# Run the SQL migration in your Supabase dashboard
# File: supabase/migrations.sql
```

5. **Seed demo data (optional)**
```bash
npm run seed
```

6. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action!

## 📁 Project Structure

```
reclaim/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── dashboard/     # Usage analytics
│   │   ├── focus/         # Focus session management
│   │   ├── generate-insights/ # AI-powered insights
│   │   ├── insights/      # Insight retrieval
│   │   ├── report/        # Usage reports
│   │   └── usage/         # Usage logging
│   ├── dashboard/         # Main dashboard UI
│   ├── focus/            # Focus session interface
│   ├── insights/         # AI insights display
│   ├── login/            # Authentication
│   ├── onboarding/       # User setup flow
│   ├── report/           # Analytics reports
│   └── usage/            # Usage input form
├── components/           # Reusable React components
├── lib/                 # Utility libraries
│   ├── ai.ts           # Cerebras API integration
│   ├── db.ts           # Database helpers
│   ├── supabase.ts     # Supabase client
│   └── supabaseAdmin.ts # Admin client
├── scripts/            # Utility scripts
│   └── seed.ts         # Demo data seeder
├── supabase/          # Database schema
│   └── migrations.sql  # SQL migrations
└── types/             # TypeScript definitions
    └── index.ts       # App-wide types
```

## 🔌 API Endpoints

### **Usage Management**
- `POST /api/usage` - Log daily app usage
- `GET /api/dashboard` - Get today's usage summary
- `GET /api/report` - Get 7-day usage analytics

### **AI Insights**
- `POST /api/generate-insights` - Generate AI recommendations
- `GET /api/insights` - Retrieve existing insights

### **Focus Sessions**
- `POST /api/focus/start` - Start a focus session
- `POST /api/focus/end` - End active focus session

## 🎯 Demo Features

### **Quick Demo Access**
- Click "Use Demo Account" on login page
- Credentials: `demo@reclaim.com` / `demo123`
- Pre-loaded with sample usage data and insights

### **Sample Data**
- Social Media App: 180 minutes
- Video Platform: 120 minutes  
- Productivity App: 60 minutes

## 🤖 AI Integration Details

### **Cerebras API Integration**
- **Model**: LLaMA-small for fast inference
- **Task**: Personalized recommendation generation
- **Input**: User profile + usage patterns
- **Output**: 3 actionable insights with titles, descriptions, and optional links

### **Fallback Behavior**
- Graceful degradation when API key is missing
- Returns empty arrays instead of dummy data
- Maintains app functionality without AI features

### **Smart Analysis**
- Peak usage time detection
- Disruptive app identification  
- Productivity impact assessment
- Personalized nudge generation

## 🗄️ Database Schema

### **Core Tables**
- `users` - User profiles and preferences
- `usage_logs` - Daily app usage data (JSONB)
- `insights` - AI-generated recommendations
- `insights_daily` - Daily insight summaries
- `focus_sessions` - Focus session tracking

### **Key Features**
- UUID primary keys
- JSONB for flexible app data storage
- Foreign key relationships
- Optimized indexes for performance

## 🎨 Design System

### **Color Palette**
- **Background**: `#000000` (Pure Black)
- **Text**: `#F5F5F5` (Light Gray)
- **Placeholders**: `#9CA3AF` (Medium Gray)
- **Accents**: Green/Red for actions, no blue elements

### **Typography**
- **Font**: Inter font family
- **Hierarchy**: Responsive heading sizes
- **Weight**: 400 (regular) to 600 (semibold)

## 🚀 Deployment

### **Vercel Deployment**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### **Environment Variables**
- Set all variables in Vercel project settings
- Include both public and server-only keys
- Ensure Supabase and Cerebras credentials are correct

## 🤝 Contributing

This project was built for the WeMakeDevs Hackathon. For any questions or suggestions:

- **Shreyas** - [@Shrysxs](https://github.com/Shrysxs)
- **Pradnyesh** - [@25Pradnyesh](https://github.com/25Pradnyesh)

## 📄 License

Built with ❤️ for the WeMakeDevs community.

---

**Reclaim your time. Reclaim your focus. Reclaim your life.** 🌟
