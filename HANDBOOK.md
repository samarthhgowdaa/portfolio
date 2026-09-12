# Portfolio Maintenance Handbook 🛠️

Welcome to your portfolio handbook! This website was engineered to be **lightweight, warm, ultra-fast, and completely editable in Markdown**—just like writing posts for Chirpy / Jekyll.

---

## 🚀 Quick Start: How to Edit & Update

All the text, projects, blogs, and settings live in the `content/` folder as clean Markdown (`.md`) files:

```
content/
├── about.md          # Bio, facts, headlines (with alternate choices)
├── focus.md          # Key interests, hardware domains, and toolkit
├── experience.md     # Engineering timeline (currently commented out)
├── projects.md       # Projects list, GitHub links, category filter chips
├── writing.md        # Blog articles linking to your Jekyll/Chirpy blog
├── education.md      # Degree and coursework (newest at top)
├── certifications.md # Certificates, image badges, credential IDs
└── contact.md        # Email, GitHub, LinkedIn, RSS feed
```

Whenever you edit any file inside `content/`, simply open your terminal and run:

```bash
python3 build.py
```

`build.py` runs instantly (under 20 milliseconds) with **zero external dependencies** (no npm, no node, no gems required) and generates the static `index.html`.

---

## 1. How to Add a New Project

Open `content/projects.md`. Under the `projects:` list, copy and paste this block at the top or bottom of the list:

```yaml
  - title: "My New Hardware Project"
    link: "https://github.com/samarthhgowdaa/my-new-project"
    category: "embedded"
    year: "2026"
    description: "Brief summary of what the project does, the problem it solves, and how it was built."
    tags:
      - "ESP32"
      - "FreeRTOS"
      - "C++"
```

### Adding or Renaming Category Chips
In `content/projects.md`, look at the `categories:` list:

```yaml
categories:
  - id: "all"
    label: "All Projects"
  - id: "systems"
    label: "Systems & C/C++"
  - id: "embedded"
    label: "Hardware & Embedded"
  - id: "digital"
    label: "Digital Logic & HDL"
  - id: "web"
    label: "Web & Tools"
```

To add a new category (e.g. `robotics`), simply add:
```yaml
  - id: "robotics"
    label: "Robotics & Control"
```
And set `category: "robotics"` on any matching project!

Then run:
```bash
python3 build.py
```

---

## 2. How to Change the Bold Headline & Location

Open `content/about.md`.

### Changing the Headline:
Uncomment whichever choice you prefer (or write your own custom one):

```yaml
# Choice 1 (Active):
headline: "Exploring machines from raw silicon up to software."

# Choice 2:
# headline: "To truly love a machine, one must open it, understand its heart, its design & its soul."

# Choice 3:
# headline: "Bridging digital circuits, low-level firmware, and creative software."

# Choice 4:
# headline: "Turning logic gates, microcontrollers, and code into tangible reality."
```

### Enabling Your Location:
In `content/about.md`, uncomment the location line:
```yaml
location: "Bengaluru, India"
```
Then run:
```bash
python3 build.py
```

---

## 3. How to Enable the Experience Tab

Open `content/experience.md`. At the very top, change `enabled: false` to `enabled: true`:

```yaml
enabled: true
```

Then edit the company names, roles, bullets, and tags in `content/experience.md`, and run:

```bash
python3 build.py
```

The **02b Experience** tab will automatically appear in both your sticky sidebar navigation and the main page flow!

---

## 4. How to Add Blog Posts / Writing Links

Open `content/writing.md`. Under `posts:`, add your article:

```yaml
  - title: "Interfacing I2C Accelerometers on STM32"
    date: "Oct 2026"
    link: "https://samarthhgowdaa.github.io/posts/i2c-accelerometer/"
    description: "Detailed walk-through of I2C registers, timing diagrams, and DMA buffer transfers."
    tags:
      - "STM32"
      - "I2C"
      - "Embedded C"
```

Then run `python3 build.py`.

---

## 5. How to Add New Certifications & Photos

1. Put your certificate image or badge in `assets/certs/` (e.g., `assets/certs/my_new_cert.png` or an SVG).
2. Open `content/certifications.md` and add a new entry:

```yaml
  - title: "FPGA Design for Embedded Systems"
    issuer: "Coursera / University of Colorado"
    date: "2026"
    link: "https://coursera.org/verify/YOUR_ID"
    image: "assets/certs/my_new_cert.png"
    credential_id: "CERT-FPGA-7712"
    skills:
      - "Verilog"
      - "FPGA"
      - "Timing Analysis"
```

Run `python3 build.py`.

---

## 6. Testing Locally in Your Browser

To preview your site on your local machine:

1. Open a terminal in the `Portfolio/` directory.
2. Start Python's built-in web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

*(You can also double-click `index.html` to open it directly in Firefox/Chrome/Brave!)*

---

## 7. Deploying to GitHub Pages

Since the site produces a completely standalone `index.html`, `css/`, and `js/`:

1. Initialize Git (if not already done) and commit your files:
   ```bash
   git add .
   git commit -m "Update portfolio site"
   ```
2. Push to your GitHub repository (`samarthhgowdaa.github.io` or `Portfolio`):
   ```bash
   git push origin main
   ```
3. In your GitHub repository settings:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select Branch: `main`, folder: `/ (root)`.
   - Click **Save**.

Your site will be live within seconds!
