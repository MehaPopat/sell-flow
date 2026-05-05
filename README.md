# Sell Flow

A financial portal prototype for managing bond/security sell transactions. Supports three user roles — **Investor**, **IFA** (Investment Financial Advisor), and **Ops** — each with their own dashboards and workflows.

Built with mock data; no backend required.

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router DOM v7
- TailwindCSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Login

Enter any phone number, then any OTP. Select a role on login:

| Role | Entry point after login |
|------|------------------------|
| Investor | `/dashboard` — personal holdings |
| IFA | `/ifa/investors` — investor list |
| Ops | `/ops` — operations dashboard |

Session is stored in `localStorage` under `sell-flow-session`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |

## Project Structure

```
src/
├── components/     # Shared UI components (Navigation, modals, layout)
│   └── ui/         # Base primitives (Button, Input, Label)
├── pages/          # One component per route (15 pages)
├── services/
│   └── api.ts      # Mock API layer (160ms simulated delay)
├── data/
│   └── mockData.ts # Hardcoded investors, IFAs, orders, holdings
├── types/
│   └── index.ts    # All TypeScript interfaces and enums
└── lib/
    ├── session.ts  # localStorage session helpers
    └── utils.ts    # Class name utilities
```

## Key Routes

| Path | Description |
|------|-------------|
| `/` | Login |
| `/dashboard` | Investor holdings |
| `/ifa/investors` | IFA — investor list |
| `/ifa/investors/:id/holdings` | IFA — investor holdings |
| `/sell-requests` | Sell request workflow tracker |
| `/sell-orders` | Sell order list |
| `/transactions` | Transaction history |
| `/ops` | Ops dashboard |
| `/admin/ifas` | Admin — IFA management |
| `/admin/investors` | Admin — investor management |
