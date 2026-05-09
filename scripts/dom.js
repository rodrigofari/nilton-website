export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const on = (el, ev, fn, opts) => el.addEventListener(ev, fn, opts);
