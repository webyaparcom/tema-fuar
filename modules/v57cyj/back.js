/* footer-serit — Ortalı footer + kaydırmayla akan yazı şeridi (15 Kas 2026, G3 · mcp:webmaker/20261115-202336-i5p2).
   Yer tutucular (koşulsuz): srtsinif srtserit srthakkinda srtsayfa srtiletisim srtsosyal srtyil. {{langbar}} motor; @anahtar@ lang.json.
   Şerit öğeleri: desing.serit ([dil sözlüğü] ya da tek sözlük, «,» ile bölünür) → setting.keyword → site adı. Uydurma metin yok.
   Şerit kendiliğinden hareket etmez: sayfa kaydırıldıkça kayar (index.html betiği) — reduced-motion'da sabit. */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const dogruMu = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");

const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const sayfa = page || {};

/* --- şerit --- */
const bol = (s) => String(s || "").split(/[,،;|]/).map((x) => x.trim()).filter(Boolean);
let seritOge = Array.isArray(des.serit) ? des.serit.map((x) => pick(x).trim()).filter(Boolean) : bol(pick(des.serit));
if (!seritOge.length) seritOge = bol(pick(setting.keyword)).slice(0, 6);
if (!seritOge.length) seritOge = ["{{web-name}}"];
const seritTek = seritOge.map((t, i) => `<span class="modulex-srt-kelime${i % 2 ? " modulex-srt-kelime--cizgi" : ""}">${t === "{{web-name}}" ? t : esc(t)}</span><span class="modulex-srt-yildiz" aria-hidden="true">✦</span>`).join("");
/* en az ~12 kelime: geniş ekranda kayarken uç boş kalmasın */
const kopya = Math.max(3, Math.ceil(12 / seritOge.length));
const srtSerit = dogruMu(des.serit_goster, true)
  ? `<div class="modulex-srt-serit" aria-hidden="true"><div class="modulex-srt-akis" data-kopya="${kopya}">${seritTek.repeat(kopya)}</div></div>`
  : "";

/* --- sayfalar --- */
let maks = parseInt(des.maxpages, 10);
if (!Number.isFinite(maks)) maks = 8;
const ps = Array.isArray(webmakerdata?.pagesetting?.data)
  ? webmakerdata.pagesetting.data.find((it) => it?.modulestatus?.page)
  : null;
const satirlar = ps && Array.isArray(webmakerdata?.[ps.path]?.data) ? webmakerdata[ps.path].data : [];
const sayfalar = [{ ad: "@home@", href: wxLangInternalHref(""), aktif: !sayfa.path }];
for (const r of satirlar) {
  if (maks > 0 && sayfalar.length > maks) break;
  if (!r || r.status !== "play" || (r.category || "") !== "") continue;
  const ad = pick(r.name).trim();
  if (ad) sayfalar.push({ ad: esc(ad), href: wxLangInternalHref(r.pathnext || r.path || ""), aktif: !!sayfa.path && sayfa.path === r.path });
}
const srtSayfa = sayfalar.map((o) =>
  `<li><a class="modulex-srt-link" href="${esc(o.href)}"${o.aktif ? ' aria-current="page"' : ""}>${o.ad}</a></li>`
).join("");

const hakkinda = pick(des.hakkinda).trim() || pick(setting.description).trim();
const srtHakkinda = hakkinda ? `<p class="modulex-srt-hakkinda">${esc(hakkinda)}</p>` : "";

const tel = pick(des.tel).trim() || (typeof setting.phone === "string" ? setting.phone.trim() : "");
const posta = pick(des.eposta).trim() || (typeof setting.email === "string" ? setting.email.trim() : "");
const adres = pick(des.adres).trim() || pick(setting.address).trim();
const ilt = [
  tel ? `<li><a class="modulex-srt-link" href="tel:${tel.replace(/[^+\d]/g, "")}"><bdi dir="ltr">${esc(tel)}</bdi></a></li>` : "",
  posta ? `<li><a class="modulex-srt-link" href="mailto:${esc(posta)}"><bdi dir="ltr">${esc(posta)}</bdi></a></li>` : "",
  adres ? `<li><span class="modulex-srt-adres">${esc(adres)}</span></li>` : "",
].join("");
const srtIletisim = ilt ? `<ul class="modulex-srt-satir modulex-srt-iletisim" aria-label="@contact-us@">${ilt}</ul>` : "";

const srtSosyal = typeof wmSocialBar === "function"
  ? wmSocialBar({ liste: "modulex-srt-sosyal", oge: "modulex-srt-sosyal-li", baglanti: "modulex-srt-sosyal-a", aria: "@follow-us@" })
  : "";

const srtSinif = srtSerit ? "" : " modulex-srt--seritsiz";

html = html
  .replaceAll("{{srtsinif}}", () => srtSinif)
  .replaceAll("{{srtserit}}", () => srtSerit)
  .replaceAll("{{srthakkinda}}", () => srtHakkinda)
  .replaceAll("{{srtsayfa}}", () => srtSayfa)
  .replaceAll("{{srtiletisim}}", () => srtIletisim)
  .replaceAll("{{srtsosyal}}", () => srtSosyal)
  .replaceAll("{{srtyil}}", () => String(new Date().getFullYear()));
