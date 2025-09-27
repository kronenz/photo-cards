import db from '$lib/server/db';

export async function handle({ event, resolve }) {
  const sessionId = event.cookies.get('session_id');

  if (!sessionId) {
    return await resolve(event);
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

  if (session && session.expiresAt > Date.now()) {
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(session.userId);
    if (user) {
      event.locals.user = user;
    }
  }

  return await resolve(event);
}