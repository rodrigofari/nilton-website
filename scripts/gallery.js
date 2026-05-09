import { $, $$, on } from "./dom.js";

let lightbox, img, captionEl, items = [], currentIndex = 0;

function ensureLightbox() {
  lightbox = $(".lightbox");
  if (!lightbox) return null;
  img = $(".lightbox__img", lightbox);
  captionEl = $(".lightbox__caption", lightbox);

  on($(".lightbox__close", lightbox), "click", close);
  on($(".lightbox__prev", lightbox), "click", prev);
  on($(".lightbox__next", lightbox), "click", next);
  on(lightbox, "click", e => {
    if (e.target === lightbox) close();
  });
  on(document, "keydown", e => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  });

  items = $$(".gallery__item");
  return lightbox;
}

function show(i) {
  currentIndex = (i + items.length) % items.length;
  const trigger = items[currentIndex];
  const sourceImg = $("img", trigger);
  if (!sourceImg) return;
  img.src = sourceImg.src;
  img.alt = sourceImg.alt || "";
  if (captionEl) captionEl.textContent = sourceImg.alt || "";
}

export function openLightbox(eventOrIndex) {
  if (!lightbox) ensureLightbox();
  if (!lightbox) return;

  let i = 0;
  if (typeof eventOrIndex === "number") {
    i = eventOrIndex;
  } else if (eventOrIndex && eventOrIndex.target) {
    const trigger = eventOrIndex.target.closest(".gallery__item");
    i = items.indexOf(trigger);
    if (i < 0) i = 0;
  }
  show(i);
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  $(".lightbox__close", lightbox)?.focus();
}

function close() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove("no-scroll");
}

function prev() { show(currentIndex - 1); }
function next() { show(currentIndex + 1); }
