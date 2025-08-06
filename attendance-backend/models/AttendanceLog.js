// models/AttendanceLog.js
const mongoose = require('mongoose');
const attendanceLogSchema = new mongoose.Schema({
  attendanceSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession' },
  action: String, // "create", "edit"
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  editor: String,
  timestamp: Date
});
module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
