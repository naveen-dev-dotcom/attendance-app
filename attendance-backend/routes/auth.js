const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /auth/register (one-time use, then comment/delete for security)
// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const exists = await Admin.findOne({ username });
//     if (exists) return res.status(400).json({ error: 'Admin already exists' });
//     const hashed = await bcrypt.hash(password, 10);
//     const admin = await Admin.create({ username, password: hashed });
//     res.status(201).json({ message: 'Admin created' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { adminId: admin._id, username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
