# Orange Juice Creative Strategist

AI-powered creative strategy tool based on the **Orange Juice Creative Framework**. Generate winning ad content for Facebook and other platforms using the systematic creative intelligence approach.

## Features

- **OpenAI Integration**: Connect your own API key and select from available models
- **Brand Management**: Add brands with automatic website scraping for content extraction
- **Orange Juice Framework**: Full implementation of the 5-phase framework:
  - **INTERRUPT** (60%): Problem/Product awareness
  - **EXPLAIN** (20%): Clarity, Education, Differentiation
  - **OVERCOME** (15%): Objection handling & Trust building
  - **PUSH** (5%): Conversion activation
  - **REENFORCE**: Retention & Advocacy
- **AI Content Generation**: Generate hooks, scripts, angles, and more with streaming responses
- **Prompt Templates**: Pre-built prompts for each phase based on direct response marketing principles

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jakobs-content-maskin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jakobs_content_maskin?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deploying to Vercel

### 1. Set up a PostgreSQL database

You can use:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- Any other PostgreSQL provider

### 2. Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket

2. Import the project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Configure environment variables:

   ```
   DATABASE_URL=your-postgresql-url
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. Deploy!

### 3. Run database migrations

After deployment, run migrations:
```bash
npx prisma migrate deploy
```

Or use Vercel's build command:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

## Project Structure

```
├── app/
│   ├── (auth)/           # Login/Register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── page.tsx      # Framework overview
│   │   ├── brands/       # Brand management
│   │   ├── generate/     # AI content generation
│   │   └── settings/     # API settings
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── framework-pipeline.tsx
│   └── phase-card.tsx
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── framework.ts      # Framework data & prompts
│   ├── openai.ts         # OpenAI utilities
│   └── scraper.ts        # Website scraper
└── prisma/
    └── schema.prisma     # Database schema
```

## Orange Juice Framework

The app is built around the Orange Juice Creative Framework which divides the customer journey into 5 phases:

| Phase | Goal | Content % |
|-------|------|-----------|
| INTERRUPT | Problem/Product awareness | 60% |
| EXPLAIN | Clarity, Education, Differentiation | 20% |
| OVERCOME | Objection handling & Trust | 15% |
| PUSH | Conversion activation | 5% |
| REENFORCE | Retention & Advocacy | Post-purchase |

Each phase has specific:
- **Psychology triggers** to leverage
- **Creative formats** that work best
- **Messaging examples** to inspire content

## License

Private - All rights reserved

## Credits

Based on the Orange Juice Creative Framework by Bagliora.
