# shadcn/ui Setup Instructions

## ✅ Already Completed
- Installed Tailwind CSS and dependencies
- Created `tailwind.config.ts` with your color scheme
- Created `components.json` for shadcn configuration
- Created `app/globals.css` with dark theme variables
- Created `lib/utils.ts` with cn() helper

## 🚀 Next Steps - Run These Commands

### 1. Install shadcn/ui components
```bash
npx shadcn@latest add card
npx shadcn@latest add chart
npx shadcn@latest add button
npx shadcn@latest add badge
```

### 2. Install the dashboard example (optional)
```bash
npx shadcn@latest add dashboard-01
```

### 3. Create app layout with globals.css
Create or update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reclaim - Focus Tracker",
  description: "Take back control of your time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

## 🎨 Color Scheme Applied

Your dark theme is configured in `app/globals.css`:

- **Background**: Pure black (#000000)
- **Foreground**: Light gray (#F5F5F5)
- **Borders**: Gray (#374151)
- **Primary**: Purple (#8b5cf6)
- **Chart Colors**:
  - Chart 1: Amber (#f59e0b)
  - Chart 2: Purple (#8b5cf6)
  - Chart 3: Green (#10b981)
  - Chart 4: Red (#ef4444)
  - Chart 5: Blue (#3b82f6)

## 📦 Dependencies Installed
- ✅ tailwindcss
- ✅ tailwindcss-animate
- ✅ class-variance-authority
- ✅ clsx
- ✅ tailwind-merge
- ✅ lucide-react
- ✅ recharts

## 🔄 After Installing Components

Once you run the shadcn commands above, the components will be in:
- `components/ui/card.tsx`
- `components/ui/chart.tsx`
- `components/ui/button.tsx`
- etc.

Then you can use them in your reports!
