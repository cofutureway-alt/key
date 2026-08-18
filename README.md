# Elite AI — License Management Dashboard & Server (v17)

A modern, full-stack license management platform for the **Elite AI** Chrome Extension.

## 🚀 Live Server & Backend
- **Supabase Project**: `yvnbmlkrwupwlzfbxtvc`
- **Edge Function API**: `https://yvnbmlkrwupwlzfbxtvc.supabase.co/functions/v1/license-api`
- **Target Domain**: `https://key.fakarli.com`

---

## ✨ Features
1. **Flexible Duration Engine**: Set license expiration in **Minutes, Hours, Days, Months, Years, or Lifetime** (Never Expire). Expiration countdown begins automatically upon first activation in the plugin.
2. **Credits Customizer**: Set custom credit quotas for any key (e.g. 50, 100, 500, 10,000 credits).
3. **Plan Tiers**: Assign plans (**Starter, Pro, Elite, Lifetime VIP, or Custom**). The plan name immediately reflects inside the plugin UI and unlocks configured features (downloads, prompt chat, watermark remover).
4. **Single & Bulk Key Generator**: Generate up to 500 licenses in one click, copy all, export CSV or TXT.
5. **Real-Time License Management**: Search, filter by status (Unused, Active, Expired, Revoked), filter by plan, extend duration, adjust credits, revoke/unrevoke, or delete keys.
6. **Live Extension Simulator**: Test any key in real-time to inspect the exact JSON response and visual state returned to the plugin.
7. **System & Branding Controls**: Update extension brand text, footer labels, badge titles, maintenance mode, and force upgrade version directly from the dashboard.

---

## 🛠️ Running Locally
```bash
cd dashboard
npm install
npm run dev
```

---

## 🌐 Deploying to `key.fakarli.com`
1. Build the production assets:
   ```bash
   npm run build
   ```
2. The compiled static website is in the `dashboard/dist/` directory.
3. Deploy the contents of `dist/` to your hosting provider (Vercel, Cloudflare Pages, Netlify, or Nginx on VPS) and point your DNS CNAME for `key.fakarli.com`.
