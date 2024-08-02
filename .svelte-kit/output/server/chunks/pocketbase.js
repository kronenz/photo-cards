import PocketBase from "pocketbase";
var define_import_meta_env_default = { BASE_URL: "/", DEV: false, MODE: "production", PROD: true, SSR: true };
const pocketbase_url = define_import_meta_env_default.VITE_POCKETBASE_URL || "https://photo-card.pockethost.io/";
const pb = new PocketBase(pocketbase_url);
export {
  pb as p
};
