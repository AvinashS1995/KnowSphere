# KnowSphere – Enterprise Knowledge Copilot (RAG)

Full-stack Angular 20 + Node.js enterprise RAG application.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| MongoDB | Running on `localhost:27017` |
| Qdrant (optional) | Running on `localhost:6333` |

---

## 1 — Start MongoDB

```bash
# macOS (homebrew)
brew services start mongodb-community
```

---

## 2 — Backend Setup & Seed

```bash
cd know-sphere-backend

# Install dependencies
npm install

# Seed the database (creates admin + sample users)
npm run seed

# Start with nodemon (auto-restart on file change)
npm start
```

Backend runs at: **http://localhost:3000**  
Swagger API docs: **http://localhost:3000/api-docs**

### Seeded credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@company.com | Admin@123 |
| User | priya@company.com | Welcome@123 |

---

## 3 — Frontend Setup

```bash
cd know-sphere-frontend

# Install dependencies
npm install

# Start dev server (proxies /api → http://localhost:3000)
ng serve
# or
npm start
```

Frontend runs at: **http://localhost:4200**

---

## 4 — Configure AI Provider

Edit `know-sphere-backend/.env`:

```env
# Choose: openai | gemini | openrouter
AI_PROVIDER=openai
AI_MODEL=gpt-4o

# Set your key
OPENAI_API_KEY=sk-...
```

---

## Architecture

```
Frontend (Angular 20)          Backend (Node.js / Express)
  └─ /login        ──POST /api/auth/login──►  JWT auth → MongoDB
  └─ /dashboard    ──GET  /api/analytics/───► Analytics summary
  └─ /chat         ──POST /api/chat/message─► RAG pipeline
  └─ /documents    ──GET  /api/documents────► MongoDB docs list
  └─ /documents/upload  ──POST /api/documents/upload
                                              ├─ Upload → S3/Filebase
                                              ├─ Extract text (pdf-parse)
                                              ├─ Chunk text
                                              ├─ Embed (OpenAI/Gemini)
                                              └─ Store → Qdrant
  └─ /users        ──GET  /api/users────────► User CRUD (admin)
  └─ /settings     ──(local for now)
```

---

## Features

- ✅ JWT Authentication (login → token → interceptor)
- ✅ Role-based access (admin / user guards)  
- ✅ Real document upload → S3/Filebase storage
- ✅ RAG pipeline: extract → chunk → embed → Qdrant
- ✅ AI chat with source citations (OpenAI / Gemini / OpenRouter)
- ✅ Analytics dashboard with ApexCharts
- ✅ User management (admin only)
- ✅ Swagger API docs at /api-docs
- ✅ Nodemon hot-reload backend
