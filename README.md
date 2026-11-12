# University Application Portfolio — five template directions

Five complete, separate portfolio templates for a student applying to university (the sample content is a fictional applicant, **Noor Alvarez**, applying for **Medicine / MBBS, Fall 2027**). Each tells the same life story — childhood → school → projects → achievements → future — as an animated, interactive timeline, but looks and behaves completely differently so a client can compare and choose.

```
/portfolio
  index.html          launcher: preview cards for all five templates
  shared/data.js      the ONE content file every template reads
  ex1/                Editorial   (index.html, styles.css, main.js)
  ex2/                Aurora
  ex3/                Neon Grid
  ex4/                Playful
  ex5/                Journey 3D
  README.md
```

## Run it locally

No build step. Serve the folder with any static server and open the address it prints:

```bash
npx serve .            # or:  python -m http.server 8000
```

Then open `/` for the launcher, or go straight to `/ex1/` … `/ex5/`.
All five templates also work by double-clicking `index.html` (`file://`). A local server is still recommended, because Template 5 loads Three.js from a CDN and needs an internet connection either way.

## Edit the content (`shared/data.js`)

Everything the visitor reads comes from this one object, so editing it updates all five templates and the launcher.

| Key | What it controls |
|---|---|
| `person` | name, title, school, degree, location, one-line `bio`, `about` paragraphs, avatar, email, socials |
| `timeline[]` | the story: `id, year, date, age, category, title, subtitle, description, image, alt, tags, link, highlight` |
| `projects[]` | title, year, description, image, tech, link, repo |
| `skills[]` | `name`, `level` 0–100, `group` (`technical`, `creative`, `language`, `soft`) |
| `stats[]` | label + value (leading digits animate; text after them is kept, e.g. `"43/45"`, `"320+"`) |
| `future[]` | goals shown in "what's next" |
| `copy` | every heading, button label and microcopy string; `copy.terminal`, `copy.playful`, `copy.journey` hold template-specific vocabulary |

Notes
- `timeline[].category` must be one of `education`, `project`, `award`, `work`, `personal`, `travel`. Chips are built from the categories present.
- `highlight: true` marks a milestone (a badge, a star sticker, confetti, a glowing node, depending on the template).
- Wrapping a word in `*asterisks*` inside a heading in `copy` highlights it (italic accent, gradient or marker, per template; Neon Grid simply strips the asterisks).
- Images are fixed-seed placeholders from `picsum.photos`. Swap in real photos by changing the URLs; keep `alt` text meaningful.
- Keep 12–15 timeline entries for the best pacing. Template 5 spaces its nodes automatically for any number of entries.

## Change the design tokens

Each template's look is driven by CSS custom properties at the top of its `styles.css` (`:root`, plus a dark block where there is a theme toggle): colours, fonts, spacing, radii and easing curves. Change a colour there and the whole template follows. Fonts are loaded from Google Fonts in each `index.html`; change the `<link>` and the `--font-*` tokens together.

## The five templates

| # | Name | Concept | Palette | Fonts | Timeline |
|---|---|---|---|---|---|
| 1 | **Editorial** | Swiss / editorial minimalism | paper `#f3f0e8`, ink `#101010`, vermilion `#c8300a` (dark mode included) | Instrument Serif · Inter Tight | **Horizontal**, scroll-driven: scrolling moves the page sideways through the years; rolling year counter |
| 2 | **Aurora** | Glassmorphism + soft gradients | lavender `#f2eefc` / indigo `#0b0920`, violet · rose · mint · peach | Bricolage Grotesque · Figtree | **Vertical** glowing line that draws itself; cards float in from alternating sides and tilt to the cursor |
| 3 | **Neon Grid** | Dark futuristic bento HUD | `#06080c`, cyan `#19f0ff`, magenta `#ff2ea6`, lime `#b6ff3c` | Space Grotesk · JetBrains Mono | **Mission log**: a sticky terminal types the active entry beside a scrolling log |
| 4 | **Playful** | Neo-brutalism scrapbook | cream `#fff6e0`, yellow · pink · blue · green (dark mode included) | Bowlby One · Fredoka · Caveat | **Hand-drawn winding path** with a walker, year stops and draggable polaroids |
| 5 | **Journey 3D** | Immersive WebGL | `#02040a`, cyan · violet · pink | Unbounded · Outfit | **Three.js flythrough** along a DNA helix; each milestone is a node with an arrival panel; 2D list fallback |

### Libraries per template

| Template | Libraries (CDN, exact versions) |
|---|---|
| 1–4 | GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (own text splitter — no paid SplitText) |
| 5 | the same, plus Three.js 0.160.0 (+ EffectComposer, UnrealBloomPass, OutputPass), loaded lazily |

Nothing else is used. Everything else is plain HTML5, CSS3 and ES6+.

## What every template includes

Intro/loader (skippable, ~2.3 s) · hero · about + animated stats · **life timeline** with category filter chips · timeline detail view (animated modal; Esc closes, focus is trapped, ← → move between entries) · projects · skills (bars / rings / LED meters / bubbles / radar — a different chart per template) · future goals · contact (no backend: the form hands the message to the visitor's email app) · footer with socials · navigation that highlights the active section · scroll-progress indicator.

Dark/light toggle: templates 1, 2 and 4.

## Accessibility and performance

- Semantic landmarks, visible focus states, skip link, alt text, keyboard-operable timeline items, tabs, carousels and modals (native `<dialog>`).
- `prefers-reduced-motion`: smooth scrolling, pinning, tilt, parallax, particles and text effects are turned off and all content stays visible. Template 5 starts in its 2D timeline.
- Animations use `transform`/`opacity` where possible; images are lazy-loaded; canvas / WebGL loops pause when the tab is hidden (and the ECG pauses off-screen).
- Mobile (360px+): Editorial's horizontal timeline becomes a stacked list; Neon Grid gets a bottom tab bar and an inline mission log; Playful's path moves to the left edge; Journey 3D lowers pixel ratio, particle counts and bloom resolution, uses a bottom-sheet arrival panel and a scrollable chip row.

## Replacing the sample with a real applicant

1. Replace the contents of `shared/data.js` (`person`, `timeline`, `projects`, `skills`, `stats`, `future`, and any `copy` strings that mention the sample subject).
2. Swap the placeholder image URLs for real, optimised photos (about 1600px wide is plenty).
3. Pick one template, copy its folder and `shared/` to your hosting, and delete the others.
