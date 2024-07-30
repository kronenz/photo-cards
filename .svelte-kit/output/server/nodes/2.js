

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.a07783e2.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/pocketbase.9c83e50f.js","_app/immutable/chunks/index.aa0c2982.js"];
export const stylesheets = [];
export const fonts = [];
