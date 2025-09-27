import db from '$lib/server/db';
import bcrypt from 'bcrypt';
import { redirect } from '@sveltejs/kit';
import { v4 as uuid } from 'uuid';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password) {
      return { error: 'Username and password are required' };
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return { error: 'Invalid username or password' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: 'Invalid username or password' };
    }

    const sessionId = uuid();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 1 week

    db.prepare('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)')
      .run(sessionId, user.id, expiresAt);

    cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    throw redirect(303, '/gallery');
  },
};