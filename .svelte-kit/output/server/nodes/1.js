

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.388a8c7e.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/stores.b68e62f9.js","_app/immutable/chunks/singletons.9138bde8.js","_app/immutable/chunks/index.aa0c2982.js"];
export const stylesheets = [];
export const fonts = [];
