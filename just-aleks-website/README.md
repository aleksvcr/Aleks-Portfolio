# just aleks // portfolio

Bilingual (EN/ES) Persona-inspired portfolio site.
Static HTML, CSS and vanilla JavaScript. No build step, no dependencies.

```
just-aleks-website/
  index.html          all markup, both languages
  css/styles.css      design tokens + every style
  js/main.js          ransom type, level system, clock, nav
  assets/img/         drop project screenshots here
  .vscode/            recommended extensions + settings
```

## Run it locally

Open `index.html` in a browser. That is genuinely it.

For live reload in VS Code install the **Live Server** extension (it is in the
recommended list, VS Code will prompt you), right-click `index.html`, choose
*Open with Live Server*.

Or from a terminal:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## The moving parts

### 1. Ransom-note headlines

Any element with `class="rn"` gets split into individual letters at load.
Each letter picks a random typeface, upper/lower case, tilt, vertical shift
and scale. Add `data-chips="1"` and some letters also get a pasted cut-out
background.

The randomness is **seeded off the text itself**, so the exact same layout
appears on every reload. Change the words and you get a new arrangement.

The five faces live in `css/styles.css` as `.rf-a` through `.rf-e`.
Swap a font family there to change the mix.

### 2. Level system

The status card level is your age. It is driven by a single attribute:

```html
<div class="av-card" id="card" data-birth="2004-01-14">
```

Change that date and everything follows: the LV number, the days-until
countdown, and the XP bar. On the birthday itself the tab switches to
"LEVEL UP!" and pulses gold. Nothing to maintain, ever.

### 3. Cancun clock

The bottom bar always shows **Cancun** time, not the visitor's. It uses
`Intl.DateTimeFormat` with `America/Cancun`, so daylight saving is handled
automatically.

The little diamond is a live availability light: green during working hours,
grey outside them. Hours are set in `js/main.js`:

```js
const open =
  (wd >= 1 && wd <= 5 && p.hour >= 9  && p.hour < 18) ||   // Mon-Fri 9-6
  (wd === 6            && p.hour >= 10 && p.hour < 14);    // Sat 10-2
```

### 4. Editing content

Every piece of text exists twice, tagged by language:

```html
<span class="l-en">English text</span>
<span class="l-es">Texto en espanol</span>
```

CSS hides whichever does not match `<html data-lang="...">`.
**If you edit one language, edit the other**, or that line goes blank for
half your visitors.

### 5. Colors

Everything lives in the `:root` block at the top of `css/styles.css`.
Colors use OKLCH: `oklch(lightness chroma hue)`.
Change `--red` and the whole site follows.

## Default language

`js/main.js` picks in this order:

1. whatever the visitor chose last (localStorage)
2. the browser language, Spanish if it starts with `es`
3. English

To make Spanish the hard default, change `data-lang="en"` to `data-lang="es"`
on the `<html>` tag and swap the `aria-pressed` values on the two language
buttons.

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git.
3. Build command: **leave empty**. Build output directory: **/**
4. Deploy, then add your custom domain in the Pages project settings.

SSL is issued automatically. Nothing to compile, so no build step.

## Before going live

- [ ] Swap the CSS placeholder thumbnails for real screenshots
- [ ] Add a favicon: `<link rel="icon" href="assets/favicon.png">`
- [ ] Add an Open Graph image so links preview properly on WhatsApp
- [ ] Verify the WhatsApp number in every link (`wa.me/529984864549`)
- [ ] Verify the email (`nerfbastion014@gmail.com`)
- [ ] Point the domain and confirm HTTPS
