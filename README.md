# FoneHisab — Offline Desktop POS

A production-grade offline Point-of-Sale and inventory manager for mobile phone retail shops.
Built with **Electron + Vite + Tailwind CSS v3 + better-sqlite3**.

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Node.js     | 20.x LTS |
| npm         | 9+       |
| Windows     | 10 / 11  |

> Linux/macOS can run the dev server but the `.exe` build target requires Windows
> (or a Windows cross-compile environment).

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Rebuild native modules against Electron's Node ABI (required for better-sqlite3)
npx electron-rebuild

# 3. Start Vite dev server + Electron window
npm run dev
```

The app opens automatically. Hot-reload works for renderer changes.
Electron main process changes require a full restart.

---

## Building the Windows Installer

```bash
# Compile renderer + package into a Windows NSIS installer
npm run dist
```

Output: `dist-installer/FoneHisab Setup x.x.x.exe`

> **Before building**, replace `assets/icon.ico` with a real
> **256 × 256 pixel `.ico` file** (multi-resolution recommended: 16/32/48/256 px).
> A missing or invalid icon will cause electron-builder to fail.
> Free tools: [IcoFX](https://icofx.ro), [convertio.co](https://convertio.co/png-ico/).

---

## First Run

1. No password is set by default — the app opens directly to the **Billing** screen.
2. Go to **Settings → Shop Information** and fill in your shop name, address, and GSTIN.
3. Go to **Inventory → New Item** to add your first product.
4. Start billing from the **Billing** screen.

---

## Setting a Master Password

1. Open **Settings → Security → Set / Change Password**.
2. Enter and confirm your password. It is stored as a SHA-256 hash — never in plain text.
3. On next launch, a full-screen lock overlay will appear before the app loads.

To remove the password: set an empty password (the lock screen is skipped when the stored hash is blank).

---

## Database Location

SQLite database file: `%APPDATA%\FoneHisab\shop.db`

Full path example: `C:\Users\<YourName>\AppData\Roaming\FoneHisab\shop.db`

To open it manually: use [DB Browser for SQLite](https://sqlitebrowser.org/).

---

## Backup & Recovery

- **Reports → Download JSON Backup** — exports all tables to a timestamped `.json` file.
- **Reports → Download GSTR-1 Excel** — exports active sales in GSTR-1 format for a date range.
- The JSON backup can be used to restore data if the database file is lost.

---

## Project Structure

```
fonehisab/
├── main.js               # Electron main process (IPC, SQLite, window)
├── preload.js            # Context bridge (window.api.db)
├── vite.config.js
├── tailwind.config.js
├── assets/
│   └── icon.ico          # ← Replace with your 256×256 .ico before building
├── src/
│   ├── index.html        # Shell HTML
│   ├── main.js           # Frontend entry, router, shell, global helpers
│   ├── styles/
│   │   └── main.css      # @tailwind base/components/utilities
│   ├── db/
│   │   ├── schema.sql    # CREATE TABLE IF NOT EXISTS (idempotent)
│   │   └── init.js       # Fetches schema.sql, calls window.api.db.init()
│   └── screens/
│       ├── pos.js        # Billing / POS screen
│       ├── inventory.js  # Inventory, stock-in, returns
│       ├── reports.js    # GSTR-1 export, JSON backup, summary stats
│       └── settings.js   # Shop info, tax config, theme, security, data
└── dist/                 # Vite build output (auto-generated)
```

---

## Tax Calculation Reference

| Scheme         | Formula |
|----------------|---------|
| Standard GST   | `taxableBase = unitPrice ÷ (1 + rate/100)` |
| Margin Scheme  | `taxableBase = (unitPrice − purchasePrice) ÷ (1 + rate/100)` |

CGST = SGST = totalGST ÷ 2

Margin scheme applies **only** to Used Phones and must be toggled per line item.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `better-sqlite3` fails to load | Run `npx electron-rebuild` after `npm install` |
| White screen on launch | Check DevTools console; usually a Vite path issue |
| Print window blocked | Allow pop-ups for `file://` in browser/Electron settings |
| `icon.ico` build error | Replace `assets/icon.ico` with a valid `.ico` file |
| DB locked / EBUSY | WAL mode is enabled by default; restart the app |

---