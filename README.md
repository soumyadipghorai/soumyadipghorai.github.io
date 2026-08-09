# Soumyadip Ghorai — Data Scientist Portfolio

A single-page, responsive portfolio site built with plain HTML, CSS and JavaScript (Tailwind via CDN for utility classes — no build step, no framework). Sections: hero/nav, about, experience timeline, projects, skills, services (with a Topmate booking link), highlights, a parallax photo gallery, and a footer/contact form wired to Formspree. Includes a light/dark theme toggle and a themed preloader.

## Folder structure

```
portfolio/
├── index.html          # single-page site (all sections)
├── style.css            # custom styles, animations, preloader, parallax, theming
├── script.js             # theme toggle, mobile nav, scroll-spy, reveal/parallax/counter
│                          animations, lightbox, Formspree submission
├── docs/
│   └── Soumyadip Ghorai Data Scientist 3+yoe GE.pdf   # resume, linked from "Download Resume"
├── assets/
│   └── gallery/          # profile, about, banner photos + gallery category folders
│       ├── architecture/ durga_puja/ landscape/ mountain/ others/ temples/
│       │                    # drop JPEG/PNG/WEBP photos straight into these —
│       │                    # the gallery section on the site reads them
│       │                    # dynamically via manifest.json (see below)
│       └── manifest.json # auto-generated list of what's in each folder above
├── scripts/
│   ├── generate_gallery_manifest.py    # regenerates manifest.json (used by CI)
│   └── generate-gallery-manifest.ps1   # same, for local Windows use
├── .github/workflows/
│   └── gallery-manifest.yml  # regenerates + commits manifest.json on every
│                              # push that touches assets/gallery/**
└── README.md
```

## Gallery photos (add new ones anytime)

The Gallery section's category pills (Architecture, Durga Puja, Landscape, Mountain, Others, Temples) and photo grid are **not hand-coded** — they're built at page-load from `assets/gallery/manifest.json`, which just lists whatever image files currently sit in each `assets/gallery/<category>/` folder.

**To add a photo:** drop a `.jpg`/`.jpeg`/`.png`/`.webp` file into the matching folder (e.g. `assets/gallery/mountain/`) and push to `main`. The `Update gallery manifest` GitHub Action (`.github/workflows/gallery-manifest.yml`) automatically regenerates `manifest.json` and commits it back — no code changes needed, the photo just appears on the live site.

- Camera RAW files (`.CR2`, `.NEF`, etc.) aren't renderable in a browser and are skipped automatically — export/convert to JPEG or WEBP first.
- Want to preview the change locally before pushing? Run `python3 scripts/generate_gallery_manifest.py` (or `scripts\generate-gallery-manifest.ps1` on Windows) to regenerate the manifest yourself, then serve the site locally (see below) — `fetch()` needs a real server, opening `index.html` directly via `file://` won't load the manifest.
- Large photos slow the page down — the DSLR originals used to build this gallery were resized to a **1600px** long edge / **~74–80% JPEG quality** before committing (see the compression note in earlier project history); doing the same for new photos keeps things fast.
