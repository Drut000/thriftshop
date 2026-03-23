# Thrift Store

Sklep internetowy dla resellera odzieży vintage / thrift. Każdy produkt to unikat — po sprzedaży znika z katalogu.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Next.js API Routes + Server Actions
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage (zdjęcia produktów)
- **Payments:** Stripe Checkout
- **Shipping:** InPost ShipX API
- **Hosting:** Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/thrift-store.git
cd thrift-store
npm install
```

### 2. Setup Supabase

1. Utwórz projekt na [supabase.com](https://supabase.com)
2. Skopiuj dane z Settings → Database → Connection string
3. Skopiuj klucze z Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Uzupełnij `.env.local` swoimi kluczami:

- `DATABASE_URL` - connection string z Supabase
- `DIRECT_URL` - direct connection string
- `NEXT_PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon key
- `SUPABASE_SERVICE_ROLE_KEY` - service role key
- `ADMIN_PASSWORD` - hasło do panelu admina
- `JWT_SECRET` - sekret do sesji (wygeneruj: `openssl rand -base64 32`)

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (categories, shipping)
npm run db:seed
```

### 5. Setup Supabase Storage

W Supabase Dashboard:
1. Storage → New bucket → `product-images`
2. Ustaw bucket jako **public**
3. Dodaj policy: `Enable read access for all users`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (shop)/            # Shop pages (public)
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── shop/              # Shop-specific components
│   └── admin/             # Admin-specific components
├── hooks/                 # React hooks
├── lib/
│   ├── db/                # Database clients
│   ├── utils/             # Utility functions
│   └── validators/        # Zod schemas
└── types/                 # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
INPOST_API_KEY=...
INPOST_ORGANIZATION_ID=...
INPOST_API_URL=https://api-shipx-pl.easypack24.net
```

## License

Private project. All rights reserved.
