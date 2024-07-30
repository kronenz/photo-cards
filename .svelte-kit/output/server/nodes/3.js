

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.83f46ff4.js","_app/immutable/chunks/index.2054b73c.js"];
export const stylesheets = ["_app/immutable/assets/3.28a12191.css"];
export const fonts = [];
