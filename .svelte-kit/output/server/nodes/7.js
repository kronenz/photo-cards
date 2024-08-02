import * as server from '../entries/pages/register/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/register/+page.server.js";
export const imports = ["_app/immutable/nodes/7.Dgh6uv_x.js","_app/immutable/chunks/scheduler.CqjKDTOy.js","_app/immutable/chunks/index.Cb7-gMiR.js","_app/immutable/chunks/entry.DxwvArx-.js","_app/immutable/chunks/index.C2vmYAQS.js","_app/immutable/chunks/pocketbase.DE3X10qx.js"];
export const stylesheets = ["_app/immutable/assets/7.BZ3TBzxD.css"];
export const fonts = [];
