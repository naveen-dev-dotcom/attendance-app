const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// GET /students?classId=xxx - list students (optionally by classId)
router.get('/', auth, async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const students = await Student.find(filter)
    .sort({ regNoSuffix: 1 }); // ascending order
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /students - add one student
router.post('/',auth, async (req, res) => {
  try {
    const { regNoSuffix, regNoPrefix, name, classId } = req.body;
    const student = new Student({ regNoSuffix, regNoPrefix, name, classId });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// New bulk upload route
router.post('/bulk', auth, async (req, res) => {
  try {
    const students = req.body.students; // expects: { students: [ {...}, {...}, ... ] }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array is required and cannot be empty.' });
    }

    // Optional: Validate each student object minimally
    for (const student of students) {
      if (!student.regNoSuffix || !student.regNoPrefix || !student.name || !student.classId) {
        return res.status(400).json({ error: 'Each student must have regNoSuffix, regNoPrefix, name, and classId.' });
      }
    }

    // Insert many students at once
    const insertedStudents = await Student.insertMany(students);

    res.status(201).json({
      message: `${insertedStudents.length} students successfully added.`,
      students: insertedStudents,
    });
  } catch (error) {
    // Handle duplicate keys or other errors more gracefully if needed
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
