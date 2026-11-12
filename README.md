# Elham Hesami — portfolio templates · *I Am War*

Six complete, separate portfolio templates for **Elham Hesami** (director · actress · visual artist · researcher), applying to film school. Every template is built around her film project **I AM WAR** and renders the *same* content from one file, so the client can open all six and choose a direction.

```
index.html          launcher — six cinematic cards (open this first)
shared/
  data.js           ← the ONE place to edit text, projects, timeline, skills, UI copy
  iamwar.js/.css    the "I AM WAR" key-art feature, bold brand mark, war-moment animation
  img/              locally generated artwork (portrait + every timeline entry + projects)
ex1 … ex6/          index.html · styles.css · main.js   (one folder per template)
.nojekyll           tells GitHub Pages to serve every file as-is
```

## Run it

It is plain static HTML/CSS/JS — no build step.

* **GitHub Pages:** works as-is (all paths are relative, `.nojekyll` is included).
* **Locally:** double-click `index.html`, or serve the folder (`npx serve .` / `python -m http.server 8000`).
* GSAP, Lenis and Google Fonts load from CDNs (template 5 also loads Three.js), so an internet connection is needed for full effect.

## The six cuts

| # | Name | Look | Signature moves |
|---|------|------|-----------------|
| 1 | **Editorial** | Paper, ink, vermilion · Instrument Serif | Pinned **horizontal timeline** with a rolling year counter, custom cursor |
| 2 | **Aurora** | Glass over moving gradients · Bricolage Grotesque | Glowing vertical line, tilting cards, skill rings |
| 3 | **Neon Grid** | Dark HUD · Space Grotesk / JetBrains Mono | Bento hero, **audio-waveform monitor**, typing shot-log terminal |
| 4 | **Playful** | Neo-brutalist scrapbook · Bowlby One / Fredoka | Winding SVG path with a walker, draggable polaroids, confetti |
| 5 | **Journey 3D** | WebGL · Unbounded / Outfit | **Three.js flythrough** along a strand of film, bloom, optional war-drum, 2D fallback |
| 6 | **Director's Cut** | Projection room · Big Shoulders / Newsreader / Courier Prime | Letterboxed hero with a live **viewfinder**, **screenplay-page About that types itself**, pinned **edit-suite timeline** (scrubbing playhead, tracks, play button), movie-poster projects, **mixing-desk** skills, end-credits contact, film grain, "house lights" theme |

All six: loader (skippable, under 2.5 s), hero, about + stats, filterable life timeline with a detail modal, projects, skills, future goals, contact + footer, active-section nav, scroll progress, keyboard access and full `prefers-reduced-motion` support. Templates 1, 2, 4 and 6 have a dark/light toggle.

## What is in every template

* **I AM WAR feature** — bold title, original key art (the director, her camera and a child's shadow over a city of light), five works, one film. Every mention of *I Am War* is set in bold across all pages; inside the project sections the words *art* and *cinema* are bold too.
* **The Iran–USA war moment** — a timeline entry flagged `special: "war"` in `data.js`. It has its own animated key image, and wherever it opens a canvas atmosphere (ash, embers, distant flashes, glitch bars, then paper cranes rising) is laid over it. Template 6 goes further: the monitor turns to a "signal lost" glitch screen and the clip pulses red.
* **No empty images** — all pictures are local files in `shared/img/` (a portrait, one per timeline entry, one per project). Swap in real photos by changing the paths in `data.js`.

## Editing the content

Everything lives in **`shared/data.js`**:

* `person` — name, title, bio, email, socials, portrait.
* `timeline` — 16 entries (`id`, `year`, `date`, `category`, `title`, `subtitle`, `description`, `image`, `tags`, `link`). `age` is optional (`null` hides it). `special: "war"` triggers the war-moment effects.
* `projects`, `skills`, `stats`, `future`, `iamwar`, and every UI string under `copy`.
* Wrap a word in `*asterisks*` to make it the italic accent word.

> **Verified vs. sample.** From public pages: the IMDb credits (Anahita 2010, Breath 2016, Sister 2016, Lady of the Mansion 2018–19, Pinto 2021), the ORCID publications (*Modern Care Journal* 2022, *Heliyon* 2025, three peer reviews), and the Bauhaus-Universität Weimar Faculty of Art & Design / Deutschlandstipendium 2024 listing. The *I Am War* works, the war-moment wording, the journey entry, bio details, skill levels and links to `example.com` are **sample text to replace** with Elham's own words.

## Changing the look

Each template defines its design tokens (colours, fonts, spacing) as CSS custom properties at the top of its `styles.css`. Template 6 uses `--bg`, `--ink`, `--accent`, `--red`, and the six category colours `--c-education … --c-travel`.

## Libraries

GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (all templates), Three.js 0.160.0 (template 5 only, loaded on demand; if it fails, the 2D timeline appears).

## Accessibility & performance notes

* Semantic landmarks, skip links, visible focus, native `<dialog>` modals (focus trapped, Esc closes, arrow keys step).
* Reduced motion removes the loader, parallax, pinned scroll, grain and canvas effects, and shows static content.
* Animations use `transform`/`opacity`; images are lazy-loaded; canvas and WebGL loops pause when off-screen or the tab is hidden.
