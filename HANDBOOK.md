# Portfolio Maintenance Handbook 🛠️

Welcome to your portfolio handbook! This website is engineered to be **lightweight, slick, ultra-fast, and completely editable in Markdown**—just like writing posts for Chirpy / Jekyll. It uses zero npm packages, zero node modules, and zero external runtime frameworks.

---

## 🌓 1. Light Mode & Dark Mode

Your portfolio includes two custom engineering themes:

- **Dark Mode (Default)**: Deep midnight petrol (`#081721`), cyan teal (`#148D8D`), and warm amber (`#EFBC75`).
- **Light Mode**: Warm editorial parchment (`#FAF8F5`), crisp white cards, and deep teal (`#127676`).

### How It Works:
- **System-Linked by Default**: When a visitor first arrives, the site automatically detects their OS/browser preference (`prefers-color-scheme`).
- **Manual Toggle**: Visitors can click the **Dark Mode / Light Mode** pill button in the sidebar footer to switch anytime.
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
