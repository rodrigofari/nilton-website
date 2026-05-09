import { $ } from "./dom.js";

/* Show the floating CTA immediately on page load. Hide it only
 * when the contact section is in view (the in-page CTA is right
 * there, so the FAB would be redundant). Uses IntersectionObserver
 * — no scroll listener. */
export function initFloatingCta() {
  const fab = $(".floating-cta");
  if (!fab) return;

  // Visible by default on page load.
  fab.classList.add("floating-cta--visible");

  const contact = $("#contact");
  if (!contact || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      fab.classList.toggle("floating-cta--visible", !entry.isIntersecting);
    }
  }, { threshold: 0.4 });
  observer.observe(contact);
}
