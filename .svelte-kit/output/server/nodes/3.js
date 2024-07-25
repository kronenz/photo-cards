

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/card/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.526d02b5.js","_app/immutable/chunks/index.9c6289ae.js","_app/immutable/chunks/index.8d3ee9ed.js"];
export const stylesheets = ["_app/immutable/assets/3.5fd3ddd4.css"];
export const fonts = [];
