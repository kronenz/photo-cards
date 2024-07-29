import PocketBase from 'pocketbase';

const pocketbase_url = import.meta.env.VITE_POCKETBASE_URL || 'https://photo-card.pockethost.io/';
export const pb = new PocketBase(pocketbase_url);

