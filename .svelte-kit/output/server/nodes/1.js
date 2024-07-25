

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.4a0aa90e.js","_app/immutable/chunks/index.9c6289ae.js","_app/immutable/chunks/singletons.865f28da.js","_app/immutable/chunks/index.8d3ee9ed.js"];
export const stylesheets = [];
export const fonts = [];
