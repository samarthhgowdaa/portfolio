# Portfolio Maintenance Handbook 🛠️

Welcome to your portfolio handbook! This website is engineered to be **lightweight, slick, ultra-fast, and completely editable in Markdown**—just like writing posts for Chirpy / Jekyll.

---

## 🎨 1. Color Schemes & Live Theme Switcher

Your portfolio comes pre-configured with **5 distinct, high-contrast engineering color palettes** inspired by the palettes you uploaded, plus a warm light mode:

| Palette Name | Key Hex Codes | Mood / Vibe |
| :--- | :--- | :--- |
| **Petrol & Teal** *(Default)* | `#081721`, `#0E2C40`, `#148D8D`, `#C1E1A7`, `#EFBC75` | Deep midnight ocean with vibrant cyan teal and golden amber |
| **Moon Phases** | `#161C22`, `#212A31`, `#4EA6C4`, `#748D92`, `#D3D9D4` | Cool celestial slate and titanium gray |
| **Cyber Marine** | `#181A36`, `#25274D`, `#2E9CCA`, `#AAABB8` | Electric neon indigo and sky blue |
| **Retro Artsy** | `#15161C`, `#D79922`, `#EFE2BA`, `#F13C20` | Editorial vintage warmth, ochre gold, and coral |
| **Obsidian & Copper** | `#0E1013`, `#16191F`, `#E58A4E` | Warm glowing vacuum tubes, copper traces, and charcoal |
| **Parchment Light** | `#FAF8F5`, `#FFFFFF`, `#127676` | Clean editorial light mode |

### How Visitors Switch Palettes:
In the sidebar footer, there is an interactive **swatch bar**. Visitors can click any color circle to transform the site theme in real-time. Their selection is automatically saved in `localStorage`.

### How to Change the Default Theme:
Open `js/main.js` and look for:
```javascript
applyTheme('petrol-teal'); // Change to 'moon-slate', 'cyber-marine', etc.
```

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

## 🌍 3. Photorealistic 3D Earth Globe

At the bottom of the page in the telemetry dock, there is a **real-time 3D rotating Earth globe**:
- Rendered on HTML5 Canvas via WebGL with satellite Earth mapping (`assets/earth_opt.jpg`).
- Features a realistic day/night terminator (shadowed left side, illuminated right side) and atmospheric blue rim glow.
- **Interactive**: Drag or swipe with your mouse/finger to spin the globe!
- **Zero-Dependency**: Runs smoothly at 60 FPS directly on the GPU without any external 3D libraries.

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
