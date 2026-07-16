# Porfilr — Trader Portfolio Template: UI design brief

**What we need:** a high-fidelity design for one page — the **Trader portfolio template**. This is
the page our trader users will publish and send to investors, prop firms, and clients. It has to
look like something a serious trader is proud to put their name and money behind.

**Deliverable:** desktop (1440px wide) + mobile (390px wide) mockups of the full page, in Figma
(shareable link + view access). Please keep layers named and organised — I build this in code
afterwards, so I need to inspect spacing, type sizes, and colours.

**Format note:** this is a real, live template (there's a working version already built). You're
redesigning it to be more premium — not inventing a new product.

---

## Who it's for

Forex/crypto/index traders — mostly young, mostly mobile-first, but this page gets sent to
**investors, prop firms, and paying clients**. So the emotional target is:

> "This person is serious, disciplined, and safe to give money to."

Not: hype, lambos, "get rich quick," neon casino energy. The moment it looks like a hype-trader
Instagram post, we've lost the investor. Think **Bloomberg terminal meets a premium fintech
landing page** — restrained, data-forward, expensive-looking.

---

## Brand + visual direction

- **Accent:** Porfilr orange `#ea580c` (primary brand colour — must be present)
- **Base:** dark. Current build uses `#08080a` background, `#141418` / `#1b1b21` cards, `#282830` borders
- **Data colours:** green `#22c55e` for positive, red `#f87171` for negative, gold `#eab308` for funded/prop-firm status
- **Type:** Inter (400–900 available). Big, tight, confident headline weights
- Dark is the default and the direction we want. If you have a strong case for a light variant, mock one — but dark ships first.
- Spelling: **"Porfilr"** / **porfilr.com** — please double-check, it's not "Portfolio"/"Profilr".

---

## The page structure (design each of these)

1. **Hero** — avatar (or initials fallback), an optional gold "prop-firm funded" badge (e.g. "FTMO Funded • $200K"), name, headline/role, location, short bio, and two buttons: "Work with me" (primary) and "View my track record" (secondary, links out).

2. **Track record** — *this is the hero of the page, treat it as the centrepiece.* Five metrics: Total return (green), Win rate, Profit factor, Max drawdown (red), and Track record length. Right now they're plain cards; make them feel like premium data. This is what earns trust.

3. **Equity curve** — a user-uploaded chart image, framed in a card. Design the frame/treatment.

4. **Proof of results** — a user-uploaded statement/screenshot, framed. Plus a small text line linking out to an external verification source (e.g. MyFXBook).

5. **Markets** — small chips: Forex, Indices, Crypto.

6. **Strategy** — a heading + a paragraph of prose ("How I trade").

7. **Risk management** — a heading + a paragraph ("How I protect capital").

8. **Services** — up to 3 cards (e.g. Managed Accounts, Signals, 1:1 Mentorship): title + short description.

9. **Contact** — a form (name, email, message, send button) + social icons.

10. **Risk disclaimer** — small legal text at the bottom.

11. **Footer** — "Made with Porfilr" link.

---

## What we specifically want you to solve

The current build works but reads generic. The wins we're looking for:

- **Make the metrics unmissable.** This is the single most important part of the page — an investor should be able to glance and instantly read the trader's credibility. Data-viz treatment, hierarchy, whatever makes it land.
- **A richer hero** that establishes credibility in the first two seconds.
- **Real visual hierarchy** — right now every section carries roughly equal weight. Track record should dominate; strategy/risk should support.
- **A proper chart/proof treatment** — the uploaded images should look framed and intentional, not pasted in.
- **Mobile.** Most of our traffic is mobile and this page gets sent via DM/WhatsApp. The mobile view is not an afterthought — the metrics have to survive the small screen.

---

## Important constraints (please respect these)

- **Every section is optional.** Users fill in a form; if they skip a field, the section doesn't render. So the design must not fall apart when, say, there's no equity curve, no prop-firm badge, or only one service. Please show at least one "sparse" state (a trader with just name, bio, and 2–3 metrics).
- **The proof is user-supplied, not verified by us.** We do NOT verify these numbers. So do **not** design a "Verified by Porfilr" badge or anything implying we've audited the results — it would be a false claim. Wording like "View my track record" or "Verified via [source]" (where the source is an external site like MyFXBook) is fine. This matters legally, not just cosmetically.
- The equity curve and statement are **images the user uploads** — arbitrary aspect ratios and quality. Design the frame to handle imperfect images gracefully.
- Avatar has an **initials fallback** when no photo is uploaded — please design both.
- Text lengths vary wildly (a bio might be one line or five). Nothing should be designed assuming a perfect character count.

---

## Reference for tone

- **Yes:** Linear, Stripe, Bloomberg, premium fintech dashboards, restrained dark UI, confident typography
- **No:** hype-trader Instagram, neon/glow overload, casino energy, stock-photo money imagery, lambos

---

## Priorities (if you're short on time)

1. Track-record metrics section (the centrepiece)
2. Hero
3. Mobile version of both of the above
4. Everything else

---

## Timeline + questions

Timeline: [fill in]. Rate: [fill in].

Send me a first pass on the hero + metrics before designing the rest — I'd rather align early on
direction than have you build the whole page in a direction we then change. Any questions, ask.
