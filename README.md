## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

golf-app/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Group: Login, Signup, Forgot Password
│   │   ├── login/page.tsx
│   │   └── register/page.tsx   # Includes Charity Selection during onboarding
│   ├── (public)/               # Group: Landing page, Charities, How it works
│   │   ├── page.tsx            # High-impact, emotion-driven homepage
│   │   └── charities/          # Charity directory & profiles
│   ├── (subscriber)/           # Group: Authenticated User Dashboard
│   │   ├── dashboard/          # Score entry, Charity stats, Draw status
│   │   ├── scores/             # Rolling 5-score management logic
│   │   └── winnings/           # Winner proof upload & payment status
│   ├── (admin)/                # Group: Restricted Admin Panel
│   │   ├── layout.tsx          # Admin-specific navigation/sidebar
│   │   ├── draws/              # Configure logic (Random/Algo) & Simulations
│   │   ├── users/              # User/Subscription management
│   │   └── winners/            # Verification & Payout tracking
│   └── api/                    # Backend Route Handlers
│       ├── draw-engine/        # Monthly draw execution logic
│       ├── stripe/             # Webhooks for subscription lifecycle
│       └── cron/               # Vercel Cron for monthly resets (optional)
├── components/                 # Reusable UI Components
│   ├── ui/                     # Shadcn/UI or custom base components
│   ├── shared/                 # Navbar, Footer, Mobile Nav
│   ├── forms/                  # ScoreEntryForm, CharitySelectForm
│   └── charts/                 # Contribution/Draw analytics
├── lib/                        # Infrastructure & Utilities
│   ├── supabase/               # Supabase client (browser/server/admin)
│   ├── stripe/                 # Stripe SDK initialization
│   ├── utils/                  # Tailwind-merge, date-fns, score-logic
│   └── constants/              # Prize pool tiers (40/35/25)
├── supabase/                   # Local Supabase configuration (optional)
│   ├── migrations/             # SQL schemas for Users, Scores, Draws, Charities
│   └── seed.sql                # Sample charities & draw data
├── types/                      # TypeScript Interfaces/Enums
├── public/                     # Icons, brand assets (no golf clichés!)
├── .env.local                  # Supabase & Stripe keys
└── next.config.mjs

