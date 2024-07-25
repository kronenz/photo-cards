

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.41f9a87d.js","_app/immutable/chunks/index.9c6289ae.js"];
export const stylesheets = [];
export const fonts = [];
