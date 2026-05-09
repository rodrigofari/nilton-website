import { $$ } from "./dom.js";

function resolve(obj, path) {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function substitute(str) {
  return str.replace("{year}", String(new Date().getFullYear()));
}

function markMissing(el, key) {
  console.warn(`[i18n] missing key: ${key}`);
  el.dataset.missing = "true";
  return `[${key}]`;
}

export async function initI18n() {
  const locale = document.documentElement.lang || "en";
  const baseLocale = locale.split("-")[0];

  let data;
  try {
    const res = await fetch(`/content/${baseLocale}.json`, { cache: "default" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error(`[i18n] failed to load /content/${baseLocale}.json`, err);
    return;
  }

  // Text content
  for (const el of $$("[data-i18n]")) {
    const key = el.dataset.i18n;
    const value = resolve(data, key);
    el.textContent = value === undefined ? markMissing(el, key) : substitute(value);
  }

  // Attribute binding: "attr:key.path" or "attr1:k1,attr2:k2"
  for (const el of $$("[data-i18n-attr]")) {
    const pairs = el.dataset.i18nAttr.split(",");
    for (const pair of pairs) {
      const [attr, key] = pair.split(":").map(s => s.trim());
      if (!attr || !key) continue;
      const value = resolve(data, key);
      if (value === undefined) {
        markMissing(el, key);
        el.setAttribute(attr, `[${key}]`);
      } else {
        el.setAttribute(attr, substitute(value));
      }
    }
  }

  // URL building: appends ?text=<encoded resolved value> to existing href
  for (const el of $$("[data-i18n-href]")) {
    const key = el.dataset.i18nHref;
    const value = resolve(data, key);
    if (value === undefined) {
      markMissing(el, key);
      continue;
    }
    const url = new URL(el.getAttribute("href"), location.origin);
    url.searchParams.set("text", substitute(value));
    el.setAttribute("href", url.toString());
  }

  return data;
}
