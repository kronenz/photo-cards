

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.d4140140.js","_app/immutable/chunks/index.9c6289ae.js"];
export const stylesheets = [];
export const fonts = [];
