🎨 QRcraft — Creative QR Code Generator
Complete PRD · Design System · Workflow · Step-by-Step AI Prompt Build Guide




📋 TABLE OF CONTENTS

Project Overview & Vision
Tech Stack Decision
Complete Feature List & Categories
UI/UX Design Language
Animation & Interaction Philosophy
Site Architecture & Pages
Storage Design
Module-by-Module Build Order
Complete AI Prompts — Module 1 through 12
QR Category Logic Reference
Cursor & Particle FX Code Reference
Extra Surprising Animation Ideas
Deployment Guide


1. PROJECT OVERVIEW & VISION
Project Name: QRcraft (you can rename to QRwave, QRbloom, NexQR — anything feels good)
One-line pitch: The world's most visually stunning QR code generator — where every click feels
like magic and every QR code you create feels like art.
The feeling you want users to have: "Woah, I've never seen a website do THAT before." Users
should feel genuinely surprised, delighted, and entertained — not just served a utility tool. The
QR generation is the product, but the experience is what makes them come back and share it with
friends.
Core problem it solves: Every QR code generator that exists is boring, minimal, and forgettable.
QRcraft combines full utility (every category of QR code you'd ever need) with a cinematic,
interactive visual experience that feels like a creative app, not a tool.
Target users: Students, creators, business owners, marketers, teachers, event organizers —
anyone who wants to generate a QR code AND feel awesome doing it.

2. TECH STACK DECISION
This project uses zero frameworks and zero build tools by design. The reason is important to
understand: AI builds pure HTML/CSS/JS much more reliably and creatively without the overhead of
React, Tailwind, Webpack, or TypeScript. You get full control, faster iteration, and cinematic
animations that frameworks often fight against. There is nothing to install, no build step, no
node_modules folder. Your project is just files.
Frontend: Pure HTML5 + CSS3 + Vanilla JavaScript (ES6+)
QR Generation Library: qrcode.js by davidshimjs — loaded via CDN. It is free, lightweight,
and generates QR codes as canvas or image elements directly in the browser with zero server needed.
File Handling: Browser-native FileReader API and URL.createObjectURL for handling uploads
Animations: CSS keyframes + JavaScript requestAnimationFrame loop + Canvas API for particles
Cursor Effects: Custom CSS cursor replacement + JS mousemove event listener driving canvas overlay
Storage: localStorage for saving recent QR codes — no backend needed for v1
Fonts: Google Fonts via CDN — Syne for headings, Outfit for body text
Icons: Lucide Icons via CDN — lightweight SVG icon set, no install needed
Export: html2canvas CDN for PNG download; native Canvas toDataURL() as fallback
QR Scanner: jsQR library via CDN for decoding QR codes from camera
Hosting Recommendation: Vercel (drag and drop your folder — free, instant, zero config) or
Netlify (same experience). Both work perfectly with pure HTML/CSS/JS.

3. COMPLETE FEATURE LIST & CATEGORIES
The website supports 16 QR code categories. Each one has its own unique form UI, icon, color
accent, and micro-interaction. Understanding each category's logic is important before building.
Category 1 — Plain Text. The user types any text: a message, quote, note, or code snippet.
The QR encodes the raw text string. Use case: secret messages, class notes, product descriptions.
Category 2 — URL / Website Link. The user pastes any URL. The QR opens that website when
scanned. Includes a "Test URL" button. Auto-prefixes https:// if missing.
Category 3 — Instagram Profile. User types their Instagram username without @. The system
constructs https://instagram.com/username and encodes it. Shows a live preview of the link.
Category 4 — WhatsApp Message. User enters phone number with country code and optional
pre-filled message. Constructs https://wa.me/PHONE?text=MESSAGE. When scanned, opens WhatsApp
with the chat ready to go.
Category 5 — Email. Fields: recipient email, subject, body. Constructs the full mailto string.
Scan-to-email that auto-fills a compose window.
Category 6 — Phone Call. User enters a phone number. Encodes tel:+1234567890. Scanning
calls the number directly.
Category 7 — SMS. Phone number plus message text. Encodes sms:+1234567890?body=MESSAGE.
Scanning opens the SMS app with everything pre-filled.
Category 8 — Wi-Fi Network. Fields: Network Name (SSID), Password, Security Type, Hidden
toggle. Encodes the WIFI string format. Scanning connects to Wi-Fi automatically — this is one
of the most-used QR types in the real world.
Category 9 — vCard / Contact. Fields: First Name, Last Name, Phone, Email, Organization,
Job Title, Website, Address. Encodes a proper vCard 3.0 string. Scanning saves the contact
directly to the phone's address book.
Category 10 — Location / Maps. User enters latitude/longitude or pastes a Google Maps link
(auto-parsed). Encodes geo:LAT,LNG. Opens the Maps app with a pin dropped.
Category 11 — YouTube Video. User pastes a YouTube URL or video ID. System constructs the
clean watch URL. Shows a thumbnail preview fetched via YouTube's image CDN.
Category 12 — Image. User uploads an image file. System converts to Base64 for tiny images or
links to a hosted URL for larger ones. Warns user if file is too large and suggests alternatives.
Category 13 — File / PDF. User uploads any file type (PDF, DOCX, MP4, ZIP, any extension).
For v1, the QR encodes a descriptive text. Power users can integrate file.io API to get a
temporary URL that is then encoded.
Category 14 — Twitter / X Profile. User types their username. Constructs
https://twitter.com/username and encodes it.
Category 15 — LinkedIn Profile. User types their LinkedIn URL or username. Constructs the
full LinkedIn profile URL.
Category 16 — Business Card QR. A premium form with all business card fields: name, company,
phone, email, website, address. Generates a vCard plus renders a visual business card preview
alongside the QR.
Bonus Features across all categories: A QR Customization Panel lets users change foreground
color, background color, error correction level (L/M/Q/H), size (128px to 1024px), and add a
center logo. Download options include PNG, SVG, PDF, and copy-to-clipboard. A History Panel
saves the last 10 QR codes in localStorage. A QR Scanner tab uses the device camera to decode
existing QR codes.

4. UI/UX DESIGN LANGUAGE
This is the most important section for feel and identity. The design must feel alive.
Color Palette. The background is a very deep near-black: #0a0a0f. Not pure black —
slightly purple-tinted to feel premium. The primary accent is an electric violet-to-cyan
gradient: linear-gradient(135deg, #7c3aed, #06b6d4). Each category has its own signature
accent color used in the card, form header, glow effects, and cursor: Text uses warm amber
#f59e0b, URL uses electric blue #3b82f6, Instagram uses hot pink #e1306c, WhatsApp uses
fresh green #25D366, and so on for all 16 categories.
Typography. Two Google Fonts. Syne for all headings and display text — it is futuristic,
wide, and has personality. Outfit for all body text and UI — clean, modern, and very readable
at small sizes. Hero heading uses clamp(2.8rem, 7vw, 6.5rem) so it scales beautifully on
any screen without media queries.
Glassmorphism Cards. All category cards, form panels, and the QR output panel use a
frosted-glass look: background: rgba(255,255,255,0.04), backdrop-filter: blur(20px),
border: 1px solid rgba(255,255,255,0.08), border-radius: 24px. This makes colorful
content pop dramatically on the dark background.
Glow Effects. Colored glows are the signature visual of this design. The selected category
card pulses with box-shadow: 0 0 40px COLOR, 0 0 80px COLOR using its category color. The
generated QR has a breathing glow animation. Buttons glow on hover. Input fields glow on focus
with the current category's color. Nothing should feel flat.

5. ANIMATION & INTERACTION PHILOSOPHY
This is where the website becomes unforgettable. The philosophy is simple: every single
interaction must have a visual response. Silence is not allowed.
Custom Cursor. Replace the default cursor with a glowing circle (12px, filled with the
current category's color). Behind it trails a larger, soft, blurred circle (40px, low opacity)
that follows with a lag using JS lerp (linear interpolation). On hovering interactive elements,
the outer circle expands to 80px — a halo around the target.
Background Particle Field. A canvas element sits behind all content. JavaScript draws 110
tiny particles that drift slowly and connect to nearby particles with faint lines when within
120px. The particle field repels from the cursor — particles near the mouse slowly drift away,
creating a "parting sea" effect that feels magical.
Category Card Selection. When a card is clicked: all other cards blur and scale to 0.92,
the selected card scales to 1.06 and emits a radial particle burst in its color, the form panel
springs in from below with spring physics curve, and the background shifts its ambient tint
toward the category's color.
QR Code Generation Reveal. The QR does NOT just appear. First, a blank square with a
spinning border shows for 0.4s. Then the QR "blooms" outward from the center using
clip-path: circle(0% at center) expanding to circle(75%) over 0.8s — like a camera iris
opening. Then a glow pulse radiates outward. Then confetti particles in the category color
burst upward and rain down.
The Surprising Moments. These are the random, delightful easter eggs that make users
show the site to others. While typing, every 20 characters a flying category emoji arcs
across the screen and fades. Every 8-10 seconds, the generated QR briefly "glitches" with
an RGB-shift animation for 200ms then snaps clean. After 12 seconds of idle, tiny QR-square
shapes rain from the top like snow. If the user clicks 4+ categories in 2 seconds, the entire
category grid playfully spins 360°.

6. SITE ARCHITECTURE & PAGES
The entire site is a single HTML file. JavaScript manages state and view transitions. No actual
navigation happens — sections are shown and hidden with JS, with smooth animations between them.
The structure from top to bottom is: the custom cursor elements and two canvas elements (particle
background and confetti overlay), then Section Hero (full viewport, animated heading, CTA),
then a Mode Tabs bar (Create QR / Scan QR), then Section Category Grid (16 cards in a 4-column
grid), then Section Form Panel (hidden until category selected — dynamic fields injected by JS),
then Section Output Panel (hidden until QR generated — shows QR with glow, download buttons),
then History Drawer (slides in from right, shows last 10 QRs), then Scanner Panel (camera
view and decoded result), then the Footer.

7. STORAGE DESIGN
Since this is frontend-only in v1, localStorage is used exclusively. No user accounts, no
server, no database — completely free and zero-maintenance. The history object stored is a JSON
array under the key qrcraft_history. Each item contains an id, category name, content string,
customization object (colors, size, error level), a 64x64 base64 thumbnail of the QR, and a
createdAt timestamp. Maximum 10 items — when the 11th is added, the oldest is removed (FIFO queue).

8. MODULE-BY-MODULE BUILD ORDER
This is your exact construction sequence. Build strictly in this order — each module depends on
the previous one being complete. Feed each module's full prompt to the AI before starting the next.
Module 1 establishes the HTML document shell, loads all CDN libraries, defines CSS variables,
and creates the CSS reset and placeholder section divs.
Module 2 adds the living background: the particle canvas system with cursor repel and the
custom cursor with lerp-based trailing ring.
Module 3 builds the Hero section — full-viewport with animated heading (individual word spans),
gravity words on hover, stats count-up, and the CTA button.
Module 4 creates the Category Grid — all 16 cards with their colors, icons, and the complete
click interaction: card selection state, particle burst, form reveal, accent color update.
Module 5 is the Dynamic Form Engine — the JS system that renders the correct form fields for
each category, plus the QR customization options panel.
Module 6 integrates qrcode.js — wires up the Generate button, reads form values, validates
inputs, and produces the QR code canvas.
Module 7 adds the spectacular QR reveal animation: the iris bloom, glow pulse, confetti
burst, and the 8-second glitch easter egg.
Module 8 builds the Download & Export System — PNG, SVG, PDF, and clipboard copy, each with
the explosion animation on click.
Module 9 creates the History System — localStorage save/load/delete with the slide-in drawer UI.
Module 10 adds the QR Scanner tab — camera access, jsQR frame scanning, and result display.
Module 11 layers in all the surprising animations: flying emojis while typing, gravity words,
idle QR rain, category shuffle spin, and the toast notification system.
Module 12 handles mobile responsiveness, touch interactions, performance optimizations,
the loading screen, SEO meta tags, and final polish.

9. COMPLETE AI PROMPTS — MODULE 1 THROUGH 12
Feed each prompt below to your AI exactly as written. Each prompt starts with a brief context
reminder (so the AI doesn't forget what the project is) then gives complete, specific instructions.
Always paste your current full HTML file when feeding prompts for Module 2 onwards.

MODULE 1 PROMPT — HTML Shell + CSS Foundation
You are an expert creative frontend developer. Build the complete HTML shell and CSS
foundation for a website called "QRcraft" — a creative, cinematic QR code generator.

REQUIREMENTS:

1. Create a single index.html file with proper HTML5 structure.

2. In the <head>, load these CDN libraries:
   - Google Fonts: Syne (weights 400,700,800) and Outfit (weights 300,400,600)
     from fonts.googleapis.com
   - qrcode.js: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
   - Lucide icons: https://unpkg.com/lucide@latest/dist/umd/lucide.js
   - html2canvas: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
   - jsQR: https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js

3. In <style>, define these CSS custom properties in :root:
   --bg: #0a0a0f
   --bg-card: rgba(255,255,255,0.04)
   --border: rgba(255,255,255,0.08)
   --text-primary: #f1f5f9
   --text-secondary: #94a3b8
   --accent-1: #7c3aed
   --accent-2: #06b6d4
   --gradient-main: linear-gradient(135deg, #7c3aed, #06b6d4)
   --font-display: 'Syne', sans-serif
   --font-body: 'Outfit', sans-serif
   --radius-card: 24px
   --radius-btn: 14px
   --blur-glass: blur(20px)
   --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1)
   --transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
   --focus-color: #7c3aed

4. Write a complete CSS reset: box-sizing border-box on *, margin 0 padding 0 on *,
   html and body set to 100% height, body background is var(--bg), color is
   var(--text-primary), font-family is var(--font-body). Hide default scrollbar but
   keep scroll functionality (scrollbar-width: none on html, ::-webkit-scrollbar display:none).
   Set cursor: none on * (we will use a custom cursor).

5. Create placeholder empty sections in the HTML body with these IDs:
   #cursor-dot (a div), #cursor-ring (a div), #particle-canvas (a canvas element,
   position fixed, full screen using width:100vw height:100vh, z-index:0,
   pointer-events:none, top:0 left:0), #confetti-canvas (same but z-index:999),
   #loading-screen (a full screen overlay div with z-index:10000),
   #hero (a section element), #mode-tabs (a div), #category-section (a section),
   #form-section (a section), #output-section (a section), #history-drawer (a div),
   #scanner-section (a section), a footer element with id="main-footer".

6. Style the placeholder sections: all sections except #hero have display:none initially.
   #hero has display:flex, min-height:100vh. All sections have position:relative and
   z-index:1. Add padding: 4rem 1.5rem to all section elements.

7. Create a JS variable in a <script> tag at the bottom of body:
   let currentCategory = 'text';
   let currentCategoryColor = '#7c3aed';
   Add a DOMContentLoaded listener that calls lucide.createIcons() after DOM loads.

Output the complete index.html file only. No explanations. All CSS inside a <style> tag
in <head>. All JS inside a <script> tag before </body>.

MODULE 2 PROMPT — Particle Background + Custom Cursor
I am building a website called QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the interactive background particle system and custom cursor. Add new CSS and JS to
the existing file. Do NOT remove or replace anything already there — only append.

CUSTOM CURSOR CSS:
#cursor-dot: position fixed, width 10px, height 10px, border-radius 50%,
background var(--gradient-main), pointer-events none, z-index 10000,
transform translate(-50%,-50%), transition: width 0.15s, height 0.15s,
top 0, left 0. Initially hidden (opacity 0) until first mousemove.

#cursor-ring: position fixed, width 40px, height 40px, border-radius 50%,
border 1.5px solid rgba(124,58,237,0.6), pointer-events none, z-index 9999,
transform translate(-50%,-50%), transition: width 0.2s, height 0.2s,
border-color 0.2s, top 0, left 0.

.cursor-hover state (add via JS class): cursor-dot shrinks to 5px,
cursor-ring expands to 70px and border-color changes to var(--accent-2).

CURSOR JAVASCRIPT — write function initCursor():
- Track mousemove: update cursor-dot position INSTANTLY (no transition lag).
  On first mousemove, set both elements to opacity 1.
- Implement cursor-ring lerp: use requestAnimationFrame loop where ringX and ringY
  approach mouseX and mouseY at factor 0.14 each frame. Update ring element position.
- On mouseenter of any element matching 'button, a, .category-card, [data-interactive]':
  add class 'cursor-hover' to both #cursor-dot and #cursor-ring.
- On mouseleave of same: remove 'cursor-hover' class.
- Also write global function updateAccentColor(hex) that:
  changes #cursor-dot background to hex color (directly sets style.background)
  changes #cursor-ring border-color to hex + 'cc' (hex with opacity)
  updates CSS variable --focus-color to hex value on document.documentElement.style

PARTICLE BACKGROUND JAVASCRIPT — write function initParticles():
- Get #particle-canvas, set width and height to window.innerWidth/Height.
  On window resize, update canvas size.
- Create array of 110 particle objects. Each has:
  x (random 0 to canvas width), y (random 0 to canvas height),
  vx (random -0.5 to 0.5), vy (random -0.5 to 0.5),
  radius (random 1 to 2.5),
  color (randomly pick from: 'rgba(124,58,237,0.5)', 'rgba(6,182,212,0.5)',
  'rgba(232,121,249,0.4)', 'rgba(59,130,246,0.5)', 'rgba(167,139,250,0.4)')
- Animation loop using requestAnimationFrame:
  clearRect entire canvas each frame.
  For each particle: add vx/vy to position. Bounce off edges (flip velocity).
  Mouse repel: if distance to mouseX/mouseY < 100, push particle away with
  force = (100 - dist) / 100 * 0.35 applied along the dx/dy direction.
  Apply velocity damping: vx *= 0.97, vy *= 0.97.
  Draw connections: for pairs of particles within 120px, draw a line between them
  with strokeStyle using opacity mapped to distance: opacity = (1 - dist/120) * 0.12.
  Draw each particle as a filled circle with its color.
- Store mouseX, mouseY as module-level variables updated by mousemove.

Write function initBackground() that calls initCursor() then initParticles().
Add initBackground() call inside the DOMContentLoaded listener.

MODULE 3 PROMPT — Hero Section
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the Hero Section content and animations. All changes go INSIDE the existing #hero element.
Also add new CSS and new JS — do not remove anything.

HERO HTML — inject this structure inside #hero:
A div.hero-bg-glow for the ambient glow effect.
A nav.hero-nav for the logo at the top: div.logo-mark containing a small inline SVG
that looks like a stylized QR grid (3x3 squares, some filled, some empty using rects in SVG),
plus a span.logo-text with "QRcraft" in Syne font, gradient text effect.
A div.hero-content containing:
  - An h1.hero-title where the text "Create QR Codes That Feel Like Art" is split into
    individual <span class="word"> elements, one per word. Each span is display:inline-block.
  - A p.hero-subtitle: "16 categories. Zero boring. Pure magic."
    Outfit font, color var(--text-secondary).
  - A div.hero-stats containing three div.stat-pill elements showing:
    "16 Categories", "1-Click Export", "100% Free".
    Each pill has glassmorphism style: background rgba(255,255,255,0.06),
    border 1px solid var(--border), border-radius 100px, padding 8px 20px,
    Outfit font 0.85rem, font-weight 600.
  - A button#hero-cta with text "Start Creating →".
    Style: background var(--gradient-main), border none, Syne font, font-size 1.1rem,
    font-weight 700, padding 18px 44px, border-radius var(--radius-btn), color white,
    cursor none, box-shadow 0 0 30px rgba(124,58,237,0.4),
    transition transform 0.3s var(--transition-spring), box-shadow 0.3s.
    On hover: transform scale(1.06), box-shadow 0 0 50px rgba(124,58,237,0.6).

HERO CSS:
#hero: min-height 100vh, display flex, flex-direction column, align-items center,
justify-content center, position relative, overflow hidden, padding 2rem 1.5rem,
text-align center, gap 2rem.

.hero-bg-glow: position absolute, width 700px, height 700px, border-radius 50%,
background radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%),
top 50%, left 50%, transform translate(-50%,-50%), filter blur(60px), z-index 0,
animation: glow-pulse 4s ease-in-out infinite alternate.

@keyframes glow-pulse: from {opacity:0.5; transform:translate(-50%,-50%) scale(1)}
to {opacity:1; transform:translate(-50%,-50%) scale(1.3)}

.hero-content: position relative, z-index 2, display flex, flex-direction column,
align-items center, gap 1.5rem, max-width 900px.

.logo-mark: display flex, align-items center, gap 12px, margin-bottom 1rem.
.logo-text: font-family var(--font-display), font-size 1.8rem, font-weight 800,
background var(--gradient-main), -webkit-background-clip text,
-webkit-text-fill-color transparent, background-clip text.

.hero-title: font-family var(--font-display), font-size clamp(2.5rem,7vw,6rem),
font-weight 800, line-height 1.1, background var(--gradient-main),
-webkit-background-clip text, -webkit-text-fill-color transparent, background-clip text.

.word: display inline-block, margin-right 0.25em, opacity 0,
transform translateY(60px), transition opacity 0.5s, transform 0.5s var(--transition-spring).
.word.visible: opacity 1, transform translateY(0).

.hero-subtitle: font-size clamp(1rem,2vw,1.25rem), color var(--text-secondary), max-width 500px.

HERO JAVASCRIPT:
Write function initHero() that:
1. Stagger-animates each .word span: on DOMContentLoaded, loop through words and add class
   'visible' with a setTimeout delay of index * 120ms starting after 300ms.
2. Implements gravity words: on mouseover of any .word, add CSS class .word-bouncing which
   applies @keyframes wordBounce: 0%{transform:translateY(0)} 30%{transform:translateY(10px)}
   70%{transform:translateY(-4px)} 100%{transform:translateY(0)} — duration 0.5s spring curve.
   Remove class on animationend.
3. On #hero-cta click: show #mode-tabs by setting display:flex and adding class 'fade-in',
   show #category-section by setting display:block and adding class 'fade-in',
   smoothly scroll to #category-section using scrollIntoView({behavior:'smooth'}).
4. Count-up animation for stat pills: find all .stat-pill elements, each containing a number.
   Animate count from 0 to target number over 1.5s using requestAnimationFrame with easeOut.

@keyframes fadeInUp: from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)}
.fade-in: animation: fadeInUp 0.6s var(--transition-spring) forwards.

Call initHero() inside DOMContentLoaded.

MODULE 4 PROMPT — Category Grid
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the Category Selection Grid inside the existing #category-section element.
Add new CSS and JS. Do not remove anything existing.

SECTION HTML — inject inside #category-section:
A div.section-header containing:
  - p.section-label: "Choose Your QR Type" (small, all-caps, letter-spacing 0.2em,
    color var(--text-secondary))
  - h2.section-title: "What are you encoding?" (Syne font, gradient text,
    clamp(1.8rem,4vw,3rem), font-weight 800)
  - A div.section-actions containing a button#random-category "🔀 Surprise Me"
    (small pill button style)

A div.category-grid containing all 16 category cards.

CREATE 16 CATEGORY CARDS. Each card is div.category-card with attributes:
data-category="ID" and data-color="HEX". Inside each card:
  - div.card-glow (absolutely positioned, full card, z-index -1, opacity 0,
    transitions to opacity 0.15 on hover/select)
  - div.card-icon (48x48px circle, background is the category color at 0.15 opacity,
    display flex, align items center justify-content center,
    contains: <i data-lucide="ICON_NAME" style="width:22px;height:22px;color:HEX"></i>)
  - span.card-label (Outfit font, 0.9rem, font-weight 600)

The 16 cards — format is [ID | Label | Lucide icon name | Hex color]:
text | Plain Text | type | #f59e0b
url | Website URL | globe | #3b82f6
instagram | Instagram | instagram | #e1306c
whatsapp | WhatsApp | message-circle | #25d366
email | Email | mail | #f87171
phone | Phone Call | phone | #2dd4bf
sms | SMS | message-square | #a78bfa
wifi | Wi-Fi | wifi | #38bdf8
vcard | Contact Card | contact | #fbbf24
location | Location | map-pin | #ef4444
youtube | YouTube | youtube | #ff0000
image | Image | image | #e879f9
file | File / PDF | file | #94a3b8
twitter | Twitter / X | twitter | #ffffff
linkedin | LinkedIn | linkedin | #0077b5
bizcard | Business Card | credit-card | #fcd34d

CATEGORY GRID CSS:
.category-grid: display grid, grid-template-columns repeat(4,1fr), gap 14px,
max-width 960px, margin 0 auto, margin-top 2.5rem.

.category-card: background var(--bg-card), border 1px solid var(--border),
border-radius 20px, padding 24px 16px, display flex, flex-direction column,
align-items center, justify-content center, gap 12px, cursor none,
position relative, overflow hidden,
transition transform 0.3s var(--transition-spring), box-shadow 0.3s, opacity 0.3s.

.category-card:hover: transform scale(1.04),
box-shadow 0 8px 32px rgba(0,0,0,0.5).

.category-card.selected: transform scale(1.06), opacity 1 !important.
The selected card's glow and box-shadow use the card's data-color value — this is set
dynamically by JS: card.style.boxShadow = '0 0 0 2px COLOR, 0 0 40px COLORaa'.

.category-card.dimmed: opacity 0.45, transform scale(0.95).

.card-icon: width 48px, height 48px, border-radius 50%, display flex,
align-items center, justify-content center, flex-shrink 0.

.card-label: font-size 0.85rem, font-weight 600, color var(--text-primary),
text-align center.

.card-glow: position absolute, inset 0, border-radius inherit,
opacity 0, transition opacity 0.3s, pointer-events none, z-index -1.
On .category-card:hover .card-glow: opacity 0.1.
On .category-card.selected .card-glow: opacity 0.15.

CATEGORY GRID JAVASCRIPT — write function initCategoryGrid():
1. Loop through all .category-card elements and add click listener.
2. On card click: get its data-category and data-color.
   Set currentCategory and currentCategoryColor to these values.
   Remove .selected and .dimmed from all cards.
   Add .selected to clicked card. Add .dimmed to all other cards.
   Set clicked card's boxShadow dynamically using its color.
   Set clicked card's .card-glow background to a radial-gradient using its color.
   Call updateAccentColor(color).
   Call burstParticles at card's getBoundingClientRect center (write burstParticles below).
   After 200ms setTimeout: show #form-section (display:block, add .fade-in class),
   call renderForm(data-category), smooth scroll to #form-section.
   Re-init lucide icons: lucide.createIcons().

3. Write burstParticles(x, y, color): creates 12 particle objects on #confetti-canvas
   that shoot outward from (x,y) in random directions, fade out over 600ms, then stop.
   Use requestAnimationFrame to animate. Each particle: starts at (x,y), random angle,
   speed 3-8, opacity starts 1, decays 0.025/frame, radius 3-6px, no gravity.

4. Write #random-category click handler: picks a random category card, simulates a click
   on it with a small delay for dramatic effect. Before clicking, briefly add class
   .shuffle-spin to .category-grid.

@keyframes shuffle: 0%{transform:rotate(0) scale(1)} 
50%{transform:rotate(180deg) scale(0.92)}
100%{transform:rotate(360deg) scale(1)}
.shuffle-spin: animation shuffle 0.5s var(--transition-smooth) forwards.

Call initCategoryGrid() inside DOMContentLoaded.

MODULE 5 PROMPT — Dynamic Form Engine
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the Dynamic Form Engine inside the existing #form-section element.
Add new CSS and new JS. Do not remove anything existing.

FORM SECTION HTML — inject inside #form-section:
A div.form-wrapper (max-width 680px, margin 0 auto) containing:
  - div.form-header: contains a div.form-header-icon (56px circle, glassmorphism,
    holds the category icon), h3.form-category-name (will be set by JS),
    button.change-category (small link-style button "← Change Type")
  - div.form-card (glassmorphism card: bg var(--bg-card), border var(--border),
    border-radius var(--radius-card), padding 2rem, backdrop-filter var(--blur-glass))
    Inside: div#form-body (where fields are injected by JS)
  - div.qr-options-panel (collapsible, initially collapsed, glassmorphism card style)
    - div.qr-options-toggle button "Customize QR ▾" (click toggles open/close)
    - div.qr-options-body (initially display:none) containing:
        Two .color-field divs: "QR Color" (input#qr-fg type=color value=#000000)
        and "Background" (input#qr-bg type=color value=#ffffff). Each wrapped in a
        .color-picker-wrapper (flex, gap 10px, align-items center) with a
        .color-swatch span that mirrors the input's current color.
        One .slider-field div: label "Size: <span id=size-label>256</span>px",
        input#qr-size type=range min=128 max=1024 step=128 value=256.
        One .ecc-field div: label "Error Correction", div.ecc-options with 4
        span.ecc-btn elements for L, M (default selected), Q, H.
  - button#generate-btn (full width): "Generate QR Code"
    Style: background var(--gradient-main), border none, width 100%, height 56px,
    border-radius var(--radius-btn), Syne font, font-size 1.1rem, font-weight 700,
    color white, cursor none, margin-top 1.5rem,
    transition transform 0.2s var(--transition-spring), box-shadow 0.2s.
    Hover: transform scale(1.02), box-shadow 0 0 30px rgba(124,58,237,0.5).

FORM CSS additions:
.form-field: display flex, flex-direction column, gap 8px, margin-bottom 18px.
.form-field label: font-size 0.8rem, font-weight 600, color var(--text-secondary),
letter-spacing 0.08em, text-transform uppercase.
.form-field input, .form-field textarea, .form-field select:
background rgba(255,255,255,0.06), border 1px solid var(--border), border-radius 12px,
padding 14px 18px, color var(--text-primary), font-family var(--font-body),
font-size 0.95rem, width 100%, outline none, box-sizing border-box,
transition border-color 0.2s, box-shadow 0.2s.
On focus: border-color var(--focus-color),
box-shadow 0 0 0 3px rgba from var(--focus-color) at 0.15 opacity.
.ecc-btn: padding 8px 16px, border-radius 8px, border 1px solid var(--border),
background transparent, color var(--text-secondary), font-family var(--font-body),
cursor none, transition all 0.2s.
.ecc-btn.active: background var(--gradient-main), border-color transparent, color white.
.field-note: font-size 0.78rem, color var(--text-secondary), margin-top 4px.
.preview-text: font-size 0.9rem, color var(--accent-2), padding 8px 12px,
background rgba(6,182,212,0.08), border-radius 8px, border 1px solid rgba(6,182,212,0.2).

JAVASCRIPT — write renderForm(categoryId) function:
This function clears #form-body innerHTML and injects the correct fields.
Also updates form-category-name text and form-header-icon with the category's label and color.
Use innerHTML assignment to build the form HTML.

Field HTML template for a standard text input:
<div class="form-field">
  <label for="ID">LABEL</label>
  <input type="text" id="ID" placeholder="PLACEHOLDER" autocomplete="off">
</div>

Build forms for all 16 categories:
'text': One textarea id=f-text rows=5 placeholder="Enter your message, note, or any text..."

'url': Input type=url id=f-url placeholder="https://example.com"
Plus a div.preview-text id=url-preview "Paste a URL above" that updates live on input.
Plus a small button.field-btn "Open & Test →" that opens f-url value in new tab.

'instagram': Input id=f-ig placeholder="username (without @)"
Live preview div: "instagram.com/" + typed username, updates on every keystroke.

'whatsapp': Input id=f-wa-phone placeholder="+91 98765 43210"
Textarea id=f-wa-msg placeholder="Pre-filled message (optional)" rows=3

'email': Input type=email id=f-em-to placeholder="recipient@example.com"
Input id=f-em-sub placeholder="Subject line"
Textarea id=f-em-body placeholder="Email body..." rows=4

'phone': Input type=tel id=f-phone placeholder="+1 234 567 8900"

'sms': Input type=tel id=f-sms-phone placeholder="+1 234 567 8900"
Textarea id=f-sms-msg placeholder="Your SMS message..." rows=3

'wifi': Input id=f-wifi-ssid placeholder="Network Name (SSID)"
Input type=password id=f-wifi-pass placeholder="Password"
  (add a show/hide toggle button next to it using type switching)
Select id=f-wifi-sec with options WPA, WEP, nopass
Checkbox id=f-wifi-hidden with label "Hidden Network"

'vcard': Inputs for: First Name (f-vc-fn), Last Name (f-vc-ln), Phone (f-vc-phone),
Email (f-vc-email), Organization (f-vc-org), Website (f-vc-web)

'location': Input id=f-lat placeholder="Latitude e.g. 28.6139"
Input id=f-lng placeholder="Longitude e.g. 77.2090"
Input id=f-loc-name placeholder="Place name (for your reference)"
Field note: "Find coordinates on Google Maps → right-click any location"

'youtube': Input id=f-yt placeholder="Paste YouTube URL or video ID"
Div#yt-thumb (hidden img element, shows thumbnail when video ID is detected)

'image': Input type=file id=f-image accept="image/*"
Div#img-preview (hidden, shows preview after selection)
Field note: "Large images will be described as text"

'file': Input type=file id=f-file accept="*/*"
Div#file-info (hidden, shows filename and size after selection)
Field note: "Any file type accepted — QR will contain file description"

'twitter': Input id=f-tw placeholder="username (without @)"
Live preview: "twitter.com/" + username

'linkedin': Input id=f-li placeholder="linkedin.com/in/yourprofile or just username"

'bizcard': Inputs for: Full Name (f-biz-name), Job Title (f-biz-title),
Company (f-biz-co), Phone (f-biz-phone), Email (f-biz-email),
Website (f-biz-web), Address (f-biz-addr)

After injecting HTML, reattach all event listeners for live previews,
file input changes, show/hide password toggle, etc.
Call lucide.createIcons() after rendering.

JAVASCRIPT — write getQRContent(categoryId) function:
Returns the final string to encode as QR. Logic per category:
text: return document.getElementById('f-text').value.trim()
url: val = getElementById('f-url').value.trim();
  return val.startsWith('http') ? val : 'https://' + val
instagram: return 'https://instagram.com/' + getElementById('f-ig').value.replace('@','').trim()
whatsapp: phone = getElementById('f-wa-phone').value.replace(/\D/g,'');
  msg = getElementById('f-wa-msg').value.trim();
  return 'https://wa.me/' + phone + (msg ? '?text=' + encodeURIComponent(msg) : '')
email: to=f-em-to, sub=f-em-sub, body=f-em-body
  return 'mailto:' + to + '?subject=' + encodeURIComponent(sub) + '&body=' + encodeURIComponent(body)
phone: return 'tel:' + getElementById('f-phone').value.replace(/\s/g,'')
sms: return 'sms:' + phone.replace(/\D/g,'') + '?body=' + encodeURIComponent(msg)
wifi: sec=f-wifi-sec, ssid=f-wifi-ssid, pass=f-wifi-pass, hidden=f-wifi-hidden.checked
  return 'WIFI:T:' + sec + ';S:' + ssid + ';P:' + pass + ';H:' + hidden + ';;'
vcard: construct BEGIN:VCARD\nVERSION:3.0\nFN:first last\nORG:org\nTEL:phone\nEMAIL:email\nURL:web\nEND:VCARD
location: return 'geo:' + lat + ',' + lng
youtube: extract video ID from URL using regex, return 'https://youtube.com/watch?v=' + id
image: if file selected and size < 500 bytes: return base64 data URL; else return 'Image: ' + filename
file: return 'File: ' + filename + ' (' + filesize + ')'
twitter: return 'https://twitter.com/' + getElementById('f-tw').value.replace('@','').trim()
linkedin: val = getElementById('f-li').value.trim();
  return val.startsWith('http') ? val : 'https://linkedin.com/in/' + val
bizcard: construct full vCard from all bizcard fields

Also write validateForm(categoryId): returns true/false. If false, shakes the form-card
using @keyframes shake: 0%{transform:translateX(0)} 25%{transform:translateX(-8px)}
75%{transform:translateX(8px)} 100%{transform:translateX(0)} — duration 0.4s.
Shows a red .error-msg div under the empty required field.

Wire up .change-category click to hide #form-section, show #category-section.
Wire up .ecc-btn clicks to toggle .active class among siblings.
Wire up #qr-size input to update #size-label text on input event.
Wire up color inputs to update their .color-swatch background colors.
Wire up .qr-options-toggle to toggle .qr-options-body display.

MODULE 6 PROMPT — QR Generation Core
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add QR Generation using the qrcode.js library already loaded in the page.
Add new CSS and JS. Do not remove anything existing.

OUTPUT SECTION HTML — inject inside #output-section:
A div.output-wrapper (max-width 680px, margin 0 auto) containing:
  - div.output-card (same glassmorphism style as form-card, padding 2.5rem,
    display flex, flex-direction column, align-items center, gap 24px)
    Inside:
    - p.output-label: small label "Your QR Code" (all-caps, letter-spacing, secondary color)
    - div#qr-container (position relative, display inline-block, border-radius 16px,
      overflow hidden, cursor none)
    - div#qr-info: shows the category name and truncated content that was encoded
      (e.g. "WhatsApp · https://wa.me/91...")
    - div.download-row (flex, gap 10px, flex-wrap wrap, justify-content center)
      Four buttons: id=dl-png "⬇ PNG", id=dl-svg "⬇ SVG", id=dl-pdf "⬇ PDF",
      id=dl-copy "⎘ Copy". Style them as .dl-btn.
    - p.output-footer-note: "No watermarks · No account needed · 100% free"
      (small, secondary color)
    - button#make-another "← Make Another QR"
      (outlined button style: border 1px solid var(--border), bg transparent,
      Outfit font, color var(--text-primary), padding 12px 28px, border-radius var(--radius-btn))

OUTPUT SECTION CSS:
#qr-container: display inline-block, position relative, border-radius 16px, overflow hidden,
--qr-glow: var(--accent-1) as default, transition box-shadow 0.5s.

#qr-container.revealed: box-shadow 0 0 50px rgba(124,58,237,0.4), 0 0 100px rgba(6,182,212,0.15),
animation qr-breathe 3s ease-in-out infinite.

@keyframes qr-breathe:
0%,100% { box-shadow: 0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.1) }
50% { box-shadow: 0 0 70px rgba(124,58,237,0.5), 0 0 140px rgba(6,182,212,0.2) }

.dl-btn: background rgba(255,255,255,0.08), border 1px solid var(--border),
border-radius 10px, padding 12px 22px, color var(--text-primary), font-family var(--font-body),
font-size 0.88rem, font-weight 600, cursor none, transition all 0.2s,
display flex, align-items center, gap 6px.
.dl-btn:hover: background rgba(255,255,255,0.14), transform translateY(-2px),
box-shadow 0 4px 20px rgba(0,0,0,0.3).
#dl-png: background var(--gradient-main), border-color transparent,
box-shadow 0 0 20px rgba(124,58,237,0.25).

.btn-pop keyframe: 0%{transform:scale(1)} 40%{transform:scale(1.12)} 70%{transform:scale(0.96)} 100%{transform:scale(1)}

GENERATE BUTTON JAVASCRIPT:
Write function generateQR() called when #generate-btn is clicked:

1. Call validateForm(currentCategory). If returns false, return early.
2. Get content = getQRContent(currentCategory). If empty, return early.
3. Get options: fgColor from #qr-fg value, bgColor from #qr-bg value,
   size from Number(#qr-size.value) default 256,
   errorLevel from document.querySelector('.ecc-btn.active').textContent default 'M'.
4. Set #generate-btn to loading state: innerHTML = '<span class="btn-spinner"></span> Generating...',
   disabled = true.
5. Clear #qr-container innerHTML.
6. setTimeout 100ms then:
   new QRCode(document.getElementById('qr-container'), {
     text: content, width: size, height: size,
     colorDark: fgColor, colorLight: bgColor,
     correctLevel: QRCode.CorrectLevel[errorLevel]
   });
7. setTimeout 400ms then:
   Restore #generate-btn text to "Generate QR Code", disabled = false.
   Update #qr-info text.
   Show #output-section (display:block, add .fade-in).
   Call showQRReveal() — the bloom animation (Module 7 will implement this but add a stub here).
   Scroll to #output-section smoothly.
   Call saveToHistory(currentCategory, content, null) (Module 9 stub).

Write #make-another click handler: smooth scroll back to #form-section.
Write #dl-png, #dl-svg, #dl-pdf, #dl-copy click handlers as stubs that just log for now
(Module 8 will fill these in).

CSS for .btn-spinner: display inline-block, width 14px, height 14px, border-radius 50%,
border 2px solid rgba(255,255,255,0.3), border-top-color white,
animation spin 0.7s linear infinite.
@keyframes spin: to { transform: rotate(360deg) }

Write stub functions: showQRReveal() (empty), saveToHistory() (empty),
launchConfetti() (empty). These will be replaced by later modules.

MODULE 7 PROMPT — QR Reveal Animation + Confetti System
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add all reveal animations, confetti, and the glitch easter egg.
Replace the stub functions showQRReveal() and launchConfetti() with real implementations.
Add new CSS and update existing JS. Do not remove anything.

IMPLEMENT showQRReveal():
This function fires after the QR is generated and #output-section is shown.

Step 1 (immediate): Add class 'blooming' to #qr-container.
CSS .blooming: clip-path circle(0% at center), transition: clip-path 0.7s ease-out.
Then in the next animation frame (requestAnimationFrame), add class 'bloom-open':
CSS .bloom-open: clip-path circle(75% at center).

Step 2 (at 300ms): Remove 'blooming' and 'bloom-open' classes.
Add class 'revealed' to #qr-container which applies the qr-breathe glow animation.

Step 3 (at 500ms): Create a div.ring-pulse absolutely positioned over #qr-container.
Its size equals the QR container's offsetWidth.
CSS .ring-pulse: position absolute, top 0, left 0, width 100%, height 100%,
border-radius 50%, background radial-gradient(circle, transparent 40%, COLOR 41%, transparent 60%),
opacity 0.7, pointer-events none, animation ring-expand 0.8s ease-out forwards.
@keyframes ring-expand: from{transform:scale(1); opacity:0.7} to{transform:scale(2.2); opacity:0}
After animation ends, remove the element.
Use currentCategoryColor for COLOR (set as inline style).

Step 4 (at 700ms): Call launchConfetti() centered on the QR container position.

IMPLEMENT launchConfetti(x, y, color):
If x and y are not provided, use the center of #qr-container via getBoundingClientRect.
If color is not provided, use currentCategoryColor.

Create 22 confetti particles on #confetti-canvas:
Each particle: { x, y, vx: random direction * speed 5-13, vy: random -8 to -14 (upward launch),
radius: random 4-10, color: random pick from [color, '#f59e0b', '#06b6d4', '#e879f9', '#3b82f6'],
rotation: random 0-360, rotSpeed: random -6 to 6,
shape: random pick 'rect' or 'circle', opacity: 1 }

Animation loop (requestAnimationFrame):
Each frame: clear confetti canvas. For each particle:
  vy += 0.4 (gravity). x += vx. y += vy. rotation += rotSpeed. opacity -= 0.013.
  Draw: save ctx, translate to particle position, rotate, draw rect (8x8) or circle,
  restore. Use ctx.globalAlpha = particle.opacity.
Remove particles with opacity <= 0. Stop loop when array empty.
Store as a separate animation loop variable so it doesn't conflict with particle background.

GLITCH EASTER EGG:
Write function scheduleGlitch():
  const delay = Math.random() * 4000 + 7000; // 7-11 seconds random
  setTimeout(() => {
    if (document.getElementById('qr-container').classList.contains('revealed')) {
      document.getElementById('qr-container').classList.add('glitching');
      setTimeout(() => {
        document.getElementById('qr-container').classList.remove('glitching');
      }, 220);
    }
    scheduleGlitch(); // reschedule
  }, delay);
Call scheduleGlitch() after the first QR is generated.

CSS @keyframes glitch:
0% { transform: translate(0) }
15% { transform: translate(-3px, 1px); filter: hue-rotate(90deg) }
30% { transform: translate(3px, -1px); filter: hue-rotate(-90deg) saturate(2) }
50% { transform: translate(-2px, 2px); filter: brightness(1.3) }
70% { transform: translate(2px, -2px); filter: hue-rotate(180deg) }
85% { transform: translate(-1px, 1px); filter: saturate(0.5) }
100% { transform: translate(0); filter: none }
.glitching: animation glitch 0.22s steps(3) forwards.

DOWNLOAD BUTTON EXPLOSION:
Add to download button click handlers: after clicking any .dl-btn:
Get button's getBoundingClientRect center, call launchConfetti(centerX, centerY, currentCategoryColor).
Add class .btn-pop to the button element, remove after 400ms.

MODULE 8 PROMPT — Download & Export System
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Implement the complete download and export system. Fill in the stub download functions.
Add new JS. Do not remove anything.

IMPLEMENT downloadPNG() — called when #dl-png is clicked:
Get the canvas element inside #qr-container using:
  const qrCanvas = document.querySelector('#qr-container canvas');
If canvas exists: use qrCanvas.toDataURL('image/png') to get data URL.
If only img exists (qrcode.js sometimes makes img): draw it on a temp canvas first.
Create <a> element, set href to data URL, set download attribute to
  'qrcraft-' + currentCategory + '-' + Date.now() + '.png'.
Programmatically click the link, remove it. Done.

IMPLEMENT downloadSVG() — called when #dl-svg is clicked:
Get the QR canvas (same as above). Convert to data URL.
Create SVG string:
  const svgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">'
    + '<image href="' + dataURL + '" width="' + W + '" height="' + H + '"/>'
    + '</svg>';
Create Blob: new Blob([svgStr], {type:'image/svg+xml'}).
Create object URL, create <a> link, trigger download as .svg file, revoke object URL.

IMPLEMENT downloadPDF() — called when #dl-pdf is clicked:
Use html2canvas to capture #output-section div:
  html2canvas(document.querySelector('.output-card'), {
    backgroundColor: '#0a0a0f', scale: 2
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    // Build minimal PDF manually:
    // Create a new window with just the QR and title, then trigger window.print()
    // This is the most reliable cross-browser approach.
    const printWin = window.open('', '_blank');
    printWin.document.write('<html><head><title>QRcraft Export</title>'
      + '<style>body{background:#0a0a0f;display:flex;align-items:center;'
      + 'justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;color:white;}'
      + '.qr-print{text-align:center;padding:40px;}'
      + 'img{max-width:400px;border-radius:12px;}'
      + 'p{margin-top:16px;opacity:0.6;font-size:14px;}'
      + '</style></head><body>'
      + '<div class="qr-print"><img src="' + imgData + '">'
      + '<p>Generated by QRcraft · ' + currentCategory.toUpperCase() + '</p>'
      + '</div></body></html>');
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  });

IMPLEMENT copyToClipboard() — called when #dl-copy is clicked:
Method 1 (modern): Get QR canvas, convert to blob using canvas.toBlob(blob => {...}),
then: navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
  Show success feedback on button: button.textContent = '✓ Copied!';
  setTimeout(() => button.textContent = '⎘ Copy', 2000);
}).catch(err => fallback());
Method 2 (fallback): Get data URL, create a textarea with the URL,
  append to body, select all, copy, remove. Show different success message.

Wire up all button click events properly now — replace stub listeners with real ones.
Each download also:
  1. Calls launchConfetti() using the button's getBoundingClientRect center
  2. Adds class .btn-pop to the button temporarily

Also implement showToast(message, duration=2500):
  Creates div.toast with message, appends to body, adds class .toast-visible after 50ms.
  Removes after duration. Use for copy success, error messages, etc.
  CSS .toast: position fixed, bottom 2rem, left 50%, transform translateX(-50%) translateY(20px),
  background rgba(15,15,25,0.95), border 1px solid var(--border),
  backdrop-filter var(--blur-glass), border-radius 100px, padding 12px 28px,
  z-index 5000, Outfit font, font-size 0.9rem, opacity 0, transition all 0.3s,
  white-space nowrap, pointer-events none.
  .toast.toast-visible: opacity 1, transform translateX(-50%) translateY(0).

MODULE 9 PROMPT — History System
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the complete QR History system with a slide-in drawer.
Add HTML inside #history-drawer, new CSS, and new JS. Do not remove anything.

HISTORY DRAWER HTML — inject inside #history-drawer:
A div.drawer-overlay (position fixed, full screen, background rgba(0,0,0,0.6),
z-index 500, opacity 0, transition opacity 0.3s, pointer-events none initially).
A div.drawer-panel (position fixed, top 0, right 0, height 100vh, width 360px,
background #0e0e18, border-left 1px solid var(--border), z-index 501,
transform translateX(100%), transition transform 0.35s var(--transition-spring),
display flex, flex-direction column, overflow hidden).

Inside drawer-panel:
  - div.drawer-header: padding 1.5rem, border-bottom 1px solid var(--border),
    display flex, justify-content space-between, align-items center.
    Contains h3 "Recent QR Codes" (Syne font, 1.1rem), and div with buttons:
    button#clear-history "Clear All" (small danger style, red-tinted),
    button#close-drawer "×" (icon button).
  - div.drawer-body (flex 1, overflow-y auto, padding 1rem).
    Contains div#history-list (where items are rendered).
    And div#history-empty (shown when list is empty): centered empty state with
    a CSS-drawn QR frame (just borders making a square outline), text "No history yet",
    subtext "Generated QR codes will appear here".
  - A floating button#history-toggle (position fixed, bottom 1.5rem, right 1.5rem,
    width 52px, height 52px, border-radius 50%, background var(--gradient-main),
    border none, z-index 400, cursor none, box-shadow 0 4px 20px rgba(124,58,237,0.4),
    display flex, align-items center, justify-content center, font-size 1.2rem)
    containing 🕐 or a clock lucide icon.

HISTORY ITEM HTML (generated by JS):
Each item is a div.history-item with data-id attribute:
  - img.hist-thumb (width 56px, height 56px, border-radius 8px, object-fit contain,
    background white, flex-shrink 0)
  - div.hist-info: div.hist-meta (colored dot + category label + relative time),
    p.hist-content (content preview, max 45 chars, truncated with ellipsis)
  - div.hist-actions: button.hist-restore "Restore", button.hist-delete "×"

DRAWER CSS:
.drawer-panel.open: transform translateX(0).
.drawer-overlay.open: opacity 1, pointer-events all.
.history-item: display flex, align-items center, gap 12px, padding 12px,
border-radius 12px, border 1px solid var(--border), margin-bottom 8px, cursor none,
transition background 0.2s. Hover: background rgba(255,255,255,0.04).
.hist-restore: small pill button, background rgba(124,58,237,0.15), border none,
border-radius 6px, padding 6px 12px, color var(--accent-1), font-size 0.8rem, cursor none.
.hist-delete: small button, background transparent, border none, color var(--text-secondary),
font-size 1.1rem, cursor none, padding 4px 8px. Hover: color #ef4444.

HISTORY JAVASCRIPT:
Write saveToHistory(category, content, thumbnailDataURL):
  Load array from localStorage.getItem('qrcraft_history'), JSON.parse (default []).
  Create new item object with all fields. Prepend with unshift().
  If length > 10: pop().
  localStorage.setItem('qrcraft_history', JSON.stringify(arr)).
  Call renderHistoryItems(arr) to refresh drawer.

Write loadHistory(): parse from localStorage, call renderHistoryItems(items).

Write renderHistoryItems(items):
  Clear #history-list innerHTML.
  Show/hide #history-empty based on items.length.
  For each item: build HTML string for .history-item, set innerHTML via document fragment.
  Attach event listeners for .hist-restore and .hist-delete.

Write deleteHistoryItem(id):
  Filter item out of localStorage array, re-save.
  Animate the item element: add a class .removing (transform translateX(100%), opacity 0,
  transition 0.3s) then after 300ms remove the element and call renderHistoryItems.

Write restoreHistoryItem(id):
  Find item in array. Set currentCategory, currentCategoryColor.
  Re-select category card. Call renderForm(category).
  Set form field values by parsing item.content back to fields (best effort).
  Close drawer. Scroll to form section.

Write openDrawer(), closeDrawer() functions that toggle .open class on
.drawer-panel and .drawer-overlay.

Wire up #history-toggle click → openDrawer().
Wire up #close-drawer click → closeDrawer().
Wire up .drawer-overlay click → closeDrawer().
Wire up #clear-history click → confirm dialog → clear localStorage → renderHistoryItems([]).

GENERATE THUMBNAIL:
After QR is generated (in generateQR function), get the QR canvas, draw scaled down
to a 64x64 offscreen canvas, get data URL, pass to saveToHistory.
Update saveToHistory call in generateQR to pass the thumbnail.
Call loadHistory() once on DOMContentLoaded.

MODULE 10 PROMPT — QR Scanner
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add the QR Code Scanner functionality. Wire up the #mode-tabs and #scanner-section.
Add new CSS and JS. Do not remove anything.

MODE TABS HTML — inject inside #mode-tabs:
Two button.tab-btn elements: data-tab="create" with text "✦ Create QR" (active by default)
and data-tab="scan" with text "◈ Scan QR Code".
CSS: #mode-tabs: display flex, justify-content center, gap 8px, padding 1.5rem 1rem, z-index 2.
.tab-btn: padding 12px 28px, border-radius 100px, border 1px solid var(--border),
background rgba(255,255,255,0.05), color var(--text-secondary), font-family var(--font-body),
font-size 0.95rem, font-weight 600, cursor none, transition all 0.25s.
.tab-btn.active: background var(--gradient-main), border-color transparent,
color white, box-shadow 0 0 20px rgba(124,58,237,0.3).

Tab switching JS:
Tab 'create' shows #category-section, #form-section (if category selected), hides #scanner-section.
Tab 'scan' shows #scanner-section, hides #category-section, #form-section, #output-section,
then calls initScanner() if camera not yet started.

SCANNER SECTION HTML — inject inside #scanner-section:
A div.scanner-wrapper (max-width 520px, margin 0 auto, display flex, flex-direction column, gap 24px):
  - h2.scanner-title "Scan Any QR Code" (Syne font, gradient text, centered)
  - p.scanner-sub "Point your camera at a QR code to decode it instantly"
  - div.scanner-card (glassmorphism):
      div.video-wrapper (position relative, border-radius 20px, overflow hidden,
        width 100%, aspect-ratio 1/1, background #111):
        video#scanner-video (width 100%, height 100%, object-fit cover,
          autoplay, playsinline, muted attributes)
        canvas#scanner-canvas (display none, position absolute, top 0, left 0)
        div.scan-frame: absolutely positioned over video, pointer-events none.
          Four div.corner elements positioned at each corner using absolute positioning.
          Each .corner is 24px square with two 3px borders (top+left, top+right, etc.)
          using currentCategoryColor. CSS: corner animation pulsing opacity.
          A div.scan-line: absolutely positioned horizontal bar (height 2px,
          background linear-gradient, width 80%, centered horizontally)
          that animates top 10% to 90% repeatedly over 2s linear infinite.
  - div#scan-result (display none, glassmorphism card style):
      div.result-header: ✓ icon + "QR Code Detected!" heading
      p#result-content (the decoded text, word-break break-all)
      div.result-actions: button#result-copy "Copy Text", button#result-open "Open Link"
        (result-open hidden if not a URL)
  - div.scanner-controls: button#start-scanner "Start Camera",
    button#stop-scanner "Stop" (initially hidden)
  - div#scanner-error (hidden): error message for camera permission denied.

SCANNER JAVASCRIPT:
Write initScanner():
  If already running, return. Request camera:
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}}})
    .then(stream => {
      scanStream = stream;
      video.srcObject = stream;
      video.play();
      video.addEventListener('loadedmetadata', () => {
        scannerCanvas.width = video.videoWidth;
        scannerCanvas.height = video.videoHeight;
        scanLoop();
      });
      Show #stop-scanner button, hide #start-scanner.
    })
    .catch(err => {
      Show #scanner-error with message based on err.name:
      If NotAllowedError: "Camera permission denied. Please allow camera access and try again."
      If NotFoundError: "No camera found on this device."
      Default: "Could not access camera: " + err.message
    });

Write scanLoop():
  Get imageData from scannerCanvas context: draw video frame, then getImageData.
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  If code and code.data:
    stopScanner(). Show #scan-result.
    Set #result-content.textContent = code.data.
    Flash video wrapper green for 0.5s (add class .scan-success which adds green border).
    If code.data starts with 'http': show #result-open and set its href.
    Call burstParticles at video center.
    Call showToast('QR Decoded! 🎯');
  Else: requestAnimationFrame(scanLoop).

Write stopScanner(): stop all video tracks, clear srcObject, show #start-scanner, hide #stop-scanner.
Wire #start-scanner click → initScanner().
Wire #stop-scanner click → stopScanner().
Wire #result-copy → copy #result-content text → showToast('Copied!').
Wire #result-open → window.open(code.data, '_blank').

CSS additions:
.scan-line: position absolute, left 10%, width 80%, height 2px,
background linear-gradient(90deg, transparent, var(--accent-2), transparent),
animation scanMove 2s linear infinite.
@keyframes scanMove: 0%{top:10%} 50%{top:88%} 100%{top:10%}
.scan-success: border 3px solid #25d366 !important, box-shadow 0 0 30px rgba(37,211,102,0.4)

MODULE 11 PROMPT — Surprising Animations Layer
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

Add all the easter eggs and surprising interactive animations that make QRcraft feel alive.
Add new CSS and new JS only. Do not remove anything.

EASTER EGG 1 — FLYING EMOJIS WHILE TYPING:
Define a map of category emojis:
const categoryEmojis = { text:'✍️', url:'🌐', instagram:'📸', whatsapp:'💬', email:'📧',
phone:'📱', sms:'💬', wifi:'📶', vcard:'👤', location:'📍', youtube:'▶️',
image:'🖼️', file:'📁', twitter:'🐦', linkedin:'💼', bizcard:'💳' };

Write function launchFlyingEmoji(emoji, startX, startY):
  Create div.flying-emoji: position fixed, font-size 2rem, pointer-events none,
  z-index 800, left startX px, top startY px.
  Animate using requestAnimationFrame physics arc over 1200ms:
  the emoji starts at (startX, startY), moves with vx=4 to 8, vy=-6 to -10,
  gravity adds 0.3 to vy each frame, opacity fades after 600ms.
  Remove element when opacity <= 0 or off screen.

Track keypresses in all form inputs with a module-level charCounter variable.
On every 'input' event on form fields: increment charCounter.
Every 20 characters: get the active input's getBoundingClientRect,
call launchFlyingEmoji(categoryEmojis[currentCategory], rect.right, rect.top).
Reset charCounter to 0.

EASTER EGG 2 — GRAVITY WORDS (already partially set up in Module 3):
Ensure each .word span in .hero-title has a mouseover listener that adds .word-bouncing class.
Remove class on animationend. Make sure CSS @keyframes wordBounce is defined.

EASTER EGG 3 — IDLE QR RAIN:
Track last interaction time: update on mousemove, keydown, click.
Use setInterval every 500ms to check: if Date.now() - lastInteraction > 12000
and #qr-container has .revealed class (QR is visible) and !isRaining:
  Start rain: set isRaining = true, create div#qr-rain (position fixed, top 0, left 0,
  width 100%, height 100%, pointer-events none, z-index 2, overflow hidden).
  Every 300ms create a new div.rain-sq: position absolute, top -20px,
  left random 0-100vw, width random 5-12px, height same, border-radius 2px,
  background currentCategoryColor, opacity 0.12,
  animation fall-sq linear forwards with random duration 3-6s.
  @keyframes fall-sq: from{transform:translateY(-20px)} to{transform:translateY(110vh)}
  Max 35 squares. Remove oldest if more.

On any user interaction when isRaining:
  isRaining = false. Fade out #qr-rain: add opacity:0 transition 0.5s, then remove element.
  Clear the rain interval.

EASTER EGG 4 — CATEGORY SHUFFLE SPIN:
Track rapid category clicks: rapidClickCount and rapidClickTimer.
On any category card click: increment rapidClickCount.
If rapidClickCount === 1: set rapidClickTimer = setTimeout(() => rapidClickCount=0, 2000).
If rapidClickCount >= 4:
  Clear timer. Reset count.
  Add .shuffle-spin to .category-grid, remove after 550ms.
  Call showToast('Explorer mode unlocked! 🔍').

EASTER EGG 5 — MAGNETIC BUTTONS:
For all .dl-btn and #generate-btn and #hero-cta elements, add mousemove listener:
  Get button's getBoundingClientRect center. Calculate mouse offset from center.
  If mouse is within the button bounds: apply transform to button:
  translateX(dx * 0.25) translateY(dy * 0.25) where dx/dy are distances from center.
  On mouseleave: transition back to transform: translate(0,0) with 0.3s spring.
  This creates the magnetic hover effect.

EASTER EGG 6 — COLOR WAVE ON GENERATE:
When #generate-btn is clicked (add to existing click handler):
  Create div.btn-wave: position absolute over button, same size, border-radius inherit,
  background: radial-gradient(circle, currentCategoryColor 0%, transparent 70%), opacity 0.5.
  Animate: transform scale(1) to scale(2.5), opacity 0.5 to 0 over 0.5s ease-out.
  Remove after animation.
  The button needs position:relative for this to work — add that to #generate-btn CSS.

TOAST NOTIFICATION IMPROVEMENTS:
If showToast function already exists, enhance it:
  Support a second parameter 'type': 'success' (green tint), 'error' (red tint), 'info' (default).
  Add a small icon prefix based on type: ✓ for success, ✕ for error, ℹ for info.
  Ensure toasts stack properly if called multiple times quickly (use a toast queue).

PAGE-LEVEL COLOR ATMOSPHERE:
On category selection, smoothly update the page's ambient background:
  Set a CSS variable --ambient-color to currentCategoryColor.
  Apply a very subtle radial-gradient at the top of the page using this color:
  Add/update a style on body::before: position fixed, top 0, left 50%, transform translateX(-50%),
  width 80vw, height 50vh, background radial-gradient(ellipse, rgba(COLOR,0.06) 0%, transparent 70%),
  z-index 0, pointer-events none, transition background 1s ease.
  This gives the page a gentle color "aura" matching the current category.

MODULE 12 PROMPT — Mobile, Polish & Final Touches
I am building QRcraft. Here is my current index.html: [PASTE YOUR FILE HERE]

This is the final polish pass. Add mobile responsiveness, performance optimizations,
loading screen, SEO, and finishing touches. Do not remove anything.

RESPONSIVE CSS — add media queries:

At max-width: 1024px:
  .category-grid: grid-template-columns repeat(3,1fr)

At max-width: 768px:
  .category-grid: grid-template-columns repeat(2,1fr), gap 10px
  .category-card: padding 18px 12px
  .hero-title: font-size clamp(2rem,9vw,3.5rem)
  .drawer-panel: width 100vw
  .download-row: flex-direction column, align-items stretch
  .dl-btn: justify-content center
  .hero-stats: flex-wrap wrap, gap 8px
  #form-section, #output-section, #category-section: padding 2rem 1rem
  .form-card, .output-card: padding 1.5rem 1rem
  .scanner-wrapper: padding 0 1rem
  .mode-tabs: padding 1.5rem 1rem
  #hero-cta: padding 15px 32px, font-size 1rem

At max-width: 480px:
  .category-grid: grid-template-columns repeat(2,1fr), gap 8px
  .category-card: padding 14px 8px
  .card-icon: width 40px, height 40px
  .card-label: font-size 0.78rem
  #history-drawer .drawer-panel: width 100vw

TOUCH INTERACTIONS:
Detect touch devices: const isTouch = 'ontouchstart' in window.
If isTouch is true: hide #cursor-dot and #cursor-ring via display:none.
For .category-card on touch: touchstart adds :hover equivalent class .touch-active,
touchend removes it after 150ms (so the hover glow effect shows briefly on tap).
Disable the magnetic button effect on touch (it doesn't make sense for touch).
Ensure all interactive elements are at least 44px tall for accessibility.

PERFORMANCE OPTIMIZATIONS:
If window.innerWidth < 768: reduce particle count to 50 (update initParticles).
If window.innerWidth < 768: skip drawing particle connection lines (check in draw loop).
Add will-change: transform to: .category-card, #cursor-dot, #cursor-ring, .flying-emoji.
Use passive: true on all scroll, touchstart, touchmove event listeners.
Throttle mousemove handler: only process if 16ms have passed since last processing
(use a timestamp variable: if Date.now() - lastMove < 16 return; lastMove = Date.now()).

LOADING SCREEN:
#loading-screen HTML (inject inside #loading-screen):
  A div.loading-content (flex column, centered, gap 20px):
    div.loading-logo: the QRcraft logo SVG (same as hero)
    div.loading-bar-wrapper (width 200px, height 3px, background rgba(255,255,255,0.1),
      border-radius 100px, overflow hidden):
      div.loading-bar (height 100%, background var(--gradient-main), width 0%,
        animation: load-progress 1.2s ease-in-out forwards)
    p.loading-text "Initializing QRcraft..." (small, secondary color)

@keyframes load-progress: from{width:0%} to{width:100%}

#loading-screen CSS: position fixed, inset 0, background var(--bg), z-index 10000,
display flex, align-items center, justify-content center,
transition opacity 0.4s.

JS: After DOMContentLoaded plus 1.4s setTimeout:
  loadingScreen.style.opacity = '0';
  After another 400ms: loadingScreen.style.display = 'none';
  Then start all hero entrance animations.

FOOTER HTML — inject inside #main-footer:
  CSS: background #080810, border-top 1px solid var(--border), padding 3rem 1.5rem,
  text-align center.
  div.footer-brand: "QRcraft" in gradient text, Syne font, 1.5rem.
  p.footer-tagline: "Create beautiful QR codes. Zero tracking. Zero watermarks."
  div.footer-categories: a row of .cat-pill elements for all 16 categories
    (small pills that on click scroll to category section and select that category).
    CSS: display flex, flex-wrap wrap, justify-content center, gap 8px, margin 1.5rem 0.
    Each .cat-pill: small pill style with the category's color as border-color.
  p.footer-note: "Built with pure HTML, CSS & JS · Works offline · Open & free forever"
    (small, secondary color, margin-top 1rem)

SEO META TAGS — add inside <head>:
  <meta name="description" content="QRcraft — The most creative QR code generator.
    Create QR codes for text, URLs, Instagram, WhatsApp, Wi-Fi, vCards, and 10+ more
    categories. Beautiful animations, instant download, 100% free.">
  <meta property="og:title" content="QRcraft — Creative QR Code Generator">
  <meta property="og:description" content="16 categories. Cinematic animations.
    Zero watermarks. Create QR codes that feel like art.">
  <meta name="theme-color" content="#0a0a0f">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%237c3aed'/><rect x='6' y='6' width='8' height='8' rx='1' fill='white'/><rect x='18' y='6' width='8' height='8' rx='1' fill='white'/><rect x='6' y='18' width='8' height='8' rx='1' fill='white'/><rect x='18' y='18' width='4' height='4' rx='1' fill='white'/><rect x='24' y='22' width='2' height='4' rx='1' fill='white'/><rect x='20' y='24' width='4' height='2' rx='1' fill='white'/></svg>">

FINAL ACCESSIBILITY:
Add aria-label to all icon-only buttons: #history-toggle aria-label="View History",
#close-drawer aria-label="Close History", #stop-scanner aria-label="Stop Camera",
.hist-delete aria-label="Delete from history", .hist-restore aria-label="Restore QR".
Add role="button" and tabindex="0" to .category-card elements.
Add keyboard handler: on keydown Enter/Space on .category-card, trigger its click.

FINAL SCROLL ANIMATIONS using IntersectionObserver:
Observe .category-card elements. When they enter viewport:
  Add class .card-in-view: opacity 1, transform translateY(0).
  Initial state (not in view): opacity 0, transform translateY(24px), transition 0.4s.
  Add staggered delay: i * 0.05s per card index using inline style transition-delay.
This makes cards animate in like a cascade as the page scrolls.

10. QR CATEGORY LOGIC REFERENCE
This quick reference table shows the exact format of the encoded string for each category.
You can refer to this when debugging or manually testing QR outputs.
CategoryEncoded FormatExampleTextRaw stringHello, world!URLhttps://url.comhttps://example.comInstagramhttps://instagram.com/USERNAMEhttps://instagram.com/nasaWhatsApphttps://wa.me/PHONE?text=MSGhttps://wa.me/919876543210Emailmailto:TO?subject=S&body=Bmailto:hi@example.com?subject=HeyPhonetel:+NUMBERtel:+12345678900SMSsms:+NUMBER?body=MSGsms:+12345678900?body=HelloWi-FiWIFI:T:WPA;S:SSID;P:PASS;H:false;;WIFI:T:WPA;S:HomeNet;P:mypass;;vCardBEGIN:VCARD ... END:VCARDFull vCard 3.0 stringLocationgeo:LAT,LNGgeo:28.6139,77.2090YouTubehttps://youtube.com/watch?v=IDhttps://youtube.com/watch?v=dQw4w9WgXcQImagetiny: base64, large: filename textImage: photo.jpg (2.4 MB)FileFile: filename (size)File: report.pdf (1.2 MB)Twitter/Xhttps://twitter.com/USERNAMEhttps://twitter.com/nasaLinkedInhttps://linkedin.com/in/USERNAMEhttps://linkedin.com/in/yournameBiz CardBEGIN:VCARD ... END:VCARDFull vCard with all fields

11. CURSOR & PARTICLE FX CODE REFERENCE
If the AI needs exact lerp cursor code, use this as reference to paste in your prompts:
javascript// Lerp cursor ring — smooth lag effect
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
const LERP = 0.14; // Lower = more lag and smoothness

function animateCursorRing() {
  ringX += (mouseX - ringX) * LERP;
  ringY += (mouseY - ringY) * LERP;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursorRing);
}

// Particle mouse repel — natural-feeling pushback
// Inside particle update loop (px, py = particle position, mouseX/Y = cursor):
const dx = px - mouseX, dy = py - mouseY;
const dist = Math.sqrt(dx*dx + dy*dy);
if (dist < 100) {
  const force = (100 - dist) / 100 * 0.35;
  particle.vx += (dx / dist) * force;
  particle.vy += (dy / dist) * force;
}
particle.vx *= 0.97; // damping — prevents runaway acceleration
particle.vy *= 0.97;

12. EXTRA SURPRISING ANIMATION IDEAS
If you want to go further after Module 11, give these ideas to the AI as individual add-on prompts.
QR Heartbeat. The generated QR container pulses its scale very subtly (1.0 to 1.003 and back)
on a 1-second cycle. So subtle users don't consciously notice but subconsciously feel the QR is
"alive." Give the AI: "Add a very subtle heartbeat CSS animation to #qr-container.revealed that
scales between 1 and 1.003 every 1 second."
Type-To-Preview Live QR. For URL, Instagram, and Twitter categories, as the user types the
input, a tiny low-quality live QR preview updates in real time in a small thumbnail below the
input. This makes the form feel hyper-responsive and magical. Give the AI: "Add a live QR preview
that regenerates as the user types in the URL, Instagram, and Twitter inputs."
Konami Code Easter Egg. If the user types ↑↑↓↓←→←→BA, the entire site briefly goes into
"retro mode" — colors invert, a pixelated font replaces all text, for exactly 3 seconds before
reverting. Give the AI: "Add a Konami code detector. When triggered, add a class .retro-mode to
body for 3 seconds that inverts colors and uses a monospace pixel font."
Web Share API. After generation, a "Share QR" button on mobile uses navigator.share() to
share the QR image directly to other apps. Give the AI: "Add a Share button in the output section.
If navigator.share and navigator.canShare are available, use the Web Share API to share the QR
canvas as a PNG file. On desktop, fall back to showing a download prompt."

13. DEPLOYMENT GUIDE
Option A — Vercel (Recommended, 2 minutes). Go to vercel.com. Click "Add New Project." If
you have a GitHub repo, connect it and Vercel auto-deploys on every push. If you just have a
folder on your computer, install Vercel CLI with npm install -g vercel, navigate to your project
folder, run vercel, follow the prompts. You get a free .vercel.app URL instantly.
Option B — Netlify (Drag & Drop, 1 minute). Go to netlify.com. Click "Deploy manually." Drag
your entire project folder onto the deploy area. Done. You get a free .netlify.app URL. Adding a
custom domain is also free.
Option C — GitHub Pages (Free Forever). Create a GitHub repository, push all your files,
go to repository Settings → Pages → Source → select main branch and root folder. Save. Your site
is live at yourusername.github.io/your-repo-name within a few minutes.
No Build Step Needed. Since QRcraft uses zero frameworks and zero build tools, there is no
npm install, no npm run build, no Webpack, no Vite — nothing. Your project is HTML, CSS, and
JS files. Drag and drop to deploy. It just works.
Custom Domain (Optional). All three services above support custom domains for free. Buy a
domain from Namecheap or Cloudflare Domains, point the DNS to your host's name servers (each
service gives you exact instructions), and your site is live at yourname.com within 24 hours.

🚀 QUICK START — 5-STEP SUMMARY
Step 1. Open Claude, GPT-4, or Cursor. Start a fresh new conversation.
Step 2. Paste the Module 1 prompt exactly. Get back index.html. Save it to a folder on your
computer.
Step 3. For every subsequent module (2 through 12), start your message to the AI like this:
"I am building QRcraft. Here is my current index.html: [paste your entire current file here].
Now add Module X: [paste the module prompt]." This ensures the AI always has full context.
Step 4. After receiving the updated file from the AI, always open it in your browser
(just double-click the HTML file) and test that module before moving to the next. Fix bugs
immediately while the context is fresh.
Step 5. After Module 12, do a full end-to-end test: select every category, fill the form,
generate a QR, download it. Then deploy to Vercel or Netlify by dragging the folder.
Estimated build time: 3–6 hours for the full 12 modules working at a comfortable pace.

QRcraft — Where utility meets art. 🎨
Pure HTML · Pure CSS · Pure JS · No frameworks · No tracking · No watermarks · 100% free
