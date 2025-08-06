const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: String,         // eg. 3rd Year CSE-B
  regNoPrefix: String,  // Common registration no. prefix
});

module.exports = mongoose.model('Class', classSchema);
