# 02_Product_Principles.md

# Product Constitution

> Version: 2.0 — Aligned with 01_Vision.md v2.0

These principles are mandatory for every feature, screen and technical decision.

## Decision Hierarchy

When principles conflict, the higher one wins:

1. **Trust** — never trade trust for anything below.
2. **Simplicity** — fewer steps beats more options.
3. **Quality of experience** — premium feel, performance, accessibility.
4. **Conversion** — only after the first three are satisfied.
5. **Feature count** — last, always last.

Example: a countdown timer might raise conversion (4) but manufactures urgency and erodes trust (1). Rejected.

## Product Philosophy

1. Build trust before conversion.
2. Simplicity beats feature count.
3. Premium over crowded.
4. Fixed-price marketplace only.
5. Every feature must solve a real problem for a buyer or a seller. If we can't name the problem, we don't build it.
6. No unnecessary clicks.
7. Buyer side: desktop-first execution for MVP, mobile-first thinking.
   Seller side: the listing flow is **mobile-first from day one** — a store employee lists a display item from a phone in under 3 minutes.
8. Accessibility is required.
9. Fast by default.
10. SEO is a product feature — every listing page is a landing page.

## Trust UX (the Trust Engine on screen)

These are product-level requirements, not suggestions:

- The **Transparency Card** (condition, grade, discount reason, original vs. Atlas price, warranty, return policy, stock) appears on every listing, always in the same place, always in the same format.
- Condition badge + Grade badge (A/B/C) are visible on every product card, including in search results and feeds — never only on the detail page.
- Grade B and C listings must show flaw close-up photos; the photo section labels them explicitly ("Flaw 1 of 3").
- Seller identity, verification badge, and performance score are one tap away from every listing.
- Original price must be verifiable; discounts are never invented.
- Prices, stock, and availability shown are always real and current. Overselling a 1-unit item is a critical bug, not an edge case.

## Scarcity UX (a 1-unit inventory world)

Most listings have stock of one. This changes the rules:

- Stock status is real-time. "In cart" does not reserve; checkout start does (short hold, clearly communicated).
- **Sold items stay visible** as "Sold" — they prove liquidity, preserve SEO, and teach buyers to act. They never pretend to be available.
- Followed items notify instantly on price change or low-stock.
- Honest scarcity only: "1 unit", "8 people following" — real numbers. Never fake countdowns, fake viewer counts, or "only today" pressure.

## UX Principles

- Never overwhelm users.
- Maximum 3 primary actions per screen.
- One clear CTA per page.
- Large whitespace.
- Clear typography.
- Real product photography first. Stock photos may support, never replace.
- No dark patterns.
- No fake urgency.
- No auto-playing videos.
- Skeleton loaders instead of spinners whenever possible.
- Empty states and error states are designed, not defaulted — an empty search result suggests followed-search alerts, not a dead end.
- Every destructive or paying action has a clear confirmation and a clear receipt.

## Marketplace Rules

- Verified businesses only.
- No individual sellers in MVP.
- No auctions.
- No bidding.
- No bargaining.
- One product, one fixed price.
- Inventory must be accurate.
- Products must include condition badge **and Atlas Grade (A/B/C)**.
- Discount reason is mandatory.
- Original price must be verifiable.
- Flaws must be photographed (Grade B/C).

## Design Principles

Reference:
- Apple
- Airbnb
- Stripe
- Linear
- Notion
- Vercel

Avoid:
- Trendyol
- Hepsiburada
- Sahibinden
- Craigslist style layouts

The tone in one line: **a quiet, confident store — not a shouting bazaar.**
No blinking discounts, no red-on-yellow badges, no banner walls. The discount speaks for itself; the design stays calm.

## Content & Microcopy Rules

- Use simple language. Avoid jargon.
- Always explain outlet conditions honestly — say "3 months on our showroom floor", not "gently handled".
- Flaws are stated plainly and early, never buried below the fold.
- Never oversell: microcopy that raises expectations above reality creates returns and kills trust.
- One consistent vocabulary: the same condition and grade terms everywhere — listings, filters, emails, invoices.

## Performance

- Lighthouse score target: 95+
- LCP under 2.5s, FCP under 1.8s, CLS under 0.1, INP under 200ms.
- Lazy-load images below the fold; the primary product photo loads eagerly.
- Optimize every asset (modern formats, responsive sizes).
- Responsive by default.
- Performance budgets are enforced in CI, not reviewed occasionally.

## Components

Every component must be:
- Reusable
- Accessible
- Typed
- Documented
- Responsive

Core marketplace components (Transparency Card, Grade badge, condition badge, price block, seller card) are built once, used everywhere — never re-implemented per page.

## Engineering

- TypeScript only.
- Strict typing.
- Small reusable components.
- Feature-based architecture.
- Clean folder structure.
- No duplicated logic.
- Critical flows (checkout, stock reservation, listing creation) are covered by automated tests before release.
- Money, stock, and order state transitions live on the server — the client never decides them.

## Security

- Validate all inputs.
- Server-side authorization on every request — never trust the client's role.
- Secure file uploads (type, size, content validation).
- Audit logging for money, stock, and account changes.
- Rate limiting.
- Personal and business data handled to KVKK standards from day one (GDPR-ready for European expansion).

## Success Criteria

Every release should improve at least one:
- Trust (grade accuracy, dispute rate)
- Conversion
- Performance
- Seller efficiency (time-to-list, sell-through)
- Customer satisfaction

And degrade none of the others. A release that trades trust for conversion fails review.

## Golden Rule

Whenever there is a choice between "more features" and "better experience", always choose the better experience.
