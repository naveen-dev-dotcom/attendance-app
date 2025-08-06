const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');

// GET /classes - List all classes
router.get('/',auth , async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /classes - Add a new class
router.post('/',auth , async (req, res) => {
  try {
    const { name, regNoPrefix } = req.body;
    const newClass = new Class({ name, regNoPrefix });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
