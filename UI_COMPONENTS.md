# UI Components Guide

## Color Scheme
The entire application now uses a **monochrome black, white, and gray** color scheme:

- **Background**: Black (#000000)
- **Cards**: Dark Gray (#121212)
- **Text**: White and Gray shades
- **Borders**: Gray-800
- **Primary Actions**: White buttons with black text
- **Destructive Actions**: Red accent

## Available Components

### Card Component
Located at: `components/ui/card.tsx`

```tsx
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```

**Features:**
- Dark gray background with subtle borders
- Rounded corners (xl)
- Shadow effects
- Responsive padding

### Button Component
Located at: `components/ui/button.tsx`

**Variants:**
- `default` - White background, black text (primary action)
- `outline` - Transparent with gray border
- `secondary` - Gray background
- `destructive` - Red background
- `ghost` - No background, hover effect
- `link` - Underlined text link

**Sizes:**
- `default` - Standard height (h-10)
- `sm` - Small (h-9)
- `lg` - Large (h-11)
- `icon` - Square icon button (10x10)

### Input Component
Located at: `components/ui/input.tsx`

**Features:**
- Dark gray background
- Gray border with focus state
- Placeholder text in gray-500
- Smooth transitions

### Label Component
Located at: `components/ui/label.tsx`

**Features:**
- Gray-200 text color
- Medium font weight
- Accessible with form inputs

## Example Usage

See `components/CardDemo.tsx` for a complete example of a login card using all components.

## Design Principles

1. **Bold Typography**: Large, bold headings for better readability
2. **High Contrast**: White text on black backgrounds
3. **Minimal Colors**: No blue or purple gradients - pure monochrome
4. **Generous Spacing**: Ample padding and margins
5. **Smooth Animations**: Subtle transitions for better UX
6. **Responsive Design**: Mobile-first approach with bottom navigation

## Navigation

- **Desktop**: Fixed sidebar on the left
- **Mobile**: Bottom navigation bar with 4 main sections
- **Floating Action Button**: White circular button for Focus mode
- **Active States**: White background with subtle border (no blue!)

## CSS Variables

All colors are defined in `app/globals.css` using HSL values:

```css
--background: 0 0% 0%        /* Black */
--foreground: 0 0% 96%       /* White */
--card: 0 0% 7%              /* Dark Gray */
--primary: 0 0% 100%         /* White */
--border: 0 0% 20%           /* Gray */
```

## Installation

Required dependencies:
```bash
npm install clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-label tailwindcss-animate lucide-react framer-motion
```
