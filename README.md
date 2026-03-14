# AI Grooming Coach

An AI-powered grooming coach for men. Upload a photo and get personalized coaching feedback on hair, beard, and mustache — delivered in under 30 seconds.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| AI Service | Python FastAPI + MediaPipe + OpenAI GPT-4o Vision |
| Icons | Lucide React |
| Font | Inter (via next/font/google) |

## Project Structure

```
ai-grooming-coach/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Welcome / Landing
│   │   ├── category/           # Grooming category selection
│   │   ├── style-goal/         # Style goal selection
│   │   ├── upload/             # Photo upload
│   │   ├── analyzing/          # Loading / analysis in progress
│   │   ├── results/            # Results dashboard (Feedback / Simulation / Barber Guide)
│   │   └── chat/               # Premium AI coach chat
│   ├── components/ui/          # Design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── SelectionChip.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BeforeAfterSlider.tsx
│   ├── lib/
│   │   └── mock-data.ts        # Mock product data (replaced by API in RVI-13)
│   └── types/
│       └── analysis.ts         # TypeScript interfaces for analysis data
├── api/                        # Python FastAPI AI service
│   ├── main.py                 # FastAPI app — GET /health, POST /analyze
│   ├── models.py               # Pydantic request/response models
│   ├── services/
│   │   ├── face_detection.py   # MediaPipe FaceMesh face + landmark detection
│   │   └── feedback.py         # GPT-4o Vision coaching feedback generation
│   ├── requirements.txt
│   └── .env.example
```

## Local Development

### Frontend (Next.js)

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### AI Service (FastAPI)

```powershell
cd api
# Copy and fill in your OpenAI key
cp .env.example .env

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at [http://localhost:8000](http://localhost:8000)  
Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs)

### Environment Variables (`api/.env`)

```
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:3000
```

## API Reference

### `GET /health`
Returns `{"status": "ok"}` — liveness check.

### `POST /analyze`
Accepts a multipart form with:
- `photo` — JPEG/PNG image, max 10MB, front-facing
- `category` — `hair` | `beard` | `mustache` | `full_grooming`
- `style_goal` — `professional` | `dating` | `clean_everyday` | `rugged` | `modern`
- `current_style` _(optional)_ — `casual` | `professional` | `rugged` | `minimalist` | `unsure`

Returns structured grooming feedback with coaching observations, improvement opportunities, and barber tips per grooming area.

## Features

| Feature | Status |
|---|---|
| Welcome screen + user flow | Done (RVI-10, RVI-11) |
| Grooming category selection | Done |
| Style goal selection | Done |
| Photo upload with preview | Done |
| Analysis loading screen | Done |
| Results: coaching feedback | Done (mock data) |
| Results: before/after simulation slider | Done (mock data) |
| Results: annotated barber guide | Done (mock data) |
| Premium AI coach chat UI | Done (locked, mock) |
| FastAPI AI service | Done (RVI-12) |
| Face detection (MediaPipe) | Done |
| GPT-4o Vision feedback | Done |
| Frontend ↔ API connection | Planned (RVI-13) |
| Visual simulation (Replicate) | Planned (RVI-14) |
| Download + Stripe premium | Planned (RVI-15) |

## Roadmap

| Phase | Issue | Status |
|---|---|---|
| Project scaffold + design system | RVI-10 | Done |
| All UI screens (static/mocked) | RVI-11 | Done |
| Python FastAPI AI service | RVI-12 | Done |
| Connect frontend to AI service | RVI-13 | Planned |
| Visual simulation (Replicate) | RVI-14 | Planned |
| Download, Stripe, AI chat | RVI-15 | Planned |
