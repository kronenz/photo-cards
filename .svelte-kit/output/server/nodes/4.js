

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/card/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.32191b0d.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/index.aa0c2982.js"];
export const stylesheets = ["_app/immutable/assets/4.acf77daa.css"];
export const fonts = [];
