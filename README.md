# Lamarr — Job Application Tracker berbasis AI

> Dibuat karena spreadsheet adalah cara yang menyiksa untuk melacak lamaran kerja.

**Live Demo:** [lamarr.vercel.app](https://lamarr.vercel.app)

![Lamarr Dashboard](./docs/screenshot.png)

## Apa itu Lamarr?

Lamarr adalah aplikasi pelacak lamaran kerja dengan lapisan AI yang benar-benar membantu proses job hunting — bukan sekadar menyimpan data.

- **Kanban Board** — drag lamaran antar tahap (Applied → Screening → Interview → Offer)
- **AI Job Parser** — paste job posting manapun, AI otomatis mengekstrak judul, perusahaan, requirements, dan gaji
- **CV Match Score** — menghitung kemiripan semantik antara CV dan requirements pekerjaan menggunakan sentence-transformers
- **Gap Analyzer** — analisis jujur dari AI tentang kekuatan, kekurangan, dan peluang lolos
- **Follow-up Email Generator** — draft email follow-up yang kontekstual berdasarkan posisi, perusahaan, dan berapa hari sejak melamar
- **Ghosted Graveyard** — melacak perusahaan mana yang tidak memberi kabar 👻

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui |
| Backend | Go 1.26, Gin, GORM |
| Database | PostgreSQL + pgvector |
| Auth | Firebase Authentication |
| AI - Text Gen | Groq API (llama-3.3-70b-versatile) |
| AI - Embeddings | HuggingFace (sentence-transformers/all-MiniLM-L6-v2) |
| Queue | Redis + Asynq |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

## Arsitektur

```
Next.js (Vercel)
      ↓ Firebase ID Token
Go API (Railway)
      ↓           ↓
PostgreSQL      Redis
+ pgvector    (cache/queue)
      ↓
Groq + HuggingFace
```

## Cara Kerja AI

1. **Parsing** — teks job mentah → Groq LLM → JSON terstruktur (judul, perusahaan, requirements, gaji)
2. **Matching** — teks CV + requirements JD → HuggingFace embeddings → cosine similarity score
3. **Gap Analysis** — CV + requirements → Groq → kekuatan, kekurangan, verdict, dan saran konkret
4. **Follow-up** — konteks pekerjaan + hari sejak melamar → Groq → draft email profesional

## Menjalankan Secara Lokal

```bash
# Prasyarat: Go 1.21+, Node.js 20+, pnpm, Docker

# 1. Clone repo
git clone https://github.com/myfarism/lamarr
cd lamarr

# 2. Jalankan database & redis
docker compose up -d

# 3. Backend
cd apps/api
cp .env.example .env   # isi API keys
go run cmd/server/main.go

# 4. Frontend
cd apps/web
cp .env.local.example .env.local   # isi Firebase config
pnpm install && pnpm dev
```

## Environment Variables

**Backend (`apps/api/.env`)**
```
DATABASE_URL=
REDIS_URL=
GROQ_API_KEY=         # gratis di console.groq.com
HUGGINGFACE_API_KEY=  # gratis di huggingface.co/settings/tokens
```

**Frontend (`apps/web/.env.local`)**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_API_URL=
```

## Latar Belakang

Proyek ini lahir dari pengalaman nyata melacak puluhan lamaran kerja menggunakan spreadsheet. Hasilnya tidak efisien — mudah lupa follow-up, tidak ada gambaran platform mana yang paling efektif, dan tidak ada sinyal konkret mengapa lamaran sering tidak mendapat respons.

Lamarr dibangun sebagai solusi atas masalah tersebut, sekaligus sebagai kesempatan untuk mengeksplorasi Go sebagai bahasa backend di luar zona nyaman Node.js.

---

Dibuat oleh [Muhammad Faris Hafizh](https://myfarism.vercel.app)
