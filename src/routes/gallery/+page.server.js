import { redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/auth/login');
  }

  const images = db.prepare('SELECT imagePath FROM images WHERE userId = ?').all(locals.user.id);

  return {
    images,
  };
}