# Home Concepts website

A static, single-page marketing site for Home Concepts (Malerkotla, Punjab). No backend, no build step to deploy — just HTML/CSS/JS and images.

## Structure

- `index.html` — the whole site (one page, sections linked by in-page anchors).
- `css/` — `main.css` imports the rest in order (`fonts`, `tokens`, `base`, `layout`, `components`, `accordion-gallery`, `sections`, `sticky`).
- `js/` — small ES modules wired up by `main.js`: `nav.js` (mobile menu), `floating-whatsapp.js` (floating WhatsApp button), `reveal.js` (scroll animations), `header-scroll.js` (navbar), `hero-showcase.js` (hero carousel), `accordion-gallery.js` (Our Work gallery), `reviews-carousel.js` (Testimonials).
- `images/gallery/`, `images/hero/` — the photos actually used on the site. **Each one is a single file** — see below.
- `images/source/` — the original raw photos these were cropped from. Not used by the site; kept only as an archive.

## Replacing a photo

Every photo on the site is exactly one file, at its final size, with no other copies to keep in sync. To swap one out:

1. Crop/export your new photo (any normal photo editor or phone gallery app works).
2. Save it as a `.jpg`, using the **exact same filename** as the photo you're replacing (e.g. `images/gallery/curtains-01.jpg`).
3. Overwrite the old file. That's it — nothing else to update.

Current files and where they're used:

| File | Used for |
|---|---|
| `images/hero/hero-01.jpg` … `hero-05.jpg` | The 5 rotating hero background photos |
| `images/gallery/curtains-01.jpg`, `curtains-02.jpg`, `curtains-03.jpg` | Curtain photos (Our Work gallery, hero cards, Instagram grid) |
| `images/gallery/bedding-01.jpg`, `bedding-02.jpg` | Bed & home linen photos |
| `images/gallery/upholstery-01.jpg`, `upholstery-02.jpg` | Upholstery photos |

Aim for roughly 1200–1600px on the longer side — sharp enough for a full-width hero photo, but not so large that the page gets slow to load. There's no automatic resizing, so an oversized file (e.g. a 12MP phone photo straight off the camera) will work but will make the page heavier than it needs to be.

To add or remove a slide/photo entirely (not just swap an existing one), edit the `SLIDES` array in `js/hero-showcase.js` or the `ITEMS` array in `js/accordion-gallery.js`.

## Content you'll likely want to update

Search `index.html` for these and update all occurrences consistently:

- **Phone / WhatsApp number**: `919988205088` appears in every `tel:` and `wa.me` link.
- **Reviews section** (`id="reviews"`): the star rating, review count, and all five quotes/names are **placeholders** — replace with real Google reviews before launch.
- **FAQ section** (`id="faq"`): review the 5 questions/answers and adjust wording as needed.
- **`sitemap.xml` / `robots.txt`**: contain a placeholder domain (`homeconcepts.example`) — update once the site has a real domain.

## Deploying

Any static host works (Netlify, Vercel, GitHub Pages, or plain shared hosting) — just upload everything except `images/source/`.
