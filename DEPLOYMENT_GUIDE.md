# 🙏 Temple Puja Registration — Deployment Guide
## Vercel + Supabase (100% Free)

---

## What You'll Get
- **Live website** at `your-app-name.vercel.app` (free custom domain too)
- **Real database** — temples, pujas, registrations shared across all users
- **File storage** — deity photos, temple photos, payment screenshots
- **Admin access** — manage everything from any device
- **Auto-deploy** — push to GitHub and it updates automatically

---

## Overview of Steps

| Step | What | Time | Account Needed |
|------|------|------|----------------|
| 1 | Set up Supabase (database) | 10 min | Supabase (free) |
| 2 | Create database tables | 5 min | — |
| 3 | Set up the project locally | 10 min | Node.js installed |
| 4 | Push to GitHub | 5 min | GitHub (you have it) |
| 5 | Deploy on Vercel | 5 min | Vercel (free) |

**Total: ~35 minutes**

---

## Step 1: Set Up Supabase

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with your **GitHub account** (easiest)
3. Click **New Project**
4. Fill in:
   - **Name**: `temple-puja-registration`
   - **Database Password**: choose a strong password (save it!)
   - **Region**: pick the closest to you (e.g., Mumbai / Singapore)
5. Click **Create new project** — wait ~2 minutes

### Get Your Keys
Once the project is created:
1. Go to **Settings** → **API** (in the left sidebar)
2. Copy these two values (you'll need them later):
   - **Project URL** — looks like `https://abcdefg.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`

---

## Step 2: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this entire SQL and click **Run**:

```sql
-- Temples table
CREATE TABLE temples (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  icon TEXT DEFAULT '🛕',
  description TEXT,
  deity_photo TEXT,
  temple_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pujas table
CREATE TABLE pujas (
  id TEXT PRIMARY KEY,
  temple_id TEXT REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration TEXT DEFAULT '30 min',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  devotee_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gotra TEXT,
  temple_id TEXT REFERENCES temples(id),
  puja_ids TEXT[] NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  members INTEGER DEFAULT 1,
  payment_screenshot TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can see temples & pujas)
CREATE POLICY "Public read temples" ON temples FOR SELECT USING (true);
CREATE POLICY "Public read pujas" ON pujas FOR SELECT USING (true);

-- Allow public insert for registrations (devotees can register)
CREATE POLICY "Public insert registrations" ON registrations FOR INSERT WITH CHECK (true);

-- Allow public read registrations (for admin view - you can restrict later)
CREATE POLICY "Public read registrations" ON registrations FOR SELECT USING (true);

-- Allow public operations for now (restrict with auth later)
CREATE POLICY "Public manage temples" ON temples FOR ALL USING (true);
CREATE POLICY "Public manage pujas" ON pujas FOR ALL USING (true);
CREATE POLICY "Public manage registrations" ON registrations FOR ALL USING (true);

-- Insert sample data
INSERT INTO temples (id, name, location, icon, description) VALUES
  ('t1', 'Shree Siddhivinayak Temple', 'Prabhadevi, Mumbai', '🕉️', 'One of the most revered temples of Lord Ganesha in Mumbai'),
  ('t2', 'Shree Mahalaxmi Temple', 'Mahalaxmi, Mumbai', '🪷', 'Sacred temple dedicated to Goddess Mahalaxmi');

INSERT INTO pujas (id, temple_id, name, price, duration, description) VALUES
  ('p1', 't1', 'Ganesh Abhishek', 1100, '45 min', 'Sacred bathing ritual of Lord Ganesha'),
  ('p2', 't1', 'Modak Prasad Puja', 501, '30 min', 'Special offering with modak sweets'),
  ('p3', 't1', 'Navarasa Puja', 2100, '1 hr', 'Nine-emotion devotional ceremony'),
  ('p4', 't2', 'Lakshmi Puja', 1100, '1 hr', 'Prosperity and wealth blessing ceremony'),
  ('p5', 't2', 'Sahasranama Archana', 751, '45 min', 'Chanting of 1000 divine names');
```

4. You should see "Success" — your database is ready!

---

## Step 3: Set Up the Project Locally

### Prerequisites
Make sure you have installed:
- **Node.js** (v18+): https://nodejs.org
- **Git**: https://git-scm.com

### Create the Project

Open your terminal/command prompt and run:

```bash
# Create the project
npm create vite@latest temple-puja-app -- --template react
cd temple-puja-app

# Install dependencies
npm install @supabase/supabase-js

# Remove default files we don't need
rm src/App.css src/index.css
```

### Add Environment Variables

Create a file called `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with the values you copied from Step 1.

### Add the App Files

**I will provide you these files separately:**
- `src/supabase.js` — database connection
- `src/App.jsx` — the full app (adapted for Supabase)
- `src/main.jsx` — entry point
- `index.html` — HTML template

Simply replace the contents of these files in your project.

---

## Step 4: Test Locally

```bash
npm run dev
```

Open **http://localhost:5173** — you should see the app with live data from Supabase!

Try adding a temple, then refresh — it should persist.

---

## Step 5: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Temple Puja Registration App"

# Create a new repo on GitHub (go to github.com/new)
# Name: temple-puja-app
# Keep it public or private — your choice
# Do NOT initialize with README

# Connect and push
git remote add origin https://github.com/YOUR_USERNAME/temple-puja-app.git
git branch -M main
git push -u origin main
```

---

## Step 6: Deploy on Vercel

1. Go to **https://vercel.com** and sign in with **GitHub**
2. Click **Add New → Project**
3. Find and select your **temple-puja-app** repository
4. Before clicking Deploy, add **Environment Variables**:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**
6. Wait ~1 minute — your app is now live! 🎉

You'll get a URL like: `temple-puja-app.vercel.app`

---

## Step 7: Custom Domain (Optional, Free)

If you have a domain name:
1. In Vercel, go to your project → **Settings → Domains**
2. Add your domain (e.g., `puja.yourdomain.com`)
3. Update your domain's DNS as instructed

If you don't have a domain, the `.vercel.app` URL works perfectly fine.

---

## After Deployment

### Managing Your App
- **Add temples/pujas**: Use the Admin panel in your deployed app
- **Update code**: Just push to GitHub — Vercel auto-deploys
- **View database**: Go to Supabase dashboard → Table Editor

### Free Tier Limits (very generous)

| Service | What's Free |
|---------|-------------|
| **Vercel** | 100GB bandwidth/month, unlimited deploys |
| **Supabase** | 500MB database, 1GB file storage, 50K monthly users |
| **GitHub** | Unlimited public/private repos |

These limits are more than enough for a temple registration app.

### Future Enhancements (When Ready)
- **Admin login** — Add Supabase Auth so only you can manage temples
- **Email notifications** — Auto-email devotees on confirmation
- **WhatsApp integration** — Send booking confirmations via WhatsApp
- **Payment gateway** — Add Razorpay/UPI for direct payments

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Supabase connection failed" | Check `.env.local` values match your Supabase dashboard |
| "npm create vite" fails | Update Node.js to v18+ |
| Vercel build fails | Make sure env variables are added in Vercel settings |
| Data not showing | Check Supabase SQL Editor ran successfully |

---

## Need Help?

Ask me anytime to:
- Generate the Supabase-connected app files
- Add admin authentication
- Set up email notifications
- Troubleshoot deployment issues

🙏 जय श्री दत्तराज गुरुमाऊली!
