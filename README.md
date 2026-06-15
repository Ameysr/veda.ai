# Veda.ai Assessment Creator

Full-stack assignment system for teachers to create assessments, generate structured question papers with AI, and view results in real time.

## Architecture

```
┌─────────────┐     REST + WS      ┌──────────────┐
│  Next.js    │ ◄────────────────► │   Express    │
│  (Zustand)  │                    │  TypeScript  │
└─────────────┘                    └──────┬───────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              ┌──────────┐         ┌──────────┐         ┌──────────┐
              │ MongoDB  │         │  Redis   │         │  BullMQ  │
              │assignments│        │ job state│         │  worker  │
              └──────────┘         └──────────┘         └────┬─────┘
                                                             ▼
                                                        LLM + PDF
```

**Flow:** Teacher submits form → API creates assignment + enqueues job → Worker builds prompt, calls LLM, parses JSON → Result stored in MongoDB → WebSocket notifies frontend → Structured output page renders sections/questions (never raw LLM text).

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Frontend | Next.js 14, TypeScript, Zustand, Socket.IO |
| Backend  | Express, TypeScript, Mongoose, BullMQ      |
| Data     | MongoDB, Redis                             |
| AI       | OpenAI (optional mock without API key)     |

## Prerequisites

- Node.js 18+
- Docker (for MongoDB + Redis) or local installs

## Quick Start

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Set OPENAI_API_KEY for real AI, or leave empty for mock generation
npm install
npm run dev
```

Runs on `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Runs on `http://localhost:3000`

## Environment Variables

**Backend (`backend/.env`)**

| Variable         | Description                    |
|------------------|--------------------------------|
| PORT             | API port (default 4000)        |
| MONGODB_URI      | Mongo connection string        |
| REDIS_URL        | Redis URL for BullMQ           |
| OPENAI_API_KEY   | Optional; mock if omitted      |
| FRONTEND_URL     | CORS origin (default 3000)     |

**Frontend (`frontend/.env.local`)**

| Variable                  | Description        |
|---------------------------|--------------------|
| NEXT_PUBLIC_API_URL       | Backend REST URL   |
| NEXT_PUBLIC_WS_URL        | Backend WS URL     |

## API Endpoints

- `GET /api/assignments` – Get list of all assignments (ordered by creation date descending)
- `POST /api/assignments` – Create assignment + queue generation
- `GET /api/assignments/:id` – Get assignment + paper details
- `POST /api/assignments/:id/regenerate` – Re-queue generation
- `DELETE /api/assignments/:id` – Delete assignment
- `GET /api/assignments/:id/pdf` – Download PDF

## WebSocket Events

- `job:progress` – `{ assignmentId, status, progress }`
- `job:complete` – `{ assignmentId, status: 'completed' }`
- `job:failed` – `{ assignmentId, error }`

## Approach

1. **Prompt structuring** – Form fields map to a strict JSON schema prompt; LLM must return parseable JSON only.
2. **Parsing** – Worker validates with Zod; retries/fallback to mock on failure.
3. **No raw render** – Frontend only displays typed `QuestionPaper` structure.
4. **Caching** – Redis stores job status and cached paper for fast reads.
5. **PDF** – Puppeteer renders a dedicated print template.

## Bonus Features

- PDF export with exam-style formatting
- Regenerate action bar
- Difficulty badges (Easy / Moderate / Hard)
- Responsive exam paper layout

## Deployment

- **Frontend:** Vercel – set env vars, build `frontend`
- **Backend:** Railway/Render – MongoDB Atlas + Upstash Redis recommended
- **Repo:** Push to GitHub and submit repo + live URLs

## License

MIT
