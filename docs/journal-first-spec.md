# Spec — Journal-first, free to start

Two changes shipped as one piece of work, because they touch the same surfaces:

1. **Journal-first positioning.** The journal is the product; the public page is what makes
   it yours. Today it's the other way round.
2. **Free to start, pay to continue.** No card to begin. A cap that fires after the user has
   seen their own data.

---

## WHY (the evidence, so this is revisitable)

- 8 kit owners. **7 are grants, 1 is a sale.** The one who paid never built a page.
- **6 of 8 have never logged a trade.** Free access already exists in the data and did not
  produce usage — so price is not the only blocker; time-to-value is.
- **3 of 4 trader pages have 0 views.** The only one with traffic is a founder test page
  (2 views). Meanwhile non-trader pages have 105 views between them, so pages do get looked
  at — trader pages don't.
- The one active user has 7 trades logged, uses the journal, and has his public track record
  **switched off**.

Directional, not conclusive — it's four pages. But it all points one way.

---

## 1. THE MODEL

**Free — no card, no trial clock**
- Log trades (manual), unlimited fields
- CSV import **enabled** — this is the accelerant, not the paywall
- Calendar, equity curve, win rate, drawdown, profit factor
- One published page, with Porfilr branding
- **Capped at 15 trades stored**
- The live track record and public calendar on the page — **free**

**Paid — $35 once**
- Cap removed
- Branding removed
- Custom domain

**The cap is on the journal, not the page.** If the page is a side-benefit, charging for
page polish would be charging for the part nobody wants. The thing they pay for is the
thing they're using.

### Why 15

Started at 25, lowered once everything else became free. The paid tier is now just two
things — the cap and the Porfilr badge — so the cap carries more of the weight than it did
when it was one limit among several.

15 is still roughly a month of trading for most people, so it lands *after* someone has a
real calendar to look at rather than before. It fires hardest on **importers** — someone
dropping in a Bybit export with 200 trades hits it immediately, having just watched their
own history render. That's the buyer.

Nothing is ever deleted: the trigger only fires on INSERT, so anyone already above the cap
keeps every trade they have and simply can't add more.

Manual loggers take months to reach it. That's fine; they aren't this quarter's revenue.

---

## 2. THE PAYWALL MOMENT

The whole model rests on this screen. It must appear **after** the user sees their own data,
never before.

On CSV import, when the file exceeds the remaining allowance:

> **We found 214 trades in your file.**
> We've imported the most recent 15 and built your calendar from them.
> Unlock the rest — $35 once, yours forever.
>
> [ Unlock all 214 ]   [ Keep the free 15 ]

Rules:
- Import the **most recent** N, not the first N. Recent trades are the ones they care about.
- Render the calendar and curve from what was imported **before** showing the prompt.
- "Keep the free 15" must be a real, non-punished choice. No nag on every page load.

Manual logging hits a quieter version at the form:

> You've logged 15 trades — that's the free limit. Unlock unlimited for $35 once.

---

## 3. ENFORCEMENT (important — the current architecture can't do this in the API)

Trades are written **client-side** via `supabase.from('trades').insert(...)`, not through an
API route. So a check in JavaScript is advisory only — anyone can bypass it from the console.

**Enforce with a Postgres trigger**, `sql/011_trade_cap.sql`:

```
BEFORE INSERT ON public.trades
  → count existing rows for NEW.user_id
  → if count >= free_trade_cap() AND no template_purchases row for (user_id, 'trader-template')
    → raise exception 'TRADE_CAP_REACHED'
```

Notes:
- Grandfathering is automatic: owning the kit removes the cap, and all 8 current owners
  have a purchase row.
- The client must catch `TRADE_CAP_REACHED` and show the paywall, not a raw DB error.
- Bulk CSV insert must be **pre-truncated client-side** to the remaining allowance, so the
  trigger is a backstop rather than the normal path — a 214-row insert failing halfway
  would leave a mess.
- Deleting trades to get back under the cap is allowed. Don't police it; it's a rounding
  error and the alternative feels hostile.

---

## 4. JOURNAL WITHOUT A PAGE (structural)

`/journal/:slug` currently requires a `portfolios` row — the journal hangs off a page. That
directly contradicts journal-first: a new user would have to build a page before they can
log a trade, which is the exact order that left 6 of 8 owners inactive.

**Fix:** on first entry to the journal, auto-create the portfolio row with
`status = 'draft'`.

- The draft gives the journal a home and a slug
- `api/p/index.js` must **404 on `status = 'draft'`** — an unpublished page must not be
  publicly reachable
- Publishing flips it to `active`
- The dashboard shows drafts as "Not published yet"

This is the largest single piece of work here and the one most likely to have edge cases.

---

## 5. ONBOARDING ORDER

Today: pick template → build page → (maybe) find the journal.
New: **set balance → import or log trades → see your calendar → "want a page for this?"**

- After signup as a trader: land on the journal, not the builder
- After purchase: land on the journal, not the builder
- The "publish a page" prompt appears once they have ≥5 trades — when there's something
  worth putting on it

---

## 5b. NAMING — "Porfilr Journal"

"Trader Kit" is wrong twice: *kit* means template bundle (what we're moving away from), and
nobody searches for it. People search **"trading journal"** — a term with real demand that
we currently rank for nowhere.

**Brand architecture — the parent stays generic:**

```
Porfilr  ............  portfolio pages for professionals   ← the company
  └─ Porfilr Journal   the trader module
  └─ (future)          photographer / designer modules where a tool is warranted
```

Naming the trader module does **not** narrow the company, as long as one rule holds:

> Porfilr Journal is a product *inside* Porfilr. It never replaces "Porfilr" in top-level
> marketing — the homepage keeps selling pages to everyone, and the niche landing pages
> are untouched.

Most future verticals need a *page*, which is the core product. Traders are the unusual case
that needs a *tool* on top. So the pattern is "Porfilr + module where a module is warranted",
not a new brand per niche.

Rename before the batch-4 graphics go into production — changing a name across posts,
graphics and emails after material exists is where the cost lands.

**URLs.** Canonical is `/trading-journal`. `/trader-kit` 301s to it in `vercel.json` and
must keep doing so: Ayo's tracked links (`/r/ayo`), everything already shared, and every
graphic printed so far point at the old path. The redirect also hands the accumulated SEO
to one URL rather than splitting it across two.

Two things about that config, both learned the hard way:

- **No comments.** `vercel.json` is validated against a strict schema — an explanatory
  `"comment"` key on a redirect fails the deploy with *"should NOT have additional
  property"*. Rationale goes here instead.
- **Host rules come first.** With the path rename above the `www` rule, a visitor to
  `www.porfilr.com/trader-kit` takes two redirects instead of one.

---

## 6. COPY CHANGES

- `/trader-kit` — sells a page today. Must sell the journal, with the page as the closing
  line rather than the headline.
- The kit purchase emails and `announce-calendar.mjs` — same shift.
- Anything still framing the page as proof for investors (see `designer-brief-batch4.md`
  retirement list).

---

## 7. WHAT WE MEASURE

Stop counting signups. The number that matters:

**Activation — users who log 5 or more trades.** Today that is **one person.**

- Activation: signed up → 5 trades
- Cap-hit rate: activated → reached the cap
- Conversion: reached cap → paid

If activation moves from 1 to 10, the model works and revenue follows. If it stays near
zero, the problem was never pricing — it's distribution, and no pricing change fixes that.

---

## 8. BUILD ORDER

1. `011_trade_cap.sql` + client error handling — the model doesn't exist without it
2. Draft portfolios, so the journal stands alone
3. Import paywall state (the revenue moment)
4. Onboarding order + landing destinations
5. Copy

Roughly 3–4 days. Steps 1 and 3 are the ones that earn money; 2 is the one that will
surprise us.

---

## 9. OUT OF SCOPE

- Subscriptions. $35 once, unchanged.
- Refunds/downgrades — nobody has hit this yet.
- Multiple journals per user.
- Team/coach accounts.

---

## 10. THE CAVEAT TO KEEP IN VIEW

Freemium improves the **rate** at which visitors become users. With roughly no visitors, a
better rate produces roughly nothing. This is worth building because it removes the
objection Rose and Ayo keep hitting — not because it will produce sales on its own.
