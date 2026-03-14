# Changelog

All notable changes to this project are documented here.

---

## [Unreleased]

---

## [0.4.1] — Code review fixes (RVI-13)

### Fixed
- `analyzing/page.tsx` — navigation `setTimeout` stored in ref so cleanup always clears it; prevents timer leak on unmount
- `analyzing/page.tsx` — base64 string validated before `atob()` call; corrupt/missing session data now falls back to mock instead of crashing
- `analyzing/page.tsx` — query param keys corrected from camelCase (`styleGoal`, `currentStyle`) to snake_case (`style_goal`, `current_style`) to match style-goal page output; user's selected goal now reaches the API correctly
- `analyzing/page.tsx` — removed `console.error` from production network-error fallback
- `upload/page.tsx` — `sessionStorage.setItem` calls inside `reader.onload` wrapped in `try/catch`; `QuotaExceededError` now surfaces a user-facing message instead of silently failing
- `results/page.tsx` — replaced `alert()` download stubs with disabled buttons and "coming soon" label
- `results/page.tsx` — removed redundant `: FeedbackSection` type annotation on `feedback.map()` callback

---

## [0.4.0] — RVI-13: Connect Frontend to AI Service

### Added
- `src/lib/api.ts` — typed `analyzePhoto()` client; `ApiError` class with `statusCode` for structured error handling

### Changed
- `src/app/upload/page.tsx` — photo encoded to base64 via `FileReader` and stored in `sessionStorage` on "Use This Photo"; passes `groomingPhoto`, `groomingPhotoName`, `groomingPhotoType` keys
- `src/app/analyzing/page.tsx` — drives real `POST /analyze` call; tracks live progress up to 90% while waiting; surfaces 400 errors (e.g. no face detected) to user; falls back to mock data on network/server errors
- `src/app/results/page.tsx` — reads live `AnalysisResponse` from `sessionStorage`; original photo used as "before" in BeforeAfterSlider; falls back to mock when `?mock=1` param is set
- `src/types/analysis.ts` — added `AnalysisResponse` (API contract) and `DetectedFeatures` interfaces; simplified `AnalysisResult` to UI-only shape
- `src/lib/mock-data.ts` — updated `mockAnalysisResult` to match simplified `AnalysisResult` type
- `.env.local` — added `NEXT_PUBLIC_API_URL=http://localhost:8000` (gitignored)

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
