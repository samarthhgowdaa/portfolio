# Portfolio Maintenance Handbook 🛠️

Welcome to your portfolio handbook! This website is engineered to be **lightweight, slick, ultra-fast, and completely editable in Markdown**—just like writing posts for Chirpy / Jekyll. It uses zero npm packages, zero node modules, and zero external runtime frameworks.

---

## 🌓 1. Theme & Dot Grid Backdrop

Your portfolio features the refined styling and palette of [v2.elejeune.me](https://v2.elejeune.me/) paired with a minimal, clean **engineering dot grid backdrop**:

- **Dark Mode (Default: Ink & Iris)**: Deep obsidian background (`#0d0e12`), frosted glass cards (`#15171d`), subtle border lines (`#252833`), clean text (`#e4e6ec`), and Iris periwinkle accent (`#8b95f0`).
- **Light Mode (Bone & Rust)**: Warm parchment background (`#f5f3ee`), pure milk-glass cards (`#ffffff`), warm borders (`#dbd6cb`), dark text (`#1b1a17`), and terracotta rust accent (`#b0472b`).
- **Typography**: Complete **Aptos Font Family** self-hosted in `assets/fonts/`:
  - `Aptos Display` (weights 700, 800, 900) for impactful bold headlines and brand lettering.
  - `Aptos` (weights 400, 700, 800) for body reading experience and crisp paragraph flow.
  - `Aptos Mono` for technical specs, timelines, dates, and code tags.

### 📐 Engineering Dot Grid & Ambient Light Orbs:
- A minimal millimeter-style dot grid pattern (`radial-gradient`) renders fixed across the viewport at 24px spacing.
- **Ambient Chromatic Glow Orbs (`.bg-glow-1`, `.bg-glow-2`)**: Soft, diffused radial gradient light orbs sit behind the dot grid. When frosted glass cards scroll across them, they refract subtle, warm/iris backlighting through the frosted glass.
- **Pure CSS / 0% CPU**: Zero JavaScript computation during normal rendering, instant 120Hz scrolling on mobile and desktop without battery drain.

### How It Works:
- **System-Linked by Default**: When a visitor first arrives, the site automatically detects their OS/browser preference (`prefers-color-scheme`).
- **Manual Toggle**: Visitors can click the **Dark / Light** pill button with glowing indicator dot in the sidebar footer to switch anytime.
- **Persistent**: The visitor's preference is saved in their browser's `localStorage`.

---

## 📄 2. Resume Button & Replacing the PDF

In the About hero section, a **Resume** button sits right after "Get in Touch":
- It points directly to `assets/resume.pdf`.
- When clicked, it opens the PDF in a new tab or prompts download.

### How to Update or Replace Your Resume:
1. When you have an updated resume PDF, simply name it `resume.pdf` and drop it into the `assets/` directory:
   ```
   assets/resume.pdf
   ```
2. If you prefer to host your resume on Google Drive, GitHub, or LinkedIn, open `content/about.md` and change:
   ```yaml
   resume_url: "https://your-custom-link.com/resume.pdf"
   ```
3. Run `python3 build.py`.

---

## 💎 3. Enhanced Glassmorphism & Silky Smooth Scroll Engine

The website features an elevated **Glassmorphic design system** engineered with high-refraction lighting and a frictionless navigation engine:

- **Elevated Frosted Glass System**:
  - Cards, sidebar, filter chips, quote boxes, and buttons utilize `backdrop-filter: blur(20px) saturate(180%)`.
  - Directional specular surface lighting: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.015) 100%)`.
  - Double inset specular edge bevels: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.14)` for the crisp top light reflection, plus perimeter rim highlights.
  - Ambient elevation shadows with accent hover glows (`box-shadow: 0 16px 44px ..., 0 0 24px var(--accent-glow)`).
- **Silky Smooth Scrolling Engine**:
  - **Zero-Reflow IntersectionObserver Scrollspy**: Automatically tracks and highlights the active section in the sidebar without locking the main thread with scroll calculations.
  - **Smooth Internal Navigation**: Clicking any section anchor smoothly scrolls into view with automatic header height compensation on both desktop and mobile.
  - **Desktop Mouse Wheel Momentum Lerp**: Gently dampens discrete notched mouse wheels into fluid, cinematic inertia via `requestAnimationFrame` while preserving native 120Hz trackpad physics and touchscreen gestures.
  - **Reduced Motion Friendly**: Automatically detects and respects OS `prefers-reduced-motion: reduce`.

---

## ✍️ 4. How to Edit Content & Projects

All website text lives in the `content/` folder:

```
content/
├── about.md          # Bio, resume link, facts, headlines (with alternate choices)
├── focus.md          # Key interests (Raspberry Pi, Arduino, ESP32, Verilog, Linux, etc.)
├── experience.md     # Engineering timeline (currently commented out)
├── projects.md       # Projects list, GitHub links, category filter chips
├── writing.md        # Blog articles linking to your Jekyll/Chirpy blog
├── education.md      # Degree and coursework (newest at top)
├── certifications.md # Certificates, image badges, credential IDs
└── contact.md        # Email, GitHub, LinkedIn, RSS feed
```

Whenever you make an edit, run:
```bash
python3 build.py
```
`build.py` runs in under 20 milliseconds and generates the production-ready `index.html`.

### Adding a Project:
Open `content/projects.md` and add a new block:
```yaml
  - title: "My New Hardware Project"
    link: "https://github.com/samarthhgowdaa/my-project"
    category: "embedded"
    year: "2026"
    description: "Brief summary of the circuit or firmware."
    tags:
      - "ESP32"
      - "FreeRTOS"
      - "C++"
```

### Enabling the Experience Section:
Open `content/experience.md`, set `enabled: true`, and run `python3 build.py`.

---

## 🚀 5. Testing & Deploying

### Test Locally:
```bash
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Deploy to GitHub Pages:
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```
In your GitHub repo settings under **Pages**, set branch to `main` and root `/`. It will go live immediately!
