# Image Placement Guide — Jaiclubb.app

This folder is where you drop your **100+ screenshots and photos**. Each filename below corresponds to a placeholder already wired into the HTML pages.

## Folder structure to create

```
assets/images/
├── og-cover.jpg               (1200×630) — site-wide social share image
├── og-fullreview.jpg          (1200×630) — main review social image
├── review/
│   ├── hero-jaiclub.jpg       (1600×900) — full review hero
│   ├── jaiclub-app-home.jpg   (1080×1920) — app home screenshot
│   ├── registration-flow.jpg  (1920×1080) — 3-panel: phone → OTP → password
│   └── deposit-upi-screen.jpg (1080×1920) — UPI deposit page
├── games/
│   ├── wingo-thumb.jpg        (800×450)   — homepage card
│   ├── wingo-hero.jpg         (1600×900)  — wingo page hero
│   ├── wingo-test-graph.jpg   (1200×675)  — your test chart
│   ├── k3-thumb.jpg           (800×450)
│   ├── k3-hero.jpg            (1600×900)
│   ├── 5d-thumb.jpg           (800×450)
│   ├── 5d-hero.jpg            (1600×900)
│   ├── aviator-thumb.jpg      (800×450)
│   ├── aviator-hero.jpg       (1600×900)
│   ├── mines-thumb.jpg        (800×450)
│   ├── mines-hero.jpg         (1600×900)
│   ├── dice-thumb.jpg         (800×450)
│   ├── dice-hero.jpg          (1600×900)
│   └── (extra) wingo-result-*.jpg etc.
├── guides/
│   ├── how-it-works.jpg       (800×450)
│   ├── how-it-works-hero.jpg  (1600×900)
│   ├── safety-tips.jpg        (800×450)
│   └── red-flags.jpg          (800×450)
├── blog/
│   ├── 01-real-or-fake.jpg    (800×450) — blog hub card
│   ├── 01-real-or-fake-hero.jpg (1600×900) — article hero
│   ├── 02-probability.jpg     (800×450)
│   ├── 03-help.jpg            (800×450)
│   ├── 04-telegram.jpg        (800×450)
│   └── (extra) screenshots for inline figures
└── gallery/
    ├── 01-home-screen.jpg     (1080×1920)
    ├── 02-wingo-lobby.jpg
    ├── 03-bet-slip.jpg
    ├── 04-wallet.jpg
    ├── 05-deposit-upi.jpg
    ├── 06-withdraw-page.jpg
    ├── 07-aviator-gameplay.jpg
    ├── 08-k3-dice.jpg
    ├── 09-5d-digits.jpg
    ├── 10-mines-board.jpg
    ├── 11-profile-page.jpg
    ├── 12-bonus-claim.jpg
    └── ... up to 100+
```

## How many photos can I add total?

You can add **100+ photos** following this scheme:

- **6 game pages × 5 screenshots each** = 30 images (gameplay screenshots, payout tables, bonus offers, withdrawal screens, etc.)
- **1 main review × 12 screenshots** = 12 images (registration, deposit, withdrawal, KYC, support chat, settings, etc.)
- **3 guides × 6 screenshots each** = 18 images (process diagrams, app interfaces, red flag examples)
- **4 blog articles × 8 screenshots each** = 32 images (investigation evidence, Telegram channel screenshots, payment receipts, etc.)
- **1 gallery on homepage × 12+ thumbnails** = 12+ images
- **Total = 104+ image slots**

If you need more, just add them inline in any article — see "How to add more inline images" below.

## Image specifications

| Image type | Dimensions | Format | Max file size | Loading |
|---|---|---|---|---|
| Hero / banner | 1600×900 | JPG/WebP | 200 KB | eager |
| Article inline | 1200×675 | JPG/WebP | 150 KB | lazy |
| Card thumbnail | 800×450 | JPG/WebP | 80 KB | lazy |
| Gallery thumbnail | 480×480 | JPG/WebP | 50 KB | lazy |
| OG / social share | 1200×630 | JPG | 200 KB | eager |
| App screenshot (mobile) | 1080×1920 | JPG/PNG | 250 KB | lazy |

**Always optimize before uploading.** Use:
- TinyPNG (free): https://tinypng.com/
- Squoosh.app (free, browser): https://squoosh.app/
- ImageOptim (Mac, free)

Convert to WebP for better compression — modern browsers all support it.

## SEO image best practices (already wired in)

- ✅ Every `<img>` has descriptive `alt` text (you may want to refine these)
- ✅ `loading="lazy"` for below-the-fold images
- ✅ `width` and `height` attributes prevent layout shift
- ✅ Images sit inside `<figure>` with `<figcaption>` for captions

## Naming your screenshots

Use **descriptive, keyword-rich filenames**:

- ✅ `jaiclub-wingo-color-prediction-screen.jpg`
- ✅ `aviator-multiplier-crash-screenshot.jpg`
- ✅ `jai-club-withdrawal-rejected-error.jpg`
- ❌ `IMG_0123.JPG`
- ❌ `screenshot-1.png`

Filenames are read by Google for image search ranking.

## Alt text guidelines

When replacing the placeholder images, update the `alt=""` attribute in the HTML to describe what the image actually shows. Examples:

```html
<img src="games/wingo-hero.jpg"
     alt="Jai Club Wingo game interface showing 30-second countdown timer and red green color betting buttons"
     loading="lazy" width="1600" height="900" />
```

Good alt text:
- Describes what's in the image specifically
- Includes relevant keywords naturally (not stuffed)
- 8-20 words ideal
- No "image of" or "picture of"

## How to add more inline images

To add an image anywhere in an article, replace this placeholder block:

```html
<figure class="placeholder">
  <div class="img-placeholder">📸 Add: assets/images/...</div>
</figure>
```

With this:

```html
<figure>
  <img src="../assets/images/your-image.jpg"
       alt="Descriptive alt text here"
       loading="lazy" width="1200" height="675" />
  <figcaption>Optional caption that appears below the image.</figcaption>
</figure>
```

## Watermarking your screenshots

To protect your original screenshots from being scraped:

1. Add a small watermark in the corner: "Jaiclubb.app"
2. Use the bottom-right corner with 50% opacity
3. Free tool: https://watermark.ws/
4. Or use Canva's built-in watermark feature

## Quick checklist before going live

- [ ] All placeholder `.img-placeholder` divs replaced with real `<img>` tags
- [ ] All images compressed (target: under sizes in table above)
- [ ] All filenames are keyword-rich
- [ ] All `alt` attributes are descriptive
- [ ] `og-cover.jpg` exists (the site-wide social share image)
- [ ] Images converted to WebP where possible
- [ ] At least 100 images placed across the site
- [ ] Image sitemap generated (optional but helps SEO — see Google Search Console)

Happy uploading.
