import db from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function GET({ cookies }) {
  const sessionId = cookies.get('session_id');

  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    cookies.delete('session_id', { path: '/' });
  }

  throw redirect(303, '/auth/login');
}