

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/card/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.DW-cYwSc.js","_app/immutable/chunks/scheduler.CqjKDTOy.js","_app/immutable/chunks/index.Cb7-gMiR.js","_app/immutable/chunks/CardProxy.DuluoO3k.js","_app/immutable/chunks/index.C2vmYAQS.js"];
export const stylesheets = ["_app/immutable/assets/4.C72RruFH.css","_app/immutable/assets/CardProxy.aiBzuC07.css"];
export const fonts = [];
