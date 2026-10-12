# MatchLens ⚽ Backend Architecture & Setup

**Understand the game beyond the score.**

MatchLens Backend adalah REST API intelligence sepakbola berbasis Next.js (TypeScript), PostgreSQL (Docker), Zod validation, dan AI Analysis engine.

---

## 📁 Project Structure

Struktur direktori disiapkan dalam 2 folder terpisah agar **sangat mudah dipisahkan menjadi repositori Git terpisah** di kemudian hari:

```text
MatchLens/
├── apps/
│   ├── api/                   # Backend REST API (Next.js 16 + TypeScript)
│   │   ├── src/
│   │   │   ├── app/api/v1/    # Route Handlers (/health, /matches, /analysis, dll)
│   │   │   ├── lib/
│   │   │   │   ├── ai/        # AI Orchestrator, OpenRouter (Nemotron), Gemini & Mock Tactical Engines
│   │   │   │   ├── config/    # Type-safe environment config (Zod)
│   │   │   │   ├── db/        # PostgreSQL Connection Pool (pg)
│   │   │   │   ├── football/  # Provider Adapters (Mock & External APIs)
│   │   │   │   ├── validation/# Zod Request & Response Schemas
│   │   │   │   └── response.ts# Standardized JSON response helper
│   │   ├── .env.example
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── web/                   # (Tahap Selanjutnya) React Web Application
│
├── docker/
│   └── init.sql               # 14 Relational PostgreSQL tables + demo seed data
├── docker-compose.yml         # PostgreSQL 16 Alpine + Adminer Web UI
└── README.md
```

---

## 🚀 Menjalankan Backend & Database Lokal

### 1. Database PostgreSQL via Docker
Container PostgreSQL dan Adminer sudah disiapkan:
```bash
# Menjalankan database di background
docker compose up -d

# Akses Database Adminer GUI via Browser:
# URL: http://localhost:8080
# System: PostgreSQL
# Server: postgres
# Username: postgres
# Password: postgres
# Database: matchlens
```

### 2. Next.js API Server
```bash
cd apps/api
npm run dev
```
Backend berjalan di: `http://localhost:3000`

---

## 📡 Daftar Endpoint API v1 yang Sudah Aktif & Teruji

| Method | Endpoint | Deskripsi | Status |
|---|---|---|---|
| `GET` | `/api/v1/health` | Health check backend & koneksi PostgreSQL Docker | ✅ Verified (200 OK) |
| `GET` | `/api/v1/matches` | Daftar jadwal & hasil pertandingan (Premier League, La Liga, UCL) | ✅ Verified (200 OK) |
| `GET` | `/api/v1/matches/:id` | Detail spesifik pertandingan | ✅ Verified (200 OK) |
| `GET` | `/api/v1/matches/:id/events` | Timeline kejadian (Gol, kartu, pergantian pemain) | ✅ Verified (200 OK) |
| `GET` | `/api/v1/matches/:id/stats` | Statistik perbandingan (xG, penguasaan bola, shots, turnover) | ✅ Verified (200 OK) |
| `POST` | `/api/v1/matches/:id/analysis` | **Why It Happened** AI Analysis (Grounded facts, narrative & caching) | ✅ Verified (200 OK) |
| `POST` | `/api/v1/matches/:id/events/:eventId/analysis` | **Match Autopsy** event analysis mendalam | ✅ Verified (200 OK) |
| `GET` | `/api/v1/players/:id` | Detail profil & statistik pemain | ✅ Verified (200 OK) |
| `GET` | `/api/v1/transfers` | **Transfer Truth** timeline rumor & status transfer berjenjang tier | ✅ Verified (200 OK) |
| `POST` | `/api/v1/creator/reports` | **Fan-to-Creator** generator format report (Card, Thread, Script) | ✅ Verified (200 OK) |

---

## 🛡️ Database Schema (14 Tables)
1. `profiles`
2. `competitions`
3. `teams`
4. `players`
5. `matches`
6. `match_stats`
7. `match_events`
8. `player_match_stats`
9. `user_favorites`
10. `articles`
11. `transfer_reports`
12. `ai_analyses` (Dilengkapi input hash untuk deduplikasi & caching analisis AI)
13. `analysis_feedback`
14. `saved_reports`
