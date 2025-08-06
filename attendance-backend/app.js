const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const classRoutes = require('./routes/class');
const studentRoutes = require('./routes/student');
const attendanceRoutes = require('./routes/attendance');
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use('/classes', classRoutes);
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

app.get('/', (req, res) => res.send('Attendance Backend API is running.'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
