// test-db.js
const pool = require('./src/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('DB test succeeded:', rows);

    const [db] = await pool.query('SELECT DATABASE() as db');
    console.log('Connected DB:', db[0].db);

    const [tables] = await pool.query("SHOW TABLES");
    console.log('Tables (first 20):', tables.slice(0, 20));

    process.exit(0);
  } catch (err) {
    console.error('DB test failed:', err);
    process.exit(1);
  }
})();
