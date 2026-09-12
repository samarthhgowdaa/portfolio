#!/usr/bin/env python3
"""
Samarth Gowda — Portfolio Static Site Generator
Zero external dependencies (uses standard library only).
Reads markdown/frontmatter files from content/ and builds index.html.
"""

import os
import re
import html
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
CONTENT_DIR = BASE_DIR / "content"
OUTPUT_FILE = BASE_DIR / "index.html"


def parse_frontmatter(file_path):
    """
    Parses a markdown file with YAML-like frontmatter into (meta_dict, body_text).
    Robust against lists, nested dictionaries, and comments.
    """
    if not file_path.exists():
        return {}, ""

    content = file_path.read_text(encoding="utf-8")
    lines = content.splitlines()

    if not lines or lines[0].strip() != "---":
        return {}, content

    meta_lines = []
    body_lines = []
    in_frontmatter = True

    for line in lines[1:]:
        if in_frontmatter:
            if line.strip() == "---":
                in_frontmatter = False
            else:
                meta_lines.append(line)
        else:
            body_lines.append(line)

    meta = parse_yaml_subset(meta_lines)
    body = "\n".join(body_lines).strip()
    return meta, body


def parse_yaml_subset(lines):
    """
    Parses key-value pairs, lists, and nested objects from YAML frontmatter lines.
    """
    data = {}
    current_key = None
    current_list = None
    current_obj_list = None
    current_obj = None

    for raw_line in lines:
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        indent = len(raw_line) - len(raw_line.lstrip())

        # Check for list item
        if stripped.startswith("- "):
            val = stripped[2:].strip().strip('"\'')
            if ":" in val:
                # Start of a dictionary in a list
                k, v = val.split(":", 1)
                k = k.strip()
                v = v.strip().strip('"\'')
                new_dict = {k: parse_scalar(v)}
                if current_key and isinstance(data.get(current_key), list):
                    data[current_key].append(new_dict)
                    current_obj = new_dict
                continue
            else:
                if current_obj is not None and current_list is not None:
                    # Item inside an object's sublist
                    current_list.append(parse_scalar(val))
                elif current_key and isinstance(data.get(current_key), list):
                    data[current_key].append(parse_scalar(val))
                continue

        # Check for sub-key inside current_obj (e.g. in projects or facts)
        if indent >= 4 and current_obj is not None and ":" in stripped:
            k, v = stripped.split(":", 1)
            k = k.strip()
            v = v.strip().strip('"\'')
            if not v:
                # Sublist inside object (e.g. tags or bullets or tools)
                current_obj[k] = []
                current_list = current_obj[k]
            else:
                current_obj[k] = parse_scalar(v)
                current_list = None
            continue

        # Top-level key
        if ":" in stripped:
            k, v = stripped.split(":", 1)
            k = k.strip()
            v = v.strip().strip('"\'')
            current_obj = None
            current_list = None

            if not v:
                # Empty value means next lines are a list or nested structure
                data[k] = []
                current_key = k
            else:
                data[k] = parse_scalar(v)
                current_key = k

    return data


def parse_scalar(val):
    if not val:
        return ""
    if val.lower() == "true":
        return True
    if val.lower() == "false":
        return False
    try:
        if "." in val:
            return float(val)
        return int(val)
    except ValueError:
        return val


def md_to_html(text):
    """
    Very lightweight inline markdown converter for bold, italic, quotes, code, links.
    """
    # Blockquotes
    lines = text.splitlines()
    out = []
    in_quote = False
    quote_buf = []

    for line in lines:
        if line.startswith("> "):
            in_quote = True
            quote_buf.append(line[2:].strip())
        else:
            if in_quote:
                quote_text = " ".join(quote_buf)
                out.append(f'<div class="quote-box"><p>{inline_format(quote_text)}</p></div>')
                quote_buf = []
                in_quote = False
            if line.strip():
                out.append(f'<p>{inline_format(line.strip())}</p>')

    if in_quote:
        quote_text = " ".join(quote_buf)
        out.append(f'<div class="quote-box"><p>{inline_format(quote_text)}</p></div>')

    return "\n".join(out)


def inline_format(text):
    # Bold **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Italic *text*
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # Inline code `code`
    text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
    # Links [text](url)
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
    return text


def build_site():
    print("Building portfolio from content/...")

    about_meta, about_body = parse_frontmatter(CONTENT_DIR / "about.md")
    focus_meta, focus_body = parse_frontmatter(CONTENT_DIR / "focus.md")
    exp_meta, exp_body = parse_frontmatter(CONTENT_DIR / "experience.md")
    proj_meta, proj_body = parse_frontmatter(CONTENT_DIR / "projects.md")
    write_meta, write_body = parse_frontmatter(CONTENT_DIR / "writing.md")
    edu_meta, edu_body = parse_frontmatter(CONTENT_DIR / "education.md")
    cert_meta, cert_body = parse_frontmatter(CONTENT_DIR / "certifications.md")
    contact_meta, contact_body = parse_frontmatter(CONTENT_DIR / "contact.md")

    # Headline selection
    headline = about_meta.get("headline", "Exploring machines from raw silicon up to software.")

    # Location
    location_str = about_meta.get("location", "")
    location_html = f'<span>{html.escape(location_str)}</span> · ' if location_str else '<!-- <span class="location">Bengaluru, India</span> · -->'

    # Facts HTML
    facts_html = ""
    for fact in about_meta.get("facts", []):
        f_title = html.escape(str(fact.get("title", "")))
        f_detail = html.escape(str(fact.get("detail", "")))
        facts_html += f'        <li><b>{f_title}</b><span>{f_detail}</span></li>\n'

    # Focus Domains HTML
    focus_domains_html = ""
    for dom in focus_meta.get("domains", []):
        d_name = html.escape(dom.get("name", ""))
        d_desc = html.escape(dom.get("description", ""))
        pills = "".join(f'<li>{html.escape(t)}</li>' for t in dom.get("tools", []))
        focus_domains_html += f"""      <div class="domain-card">
        <h3><span class="icon">◈</span> {d_name}</h3>
        <p>{d_desc}</p>
        <ul class="pill-list">{pills}</ul>
      </div>\n"""

    # Experience (Enabled or Commented Out)
    exp_enabled = exp_meta.get("enabled", False)
    exp_items_html = ""
    for item in exp_meta.get("items", []):
        r_role = html.escape(item.get("role", ""))
        r_comp = html.escape(item.get("company", ""))
        r_loc = html.escape(item.get("location", ""))
        r_period = html.escape(item.get("period", ""))
        r_desc = html.escape(item.get("description", ""))
        b_html = "".join(f'<li>{html.escape(b)}</li>' for b in item.get("bullets", []))
        t_html = "".join(f'<li>{html.escape(t)}</li>' for t in item.get("tags", []))
        exp_items_html += f"""        <li class="tl-item">
          <div class="tl-when">{r_period}</div>
          <div class="tl-what">
            <h3>{r_role} <span class="at">{r_comp}</span></h3>
            <p class="tl-where">{r_loc}</p>
            <p>{r_desc}</p>
            <ul class="bullets">{b_html}</ul>
            <ul class="tags">{t_html}</ul>
          </div>
        </li>\n"""

    if not exp_enabled:
        exp_nav_html = '        <!-- Uncomment when ready: <li><a href="#experience" data-nav><i>02b</i>Experience</a></li> -->'
        exp_section_html = f"""    <!-- ============================================================
         EXPERIENCE SECTION (Currently Commented Out)
         To enable: set `enabled: true` in content/experience.md & run build.py
         ============================================================
    <section id="experience" class="section">
      <h2 class="section-title"><i>02b</i>Experience</h2>
      <p class="section-lede">{html.escape(exp_meta.get("lede", ""))}</p>
      <ol class="timeline">
{exp_items_html}      </ol>
    </section>
    ============================================================ -->"""
    else:
        exp_nav_html = '        <li><a href="#experience" data-nav><i>02b</i>Experience</a></li>'
        exp_section_html = f"""    <!-- ───────────────────────── 02b EXPERIENCE ───────────────────────── -->
    <section id="experience" class="section">
      <h2 class="section-title"><i>02b</i>Experience</h2>
      <p class="section-lede">{html.escape(exp_meta.get("lede", ""))}</p>
      <ol class="timeline">
{exp_items_html}      </ol>
    </section>"""

    # Project Category Chips
    chips_html = ""
    for cat in proj_meta.get("categories", []):
        c_id = html.escape(cat.get("id", "all"))
        c_label = html.escape(cat.get("label", c_id))
        is_active = ' is-active' if c_id == 'all' else ''
        chips_html += f'        <button class="chip{is_active}" data-filter="{c_id}">{c_label}</button>\n'

    # Project Cards
    cards_html = ""
    for prj in proj_meta.get("projects", []):
        p_title = html.escape(prj.get("title", ""))
        p_link = prj.get("link", "#")
        p_cat = html.escape(prj.get("category", "all"))
        p_year = html.escape(str(prj.get("year", "")))
        p_desc = html.escape(prj.get("description", ""))
        tags_html = "".join(f'<li>{html.escape(t)}</li>' for t in prj.get("tags", []))
        cards_html += f"""        <div class="card" data-category="{p_cat}">
          <span class="card-year">{p_year}</span>
          <h3><a href="{p_link}" target="_blank" rel="noopener">{p_title}</a></h3>
          <p>{p_desc}</p>
          <ul class="tags">{tags_html}</ul>
        </div>\n"""

    # Writing Section
    writing_html = ""
    for post in write_meta.get("posts", []):
        w_title = html.escape(post.get("title", ""))
        w_link = post.get("link", "#")
        w_date = html.escape(post.get("date", ""))
        w_desc = html.escape(post.get("description", ""))
        w_tags = "".join(f'<li>{html.escape(t)}</li>' for t in post.get("tags", []))
        writing_html += f"""        <li class="writing-item">
          <div class="writing-date">{w_date}</div>
          <div class="writing-content">
            <h3><a href="{w_link}" target="_blank" rel="noopener">{w_title}</a></h3>
            <p>{w_desc}</p>
            <ul class="tags">{w_tags}</ul>
          </div>
        </li>\n"""

    # Education Timeline (Newest first)
    edu_html = ""
    for deg in edu_meta.get("degrees", []):
        d_title = html.escape(deg.get("degree", ""))
        d_inst = html.escape(deg.get("institution", ""))
        d_loc = html.escape(deg.get("location", ""))
        d_period = html.escape(deg.get("period", ""))
        d_desc = html.escape(deg.get("description", ""))
        h_html = "".join(f'<li>{html.escape(h)}</li>' for h in deg.get("highlights", []))
        c_html = "".join(f'<li>{html.escape(c)}</li>' for c in deg.get("coursework", []))
        edu_html += f"""        <li class="edu-item">
          <div class="edu-when">{d_period}</div>
          <div class="edu-what">
            <h3>{d_title}</h3>
            <div class="edu-institution">{d_inst} &bull; {d_loc}</div>
            <p>{d_desc}</p>
            {f'<ul class="bullets">{h_html}</ul>' if h_html else ''}
            {f'<p style="margin-top: .6rem; margin-bottom: .3rem; font-size: .84rem; font-weight: 600; color: var(--fg-dim);">Key Coursework:</p><ul class="tags">{c_html}</ul>' if c_html else ''}
          </div>
        </li>\n"""

    # Certifications Grid
    certs_html = ""
    for cert in cert_meta.get("certificates", []):
        c_title = html.escape(cert.get("title", ""))
        c_issuer = html.escape(cert.get("issuer", ""))
        c_date = html.escape(str(cert.get("date", "")))
        c_id = html.escape(cert.get("credential_id", ""))
        c_link = cert.get("link", "#")
        c_img = cert.get("image", "assets/certs/cert-embedded.svg")
        c_skills = "".join(f'<li>{html.escape(s)}</li>' for s in cert.get("skills", []))
        certs_html += f"""        <div class="cert-card">
          <div class="cert-preview">
            <img src="{c_img}" alt="{c_title} Preview" loading="lazy">
          </div>
          <div class="cert-info">
            <div class="cert-meta">
              <span>{c_issuer}</span>
              <span>{c_date}</span>
            </div>
            <h3><a href="{c_link}" target="_blank" rel="noopener">{c_title}</a></h3>
            <div class="cert-issuer">ID: <code>{c_id}</code></div>
            <ul class="tags" style="margin-top: auto;">{c_skills}</ul>
          </div>
        </div>\n"""

    # Contact Channels
    contact_rows = ""
    for ch in contact_meta.get("channels", []):
        c_lbl = html.escape(ch.get("label", ""))
        c_hdl = html.escape(ch.get("handle", ""))
        c_lnk = ch.get("link", "#")
        contact_rows += f"""        <li class="contact-item">
          <span class="contact-label">{c_lbl}</span>
          <div class="contact-val"><a href="{c_lnk}" target="_blank" rel="noopener">{c_hdl}</a></div>
        </li>\n"""

    # Generate full HTML template
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Samarth Gowda — Electrical &amp; Electronics Engineer</title>
  <meta name="description" content="Samarth Gowda — Electrical &amp; Electronics Engineer exploring machines from raw silicon up to firmware, low-level systems, and software.">
  <meta name="author" content="Samarth Gowda">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#0e1013">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Samarth Gowda — Electrical &amp; Electronics Engineer">
  <meta property="og:description" content="Exploring machines from raw silicon up to software. C/C++, Verilog, Embedded Systems &amp; Hardware.">
  <meta property="og:url" content="https://samarthhgowdaa.github.io">

  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="css/style.css">

  <script>
    /* Prevent theme flash by detecting theme before first paint */
    (function () {{
      try {{
        var saved = localStorage.getItem('sg_theme');
        var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.dataset.theme = theme;
      }} catch (e) {{}}
    }})();
  </script>
</head>

<body>
  <a class="skip-link" href="#about">Skip to content</a>

  <!-- Ambient hardware trace & pixel canvas backdrop -->
  <canvas id="bg-canvas" aria-hidden="true"></canvas>

  <div class="shell">

    <!-- ───────────────────────── SIDEBAR ───────────────────────── -->
    <header class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <a class="brand" href="#about">
          <!-- Animated IC / Chip Circuit Vector Mark -->
          <svg class="brand-mark" viewBox="0 0 32 32" role="img" aria-label="Samarth Gowda Chip Mark">
            <rect x="7" y="7" width="18" height="18" rx="3.5" fill="#16191f" stroke="var(--accent)" stroke-width="1.6"/>
            <line x1="11" y1="3" x2="11" y2="7" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="16" y1="3" x2="16" y2="7" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="21" y1="3" x2="21" y2="7" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="11" y1="25" x2="11" y2="29" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="16" y1="25" x2="16" y2="29" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="21" y1="25" x2="21" y2="29" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="3" y1="11" x2="7" y2="11" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="3" y1="16" x2="7" y2="16" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="3" y1="21" x2="7" y2="21" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="25" y1="11" x2="29" y2="11" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="25" y1="16" x2="29" y2="16" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="25" y1="21" x2="29" y2="21" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="12" y="12" width="8" height="8" rx="1.5" fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="1.2"/>
            <circle cx="16" cy="16" r="1.8" fill="var(--accent)"/>
          </svg>
          <span class="brand-text">
            <b>Samarth Gowda</b>
            <small>Electrical &amp; Electronics Engineer</small>
          </span>
        </a>

        <!-- Mobile hamburger toggle -->
        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Toggle navigation">
          <span aria-hidden="true"></span>
        </button>
      </div>

      <nav class="nav" id="nav" aria-label="Sections">
        <ul>
          <li><a href="#about"          data-nav><i>01</i>About</a></li>
          <li><a href="#focus"          data-nav><i>02</i>Focus</a></li>
{exp_nav_html}
          <li><a href="#projects"       data-nav><i>03</i>Projects</a></li>
          <li><a href="#writing"        data-nav><i>04</i>Writing</a></li>
          <li><a href="#education"      data-nav><i>05</i>Education</a></li>
          <li><a href="#certifications" data-nav><i>06</i>Certifications</a></li>
          <li><a href="#contact"        data-nav><i>07</i>Contact</a></li>
        </ul>

        <div class="sidebar-foot">
          <ul class="social">
            <li><a href="https://github.com/samarthhgowdaa" target="_blank" rel="me noopener">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/samarthhgowdaa/" target="_blank" rel="me noopener">LinkedIn</a></li>
            <li><a href="mailto:samarthac4work@gmail.com">Email</a></li>
            <li><a href="https://samarthhgowdaa.github.io/feed.xml" target="_blank" rel="noopener">RSS</a></li>
          </ul>
          <button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false" aria-label="Toggle visual theme">
            <span class="theme-dot" aria-hidden="true"></span>
            <span id="theme-label">Dark</span>
          </button>
        </div>
      </nav>
    </header>

    <!-- ───────────────────────── MAIN CONTENT STREAM ───────────────────────── -->
    <main class="main">

      <!-- ───────────────────────── 01 ABOUT ───────────────────────── -->
      <section id="about" class="section hero">
        <p class="eyebrow">
          {location_html}
          <span class="pulse" aria-hidden="true"></span>
          <span>{html.escape(about_meta.get("eyebrow", "Open to collaborate & talk"))}</span>
        </p>

        <!-- ============================================================
             BOLD STATEMENT CHOICES (Switch easily by uncommenting below)
             ============================================================ -->
        <h1>{html.escape(headline)}</h1>
        <!-- Alternate Choices:
        <h1>To truly love a machine, one must open it, understand its <em>heart</em>, its design &amp; its soul.</h1>
        <h1>Bridging digital circuits, <em>low-level firmware</em>, and creative software.</h1>
        <h1>Turning logic gates, <em>microcontrollers</em>, and code into tangible reality.</h1>
        -->

        <div class="about-copy">
{md_to_html(about_body)}
        </div>

        <ul class="facts">
{facts_html}        </ul>

        <p class="cta">
          <a class="btn btn-primary" href="#projects">Explore Projects</a>
          <a class="btn" href="mailto:samarthac4work@gmail.com">Get in Touch</a>
        </p>
      </section>

      <!-- ───────────────────────── 02 FOCUS ───────────────────────── -->
      <section id="focus" class="section">
        <h2 class="section-title"><i>02</i>Focus &amp; Toolkit</h2>
        <p class="section-lede">{html.escape(focus_meta.get("lede", ""))}</p>

        <div class="domains-grid">
{focus_domains_html}        </div>

        <div style="margin-top: 1.8rem; color: var(--fg-dim); font-size: .95rem;">
{md_to_html(focus_body)}
        </div>
      </section>

{exp_section_html}

      <!-- ───────────────────────── 03 PROJECTS ───────────────────────── -->
      <section id="projects" class="section">
        <h2 class="section-title"><i>03</i>Projects</h2>
        <p class="section-lede">{html.escape(proj_meta.get("lede", ""))}</p>

        <!-- Category Filters -->
        <div class="filters" role="group" aria-label="Filter projects by category">
{chips_html}        </div>

        <!-- Project Grid -->
        <div class="grid" id="project-grid">
{cards_html}        </div>
        <p class="grid-empty" id="grid-empty" hidden>No projects found in this category.</p>
      </section>

      <!-- ───────────────────────── 04 WRITING ───────────────────────── -->
      <section id="writing" class="section">
        <h2 class="section-title"><i>04</i>Writing &amp; Articles</h2>
        <p class="section-lede">{html.escape(write_meta.get("lede", ""))}</p>

        <ul class="writing-list">
{writing_html}        </ul>

        <div class="writing-foot">
          <a class="btn btn-primary" href="{write_meta.get("blog_url", "https://samarthhgowdaa.github.io")}" target="_blank" rel="noopener">
            {html.escape(write_meta.get("blog_button_text", "Read more on my blog"))} &rarr;
          </a>
        </div>
      </section>

      <!-- ───────────────────────── 05 EDUCATION ───────────────────────── -->
      <section id="education" class="section">
        <h2 class="section-title"><i>05</i>Education</h2>
        <p class="section-lede">{html.escape(edu_meta.get("lede", ""))}</p>

        <ol class="edu-list">
{edu_html}        </ol>
      </section>

      <!-- ───────────────────────── 06 CERTIFICATIONS ───────────────────────── -->
      <section id="certifications" class="section">
        <h2 class="section-title"><i>06</i>Certifications</h2>
        <p class="section-lede">{html.escape(cert_meta.get("lede", ""))}</p>

        <div class="certs-grid">
{certs_html}        </div>
      </section>

      <!-- ───────────────────────── 07 CONTACT ───────────────────────── -->
      <section id="contact" class="section">
        <h2 class="section-title"><i>07</i>Contact</h2>
        <p class="section-lede">{html.escape(contact_meta.get("lede", ""))}</p>

        <ul class="contact-list">
{contact_rows}        </ul>

        <p style="color: var(--fg-dim); font-size: .94rem;">
          {html.escape(contact_meta.get("note", ""))}
        </p>
      </section>

      <!-- ───────────────────────── BOTTOM VISITOR DOCK & 3D GLOBE ───────────────────────── -->
      <aside class="bottom-dock" aria-label="Visitor telemetry and profile statistics">
        <div class="dock-left">
          <div class="dock-status">
            <span class="pulse" style="width: 7px; height: 7px;"></span>
            <span>Live Telemetry &bull; <span id="ist-time">UTC+5:30</span></span>
          </div>
          <div class="dock-count">
            <span id="visitor-count">1,042</span>
            <small>profile visits tracked</small>
          </div>
          <p class="dock-sub">Hand-crafted semantic HTML5 &amp; modern CSS &bull; Hosted on GitHub Pages &bull; Zero external frameworks</p>
        </div>

        <div class="dock-right" title="Interactive 3D Dotted Globe — Drag to spin">
          <canvas id="globe-canvas" width="110" height="110"></canvas>
        </div>
      </aside>

      <!-- ───────────────────────── COLOPHON / FOOTER ───────────────────────── -->
      <footer class="foot">
        <p>&copy; 2026 Samarth Gowda. Built by hand &mdash; no framework, no npm, pure web.</p>
        <p><a href="https://github.com/samarthhgowdaa" target="_blank" rel="noopener">Source on GitHub</a></p>
      </footer>

    </main>
  </div>

  <!-- Scripts -->
  <script src="js/main.js"></script>
  <script src="js/globe.js"></script>
</body>
</html>
"""

    OUTPUT_FILE.write_text(full_html, encoding="utf-8")
    print(f"Generated {OUTPUT_FILE} successfully! ({len(full_html)} bytes)")


if __name__ == "__main__":
    build_site()
