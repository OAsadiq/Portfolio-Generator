# White Stone Properties — Launch Checklist

Everything between the site as it stands now and a live, compliant website. Work top to bottom. Anything shown in the site as *italic clay-coloured text* is a blank waiting for you, and it's listed here with the exact place to change it.

Files in this build: `index.html` (homepage), `property.html` (rental detail page), `privacy.html` (privacy, fees and legal).

---

## 1. Content to fill in

These are the stand-ins. The site works without them, but it isn't truly *yours* until they're real.

- [ ] **Mr Niyi's WhatsApp number.** Right now every WhatsApp button uses the general number. In `index.html`, near the top of the script there's a config block with `LANDLORD_PHONE`. Put his number there (digits only, with country code, e.g. `447...`). Tell me and I'll do it if you'd rather.
- [ ] **The three rentals are invented.** Canary Wharf, Maidstone and Jesmond with made-up rents. Replace with your actual available homes: title, location, rent, beds, baths, furnishing, available date, EPC rating, description and photos. These live in the `DATA` object in `property.html` and in the listing cards in `index.html`.
- [ ] **Property photos.** All images are stock placeholders. Swap in real photos of each home and each Whitestone Stays unit.
- [ ] **Airbnb / Booking.com links.** The "View on Airbnb" button points to the generic site. In `index.html` config, set `AIRBNB_URL` (and add a Booking.com link if you want one) to your real listings.
- [ ] **Whitestone Stays rates and amenities.** Confirm the nightly rate, cleaning fee and any seasonal rates with Mrs Tolani. Update `NIGHTLY` and `CLEANING` in the config, and the amenity list in the Stays section. Pull the amenities straight from your Airbnb so they match.
- [ ] **Reviews.** The testimonial is clearly marked as a placeholder. Replace once you've collected a few real ones, or remove the block for now.
- [ ] **Social handles.** Footer links are empty. Decide the handles (happy to suggest some) and drop them in.

---

## 2. Legal and compliance (do not skip)

UK letting and property management agents are required to show these. The privacy page has them all scaffolded with blanks.

- [ ] **Redress scheme.** Name the scheme you belong to (The Property Ombudsman, Property Redress Scheme, or Ombudsman Services). Update it in the footer of `index.html` and in `privacy.html` under "Regulatory & redress".
- [ ] **Client Money Protection (CMP).** Add your scheme name and membership number, and ideally a copy of the certificate. Same two places.
- [ ] **Fee schedule.** Publish your real landlord and tenant fees in `privacy.html` under "Fees". The tenant table already reflects the Tenant Fees Act; fill the landlord figures.
- [ ] **Deposit scheme.** Name the scheme you protect deposits with (DPS, MyDeposits, TDS) in the privacy page.
- [ ] **Privacy policy review.** It's a solid working draft, not finished legal copy. Read it against your scheme documents, set the retention period and "last updated" date, and list any third parties you share data with (referencing agency, etc). Get it checked before launch.

---

## 3. Deploy

- [ ] Put all three files in the **same folder** and deploy together to Netlify. The card-to-detail-page links and the forms only work once they're live together, not in preview.
- [ ] In the Netlify dashboard, turn on **Forms** (form detection). There are three: the homepage enquiry form, the tenant application form on the property page, and the contact form.
- [ ] Set up **form notifications** so submissions email you (admin@whitestonepropertyandestates.com) or ping a WhatsApp/Slack.
- [ ] Point your domain, **whitestonepropertyandestates.com**, at the Netlify site and confirm HTTPS is on.

---

## 4. After it's live, check these yourself

- [ ] Tap each WhatsApp button and confirm it opens a chat to the right number.
- [ ] Submit a test enquiry and a test tenant application; confirm they land in your inbox.
- [ ] Open a listing from the homepage and confirm the detail page loads the right property.
- [ ] Run the booking calendar: pick check-in and check-out, confirm the total and that "Request to book" opens WhatsApp with the dates filled in.
- [ ] Open the site on your own phone and walk every section once.
- [ ] Share the link in a WhatsApp chat and check the preview card looks right.

---

## Nice to have, later

Not needed for launch, but worth a thought once you're live: a live Airbnb calendar sync, a real Instagram feed in the footer, separate landing pages for landlords vs guests, and analytics (which would mean adding a cookie banner, noted on the privacy page).

*Built for White Stone Properties. The compliance notes point you in the right direction but aren't legal advice; confirm the specifics with your schemes.*
