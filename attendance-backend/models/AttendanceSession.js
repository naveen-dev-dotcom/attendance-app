const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: { type: Date, default: Date.now },
  time: String,
  attendance: [
    {
      regNoSuffix: String,
      present: Boolean,
      reason: String,
    }
  ],
});

module.exports = mongoose.model('AttendanceSession', attendanceSchema);
