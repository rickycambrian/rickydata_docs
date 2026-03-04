# Design Direction: rickydata docs visual redesign

## Research Summary

Five best-in-class documentation sites were analyzed for typography, spacing, visual separation, and hierarchy patterns:

| Site | Body Font | Mono Font | Separation Strategy | Key Trait |
|------|-----------|-----------|-------------------|-----------|
| Stripe | Sohne (custom) | proprietary mono | Whitespace + subtle bg fills | Premium restraint |
| Vercel | Geist Sans | Geist Mono | Whitespace + thin borders | Geometric clarity |
| Linear | Inter Variable | system mono | Whitespace + underlines | Minimalist density |
| Tailwind | Inter Variable | IBM Plex Mono | Ring borders (1px) + bg tints | Technical precision |
| Supabase | System stack | system mono | Horizontal rules + gap | Content-first |

### Common patterns across all five:

1. **Inter or Inter-derived fonts dominate** (3 of 5 use Inter or an Inter-based design like Geist). The remaining two use premium licensed fonts. Nobody uses geometric display fonts like Space Grotesk for body text.
2. **Generous whitespace** replaces visual noise. Gap values of 32-48px between sections, 16-24px within sections.
3. **Borders are rare and thin** when present (1px, very low opacity). Most separation is done through whitespace and subtle background-color shifts.
4. **Shadows are nearly absent** in content areas. Only used on floating elements (dropdowns, modals).
5. **Type scales are restrained**: body at 15-16px, h1 at 28-36px, h2 at 20-24px. No dramatic size jumps.
6. **Muted color palettes**: text at ~87% white (not pure white), muted text at ~55-60% white.

---

## The Problem With Our Current CSS

1. **Space Grotesk** is a geometric display font -- wide letterforms, high x-height, designed for headlines. It causes visual fatigue in long-form reading.
2. **Every element has a border**: sidebar, page, cards, code blocks, stat cards, journey cards, playbook sections, video cards, pills, badges, tables. This creates a "cage" effect.
3. **Padding is tight** (0.85-1.15rem on containers) with small gaps (0.65-0.8rem). Content feels compressed.
4. **Font sizes are ad-hoc**: 0.73rem, 0.76rem, 0.82rem, 0.84rem, 0.88rem, 0.9rem, 0.92rem, 0.96rem, 0.98rem, 1.02rem, 1.06rem -- there is no coherent scale.
5. **Heavy shadows** on every panel (`0 12px 44px rgba(0,0,0,0.42)`).
6. **Gradient backgrounds** on body, hero, sidebar, page, and cards compound visual weight.

---

## Design Direction

### 1. Font Pairing: Inter + JetBrains Mono

**Why Inter**: It is the de facto standard for technical documentation. Designed specifically for computer screens at small sizes. Excellent legibility, neutral personality, variable font for precise weight control. Used by Linear, Tailwind, and influenced Vercel's Geist.

**Why JetBrains Mono**: Purpose-built for code. Increased letter height for readability, distinctive ligatures, designed to pair with humanist/neo-grotesque sans-serifs. Free, open-source, well-supported.

**Google Fonts import:**
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");
```

**Font stacks:**
```css
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

code, pre {
  font-family: "JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, monospace;
}
```

---

### 2. Type Scale

A constrained scale based on a 1.25 ratio (Major Third), anchored at 15px body text. Every size has a purpose.

```css
:root {
  /* Type scale */
  --text-xs:    0.75rem;   /* 12px - badges, metadata, eyebrows */
  --text-sm:    0.8125rem; /* 13px - sidebar links, captions */
  --text-base:  0.9375rem; /* 15px - body text */
  --text-lg:    1.0625rem; /* 17px - lead paragraphs, card titles */
  --text-xl:    1.25rem;   /* 20px - h3, section headings */
  --text-2xl:   1.5rem;    /* 24px - h2, page section titles */
  --text-3xl:   2rem;      /* 32px - h1, page titles */
  --text-4xl:   2.5rem;    /* 40px - hero headlines only */

  /* Line heights */
  --leading-tight:  1.2;   /* headings */
  --leading-normal: 1.6;   /* body text */
  --leading-relaxed: 1.7;  /* long-form markdown */

  /* Font weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Letter spacing */
  --tracking-tight:  -0.01em;  /* large headings */
  --tracking-normal:  0;       /* body */
  --tracking-wide:    0.06em;  /* eyebrows, uppercase labels */
}
```

**Application:**
```css
.hero h1 {
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.markdown {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.sidebar-links a {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.eyebrow {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```

---

### 3. Spacing System

Replace ad-hoc rem values with a consistent 4px-based spacing scale.

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

**Key changes:**
- Page/card padding: `var(--space-6)` (24px, up from ~18px)
- Section gaps: `var(--space-8)` (32px, up from ~16px)
- Card grid gaps: `var(--space-5)` (20px, up from ~13px)
- Sidebar padding: `var(--space-5)` (20px)
- Content max-width stays at 1440px but inner content-shell padding becomes `var(--space-6)`

---

### 4. Border and Shadow Approach

**Principle: Remove borders by default. Add them only where interactive or floating.**

```css
:root {
  /* Replace current heavy border */
  --border: rgba(148, 163, 184, 0.08);  /* much more subtle than current 0.38 */
  --border-interactive: rgba(148, 163, 184, 0.15);  /* inputs, buttons */

  /* Shadows - only for floating elements */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.25);  /* dropdowns, modals only */

  /* No shadow on cards/panels (remove current --shadow) */

  /* Border radius - standardized to 3 values */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

**What changes:**
- `.sidebar`: Remove `border`, remove `box-shadow`. Use `background` only for distinction.
- `.page`: Remove `border`, remove `box-shadow`. Content lives on the background.
- `.card`, `.journey-card`, `.stat-card`: Remove `border`. Use subtle background fill (`--surface-1`) for grouping. Add border on hover only for interactive cards.
- `.doc-article`: Remove `border`, remove heavy background gradient.
- `.playbook-section`, `.product-section`: Remove `border`. Separate with whitespace + optional thin top border (`border-top: 1px solid var(--border)`).
- Code blocks (`.markdown pre`): Keep a 1px border at very low opacity. These benefit from containment.
- Inputs (`.search-form input`): Keep border, it signals interactivity.

**Before/After - Card:**
```css
/* BEFORE */
.card {
  border: 1px solid rgba(77, 110, 161, 0.45);
  border-radius: 12px;
  padding: 0.9rem;
  background: linear-gradient(180deg, rgba(13, 22, 37, 0.95), rgba(8, 14, 24, 0.95));
}

/* AFTER */
.card {
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-6);
  background: var(--surface-1);
  transition: border-color 0.15s ease;
}
.card:hover {
  border-color: var(--border-interactive);
}
```

---

### 5. Color Refinements (Dark Theme)

Simplify the palette. Remove gradient backgrounds on containers. Use flat, layered surfaces.

```css
:root {
  /* Background layers (flat, no gradients) */
  --bg:         #0a0f1a;      /* page background - slightly warmer than pure dark */
  --surface-0:  #0f1520;      /* sidebar, main panels - base surface */
  --surface-1:  #141c2b;      /* cards, elevated content */
  --surface-2:  #1a2335;      /* hover states, active items */

  /* Text hierarchy */
  --text:       #e2e8f0;      /* primary text - 87% white, not pure white */
  --text-secondary: #94a3b8;  /* descriptions, secondary info */
  --muted:      #64748b;      /* metadata, timestamps, placeholders */

  /* Accent - keep the green but make it slightly more muted */
  --accent:     #34d399;      /* primary action, links */
  --accent-hover: #6ee7b7;    /* hover state */
  --accent-subtle: rgba(52, 211, 153, 0.1);  /* backgrounds */

  /* Secondary accent - softer blue */
  --accent-2:   #60a5fa;
  --accent-2-subtle: rgba(96, 165, 250, 0.1);

  /* Links */
  --link:       #93c5fd;      /* softer than current #79d8ff */
  --link-hover: #bfdbfe;

  /* Status colors */
  --danger:     #f87171;
  --warning:    #fbbf24;
  --success:    #34d399;

  /* Borders - very subtle */
  --border:         rgba(148, 163, 184, 0.08);
  --border-interactive: rgba(148, 163, 184, 0.15);

  /* Focus ring */
  --ring: rgba(52, 211, 153, 0.3);
}
```

**Body background:**
```css
/* BEFORE - heavy multi-gradient */
body {
  background:
    radial-gradient(circle at 15% 10%, rgba(40, 133, 255, 0.24), transparent 36%),
    radial-gradient(circle at 80% -10%, rgba(37, 209, 164, 0.24), transparent 42%),
    linear-gradient(180deg, #03060a 0%, #05090f 54%, #06111f 100%);
}

/* AFTER - single subtle gradient or flat */
body {
  background: radial-gradient(ellipse at 50% 0%, rgba(52, 211, 153, 0.03), transparent 60%), var(--bg);
}
```

---

### 6. Specific Component Changes

#### Topbar
```css
/* BEFORE */
.topbar {
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  background: rgba(5, 9, 15, 0.86);
}

/* AFTER */
.topbar {
  border-bottom: 1px solid var(--border);  /* keep - topbar benefits from separation line */
  backdrop-filter: blur(16px);
  background: rgba(10, 15, 26, 0.8);
}
```

#### Sidebar
```css
/* BEFORE */
.sidebar {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  background: linear-gradient(180deg, rgba(17, 26, 45, 0.92), rgba(11, 18, 31, 0.9));
  box-shadow: var(--shadow);
}

/* AFTER */
.sidebar {
  border: none;
  border-right: 1px solid var(--border);
  border-radius: 0;
  padding: var(--space-5);
  background: transparent;
  box-shadow: none;
}
```

#### Page container
```css
/* BEFORE */
.page {
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(17, 26, 45, 0.9), rgba(11, 18, 31, 0.92));
  border-radius: 16px;
  padding: 1.15rem;
  box-shadow: var(--shadow);
}

/* AFTER */
.page {
  border: none;
  background: transparent;
  border-radius: 0;
  padding: var(--space-6);
  box-shadow: none;
}
```

#### Hero
```css
/* BEFORE */
.hero {
  border: 1px solid rgba(66, 102, 160, 0.5);
  border-radius: 16px;
  padding: 1.3rem;
  background: radial-gradient(...), radial-gradient(...), #0b1423;
}

/* AFTER */
.hero {
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  background: var(--surface-0);
}
```

#### Code blocks
```css
/* BEFORE */
.markdown pre {
  padding: 0.8rem;
  border-radius: 10px;
  background: #030b15;
  border: 1px solid rgba(72, 110, 170, 0.5);
  color: #dff5ff;
}

/* AFTER */
.markdown pre {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: #0c1222;
  border: 1px solid var(--border);
  color: var(--text);
  font-size: var(--text-sm);
}
```

#### Buttons
```css
/* BEFORE */
.btn-primary {
  background: linear-gradient(90deg, var(--accent), #22b7de);
  color: #01261f;
}

/* AFTER */
.btn-primary {
  background: var(--accent);
  color: #0a1628;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
```

#### Pills and badges
```css
/* BEFORE */
.pill {
  border-radius: 999px;
  border: 1px solid rgba(74, 122, 194, 0.58);
  background: rgba(11, 23, 41, 0.82);
  color: #b9d2ff;
  font-size: 0.82rem;
  padding: 0.2rem 0.55rem;
}

/* AFTER */
.pill {
  border-radius: var(--radius-sm);
  border: none;
  background: var(--surface-2);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  padding: 0.25rem 0.5rem;
}
```

---

### 7. Markdown/Prose Reading Experience

```css
.markdown {
  font-size: var(--text-base);         /* 15px */
  line-height: var(--leading-relaxed); /* 1.7 */
  color: var(--text);
  max-width: 72ch;                     /* constrain line length for readability */
}

.markdown h2 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-10);
  margin-bottom: var(--space-4);
  letter-spacing: var(--tracking-tight);
}

.markdown h3 {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-8);
  margin-bottom: var(--space-3);
}

.markdown p {
  margin-bottom: var(--space-4);
}

.markdown code {
  font-size: 0.875em;   /* relative to parent, not absolute */
  color: var(--accent);
  background: var(--surface-1);
  padding: 0.15em 0.35em;
  border-radius: 4px;
}
```

---

### 8. Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Body font | Space Grotesk | Inter |
| Mono font | IBM Plex Mono | JetBrains Mono |
| Body size | ~1rem (16px) | 0.9375rem (15px) |
| Line height | 1.58 | 1.7 |
| Container padding | 0.85-1.15rem | 1.5rem (24px) |
| Section gaps | 0.65-1rem | 2rem (32px) |
| Borders | On everything (38% opacity) | Minimal (8% opacity, most removed) |
| Shadows | Heavy on all panels | None on panels, light on floating UI |
| Background | Multi-gradient everywhere | Flat surfaces, one subtle body gradient |
| Font sizes | 12+ ad-hoc values | 8 scale steps |
| Pill shape | Full round (999px) | Subtle round (6px) |
| Color: text | #e6edf7 (pure-ish) | #e2e8f0 (87% white) |
| Color: muted | #97a5bf | #64748b (lower, more contrast ratio) |
| Gradients on buttons | Yes | No (flat color) |
| Card hover | None | Subtle border reveal |

---

### 9. Implementation Order

1. **Swap fonts** (Inter + JetBrains Mono import, update font-family declarations)
2. **Add CSS custom properties** (type scale, spacing scale, color tokens)
3. **Strip borders and shadows** from containers (sidebar, page, cards, sections)
4. **Update backgrounds** (remove gradients from containers, simplify body)
5. **Apply type scale** (replace all ad-hoc font-size values)
6. **Increase spacing** (padding and gaps throughout)
7. **Refine interactive states** (hover borders on cards, button transitions)
8. **Polish** (inline code styling, pill shapes, badge adjustments)

Each step is independently deployable and visually coherent.
