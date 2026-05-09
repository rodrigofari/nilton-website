import { $, on } from "./dom.js";
import { CONSENT_KEY } from "./config.js";

function emit(name) {
  window.dispatchEvent(new CustomEvent(name));
}

export function getConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

export function initConsent() {
  // Honor Global Privacy Control: explicit consent signal, treat as decline.
  if (navigator.globalPrivacyControl === true && !getConsent()) {
    localStorage.setItem(CONSENT_KEY, "declined");
    return;
  }

  const banner = $(".consent");
  if (!banner) return;

  const state = getConsent();
  if (state === "accepted") {
    banner.hidden = true;
    queueMicrotask(() => emit("consent:accepted"));
    return;
  }
  if (state === "declined") {
    banner.hidden = true;
    return;
  }

  // No prior choice — show banner.
  banner.hidden = false;

  on($(".consent__accept"), "click", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    banner.hidden = true;
    emit("consent:accepted");
  });

  on($(".consent__decline"), "click", () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    banner.hidden = true;
    emit("consent:declined");
  });
}
