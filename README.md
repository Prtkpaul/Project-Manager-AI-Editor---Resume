# PM Resume AI

An AI-powered resume workspace built specifically for Project, Program, and Delivery Managers. Split-screen editor on the left, a live ATS-compliant resume preview on the right, and a GPT-4o powered audit that scores metric density, methodology alignment, and action-verb strength — then rewrites every bullet three ways (Velocity, Budget/Scale, Leadership).

## Design concept

The left panel is a dark "console" — the analytical workspace where you edit content and read AI scores, rendered as segmented, tick-marked gauges styled after a Gantt/timeline bar (a nod to the PM's own tools). The right panel is plain white "paper" — the actual document, kept deliberately quiet and ATS-safe so it never distracts from what a recruiter or parser will see. Quantified metrics ($, %, counts) are automatically bolded in the preview.

## Getting started

```bash
npm install
cp .env.example .env.local
# add your OpenAI API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Server-side OpenAI API key used by `app/api/analyze/route.ts`. Never exposed to the client. |

## Project structure

```
app/
  page.tsx                 # Split-screen workspace container
  layout.tsx                # Root layout, fonts
  globals.css                # Tailwind base + print rules
  api/analyze/route.ts       # GPT-4o structured-output audit endpoint
components/
  EditorForm.tsx              # Tabbed forms: Profile, Experience, Education, Certs & Tools
  AIAuditPanel.tsx             # Score gauges, keyword cloud, ATS warnings, rewrite suggestions
  ResumePreview.tsx             # Live ATS resume preview with metric highlighting
  PdfExporter.tsx                # Client-side PDF export (html2pdf.js)
lib/
  schema.ts                       # TypeScript types + OpenAI JSON Schema
  initialData.ts                   # Mock Senior PM resume data
  utils.ts                          # cn() helper, metric tokenizer, local heuristic scorer
```

## How the audit works

1. The client posts the full `ResumeData` JSON to `/api/analyze`.
2. The route calls `gpt-4o` with `response_format: { type: "json_schema", json_schema: analysisJsonSchema, strict: true }`, so the model's output is guaranteed to match `AnalysisResult`.
3. The system prompt casts the model as an Executive PM Recruiter and asks for per-bullet rewrites in three frames (velocity, budget, leadership), plus scores and ATS warnings.
4. Results render as gauges and suggestion cards in `AIAuditPanel`, and as an inline picker directly on each bullet in `ResumePreview` — click a bullet to compare and apply a rewrite in place.

## Notes

- A lightweight client-side heuristic (`quickHeuristicScore` in `lib/utils.ts`) powers the "Live score" badge in the header instantly, without waiting on the API — the full GPT-4o audit is what populates the detailed panel and rewrite suggestions.
- PDF export clones the live preview, strips interactive-only affordances, and rasterizes it letter-sized via `html2pdf.js` for a single-column, ATS-safe PDF.
