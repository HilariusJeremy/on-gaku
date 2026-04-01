# on-gaku (音楽/音学)
AI-powered sheet music annotation tool for beginner piano students.
Upload any sheet music image or PDF and Ongaku will overlay note name labels directly on the score, analyse the music theory, and let you hear the piece played back. No music reading experience required.

# What it does
Annotation mode: detects every notehead in your score using optical music recognition (OMR) and overlays note name labels (C, D, E…) as an SVG layer directly on the image.
Theory mode: sends the same score to GPT-4o vision, which identifies the key signature, chord map, scales, and recommends 3–5 theory concepts for the student to study next.
Audio playback: plays the detected notes in sequence using Tone.js so you can hear what you're reading, with tempo control.

# Why it exists
Beginner piano students, especially self-taught learners (read: Me), struggle to read sheet music because they can't yet recognise note positions by sight. The existing workflow is to write note names in pencil above each notehead by hand, using mnemonics like "Every Good Boy Does Fine."
On-gaku automates that entirely. You bring any score; it labels every note and explains the theory behind the piece.

# Tech stack
| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tone.js, PDF.js |
| Backend | Python 3.9, FastAPI, oemer (OMR), PyMuPDF |
| AI | GPT-4o vision (theory analysis) |
| Deployment | Vercel (frontend), Railway + Docker (backend) |

# Architecture
Two data flows, one upload:
Flow 1 — Annotation
Image → oemer → note JSON → SVG labels on score

Flow 2 — Theory
Image → GPT-4o vision → {key, chords, scales, concepts} → theory panel
oemer runs once per upload and its result is shared by both flows. oemer handles spatial/positional reasoning; GPT-4o handles semantic/theoretical reasoning.

# API endpoints
POST /annotate — accepts an image, returns detected notes with pixel positions as JSON.
POST /theory — accepts the same image, returns key, chords, scales, and concepts as JSON.

# Project structure
```
ongaku/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + endpoints
│   │   ├── omr.py           # oemer wrapper + note parsing
│   │   ├── pdf_utils.py     # PDF → image via PyMuPDF
│   │   ├── note_mapper.py   # pixel coords → note names
│   │   └── theory.py        # GPT-4o vision call
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.tsx
│   │   │   ├── ScoreViewer.tsx
│   │   │   ├── NoteLabel.tsx
│   │   │   ├── TheoryPanel.tsx
│   │   │   └── AudioPlayer.tsx
│   │   ├── hooks/
│   │   │   ├── useAnnotation.ts
│   │   │   └── useAudio.ts
│   │   └── App.tsx
│   └── package.json
├── samples/
├── docker-compose.yml
└── README.md
```

# Running locally
## Backend
```bash
cd ongaku
python3.9 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and expects the backend at http://localhost:8000.

# MVP scope
- Upload PDF or image of sheet music
- oemer detects notes and pixel positions
- SVG overlay shows note name labels on the score
- GPT-4o theory insights panel (key, chords, scales, concepts to study)
- Audio playback via Tone.js
- Deployed live URL

# Roadmap
- Hover interactivity on note labels
- Click chord in theory panel → highlight bar on score
- Toggle annotation layers on/off
- Mobile responsive layout / PWA

# Key decisions
- oemer over GPT-4o for note detection: GPT-4o cannot reliably identify note positions. It's a spatial measurement problem, not a reasoning problem. oemer returns exact pixel coordinates needed for SVG overlay.
- GPT-4o for theory only: semantic understanding is its strength; spatial/positional reasoning is not.
- SVG overlay, not baked image: keeping labels as a live SVG layer makes hover interactivity possible in future and means the same data structure serves both annotation and theory modes.

# Author
Hilarius Jeremy: built as a portfolio project to explore OMR, computer vision, and AI-assisted music education.
