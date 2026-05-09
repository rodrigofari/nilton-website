import { $, $$, on } from "./dom.js";

export function initNav() {
  const nav = $(".site-nav");
  const toggle = $(".site-nav__toggle");
  const list = $(".site-nav__list");
  const backdrop = $(".site-nav__backdrop");

  // Mobile menu toggle
  if (toggle && list) {
    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      list.classList.add("site-nav__list--open");
      backdrop?.classList.add("site-nav__backdrop--open");
    };
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      list.classList.remove("site-nav__list--open");
      backdrop?.classList.remove("site-nav__backdrop--open");
    };

    on(toggle, "click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      open ? closeMenu() : openMenu();
    });

    // Close on backdrop tap
    if (backdrop) on(backdrop, "click", closeMenu);

    // Close on Escape
    on(document, "keydown", e => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    });

    // Close on link click (mobile)
    for (const link of $$(".site-nav__link", list)) {
      on(link, "click", closeMenu);
    }
  }

  // Scroll-state class — for nav background opacity tweak when scrolled
  if (nav) {
    const update = () => {
      nav.classList.toggle("site-nav--scrolled", window.scrollY > 8);
    };
    update();
    on(window, "scroll", update, { passive: true });
  }

  // Active section highlight via IntersectionObserver
  const sections = $$("main section[id]");
  const links = $$(".site-nav__link[href^='#']");
  if (sections.length && links.length && "IntersectionObserver" in window) {
    const linkById = new Map(
      links.map(l => [l.getAttribute("href").slice(1), l])
    );
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const l of links) l.removeAttribute("aria-current");
        const link = linkById.get(entry.target.id);
        if (link) link.setAttribute("aria-current", "true");
      }
    }, { rootMargin: "-40% 0px -55% 0px" });
    for (const s of sections) observer.observe(s);
  }
}
