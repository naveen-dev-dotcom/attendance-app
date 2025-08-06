const mongoose = require("mongoose");

const attendanceEntrySchema = new mongoose.Schema({
  regNoSuffix: String,
  present: Boolean,
  od: { type: Boolean, default: false },
  reason: String,
});

const attendanceSessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  date: { type: Date, default: Date.now },
  time: String,
  attendance: [attendanceEntrySchema],
  createdBy: String,     // admin username
  lastEditedBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
