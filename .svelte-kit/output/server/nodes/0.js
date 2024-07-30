

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.11eb1c75.js","_app/immutable/chunks/index.2054b73c.js","_app/immutable/chunks/stores.b68e62f9.js","_app/immutable/chunks/singletons.9138bde8.js","_app/immutable/chunks/index.aa0c2982.js"];
export const stylesheets = ["_app/immutable/assets/0.4e3f8a62.css"];
export const fonts = ["_app/immutable/assets/NeoDunggeunmoPro-Regular.e4b974b1.ttf"];
