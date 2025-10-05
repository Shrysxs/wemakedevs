# 📱 Reclaim - Phone Addiction Management App

**Take back control of your time with AI-powered insights and focus sessions**

Built for the WeMakeDevs Hackathon by [@Shrysxs](https://github.com/Shrysxs) and [@25Pradnyesh](https://github.com/25Pradnyesh)

---

## 🌟 Overview

Reclaim is a phone addiction management platform that helps users understand their digital habits, receive AI-generated insights, and build healthier relationships with technology through focus sessions and nudges.

---

## ✨ Features

### 📊 Usage Tracking & Analytics
- Log daily app usage manually (app name + minutes)
- Visual reports showing 7-day usage patterns and trends
- Streak tracking for consistent engagement
- Interactive charts powered by Recharts

### 🤖 AI-Powered Insights
- Personalized recommendations using **Cerebras API** with **LLaMA models**
- Smart analysis of usage patterns and peak distraction times
- Contextual nudges and alternative activity suggestions

### ⏱️ Focus Sessions
- Pomodoro-style focus timers (20min, 25min, 45min)
- Real-time progress tracking
- Session history and reclaimed time analytics

### 👤 Personalized Onboarding
- Goal-based user profiling (Fitness, Coding, Reading, Sleep, Mental Health)
- Skill and inspiration mapping
- Distraction pattern identification
- Customized experience based on user inputs

---

## 🎨 Design
- Minimalist dark theme (#000000 background, #F5F5F5 text)
- Accents for actions: green/red
- Clean typography with **Inter** font family
- Smooth animations using **Framer Motion**
- Responsive UI built with **Tailwind CSS**

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 + TypeScript  
- Tailwind CSS  
- Framer Motion  
- Recharts  

**Backend & Database**
- Supabase (PostgreSQL + Auth)
- Next.js API Routes (serverless functions)  

**AI Integration**
- Cerebras API with LLaMA models
- Custom AI pipeline for personalized insights

**DevOps**
- Vercel deployment
- Git version control
- ESLint for code quality

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Cerebras API key

### Installation
```bash
git clone https://github.com/Shrysxs/wemakedevs.git
cd wemakedevs
npm install

Environment Setup
cp .env.example .env.local


Fill in:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
CEREBRUS_API_KEY=your_cerebrus_api_key
CEREBRUS_API_URL=https://api.cerebrus.ai/v1/generate

Database Setup

Run SQL migrations in Supabase dashboard: supabase/migrations.sql

(Optional) Seed demo data: npm run seed

Start Development
npm run dev


Visit http://localhost:3000
 to view the app.

📁 Project Structure
reclaim/
├── app/                # Next.js App Router
│   ├── api/            # API routes (usage, insights, dashboard, focus, report)
│   ├── dashboard/      # Main dashboard UI
│   ├── focus/          # Focus session interface
│   ├── insights/       # AI insights display
│   ├── login/          # Authentication
│   ├── onboarding/     # User setup flow
│   ├── report/         # Analytics reports
│   └── usage/          # Usage input form
├── components/         # Reusable React components
├── lib/                # Utility libraries
├── scripts/            # Utility scripts (data seeding)
├── supabase/           # Database migrations
└── types/              # TypeScript definitions

🔌 API Endpoints

Usage Management

POST /api/usage – Log daily app usage

GET /api/dashboard – Get today’s usage summary

GET /api/report – Get 7-day usage analytics

AI Insights

POST /api/generate-insights – Generate AI recommendations

GET /api/insights – Retrieve existing insights

Focus Sessions

POST /api/focus/start – Start a focus session

POST /api/focus/end – End active focus session

🤖 AI Integration

Cerebras API with LLaMA-small for fast inference

Generates 3 actionable insights per user

Peak usage detection, productivity impact assessment, and contextual nudges

Graceful fallback if API key is missing

Built with ❤️ for the WeMakeDevs Hackathon
Contributions welcome  feel free to open issues or PRs.