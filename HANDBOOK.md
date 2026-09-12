# Portfolio Maintenance Handbook 🛠️

Welcome to your portfolio handbook! This website is engineered to be **lightweight, slick, ultra-fast, and completely editable in Markdown**—just like writing posts for Chirpy / Jekyll. It uses zero npm packages, zero node modules, and zero external runtime frameworks.

---

## 🌓 1. Theme & Pixel Art Electronics Backdrop

Your portfolio features the refined styling and palette of [v2.elejeune.me](https://v2.elejeune.me/) paired with an animated retro pixel-art electronics backdrop:

- **Dark Mode (Default: Ink & Iris)**: Deep obsidian background (`#0d0e12`), raised cards (`#15171d`), subtle border lines (`#252833`), clean text (`#e4e6ec`), and Iris periwinkle accent (`#8b95f0`).
- **Light Mode (Bone & Rust)**: Warm parchment background (`#f5f3ee`), pure white cards (`#ffffff`), warm borders (`#dbd6cb`), dark text (`#1b1a17`), and terracotta rust accent (`#b0472b`).
- **Typography**: `Space Grotesk` for titles and body text, with monospace for metadata and code.

### 🕹️ Pixel-Art Electronic Components Engine:
- Floating in the background are 10 pixel-art electronic component sprites:
  1. **DIP Microcontroller / IC** (dual pin rows, notch, pin 1 dot)
  2. **Raspberry Pi / PCB Micro-Board** (SoC, GPIO header, USB jacks)
  3. **Axial Resistor** (banded body with axial leads)
  4. **Electrolytic Capacitor** (cylindrical can with negative stripe & unequal leads)
  5. **Ceramic Disc Capacitor** ("104" disc marking & crimped leads)
  6. **5mm Dome LED** (lens, internal die cup, cathode rim)
  7. **TO-92 Transistor** (3 leads: E, B, C)
  8. **HC-49 Crystal Oscillator** (16.000 MHz metal can)
  9. **Digital Logic AND Gate** (dual inputs, curved body, output)
  10. **Retro CRT Terminal Monitor** (phosphor screen with `>_` cursor prompt)
- **Theme-Responsive**:
  - In **Dark Theme**: components are drawn in crisp **white** on the dark background.
  - In **Light Theme**: components are drawn in crisp **black** on the light background.
- Motion is smooth and respects `prefers-reduced-motion`.

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
