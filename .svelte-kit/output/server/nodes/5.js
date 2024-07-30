

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.05d326f2.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/navigation.2c662032.js","_app/immutable/chunks/singletons.9138bde8.js","_app/immutable/chunks/index.aa0c2982.js","_app/immutable/chunks/pocketbase.9c83e50f.js"];
export const stylesheets = ["_app/immutable/assets/5.b201568e.css"];
export const fonts = [];
