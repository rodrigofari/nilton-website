import { GA_ID } from "./config.js";

export function initAnalytics() {
  if (window.__ga4Inited) return;
  window.__ga4Inited = true;

  // gtag.js loader. CSP must allow https://www.googletagmanager.com in script-src.
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
}
