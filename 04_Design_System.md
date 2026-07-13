# 04_Design_System.md

# Design System

> Version: 1.0 — Implements 02_Product_Principles.md and 03_Brand_Identity.md
> Rule zero: every value on a screen comes from a token in this document. No hardcoded colors, sizes, or durations. Ever.

Sections:
- 04.1 Foundation (colors, typography, spacing, grid)
- 04.2 Components (buttons, cards, inputs, modals)
- 04.3 Motion (animations, hover, loading)
- 04.4 Responsive (desktop / tablet / mobile)
- 04.5 Accessibility (WCAG, contrast, keyboard)

---

# 04.1 Foundation

## Color

Philosophy: the interface is monochrome; **color is information**. Emerald means verified/success, amber means warning, red means error — nothing else. Product photography provides all the visual richness.

### Neutral scale (raw palette)

| Token | Hex | Typical use |
|---|---|---|
| `neutral-0` | `#FFFFFF` | Page background (light) |
| `neutral-50` | `#FAFAFA` | Subtle surface, table stripes |
| `neutral-100` | `#F5F5F5` | Cards on white, input background |
| `neutral-200` | `#E5E5E5` | Borders, dividers |
| `neutral-300` | `#D4D4D4` | Disabled borders |
| `neutral-400` | `#A3A3A3` | Placeholder text, disabled text |
| `neutral-500` | `#737373` | Muted text (min. size 14px on white) |
| `neutral-600` | `#525252` | Secondary text |
| `neutral-700` | `#404040` | Icon default |
| `neutral-800` | `#262626` | Primary text alt, dark surfaces |
| `neutral-900` | `#171717` | Primary text, primary buttons |
| `neutral-950` | `#0A0A0A` | Page background (dark) |

### Accent palette

| Token | Hex | Use |
|---|---|---|
| `emerald-600` | `#059669` | Success, savings amount, verified check |
| `emerald-700` | `#047857` | Success text on light backgrounds |
| `emerald-50` | `#ECFDF5` | Success background tint |
| `amber-600` | `#D97706` | Warnings (low stock hold expiring, etc.) |
| `amber-50` | `#FFFBEB` | Warning background tint |
| `red-600` | `#DC2626` | Errors ONLY. Never prices, never discounts, never badges |
| `red-50` | `#FEF2F2` | Error background tint |

### Semantic tokens (what components actually use)

| Token | Light | Dark |
|---|---|---|
| `bg-page` | `neutral-0` | `neutral-950` |
| `bg-surface` | `neutral-0` | `neutral-900` |
| `bg-subtle` | `neutral-50` | `neutral-900` |
| `bg-inverse` | `neutral-900` | `neutral-0` |
| `text-primary` | `neutral-900` | `neutral-50` |
| `text-secondary` | `neutral-600` | `neutral-400` |
| `text-muted` | `neutral-500` | `neutral-500` |
| `text-inverse` | `neutral-0` | `neutral-900` |
| `border-default` | `neutral-200` | `neutral-800` |
| `border-strong` | `neutral-300` | `neutral-700` |
| `focus-ring` | `neutral-900` | `neutral-50` |

Components reference semantic tokens only. Raw palette values never appear in component code — this is what makes dark mode a mapping, not a rewrite.

### Price color rules (from 03_Brand_Identity.md — non-negotiable)

- Atlas price: `text-primary`, the largest text in its block.
- Original price: `text-muted`, strikethrough.
- Savings ("–42%" / "You save ₺5.500"): `emerald-700` or `text-secondary`.
- Currency: ₺ (TRY) at launch; prices formatted per Turkish locale (₺12.999, decimal comma). Currency display is centralized in one price formatter — expansion currencies are a config, not a refactor.
- Red is never used within 100px of a price.

## Typography

Font: **Inter**, fallback `system-ui, -apple-system, sans-serif`.
Load two weights maximum for performance: 400 (regular) and 600 (semibold). 500 (medium) allowed only if measurably needed.

### Type scale

| Token | Size / Line height | Weight | Use |
|---|---|---|---|
| `display` | 48px / 56px | 600 | Landing hero only |
| `h1` | 36px / 44px | 600 | Page title (one per page) |
| `h2` | 28px / 36px | 600 | Section title |
| `h3` | 22px / 30px | 600 | Card group title, modal title |
| `h4` | 18px / 26px | 600 | Product card title, subsection |
| `body` | 16px / 24px | 400 | Default text |
| `body-strong` | 16px / 24px | 600 | Emphasis, labels |
| `small` | 14px / 20px | 400 | Secondary info, meta |
| `caption` | 12px / 16px | 400 | Badges, timestamps, legal |
| `price-lg` | 28px / 34px | 600 | Atlas price on detail page |
| `price-md` | 18px / 24px | 600 | Atlas price on product card |

Rules:
- All prices use **tabular numerals** (`font-variant-numeric: tabular-nums`).
- Body text column width: 45–75 characters max.
- Letter-spacing: `-0.02em` on `h1`/`display`, default elsewhere.
- Mobile: `display` → 36px, `h1` → 28px, `h2` → 24px. Body never shrinks below 16px.

## Spacing

Base unit: **4px**. Only these steps exist:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

| Context | Value |
|---|---|
| Inside compact components (badge padding) | 4–8 |
| Inside components (button/input padding) | 12–16 |
| Between related elements (label→input) | 8 |
| Between components in a group | 16–24 |
| Between sections | 48–64 (desktop), 32–48 (mobile) |
| Page top/bottom breathing room | 64–96 |

Whitespace is a brand feature (02: "Large whitespace"). When in doubt, use the larger step.

## Radius & Elevation

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Badges, inputs, small controls |
| `radius-md` | 10px | Buttons, cards |
| `radius-lg` | 16px | Modals, large surfaces, images |
| `radius-full` | 9999px | Pills, avatars |

Shadows are whispers, not statements — borders do most separation work:

| Token | Value | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | Cards at rest |
| `shadow-md` | `0 4px 12px rgb(0 0 0 / 0.08)` | Card hover, dropdowns |
| `shadow-lg` | `0 12px 32px rgb(0 0 0 / 0.12)` | Modals, popovers |

No colored shadows. No glows.

## Grid & Layout

- Max content width: **1280px**, centered, 24px side padding (16px on mobile).
- Desktop: 12-column grid, 24px gutter.
- Product listing grids: 4 columns (desktop) → 3 (tablet) → 2 (mobile). Never 1-column product grids except search-empty fallbacks.
- Product detail: 2-column — gallery left (7/12), buy box + Transparency Card right (5/12), sticky buy box on scroll.
- Vertical rhythm: sections separated by `64px` desktop / `40px` mobile.

---

# 04.2 Components

Global rules (every component):
- Built once in the shared library; never re-implemented per page (02).
- All states designed: default, hover, focus-visible, active, disabled, loading, error.
- Uses semantic tokens only. Fully typed props. Documented with examples.

## Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `bg-inverse` bg, `text-inverse` text | The one main action per page (02: one clear CTA) |
| Secondary | transparent bg, `border-strong` border, `text-primary` | Supporting actions |
| Ghost | transparent, `text-secondary`, no border | Tertiary/inline actions |
| Destructive | `red-600` bg, white text | Delete/cancel-order only, always behind confirmation |

Sizes: `sm` 36px, `md` 44px, `lg` 52px height. Padding: 16/20/24 horizontal. Radius: `radius-md`.

Rules:
- Max ONE primary button visible per view.
- Loading state: spinner replaces label, width locked (no layout shift), button disabled.
- Disabled: `neutral-300` border/text — never invisible, always explains itself nearby if non-obvious.
- Full-width buttons on mobile buy-box and forms.

## Badges

The most brand-critical small component. Two families, defined once:

**Condition badge** (the story — vocabulary locked to 01_Vision.md):
- `caption` size, `radius-sm`, `bg-subtle` background, `border-default` border, `text-secondary`.
- Never colored, never iconified.

**Grade badge** (the state — A / B / C):
- Monochrome, typographic: the letter in a `radius-sm` square, `border-strong` border, `text-primary`, semibold.
- Same 22px size everywhere: product cards, detail pages, order rows, emails.
- NEVER color-coded by severity (03: Grade C is honest information, not a warning).
- Always paired with text on first appearance per page: "Grade B — minor cosmetic marks".

**Verified badge**: emerald check icon + "Verified Business", `emerald-700` text. The only colored trust mark.

## Product Card

Anatomy (top to bottom), identical everywhere — feed, search, collections:

1. Image (4:3, `radius-lg` top, real photo, lazy-loaded below fold)
2. Condition badge + Grade badge (top-left overlay on image, side by side)
3. "Sold" overlay state: image at 60% opacity + "Sold" pill — card stays visible (02: sold items prove liquidity)
4. Title (`h4`, max 2 lines, ellipsis)
5. Seller name + verified check (`small`, `text-secondary`)
6. Price block: Atlas price (`price-md`) → original price (`small`, muted, strikethrough) → savings (`small`, emerald)
7. Stock line (`caption`): "1 unit" — real numbers only

Interaction: whole card is one link. Hover: `shadow-md` + image scale 1.02 (see Motion). No quick-buy buttons on cards — the detail page (with the Transparency Card) is a mandatory stop; buyers must see what they're buying.

## Transparency Card

The signature component (01: "the heart of the product").

- A bordered (`border-default`), `radius-lg` panel — always directly under the price in the buy box. Same position on every listing, no exceptions.
- Rows, in fixed order: Condition · Grade · Why discounted · Original price · Atlas price · Warranty · Return policy · Stock.
- Row layout: label (`small`, `text-muted`) left, value (`body`, `text-primary`) right.
- "Why discounted" is the widest row and may wrap — it is the point.
- Never collapsed, never behind a tab, never below the fold on desktop.

## Inputs & Forms

- Height 44px (48px on mobile), `radius-sm`, `bg-surface`, `border-default`; focus: `focus-ring` 2px outline with 2px offset.
- Label always visible above the input — placeholders are hints, never labels.
- Help text (`small`, `text-muted`) below; error state: `red-600` border + error message with icon below (never color-only).
- Validation on blur, re-validate on change after first error. Never block typing.
- Required fields are the default; mark optional ones "(optional)" instead.
- Selects, checkboxes, radios, textareas follow the same tokens. Custom-styled but native under the hood (real `<select>`, real `<input>`) unless a component genuinely needs more.

**Seller listing form** (mobile-first per 02): one step per screen, photo capture first, progress indicator, auto-save draft on every field.

## Modals & Overlays

- Sizes: `sm` 400px, `md` 560px, `lg` 720px max-width; full-screen sheet on mobile (slides from bottom).
- `radius-lg`, `shadow-lg`, backdrop `rgb(0 0 0 / 0.4)`.
- Structure: `h3` title + close button, body, footer with actions right-aligned (primary rightmost).
- Dismiss: Esc, backdrop click, close button — all three, always. Exception: mid-payment states.
- Focus is trapped inside; on close, focus returns to the trigger element.
- Maximum one modal at a time. Never stack modals; a flow needing "modal in modal" is a flow that needs a redesign.
- Use modals for confirmations and single-step tasks only. Multi-step tasks get pages.

## Toasts & Feedback

- Bottom-center (mobile) / bottom-right (desktop), `bg-inverse`, `text-inverse`, `radius-md`.
- Auto-dismiss 5s, pausable on hover; destructive-action toasts include Undo where technically honest.
- Success uses emerald icon, error uses red icon — plus text, never icon-only.

## Skeletons & Empty States

- Skeleton loaders mirror the exact final layout (card skeleton = image block + 2 text lines + price line) — zero layout shift on load (CLS budget in 02).
- Empty states are designed (02): icon + one sentence + one action. Empty search offers "Create an alert for this search" — scarcity means empty results are a feature moment, not a dead end.

---

# 04.3 Motion

Philosophy: motion confirms, never entertains. If an animation makes someone wait, it's a bug. Calm brand = calm motion.

## Tokens

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Hovers, button presses, toggles |
| `duration-base` | 200ms | Dropdowns, tooltips, card hover, fades |
| `duration-slow` | 300ms | Modals, sheets, page-level transitions |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Anything entering |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Anything exiting |
| `ease-inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Position/size changes |

Nothing exceeds 300ms. No bounce, no spring, no elastic — ever (personality: calm, confident).

## Rules

- Animate only `transform` and `opacity` (GPU-friendly; protects the performance budget).
- Card hover: `shadow-sm → shadow-md` + image `scale(1.02)`, `duration-base`.
- Button press: `scale(0.98)`, `duration-fast`.
- Modal: fade backdrop + content `opacity 0→1, translateY 8px→0`, `duration-slow ease-out`. Mobile sheet slides from bottom.
- Skeleton: subtle shimmer, 1.5s linear loop, low contrast (`neutral-100 ↔ neutral-200`).
- Toast: slide + fade in from bottom, `duration-base`.
- Image load: fade in 200ms over a `neutral-100` placeholder sized in advance (no shift).
- List changes (filtering): fade only. No items flying around the screen.
- Page transitions: none in MVP beyond instant navigation. Speed IS the transition.

## Forbidden

- Autoplaying carousels or videos (02).
- Attention-seeking animation on prices, discounts, badges, or CTAs (pulsing "Buy" buttons are a dark pattern).
- Parallax, scroll-jacking, cursor effects.
- Animated countdowns — fake urgency is banned at the brand level (01, 02, 03).

## Reduced motion

`prefers-reduced-motion: reduce` → all transitions/animations collapse to instant state changes or ≤50ms opacity fades. Skeleton shimmer becomes static. This is implemented globally in the motion layer, not per component.

---

# 04.4 Responsive

## Breakpoints

| Token | Min width | Target |
|---|---|---|
| `base` | 0 | Phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop (content max-width) |

Styles are written mobile-up (`min-width` queries), even though the buyer MVP is desktop-first in *polish priority* (02). Priority of polish ≠ direction of CSS.

## Layout behavior

| Element | Desktop (≥1024) | Tablet (768–1023) | Mobile (<768) |
|---|---|---|---|
| Product grid | 4 columns | 3 columns | 2 columns |
| Product detail | 2-col: gallery 7/12, buy box 5/12 (sticky) | 2-col, buy box not sticky | Stacked: gallery → price → Transparency Card → rest; sticky bottom buy bar (price + CTA) |
| Navigation | Top bar with categories | Top bar, collapsed categories | Top bar + bottom sticky bar on key flows; hamburger for secondary nav |
| Filters | Left sidebar | Collapsible sidebar | Full-screen sheet with result-count button ("Show 24 results") |
| Modals | Centered dialog | Centered dialog | Bottom sheet, full width |
| Seller listing flow | Same one-step-per-screen flow as mobile, centered 560px | Same | **Native-feeling: camera-first, big touch targets** — this flow is designed on a phone and adapted up |

## Rules

- Touch targets: minimum **44×44px** on touch devices; 8px minimum gap between adjacent targets.
- The Transparency Card is never demoted on mobile — it appears immediately after the price, before the description.
- Images: responsive `srcset` (card: 400/800w; gallery: 800/1600w), explicit width/height attributes always (CLS).
- No horizontal scrolling ever, except intentional swipe galleries with visible affordance.
- Hover-only affordances are forbidden — anything revealed on hover must be visible or reachable on touch.
- Test matrix per release: 360px (small Android), 390px (iPhone), 768px (iPad portrait), 1280px+, plus one slow-3G/low-end-device pass on the buyer funnel and the seller listing flow.

---

# 04.5 Accessibility

Standard: **WCAG 2.2 AA** on every screen. Accessibility failures block release, same as broken checkout (02: "Accessibility is required").

## Contrast

- Normal text ≥ 4.5:1, large text (24px+ / 19px+ semibold) ≥ 3:1, UI components & focus indicators ≥ 3:1.
- Pre-validated pairs (light mode): `neutral-900` on white 17.9:1 · `neutral-600` on white 7.6:1 · `neutral-500` on white 5.3:1 (14px+ only) · white on `neutral-900` 17.9:1 · `emerald-700` on white 5.4:1.
- `neutral-400` is NEVER used for meaningful text — placeholders and disabled only.
- Both themes are tested; dark mode gets its own contrast pass, not an inversion assumption.

## Color independence

Color never carries meaning alone:
- Errors: icon + text, not just red borders.
- Verified: check icon + "Verified Business" text, not just green.
- Grades are letters (A/B/C), inherently color-independent — this is why 03 bans severity-coloring them.
- Strikethrough original price is paired with screen-reader labels (below), since strikethrough alone is ambiguous when read aloud.

## Keyboard

- Every interactive element reachable and operable by keyboard, in logical DOM order.
- Focus is always visible: 2px `focus-ring` outline, 2px offset, ≥3:1 contrast — never `outline: none` without a better replacement.
- Skip link ("Skip to results" / "Skip to content") as first focusable element.
- Modals: focus trapped, Esc closes, focus returns to trigger.
- Galleries: arrow keys navigate; filters and menus follow WAI-ARIA APG patterns.
- No keyboard traps. No positive `tabindex` values, ever.

## Screen readers & semantics

- Semantic HTML first: real `<button>`, `<nav>`, `<main>`, one `<h1>` per page, ordered heading levels. ARIA only where HTML can't express it.
- Price block accessible name: "Atlas price ₺7.499. Original price ₺12.999. You save ₺5.500" — not a raw strikethrough soup.
- Product card is a single link whose accessible name = title + grade + price ("Dyson V15, Grade B, ₺7.499").
- Badges have full text equivalents: Grade badge announces "Atlas Grade B — minor cosmetic marks".
- Flaw photos have descriptive alt text ("Close-up: faint 2cm scratch on left side panel") — alt text honesty is Transparency Card honesty.
- Live updates (toast, "item just sold", cart hold expiring) announced via `aria-live="polite"`; errors via `role="alert"`.
- Sold state is announced in the accessible name, not just the overlay.

## Forms

- Every input has a programmatically associated `<label>`.
- Errors: `aria-describedby` links message to field, focus moves to first invalid field on submit, error summary at top for long forms.
- Autocomplete attributes on address/payment fields.
- No time-limited inputs, except the checkout stock hold — which shows remaining time as text, warns via `aria-live`, and expiry never silently discards entered data.

## Media & motion

- All meaningful images have alt text; decorative images have empty `alt=""`.
- `prefers-reduced-motion` respected globally (04.3).
- Zoom to 200% works without loss of content or function; layout reflows, no horizontal scroll.

## Process

- Automated checks (axe or equivalent) run in CI on every PR — zero critical violations to merge.
- Manual pass per release: keyboard-only run and screen-reader run (NVDA + VoiceOver) of the buyer funnel (browse → detail → checkout) and the seller listing flow.
- Every design-system component ships with its accessibility notes documented (expected roles, states, announcements) — accessibility is part of a component's definition of done.
