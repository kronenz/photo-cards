import PocketBase from "pocketbase";
const pocketbase_url = {}.VITE_POCKETBASE_URL || "https://photo-card.pockethost.io/";
const pb = new PocketBase(pocketbase_url);
export {
  pb as p
};
