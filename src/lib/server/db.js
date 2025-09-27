import Database from 'better-sqlite3';

const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    imagePath TEXT,
    FOREIGN KEY (userId) REFERENCES users (id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId INTEGER,
    expiresAt INTEGER,
    FOREIGN KEY (userId) REFERENCES users (id)
  );
`);

export default db;