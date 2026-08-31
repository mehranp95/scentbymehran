import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, "dist-pages");
mkdirSync(out, { recursive: true });

const reviews = JSON.parse(readFileSync(join(root, "data/reviews.json"), "utf8"));
const css = readFileSync(join(root, "styles/site.css"), "utf8");

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shell({ title, accent, body, activeId }) {
  const nav = reviews
    .map(
      (r) =>
        `<a class="nav-chip${r.id === activeId ? " is-active" : ""}" href="/${r.id}.html" style="--chip:${r.accent_color}">${esc(r.name_fa)}</a>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — عطر با مهران</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body style="--accent:${accent || "#c4a484"}">
  <div class="atmosphere" aria-hidden="true"></div>
  <header class="top">
    <a class="brand" href="/">عطر با مهران<span>ScentbyMehran</span></a>
    <nav class="nav-scroll">${nav}</nav>
  </header>
  <main>${body}</main>
  <footer class="foot">
    <p>ریویوها با صدای کانال <a href="https://t.me/Scentbymehran" target="_blank" rel="noopener">@Scentbymehran</a></p>
  </footer>
</body>
</html>`;
}

function notesPanel(r) {
  const notes = (r.notes_main || [])
    .map((n, i) => `<li style="--i:${i}"><span>${esc(n)}</span></li>`)
    .join("");
  const accords = (r.notes_main || [])
    .map((n, i) => {
      const w = 92 - i * 12;
      return `<div class="accord" style="--w:${w}%; --i:${i}"><span>${esc(n)}</span></div>`;
    })
    .join("");
  return `
  <section class="frag-panel" aria-label="نوت‌های اصلی به سبک فرگرنتیکا">
    <div class="frag-panel__frame">
      <div class="frag-panel__bottle">
        <img src="/images/bottles/${r.id}.jpg" alt="${esc(r.name_en)}" />
      </div>
      <div class="frag-panel__notes">
        <p class="frag-kicker">Main accords · نوت‌های اصلی</p>
        <h2>${esc(r.name_en)}</h2>
        <div class="accords" aria-hidden="false">${accords}</div>
        <ul class="note-list">${notes}</ul>
        <a class="frag-link" href="${esc(r.fragrantica)}" target="_blank" rel="noopener">
          صفحه کامل فرگرنتیکا
          <span>Fragrantica ↗</span>
        </a>
      </div>
    </div>
  </section>`;
}

const cards = reviews
  .map(
    (r, i) => `
    <a class="card" href="/${r.id}.html" style="--accent:${r.accent_color}; --delay:${i * 40}ms">
      <div class="card__media">
        <img src="/images/bottles/${r.id}.jpg" alt="" loading="lazy" />
      </div>
      <div class="card__meta">
        <p class="card__brand">${esc(r.brand)}</p>
        <h2>${esc(r.name_fa)}</h2>
        <p class="card__en">${esc(r.name_en)}</p>
      </div>
    </a>`
  )
  .join("");

const indexBody = `
  <section class="hero">
    <p class="eyebrow">مجموعه ریویو</p>
    <h1>عطر با مهران</h1>
    <p class="lede">هفده رایحه، هفده صفحه. هر کدام با عکس شیشه، نوت‌های اصلی و ریویوی کانال.</p>
  </section>
  <section class="grid">${cards}</section>
`;

writeFileSync(
  join(out, "index.html"),
  shell({
    title: "عطر با مهران",
    accent: "#c4a484",
    body: indexBody,
    activeId: null,
  })
);

for (const r of reviews) {
  const year = r.year ? ` · ${String(r.year).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])}` : "";
  const body = `
  <article class="review" style="--accent:${r.accent_color}">
    <header class="review__head">
      <a class="back" href="/">← همه عطرها</a>
      <p class="eyebrow">${esc(r.brand)}${year}</p>
      <h1 class="review__title-en">${esc(r.name_en)}</h1>
      <p class="review__title-fa">${esc(r.name_fa)}</p>
    </header>

    ${notesPanel(r)}

    <section class="review__body">
      <h2 class="review-label">ریویو</h2>
      ${r.review_html}
    </section>

    <aside class="review__cta">
      <a href="${esc(r.fragrantica)}" target="_blank" rel="noopener">مشاهده در Fragrantica</a>
    </aside>
  </article>`;

  writeFileSync(
    join(out, `${r.id}.html`),
    shell({
      title: `${r.name_fa} | ${r.name_en}`,
      accent: r.accent_color,
      body,
      activeId: r.id,
    })
  );
}

// copy css reference not needed — inlined
console.log(`Built ${reviews.length + 1} pages -> ${out}`);
