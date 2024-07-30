

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.f1e3f93f.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/navigation.2c662032.js","_app/immutable/chunks/singletons.9138bde8.js","_app/immutable/chunks/index.aa0c2982.js","_app/immutable/chunks/pocketbase.9c83e50f.js"];
export const stylesheets = ["_app/immutable/assets/6.ea054280.css"];
export const fonts = [];
