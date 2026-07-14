# Porfilr — Instagram demo-video promotion

The video: hook "A Google Doc isn't a portfolio" + how to use + who it's for + features.
Goal: signups. Learned from the X ad — targeting silently ran broad in the WRONG country,
cheap CPM = junk traffic, 0 conversions. This setup fixes that: manual US audience + UTM +
a day-1 country check.

---

## Paid caption (for the boosted Reel — more direct CTA than organic)

**Primary:**
> A Google Doc isn't a portfolio. Here's what to send instead. 👇
>
> Build a professional portfolio in 10 minutes — no code, free to start. Pick a template, add your work, share one clean link that gets you hired.
>
> 👉 Tap the link and build yours free: porfilr.com
> —
> #freelance #portfolio #graphicdesign #webdesign #freelancetips

**Alt (shorter):**
> Still sending clients a Google Doc? Watch this. 👀
>
> A real portfolio, built in 10 minutes — no code, free. This is what your work deserves.
>
> 👉 Build yours free: porfilr.com
> —
> #freelance #portfolio #designer #creatives

Note: keep the on-screen hook doing the heavy lifting; the caption just reinforces + gives the CTA.

---

## Boost setup (Instagram in-app — the $25 test)

Boost an EXISTING Reel (post organically first, boost only if it gets engagement).

- **Goal:** More website visits (NOT profile visits)
- **Website URL:**
  `https://porfilr.com/templates?utm_source=ig&utm_medium=paid_social&utm_campaign=demo_video_us`
  (sending to /templates — it's public now, lands them straight on the gallery, no login wall)
- **Button:** Learn More (or Sign Up)
- **Audience:** ⚠️ "Create your own" — NOT "Automatic" (Automatic is what let the X ad run broad/wrong)
  - **Location:** United States ONLY
  - **Age:** 18–45
  - **Interests:** Graphic design, Web design, Freelance, Adobe, Canva, Behance, Dribbble, Portfolio
- **Budget & duration:** ~$5/day × 5 days = ~$25 total (watch the TOTAL, not daily)

Alternative (more control): Meta Ads Manager → objective Traffic → optimize for Link clicks →
same audience / UTM / budget.

---

## The rules that matter (learned from X)

1. **Manual US-only audience.** Never "Automatic" — that's how X ran in the UK by mistake.
2. **Check the country breakdown on DAY 1.** Confirm it's actually running in the US.
3. **Watch the CPM.** If it's suspiciously cheap (X was $0.09), it's serving junk inventory —
   pause and tighten. Real US-designer CPMs are much higher.
4. **UTM on the link** (already included) so signups attribute.

---

## Measure it

In Supabase SQL editor:
```sql
select name, count(*) from events
where props->>'utm_campaign' = 'demo_video_us'
group by name order by count desc;
```
Watch: link clicks (is the video landing?) → template_selected / signups (is it converting?).

Read it like:
- Cheap clicks + a signup or two → worth scaling.
- Clicks, no signups → landing/offer issue.
- Few clicks → creative/hook or audience issue.

---

## The sequence

1. Tomorrow: post the Reel organically (+ caption above). Reply to early comments.
2. Day 2–3: if it's getting engagement, boost it with the settings above.
3. Day 1 of boost: check country breakdown + CPM — confirm US, not junk.
4. Measure signups via the UTM over the run.
5. Don't scale until you see clicks → signups.
