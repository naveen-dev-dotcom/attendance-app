const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regNoSuffix: String,  // Last 3 digits or unique part of reg no
  regNoPrefix: String,  // For mapping/joining
  name: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
});

module.exports = mongoose.model('Student', studentSchema);
