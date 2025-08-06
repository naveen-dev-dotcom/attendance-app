const express = require('express');
const router = express.Router();
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceLog = require('../models/AttendanceLog');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const getDateOnly = d => (new Date(d)).setHours(0,0,0,0);

// POST /attendance/submit - Record attendance for a class/date
router.post('/submit', auth, async (req, res) => {
  const { classId, date, attendance, time, isEdit } = req.body;
  const username = req.admin?.username;
  const dateOnly = getDateOnly(date);

  const existing = await AttendanceSession.findOne({ 
    classId,
    date: { $gte: new Date(dateOnly), $lt: new Date(dateOnly + 86400000) }
  });

    // Force present: true for od: true
  attendance.forEach(e => {
    if (e.od) e.present = true;
  });

  if (existing && !isEdit) return res.status(400).json({ error: "Attendance already submitted. Use edit." });

  // If edit, check if within 24hrs
  if (existing && isEdit) {
    const now = Date.now();
    const createdAt = new Date(existing.createdAt).getTime();
    if ((now - createdAt) > 86400000) // 24hrs
      return res.status(403).json({ error: "Cannot edit after 24hrs" });

    // Save log before edit
    await AttendanceLog.create({
      attendanceSessionId: existing._id,
      action: "edit",
      before: existing.attendance,
      after: attendance,
      editor: username,
      timestamp: new Date()
    });

    existing.attendance = attendance;
    existing.time = time;
    existing.lastEditedBy = username;
    await existing.save();
    return res.json(existing);
  }

  // New session
  const session = new AttendanceSession({ classId, date, time, attendance, createdBy: username });
  await session.save();

  // Log add
  await AttendanceLog.create({
    attendanceSessionId: session._id,
    action: "create",
    before: null,
    after: attendance,
    editor: username,
    timestamp: new Date()
  });

  res.status(201).json(session);
});

// GET /attendance/student/:studentId?classId=X
router.get('/student/:studentId', auth, async (req, res) => {
  const { studentId } = req.params, { classId } = req.query;
  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  // Find all attendance sessions for class
  const sessions = await AttendanceSession.find({ classId });
  const records = [];
  sessions.forEach(session => {
    const record = session.attendance.find(r => r.regNoSuffix === student.regNoSuffix);
    if (record)
      records.push({
        date: session.date,
        present: record.present,
        od: record.od,
        reason: record.reason || "",
      });
  });

  // Calculate stats, absents, ODs
  const total = records.length;
  const presentCount = records.filter(r => r.present && !r.od).length;
  const odCount = records.filter(r => r.od).length;
  const absentCount = total - presentCount - odCount;

  const absents = records.filter(r => !r.present && !r.od).map(r => ({ date: r.date, reason: r.reason }));
  const ods = records.filter(r => r.od).map(r => ({ date: r.date, reason: r.reason }));

  res.json({
    student: { name: student.name, regNo: student.regNoPrefix + student.regNoSuffix },
    stats: { total, presentCount, absentCount, odCount },
    absents,
    ods,
  });
});


// GET /attendance?classId=xxx&date=yyyy-mm-dd
router.get('/',auth, async (req, res) => {
  try {
    const { classId, date } = req.query;
    let filter = {};
    if (classId) filter.classId = classId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  return res.status(400).json({ error: "Invalid date format for fromDate or toDate" });
}

      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    const sessions = await AttendanceSession.find(filter);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /attendance/summary-range?classId=&fromDate=&toDate=
// Returns summary with per student attendance count within date range
router.get('/summary-range', auth, async (req, res) => {
  try {
    const { classId, fromDate, toDate } = req.query;

    if (!classId || !fromDate || !toDate) {
      return res.status(400).json({ error: 'classId, fromDate and toDate are required' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    // 1. Get all attendance sessions in date range for the class
    const sessions = await AttendanceSession.find({
      classId: new mongoose.Types.ObjectId(classId),
      date: { $gte: start, $lte: end }
    });

    // 2. Flatten attendance entries from all sessions into one array with student regNoSuffix and present/absent
    const attendanceRecords = [];
    sessions.forEach(session => {
      session.attendance.forEach((record) => {
        attendanceRecords.push(record);
      });
    });

    // 3. Aggregate attendance counts by regNoSuffix
    const summaryByStudent = {};

    attendanceRecords.forEach(({ regNoSuffix, present }) => {
      if (!summaryByStudent[regNoSuffix]) {
        summaryByStudent[regNoSuffix] = { presentCount: 0, absentCount: 0, total: 0 };
      }
      if (present) summaryByStudent[regNoSuffix].presentCount++;
      else summaryByStudent[regNoSuffix].absentCount++;

      summaryByStudent[regNoSuffix].total++;
    });

    // 4. Fetch student actual info to join with summary (name, full roll no)
    const regNoSuffixes = Object.keys(summaryByStudent);
    const students = await Student.find({
      classId: new mongoose.Types.ObjectId(classId),
      regNoSuffix: { $in: regNoSuffixes }
    });

    // 5. Build final report array with student name, roll no + counts and percentages
    const report = students.map(student => {
      const summ = summaryByStudent[student.regNoSuffix] || { presentCount: 0, absentCount: 0, total: 0 };
      return {
        studentId: student._id,
        name: student.name,
        regNo: student.regNoPrefix + student.regNoSuffix,
        presentCount: summ.presentCount,
        absentCount: summ.absentCount,
        totalSessions: summ.total,
        presentPercentage: summ.total ? ((summ.presentCount / summ.total) * 100).toFixed(2) : "0.00",
        absentPercentage: summ.total ? ((summ.absentCount / summ.total) * 100).toFixed(2) : "0.00"
      };
    });

    // 6. Calculate overall class attendance summary (sum of all present and absent counts)
    const totalPresent = report.reduce((acc, cur) => acc + cur.presentCount, 0);
    const totalAbsent = report.reduce((acc, cur) => acc + cur.absentCount, 0);
    const totalSessionsAll = totalPresent + totalAbsent;
    const overallAttendance = {
      totalPresent,
      totalAbsent,
      overallPresentPercent: totalSessionsAll ? ((totalPresent / totalSessionsAll) * 100).toFixed(2) : "0.00",
      overallAbsentPercent: totalSessionsAll ? ((totalAbsent / totalSessionsAll) * 100).toFixed(2) : "0.00"
    };

    // 7. Find top 5 highest absent and present students (sorted descending)
    const topAbsent = [...report].sort((a, b) => b.absentCount - a.absentCount).slice(0, 5);
    const topPresent = [...report].sort((a, b) => b.presentCount - a.presentCount).slice(0, 5);

    res.json({
      overallAttendance,
      topAbsent,
      topPresent,
      fullReport: report
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
