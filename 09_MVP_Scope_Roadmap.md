# 09_MVP_Scope_Roadmap.md

# MVP Scope & Roadmap

> Version: 1.0 — Turns 01's rollout strategy into phases with entry/exit gates. Gates are metric conditions, not dates: **a phase ends when its numbers say so, not when the calendar does.**
> Scope discipline rule: anything not explicitly IN a phase is OUT of it. When in doubt, it's out (02: golden rule).

---

## 09.1 The phases at a glance

| Phase | Name | One-line goal | Exit gate |
|---|---|---|---|
| 0 | Foundation | Build the trust-critical core | Internal E2E purchase works, twice-audited |
| 1 | Closed Beta ("İlk 50") | Prove sellers will list and buyers will pay strangers | ≥30% 30-day sell-through, ≥95% grade accuracy, 0 unresolved money incidents |
| 2 | Public Launch (İstanbul-weighted) | Prove repeatability without founder hand-holding | 100+ active sellers, self-serve listing majority, support load sustainable |
| 3 | Depth | Grow supply efficiency and retention | (defines itself from Phase 2 data) |

---

## 09.2 Phase 0 — Foundation (build)

**In:**
- Design system core (04): tokens, Button, Badge (condition/grade), Product Card, Transparency Card, Input, Modal, Toast, Skeleton.
- Buyer web (05): home (hero, trust strip, Today on Atlas, categories), browse/search with filters (PG FTS), product detail incl. sold state, cart (shortlist), checkout 3-step + hold + iyzico sandbox, confirmation.
- User dashboard (05.6): orders + timeline, confirm delivery + grade check, alerts CRUD, account, KVKK self-service (export/delete).
- Seller (06): application + manual approval, activation, full listing flow (photo-first, grading guide inline), dashboard 4 sections (listings, orders/to-ship, payouts view, performance stub).
- Ops panel (08.2): curation queue, order/dispute views, concierge listing, seller approval.
- The two critical paths (08.3) with their race/idempotency tests; audit log; notifications (email) for every order/listing transition; alert matcher job.
- Legal texts integrated (11): mesafeli satış, ön bilgilendirme, KVKK metinleri, sözleşme onay noktaları.
- Analytics events wired from day one (13.6) — Phase 1's gate is measured with these.

**Explicitly OUT of Phase 0–1 (the "not yet" list):**
- Buyer–seller messaging (06.5) · bulk upload/API (06.6) · sponsored/featured monetization (01 — commission only at start) · premium subscriptions · mobile apps (responsive web only) · SMS · multi-language/currency · "recommended" sort · seller self-serve refunds · category expansion beyond launch set · Meilisearch · reviews/ratings of products (the grade system + seller score replace review culture in MVP; product reviews on 1-unit items are structurally thin) · **refurbished phones/tablets** (special regulation, 11.3 — the `refurbished` condition stays for other categories).

**Exit gate:** full E2E on staging — apply→approve→list→curate→buy (guest + registered)→ship→deliver→confirm→payout record→dispute path — executed twice by someone who didn't build it. Backup restore drill done (08.4). Accessibility manual pass done (04.5).

---

## 09.3 Phase 1 — Closed Beta: "İlk 50" (prove it)

Shape: invite-only. **Supply first** (01): 30–50 hand-picked İstanbul sellers (13 owns recruitment), concierge onboarding (06.2), founder does curation personally. Buyers: waitlist + seller networks + small organic (13.3); no paid acquisition.

Launch categories (01): **small appliances & electronics + home & kitchen premium**. Furniture/lighting joins in Phase 2 (logistics complexity: bulky shipping needs carrier deals first — 10.6).

Ops mode: everything manual that can be manual (curation 100%, payouts reviewed by hand, disputes founder-handled). The playbook (10) is *written from* this phase's cases.

**What we're testing (in order):** will verified businesses list real inventory → will buyers pay money to unknown sellers on a new platform (the escrow line's real test) → do delivered items match their grades → does anyone come back.

**Exit gate (all must hold):**
- ≥ 30 sellers with ≥ 5 live listings each; ≥ 300 completed orders.
- **Sell-through ≥ 30%** in 30 days (01 north star).
- **Grade accuracy ≥ 95%** (grade-check yes rate, 07.6).
- Dispute rate ≤ 5%, zero unresolved money incidents, hold/oversell incidents = 0.
- Repeat purchase or active-alert signal from ≥ 25% of buyers (retention pulse, 05.6).
- Recovery rate measured and ≥ liquidator baseline — the seller pitch (01) is now a number we can put on the seller landing (05.7).

If sell-through fails but grade accuracy holds → pricing guidance problem (06.3), fix and re-run. If grade accuracy fails → curation/grading guide problem — **do not scale a broken trust engine.**

---

## 09.4 Phase 2 — Public Launch (repeatability)

**In:** open buyer registration + GTM push (13); seller self-serve onboarding with score-gated instant publishing (06.3 flag); furniture & lighting category; payout automation (weekly batch, 10.5); support tooling + macros (10.7); web push for alerts; featured listings (first monetization beyond commission, clearly labeled per 05.2); Meilisearch if listing volume triggers it (08.7).

**Exit gate:** 100+ active sellers with majority self-serve onboarded; sell-through and grade accuracy hold at Phase 1 levels *without founder-in-the-loop curation on every listing*; support tickets per order trending down; unit economics visible (commission revenue vs. ops cost per order).

## 09.5 Phase 3 — Depth (direction, not commitment)

Candidates, re-prioritized by Phase 2 data against one criterion — *more supply, less trust risk* (06.6): bulk tools & integrations · premium seller subscription · sponsored collections · buyer–seller messaging with guardrails · Anatolian city seller expansion · "Atlas Verified" physical inspection for high-value items (01 revenue) · mobile app if alert engagement demands it.

---

## 09.6 Standing rules across all phases

- The Decision Hierarchy (02) gates every scope debate; trust features never lose to growth features.
- Every phase ships with its legal/compliance set current (11) — compliance is scope, not polish.
- KPI definitions (01: sell-through, recovery rate, grade accuracy) are frozen in 13.6's event taxonomy; gates use those definitions, no re-defining metrics to pass a gate.
- A phase can be rolled back (feature-flagged features off, onboarding paused) — growth pauses are acceptable, trust regressions are not.
