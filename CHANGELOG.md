# Changelog

All notable changes to this project are documented here.

---

## [Unreleased]

---

## [0.3.0] — RVI-12: Python FastAPI AI Service

### Added
- `api/main.py` — FastAPI app with CORS, `GET /health`, `POST /analyze`
- `api/models.py` — Pydantic models: `FeedbackSection`, `DetectedFeatures`, `AnalysisResponse`
- `api/services/face_detection.py` — MediaPipe FaceMesh face detection; returns 422 if no face detected
- `api/services/feedback.py` — GPT-4o Vision feedback generation with coaching prompt guardrails
- `api/requirements.txt` — pinned deps: fastapi, uvicorn, mediapipe, openai, pillow, pydantic
- `api/.env.example` — env var template (`OPENAI_API_KEY`, `CORS_ORIGINS`)
- `.gitignore` updated to exclude `api/.env` and `__pycache__`

---

## [0.2.1] — Code review fixes (RVI-11)

### Fixed
- `upload/page.tsx` — blob URL memory leak: revoke on retake and new file selection
- `results/page.tsx` — removed unused `simulationImageUrl` destructure
- `category/page.tsx` — removed unused `Card` import
- `analyzing/page.tsx` — inner nav `setTimeout` now captured and cleaned up on unmount
- `chat/page.tsx` — `isPremium` converted from unused `useState` to plain `const`
- `chat/page.tsx` — `Message` type uses stable `id` field instead of array index as React key

---

## [0.2.0] — RVI-11: All UI Screens (Static / Mocked)

### Added
- `src/types/analysis.ts` — `GroomingCategory`, `StyleGoal`, `FeedbackSection`, `SimulationVariant` types
- `src/lib/mock-data.ts` — mock feedback, barber tips, simulation variants, option lists
- `src/components/ui/BeforeAfterSlider.tsx` — draggable before/after comparison slider, touch-friendly
- `src/app/page.tsx` — Welcome / Landing screen
- `src/app/category/page.tsx` — Grooming category selection (4 active, 3 locked with coming-soon)
- `src/app/style-goal/page.tsx` — Style goal + optional current style chips
- `src/app/upload/page.tsx` — Photo upload with camera/gallery, preview, retake, file size validation
- `src/app/analyzing/page.tsx` — Animated progress loading screen, auto-redirects to results after 3s
- `src/app/results/page.tsx` — Results dashboard with Feedback / Simulation / Barber Guide tabs
- `src/app/chat/page.tsx` — Premium AI chat UI with locked free tier and upgrade CTA

### Changed
- `next.config.mjs` — added Unsplash `remotePatterns` for mock image loading
- `src/components/ui/index.ts` — added `BeforeAfterSlider` export

---

## [0.1.0] — RVI-10: Project Scaffold + Design System

### Added
- Next.js 14 (App Router) + Tailwind CSS + TypeScript project scaffolded
- Inter font via `next/font/google`
- Design tokens in `tailwind.config.ts`: Deep Indigo `#2C3E50`, Steel Blue `#4F6D7A`, Soft Neutral `#F5F7FA`, 8px spacing grid
- `src/components/ui/Button.tsx` — primary and secondary variants, 44px WCAG tap target
- `src/components/ui/Card.tsx` — white card with 12px radius, subtle shadow
- `src/components/ui/SelectionChip.tsx` — active/inactive states
- `src/components/ui/ProgressBar.tsx` — indeterminate and value-driven modes
- `src/components/ui/index.ts` — barrel export
- lucide-react installed for iconography
- Folder structure: `/components/ui`, `/lib`, `/types`
