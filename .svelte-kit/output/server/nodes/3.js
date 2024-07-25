

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/card/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.6628d08a.js","_app/immutable/chunks/scheduler.745dea18.js","_app/immutable/chunks/index.9ca1c632.js","_app/immutable/chunks/index.a342afc0.js"];
export const stylesheets = ["_app/immutable/assets/3.5fd3ddd4.css"];
export const fonts = [];
