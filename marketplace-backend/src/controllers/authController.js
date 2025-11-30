// src/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const JWT_EXPIRES = process.env.TOKEN_EXPIRES_IN || '7d';

async function processUserRegistration(req, res) {
  try {
    const { fullUserName, userEmailID, userSecretKey, contactNumber } = req.body;
    if (!fullUserName || !userEmailID || !userSecretKey || !contactNumber) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // check existing
    const [existing] = await pool.query('SELECT id FROM users WHERE user_email_id = ?', [userEmailID]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(userSecretKey, saltRounds);
    const [result] = await pool.query(
      'INSERT INTO users (full_user_name, user_email_id, user_secret_key, contact_number) VALUES (?, ?, ?, ?)',
      [fullUserName, userEmailID, hashed, contactNumber]
    );

    const userId = result.insertId;
    const token = jwt.sign({ userId, userEmailID }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(201).json({ message: 'Registered', token, user: { id: userId, fullUserName, userEmailID, contactNumber } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

async function verifyUserCredentials(req, res) {
  try {
    const { userEmailID, userSecretKey } = req.body;
    if (!userEmailID || !userSecretKey) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await pool.query('SELECT id, full_user_name, user_secret_key, contact_number FROM users WHERE user_email_id = ?', [userEmailID]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(userSecretKey, user.user_secret_key);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, userEmailID }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ message: 'Logged in', token, user: { id: user.id, fullUserName: user.full_user_name, userEmailID, contactNumber: user.contact_number } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

module.exports = { processUserRegistration, verifyUserCredentials };
