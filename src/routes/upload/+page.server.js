import { redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

const uploadDir = 'static/uploads';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/auth/login');
  }
}

export const actions = {
  upload: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/auth/login');
    }

    const data = await request.formData();
    const image = data.get('image');

    if (!image || typeof image.arrayBuffer !== 'function') {
      return { error: 'No image file provided.' };
    }

    const fileExtension = path.extname(image.name) || '.jpg';
    const uniqueFilename = `${uuid()}${fileExtension}`;
    const imagePath = path.join(uploadDir, uniqueFilename);
    const relativePath = `/uploads/${uniqueFilename}`;

    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      fs.writeFileSync(imagePath, buffer);

      const stmt = db.prepare('INSERT INTO images (userId, imagePath) VALUES (?, ?)');
      stmt.run(locals.user.id, relativePath);
    } catch (error) {
      console.error('File upload error:', error);
      return { error: 'Failed to upload image.' };
    }

    throw redirect(303, '/gallery');
  },
};