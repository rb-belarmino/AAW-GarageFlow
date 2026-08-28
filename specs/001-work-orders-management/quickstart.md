# Quickstart Validation Guide: AAW GarageFlow

## Prerequisites
- Node.js 20+ LTS
- PNPM or NPM
- Neon PostgreSQL connection string (or local Docker Postgres for offline test execution)

---

## 1. Environment Setup
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://user:password@ep-sample-neon.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample-neon.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 2. Database Migration & Client Generation
```bash
npx prisma generate
npx prisma db push
```

---

## 3. Running Automated Tests & Verification Harness
```bash
# Run unit & domain use-case tests
npm test

# Run the comprehensive AAW GarageFlow Test Evaluation Harness
npm run test:harness
```

---

## 4. Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the AAW GarageFlow Dashboard, create vehicle work orders, manage "To Do" free-text notes, toggle completion status (✓), and view recurring maintenance schedule dispatches.
