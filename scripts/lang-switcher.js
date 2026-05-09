import { $, $$, on } from "./dom.js";
import { LANG_KEY } from "./config.js";

export function initLangSwitcher() {
  const root = $(".lang-switcher");
  if (!root) return;

  const trigger = $(".lang-switcher__trigger", root);
  const menu = $(".lang-switcher__menu", root);
  if (!trigger || !menu) return;

  const close = () => {
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };
  const open = () => {
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  // Initial state — closed
  trigger.setAttribute("aria-expanded", "false");
  menu.hidden = true;

  on(trigger, "click", e => {
    e.stopPropagation();
    if (trigger.getAttribute("aria-expanded") === "true") close();
    else open();
  });

  on(document, "click", e => {
    if (!root.contains(e.target)) close();
  });

  on(document, "keydown", e => {
    if (e.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      close();
      trigger.focus();
    }
  });

  // Persist locale on choice
  for (const opt of $$(".lang-switcher__option", menu)) {
    on(opt, "click", () => {
      const locale = opt.dataset.locale;
      if (locale) localStorage.setItem(LANG_KEY, locale);
    });
  }
}
