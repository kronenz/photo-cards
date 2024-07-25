

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.02e46287.js","_app/immutable/chunks/scheduler.745dea18.js","_app/immutable/chunks/index.9ca1c632.js"];
export const stylesheets = [];
export const fonts = [];
