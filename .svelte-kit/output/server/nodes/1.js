

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ca1a2aba.js","_app/immutable/chunks/scheduler.745dea18.js","_app/immutable/chunks/index.9ca1c632.js","_app/immutable/chunks/singletons.2d2a0f4a.js","_app/immutable/chunks/index.a342afc0.js"];
export const stylesheets = [];
export const fonts = [];
