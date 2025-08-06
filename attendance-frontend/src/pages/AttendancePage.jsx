import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


export default function AttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId, date } = location.state || {};

  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if no classId/date passed
  useEffect(() => {
    if (!classId || !date) {
      navigate('/class-selection');
    }
  }, [classId, date, navigate]);

  // Fetch students for the selected class
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/students?classId=${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);

        // Initialize attendanceData with all students present by default
        const initialAttendance = {};
        res.data.forEach(student => {
          initialAttendance[student.regNoSuffix] = { present: true, reason: '' };
        });
        setAttendanceData(initialAttendance);

        setLoading(false);
      } catch (err) {
        setError('Failed to load students.');
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classId]);

  // Handle checkbox toggle (present/absent)
  const handleCheckboxChange = (regNoSuffix) => {
    setAttendanceData(prev => ({
      ...prev,
      [regNoSuffix]: {
        ...prev[regNoSuffix],
        present: !prev[regNoSuffix].present,
        reason: prev[regNoSuffix].present ? '' : prev[regNoSuffix].reason,
        // Clear reason if marked present
      },
    }));
  };

  // Handle reason change when absent
  const handleReasonChange = (regNoSuffix, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [regNoSuffix]: {
        ...prev[regNoSuffix],
        reason: value,
      },
    }));
  };

  // Submit attendance to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that all absent students have reasons
    for (const regNo in attendanceData) {
      if (!attendanceData[regNo].present && !attendanceData[regNo].reason.trim()) {
        setError('Please enter reasons for all absent students.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    const attendanceArray = Object.entries(attendanceData).map(([regNoSuffix, data]) => ({
      regNoSuffix,
      present: data.present,
      reason: data.present ? '' : data.reason,
    }));

    try {
      // Send date as ISO string date (without time portion)
      await axios.post('http://localhost:5000/attendance/submit', 
        {
          classId,
          date,
          time: new Date().toLocaleTimeString(), // or any specific time string
          attendance: attendanceArray,
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Redirect to summary page with classId and date passed in state
      navigate('/summary', { state: { classId, date } });
    } catch (err) {
      setError('Failed to submit attendance.');
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="error">{error}</p>;

return (
  <div className="attendance-container hide-scrollbar">
    <h2>Attendance for {date}</h2>
    <form onSubmit={handleSubmit}>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Reg. No.</th>
            <th>Name</th>
            <th>Present</th>
            <th>Reason (if absent)</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const data = attendanceData[student.regNoSuffix] || { present: true, reason: '' };
            return (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td>{student.regNoPrefix ? student.regNoPrefix : ''}{student.regNoSuffix}</td>
                <td>{student.name}</td>
                <td>
                  <input 
                    type="checkbox" 
                    checked={data.present} 
                    onChange={() => handleCheckboxChange(student.regNoSuffix)} 
                  />
                </td>
                <td>
                  {!data.present && (
                    <input 
                      type="text" 
                      className="reason"
                      placeholder="Enter reason" 
                      value={data.reason} 
                      onChange={e => handleReasonChange(student.regNoSuffix, e.target.value)} 
                      required
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="submit" className='login-button'>Submit Attendance</button>
    </form>
  </div>
);

}
