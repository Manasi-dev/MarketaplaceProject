// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { processUserRegistration, verifyUserCredentials } = require('../controllers/authController');

// POST /auth/signup
router.post('/signup', processUserRegistration);

// POST /auth/login
router.post('/login', verifyUserCredentials);

module.exports = router;
