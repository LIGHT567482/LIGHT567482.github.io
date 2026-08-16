# Semucyo Joshua — Portfolio

A hand-built static portfolio. No frameworks, no build step, no `npm install`.

```
CV/
├── index.html                        all content lives here
├── styles.css                        design system + layout
├── script.js                         nav, scroll reveals, contact form
├── assets/
│   ├── Semucyo-Joshua-CV.pdf         the downloadable CV
│   └── preview.png                   1200×630 social share card
└── README.md
```

## Run it locally

Open `index.html` in a browser. That's it.

For a proper local server (recommended — some browsers restrict `fetch` on `file://`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Three things to finish

### 1. Point the project cards at real repos

Every "View on GitHub" link currently goes to your profile. In `index.html`, search
for `https://github.com/LIGHT567482` (4 occurrences, one per project) and replace
each with the actual repo URL, e.g. `https://github.com/LIGHT567482/qaat`.

### 2. Turn on the contact form

The form works **right now** — with no endpoint configured it opens the visitor's
email app pre-filled. That's a fine fallback, but a real endpoint is better.

1. Sign up free at [formspree.io](https://formspree.io) (50 submissions/month).
2. Create a form; you get an ID like `xvgpwbqz`.
3. In `index.html`, replace `YOUR_FORM_ID` in the form's `action` attribute:

```html
<form ... action="https://formspree.io/f/xvgpwbqz" method="POST" novalidate>
```

`script.js` detects the change automatically and switches to AJAX submission —
no page reload, inline success message, honeypot spam trap already wired in.

### 3. Fix the URLs if you don't use light567482.github.io

The social-preview tags in `<head>` use absolute URLs — they can't be relative, or
WhatsApp and LinkedIn won't resolve the image. Three places to update if your domain
differs: `og:url`, `og:image`, and `<link rel="canonical">`.

Regenerate `assets/preview.png` any time your title or role changes. Test how it
looks with [opengraph.xyz](https://www.opengraph.xyz) after deploying.

### 4. Keep the CV fresh

Replace `assets/Semucyo-Joshua-CV.pdf` whenever you update it. Keep the filename
the same and every download button keeps working.

## Deploy to GitHub Pages (free, ~5 minutes)

```bash
cd ~/Desktop/CV
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/LIGHT567482/LIGHT567482.github.io.git
git push -u origin main
```

Create the repo named exactly `LIGHT567482.github.io` on GitHub first. On push it
goes live at **https://light567482.github.io** — no config needed.

Any other repo name works too: push, then Settings → Pages → Source: `main` / root.
It publishes at `light567482.github.io/<repo-name>`.

## Editing notes

- **Colours** are CSS variables at the top of `styles.css` (`--orange`, `--blue`,
  `--lime`, `--violet`, `--pink`). Change `--accent` to recolour the whole site.
- **Project card colour** is set per-card inline: `style="--proj: var(--blue)"`.
- **Add a project**: copy an `<article class="proj reveal">` block, bump the
  `proj__num`, give it a `--proj` colour.
- **Animations** respect `prefers-reduced-motion` and the site has a print
  stylesheet, so Ctrl+P produces a clean document.
