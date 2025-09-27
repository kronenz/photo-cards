import { writable } from 'svelte/store';
import { mockImages } from '$lib/mock-data.js';

export const images = writable(mockImages);