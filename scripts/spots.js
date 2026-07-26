/* Spots carousel affordance.
 *
 * Note on the arrows: they are not decoration. The scroll container is a <ul>,
 * which is not focusable, so before this a keyboard-only visitor could not
 * reach the other six spots at all. The buttons are the only keyboard path.
 *
 * The nine spot cards live in a horizontally scrollable flex row at every
 * breakpoint (9 × 360px never fits). Nothing on screen said so, so visitors
 * saw three spots and assumed that was all of them.
 *
 * Three additions, in order of how much they do:
 *   1. Arrow buttons — the honest fix. Always visible, keyboard reachable,
 *      hidden at the ends so their state tells you where you are.
 *   2. An edge fade that only appears when there is actually more content in
 *      that direction. A permanent fade would read as a visual bug at rest.
 *   3. A single ~40px nudge the first time the section comes into view.
 *
 * ---------------------------------------------------------------------------
 * Why a nudge and not an auto-advancing carousel
 * ---------------------------------------------------------------------------
 * An auto-advancing carousel was the original request. Rejected on three
 * counts, recorded here so it doesn't get re-litigated:
 *
 *   - WCAG 2.2.2 requires a pause control for anything that moves by itself
 *     for more than 5 seconds. This nudge is under 1s and happens once, so the
 *     rule does not apply and no pause control is needed.
 *   - Each card carries a description. Text that moves while you read it is
 *     worse than text that sits still and looks static.
 *   - It would have destroyed the `spot_view` metric. Auto-advance means all
 *     nine spots register on every visit, so "which spots do people seek out"
 *     becomes "all of them, always".
 *
 * ---------------------------------------------------------------------------
 * The metric guard
 * ---------------------------------------------------------------------------
 * `spot_view` in track.js fires at 60% card visibility — 216px of a 360px
 * card. The nudge moves 40px, 11% of the width. A card sitting at 57% before
 * the nudge would cross to 62% during it and register a view the visitor never
 * caused. Unlikely, but the observer unobserves after firing, so a false
 * positive is permanent and uncorrectable.
 *
 * So this module owns the timing: it dispatches `spots:ready` only once the
 * nudge has finished (or immediately when there is no nudge), and track.js
 * waits for that before it starts observing. The animation cannot contaminate
 * the data.
 */

import { $, $$, on } from "./dom.js";

const NUDGE_PX = 40;
const NUDGE_HOLD_MS = 420;   // time at the far point before easing back
const SETTLE_MS = 700;       // smooth-scroll has no completion event; wait it out

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Fires exactly once, on every path, so track.js can never wait forever. */
function ready() {
  if (ready.done) return;
  ready.done = true;
  window.dispatchEvent(new CustomEvent("spots:ready"));
}

function cardStep(grid) {
  const first = grid.querySelector("li");
  if (!first) return grid.clientWidth * 0.8;
  const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
  return first.getBoundingClientRect().width + gap;
}

/* Drives both the arrow disabled states and which edge is faded. One source of
 * truth, so the two can never disagree about where the scroller is. */
function syncEdges(grid, prev, next) {
  const max = grid.scrollWidth - grid.clientWidth;
  const x = grid.scrollLeft;
  const atStart = x <= 2;
  const atEnd = x >= max - 2;
  grid.dataset.scroll = max <= 2 ? "none" : atStart ? "start" : atEnd ? "end" : "middle";
  prev.disabled = atStart;
  next.disabled = atEnd;
}

function buildArrows(grid) {
  const nav = document.createElement("div");
  nav.className = "spots__nav";

  const make = (dir, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `spots__arrow spots__arrow--${dir}`;
    // Labels ride on the grid as data attributes rather than living in
    // content/*.json: schema.json declares `spots` as additionalProperties
    // false, so new keys there would fail validation. The attribute is inlined
    // per locale, which also keeps it readable without JavaScript.
    b.setAttribute("aria-label", label || (dir === "prev" ? "Previous" : "Next"));

    // Built with DOM calls rather than innerHTML. The string would be entirely
    // author-controlled here, so it is not an injection risk — but a strict-CSP
    // codebase shouldn't normalise the pattern, and SVG needs its namespace
    // anyway for `use` to resolve.
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    const use = document.createElementNS(NS, "use");
    use.setAttribute("href",
      `/assets/images/icons/sprite.svg#icon-arrow-${dir === "prev" ? "left" : "right"}`);
    svg.append(use);
    b.append(svg);
    return b;
  };

  const prev = make("prev", grid.dataset.labelPrev);
  const next = make("next", grid.dataset.labelNext);
  nav.append(prev, next);
  // BEFORE the row, not after. The cards are tall — on a phone a single card
  // fills the viewport — so controls placed below them are off-screen exactly
  // when the visitor needs the hint that the row scrolls.
  grid.insertAdjacentElement("beforebegin", nav);

  const step = () => cardStep(grid);
  on(prev, "click", () => grid.scrollBy({ left: -step(), behavior: reducedMotion() ? "auto" : "smooth" }));
  on(next, "click", () => grid.scrollBy({ left:  step(), behavior: reducedMotion() ? "auto" : "smooth" }));

  return { prev, next };
}

export function initSpots() {
  const grid = $(".spots__grid");
  if (!grid) return ready();          // privacy pages etc. — nothing to do

  const { prev, next } = buildArrows(grid);
  syncEdges(grid, prev, next);
  on(grid, "scroll", () => syncEdges(grid, prev, next), { passive: true });
  on(window, "resize", () => syncEdges(grid, prev, next), { passive: true });

  /* Any sign the visitor is already driving the scroller cancels the nudge —
   * moving content under someone's finger is worse than no hint at all. */
  let touched = false;
  const markTouched = () => { touched = true; };
  for (const ev of ["pointerdown", "touchstart", "wheel", "keydown"]) {
    on(grid, ev, markTouched, { passive: true, once: true });
  }

  const section = document.getElementById("spots");
  if (!section || !("IntersectionObserver" in window) || reducedMotion()) return ready();

  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.disconnect();                        // once per page view, never repeats

      if (touched || grid.scrollLeft > 2) return ready();

      grid.scrollTo({ left: NUDGE_PX, behavior: "smooth" });
      setTimeout(() => {
        if (!touched) grid.scrollTo({ left: 0, behavior: "smooth" });
        // Release the metric observer only after the movement has settled.
        setTimeout(ready, SETTLE_MS);
      }, NUDGE_HOLD_MS);
    }
  }, { rootMargin: "-20% 0px -20% 0px" });

  io.observe(section);
}
