// Pure client-side SPA: Leaflet and localStorage require browser APIs.
// With adapter-static, prerender=false + fallback:'index.html' produces a
// single-page application where all routing is handled client-side.
export const prerender = false;
export const ssr = false;
