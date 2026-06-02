# 🎹 On-gaku (音楽) – Sheet Music Learning Companion

An AI-powered visual learning tool for beginner piano students to read sheet music faster.

**Upload** any sheet music image or PDF → **Get** note labels + music theory insights → **Learn** with interactive note-to-piano mapping.

[Live Demo](https://on-gaku.vercel.app) | [Report Issue](https://github.com/HilariusJeremy/on-gaku/issues)

---

## What It Does

### 🎯 Three Core Features

| Feature | What Happens |
|---------|--------------|
| **Annotation** | Detects every notehead using optical music recognition and overlays the note name (C, D, E, etc.) directly on the score as a clickable SVG layer |
| **Theory Analysis** | Identifies the key signature, clef type (treble/bass), and determines which notes belong to each hand |
| **Interactive Learning** | Click any measure or note to see a piano keyboard visualization showing exactly where that note is played |
| **Export** | Download the annotated sheet music as a PNG image with all note labels baked in |

### 📋 Supported Input Formats
- PNG, JPEG sheet music images
- PDF scores (automatically converted to images)

### 📤 Output
- **Annotated image** with note labels (downloadable as PNG)
- **Measure-by-measure breakdown** with note positions
- **Music theory summary** (key, clefs, staff assignments)

---

## How It Works
## Architecture

The pipeline processes an uploaded sheet music image through three stages:

**1. Backend — Optical Music Recognition (oemer)**
- Detect noteheads
- Identify staff lines
- Extract measure boundaries
- Determine clefs & key signature

**2. Note Mapping**
- Assign notes to measures
- Link treble & bass clefs
- Resolve key signature

**3. Frontend — Interactive Display**
- Overlay SVG note labels
- Clickable measures & notes
- Piano keyboard reference
- Download annotated image
