

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.rGjtMvNI.js","_app/immutable/chunks/scheduler.CqjKDTOy.js","_app/immutable/chunks/index.Cb7-gMiR.js","_app/immutable/chunks/entry.DxwvArx-.js","_app/immutable/chunks/index.C2vmYAQS.js","_app/immutable/chunks/stores.X0h6c6jg.js"];
export const stylesheets = ["_app/immutable/assets/3.BMfX9W2q.css"];
export const fonts = [];
