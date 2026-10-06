# Porfilr Roadmap — Q4 2026

Written 3 Oct 2026. Covers now → end of January.

---

## What Porfilr is

**A portfolio builder that also gives people the tools their profession actually needs.**

Not a trading platform. Not a generic site builder. The edge is the second half: everyone
else stops at "here is your page", and we carry on into the work itself.

The Porfilr Journal is the first instance of that, not the product itself. Strip the trading
language out of it and the shape is:

> structured records the user adds over time → computed stats → shown on their public page

Trades become win rate, drawdown and an equity curve. The same shape fits shoots booked,
projects shipped, clients served, pieces published. **That shape is the product.** The
journal is one expression of it.

---

## Where we actually are

```
signups                41 lifetime, ~2/month now
published pages        20
people who logged      5   (2 of them real, 3 are ours)
paying customers       5   (1 kit at $35, 4 Pro from January)
lifetime revenue       $111
```

Two things are true at once, and the roadmap has to hold both:

**The product works.** Two real traders use it daily and unprompted. One logged 25 trades
in a month. 46% of signups publish something. Nobody who has properly used this has
complained that it doesn't do the job.

**Nobody arrives.** Of the seven people who ever opened a journal, every one was granted a
kit, is our own account, or was sold to by direct contact. **Zero organic traders in ten
months.** The constraint is reach, not the product.

---

## The mistake not to repeat

We built an excellent tool for an audience we had no way to reach. Three months of work
landed in front of almost nobody.

**The rule from here: prove we can reach a group before building their tool.**

Reversed, that sentence is what the last quarter cost.

---

## Two tracks

The trader kit is **not** being deprioritised. It's the only finished, working product we
have, and its distribution has never actually been tested — only its build. Dropping it now
means never learning whether the problem was the product or the reach, and we'd carry that
same unanswered question into the next profession.

So: finish the experiment, and start cheap validation beside it.

### Track A — Sell what we have (revenue)

Trader-focused, nothing new built. Everything already drafted is aimed here: five Journal
videos, the October graphics round, Rose's comment outreach, Ayo's posts.

**Goal: 20 people paying for anything, by 31 January.** Currently 5.

Counting any payment — kit or Pro — rather than kit alone, so the goal survives whichever
vertical responds. It isn't a revenue target; $700 isn't a business. It's a **proof**
target: does anyone pay for this at all? That answer is still genuinely unknown.

**The one non-negotiable: stop granting kits.** Six grants produced one activated user and
destroyed the data point we most need. Baliki logged 25 trades and would have hit the cap in
September — we'd now know whether an engaged trader pays $35. We gave that answer away. No
more grants, no exceptions.

**Engineering budget for Track A: close to zero.** The product is finished. If it feels like
it needs another feature to sell, that's an instinct to distrust — it's usually a more
comfortable job than selling.

### Track B — Find the next profession (validation, no engineering)

Runs in parallel because it costs Rose and Ayo's time, not build time. **It must not consume
engineering hours.** The moment it does, both tracks stall.

**Stage 0 — can we reach them? (2 weeks per vertical, nothing built)**

A landing page and a waitlist — we already have the plumbing and the "More kits coming"
panel. Then a fortnight of genuinely trying to reach that audience where they gather.

Gate, set now so it can't be rationalised later:

> **25 waitlist emails and 3 real conversations in 14 days.**

Miss it and the vertical is closed. Nothing was built, so nothing is lost. Run **two
verticals at once** and let them compete — relative response is far more informative than
one vertical judged against a number we invented.

**Stage 1 — portfolio only (about a week of build)**

Template and copy. No tool. This is already a complete product and it's what our 14
minimal-template users bought into.

Gate: people publish, and at least one pays for Pro.

**Stage 2 — the tool (weeks, not months)**

Only after Stage 1 clears. One recurring chore that profession actually dislikes doing.

---

## Which professions to test first

The only unprompted signal we have is the waitlist: **2 votes, both Developer / Engineer.**

I'd still discount developers. They build their own sites — the one audience that treats a
no-code builder as a weekend project to replace. Two real emails, hardest possible market.

The test for any candidate:

1. The portfolio is **commercially necessary**, not nice to have
2. They **won't build it themselves**
3. There's a **recurring chore** worth owning

Photographers and consultants/coaches both score on all three. Photographers: the portfolio
is the business, and client galleries and shoot tracking are real chores. Consultants:
testimonials and case studies.

But the deciding factor is **which one we can actually reach**, because reach is the binding
constraint at two signups a month. That's Stage 0's entire job — so don't decide this on
paper, run it.

---

## Engine extraction

The journal already contains most of a general engine: CSV import with column
auto-detection, the metrics layer, the calendar view, the free-cap and unlock mechanic, the
publish pipeline. What's trader-specific is the field schema, the metric definitions and the
copy.

If that generalises, profession two costs weeks instead of months. **Do the extraction while
building vertical two, not before it** — we'll only know what's genuinely generic by making
it serve a second case, and a refactor done in advance would be guessing.

---

## Dates

| When | Track A | Track B |
|---|---|---|
| Oct | Videos 2–5, Oct graphics, outreach at volume | Pick 2 verticals, build landing pages |
| Nov | Keep selling, no new build | Stage 0 runs; gate on 25 + 3 |
| Dec | Keep selling | Winner → Stage 1 portfolio template |
| Jan | **Hit 20 paying** | Stage 2 only if Stage 1 cleared |

---

## How we'll know this is going wrong

- **Engineering starts on vertical two before Stage 0 passes.** The exact mistake we just
  made, repeated.
- **A grant gets issued** "just this once" to someone promising.
- **Signups stay at two a month in November.** Then outreach isn't working and the channel
  needs changing, not more volume.
- **Nobody ever hits the paywall.** If no real user reaches 15 trades by December, we still
  don't know whether anyone pays — and that's the question the whole quarter exists to
  answer.

---

## Open question

We're priced for the US ($35) and distributed mostly through Nigerian channels. Country
capture went in on 3 Oct (`sql/015_event_region.sql`); there'll be real data by mid-October.

If the audience is overwhelmingly Nigerian, the choice is real: re-seed the audience toward
the US, or price for the audience we can actually reach. Don't decide it before the data
lands — but don't let it drift either, because "priced for America, distributed in Nigeria"
is the one combination where neither advantage applies.
