# 08_Technical_Architecture.md

# Technical Architecture

> Version: 1.0 — Implements 07's domain on a concrete stack. Constraints inherited: TypeScript-only, strict typing, server-side money/stock decisions (02); performance budgets (04.1); Turkey launch (₺, KVKK, iyzico-class PSP).
> Philosophy: **boring, few, replaceable.** MVP architecture optimizes for one developer moving fast without painting the escrow chain into a corner. Every "later" is listed with its trigger.

---

## 08.1 Stack decision

| Layer | Choice | Why (and the alternative rejected) |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript strict** | One codebase for SSR product pages (SEO is a product feature, 02), buyer app, seller app, ops panel. Rejected SPA+API split: doubles surface for a solo/small team. |
| API style | Server Actions + route handlers; **tRPC optional** for the seller/ops panels | End-to-end types without an API contract layer to maintain. Public REST comes later only if partners/integrations need it (06.6). |
| Database | **PostgreSQL** | 07 is relational to its bones (holds, transactions, constraints). Non-negotiable. |
| ORM | **Prisma** (or Drizzle) with raw SQL escape hatch | The stock-hold atomic path is written in **raw SQL** regardless of ORM (see 08.3). |
| Cache / ephemeral | **Redis** | Hold sweeper scheduling, rate limiting, session cache, live-flip pub/sub. |
| Search | **PostgreSQL FTS at MVP** → Meilisearch/Typesense | Trigger to migrate: >50k live listings or Turkish-language relevance complaints. Turkish stemming config from day one either way. |
| Images | S3-compatible object storage (Cloudflare R2) + **Cloudflare Images/CDN** | Upload direct-to-storage with presigned URLs (06.3 background upload); on-the-fly variants for 04.4 srcset sizes; EXIF stripped at ingest (privacy). |
| Payments | **iyzico Pazaryeri** (fallback evaluation: PayTR/Craftgate) | Marketplace sub-merchant model: split payment, PSP-held escrow, seller onboarding as alt üye işyeri. **Atlas never touches funds** — this is what keeps us out of payment-institution licensing (11). Taksit support included (05.5). |
| Email / notifications | Transactional email via Resend/SES-class provider; **web push** for alerts | SMS (Netgsm-class) only for critical order events, post-MVP. |
| Background jobs | **A job queue on Postgres/Redis (BullMQ or pg-boss)** | Hold sweeper, alert matcher, score recompute, payout batch, digest emails. Rejected serverless cron-only: alert matching must be near-real-time (07.5). |
| Hosting | **EU-region VPS/containers (Hetzner-class) or Vercel + EU Postgres**; CDN in front either way | Latency to Turkey from EU is fine; KVKK cross-border transfer rules require explicit handling either way (11) — document data locations from day one. Trigger for TR-region hosting: legal counsel says so, or latency data does. |
| Analytics | Server-side event pipeline to a warehouse-lite (Postgres schema at MVP) + privacy-respecting web analytics | Event taxonomy defined in 13. No ad-tech SDK soup — performance and KVKK both say no. |
| Monitoring | Sentry (errors), uptime probe, structured logs, PSP-webhook alerting | A missed payment webhook is a lost order; webhook health is monitored like uptime. |

Monolith, one repo, feature-based folders (02). No microservices. The only physically separate concern is the job worker process.

---

## 08.2 System shape

```
Browser ── CDN ── Next.js app (SSR + API)
                     │
        ┌────────────┼───────────────┐
     Postgres      Redis          R2/Images
        │
   Job worker ── (hold sweeper, alert matcher, scores, payouts, digests)
        │
   iyzico ⇄ webhooks     Email/Push providers     Carrier tracking APIs
```

- Product/browse pages: SSR + ISR-style caching, invalidated on listing events (sold flips must appear fast; stale "available" is a trust bug).
- Live updates (sold-while-viewing, 05.4): SSE from a Redis pub/sub channel per listing. WebSockets are more than MVP needs.
- Ops panel: same app, `/ops`, OpsUser roles (07.6), IP-allowlist + 2FA.

---

## 08.3 The two critical paths (written first, tested hardest)

### Stock hold & purchase (07.3)
The invariant `stock − active_holds ≥ 0` is enforced in **one SQL statement**:

```sql
INSERT INTO stock_holds (listing_id, user_id, qty, expires_at)
SELECT $listing, $user, 1, now() + interval '10 minutes'
WHERE (SELECT stock FROM listings WHERE id = $listing AND status = 'live')
      - (SELECT COALESCE(SUM(qty),0) FROM stock_holds
         WHERE listing_id = $listing AND status = 'active' AND expires_at > now())
      >= 1
RETURNING id;
```
Zero rows returned = item taken → UI shows the honest sold/held state (05.8). No application-level check-then-write, ever. Payment capture → hold conversion → stock decrement → `sold_out` flip is one DB transaction keyed to the PSP webhook (idempotent by `payment_provider_ref` — webhooks WILL arrive twice).

### Escrow chain (07.4)
- State transitions implemented as a single `transitionOrder(orderId, event)` function — the only code allowed to change `orders.status`. It validates the edge, writes AuditLog, emits notifications, enqueues side effects. Every other path (webhook, ops click, auto-confirm job) calls it.
- Auto-confirm: daily job, `delivered_at < now() − 7 days AND status = delivered AND no open dispute` → `completed`.
- Refunds/releases execute via PSP API with idempotency keys; a failed money call parks the order in its current state + alerts ops — **money operations never retry blindly.**

---

## 08.4 Security (implements 02's list)

- All authorization server-side per request: `(user | seller-member | ops-role) × resource ownership`. No client-trusted roles.
- Input validation at the boundary with zod schemas shared with the frontend types.
- Uploads: presigned URLs constrained by content-type/size; server-side re-validation + image re-encode at ingest (kills polyglot files); EXIF/GPS stripped.
- Rate limiting (Redis): auth endpoints, checkout starts per user/IP (hold-hoarding is an attack on a 1-unit marketplace — one active hold per user per listing, 07.3, plus a per-user concurrent-hold cap of 3), alert creation.
- Secrets in environment/secret manager; PSP webhook signatures verified; admin panel 2FA.
- Sessions: httpOnly cookies, CSRF on mutations. Auth: email+password with verification + optional OAuth later; guest checkout creates claimable accounts (07.1).
- Backups: automated daily Postgres snapshots + PITR; restore drill before public launch (09) — an escrow marketplace that loses order data is dead.
- KVKK engineering: personal-data fields inventoried (07.8), erasure job implemented (anonymize, retain financials), data-location register maintained (11).

---

## 08.5 Performance engineering (implements 04.1 budgets)

- Budgets in CI (02): Lighthouse CI on product page, home, results — fail under 95 / LCP 2.5s on throttled profile.
- Product page LCP = first gallery image: preloaded, CDN-resized, AVIF/WebP.
- Inter font: two weights, subset (Turkish glyphs!), `font-display: swap` with metric-compatible fallback (CLS).
- DB: indexes derived from 05.3's filter set (category+status+grade+condition+price composite; FTS GIN on title/brand); `EXPLAIN` review is part of PR review for new queries.
- Never ship: ad-tech tags, autoplaying media, client-side rendering of the primary product content.

---

## 08.6 Environments, CI/CD, quality gates

- `dev → staging → prod`; staging runs against PSP sandbox with fake sellers.
- CI per PR: typecheck (strict), lint, unit tests, **critical-flow integration tests** (02: checkout, hold race — two buyers, one item — webhook idempotency, order transitions, listing lifecycle), axe accessibility zero-critical (04.5), Lighthouse budget.
- Migrations: forward-only, reviewed, never destructive without a two-step (deploy-then-drop) plan.
- Feature flags: simple config-table flags — curation auto-approve threshold (06.3), pricing guidance, alert channels are all flag-gated for gradual rollout (09 phases).

---

## 08.7 Explicit "laters" (with triggers)

| Later | Trigger |
|---|---|
| Meilisearch/Typesense | >50k listings or relevance complaints |
| Native/PWA push & app | Alert engagement proves demand (12/13 metrics) |
| Public seller API | First chain/integration deal (06.6) |
| Separate warehouse + BI | Analytics queries slow the prod DB |
| Multi-currency/multi-locale infra | First non-TR market decision (04: formatter is already centralized) |
| SMS notifications | Order-event email open rates show delivery gaps |
| WebSocket upgrade from SSE | A feature that needs client→server realtime (messaging, 06.5 post-MVP) |
