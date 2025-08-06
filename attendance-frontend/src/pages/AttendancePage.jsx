import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId, date, isEdit: navIsEdit } = location.state || {};
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  // Fetch students and existing attendance if editing
  useEffect(() => {
    if (!classId || !date) {
      navigate('/class-selection');
      return;
    }

    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        // Fetch students
        const stuRes = await axios.get(`http://localhost:5000/students?classId=${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(stuRes.data);

        // Fetch existing attendance if editing
        const attRes = await axios.get(`http://localhost:5000/attendance?classId=${classId}&date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (navIsEdit && attRes.data.length > 0) {
          const existingSession = attRes.data[0];
          const existingAttendance = {};

          existingSession.attendance.forEach(a => {
            existingAttendance[a.regNoSuffix] = {
              state: a.od ? 'od' : a.present ? 'present' : 'absent',
              reason: a.reason || '',
            };
          });

          setAttendance(existingAttendance);
          setIsEdit(true);
        } else {
          // New attendance (default all present)
          const initial = {};
          stuRes.data.forEach(s => {
            initial[s.regNoSuffix] = { state: 'present', reason: '' };
          });
          setAttendance(initial);
          setIsEdit(false);
        }

        setLoading(false);
      } catch {
        setError('Failed to load students or attendance.');
        setLoading(false);
      }
    }

    fetchData();
  }, [classId, date, navigate, navIsEdit]);

  const onStateChange = (regNoSuffix, value) => {
    setAttendance(prev => ({
      ...prev,
      [regNoSuffix]: {
        ...prev[regNoSuffix],
        state: value,
        reason: value === 'present' ? '' : prev[regNoSuffix]?.reason || '',
      },
    }));
  };

  const onReasonChange = (regNoSuffix, value) => {
    setAttendance(prev => ({
      ...prev,
      [regNoSuffix]: { ...prev[regNoSuffix], reason: value },
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validation
    for (const regNo in attendance) {
      if ((attendance[regNo].state === 'absent' || attendance[regNo].state === 'od') && !attendance[regNo].reason.trim()) {
        setError('Please enter reasons for all Absents and ODs.');
        return;
      }
    }

    const finalAttendance = Object.entries(attendance).map(([regNoSuffix, data]) => ({
      regNoSuffix,
      present: data.state === 'present' || data.state === 'od',
      od: data.state === 'od',
      reason: data.state === 'present' ? '' : data.reason,
    }));

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/attendance/submit', {
        classId,
        date,
        time: new Date().toLocaleTimeString(),
        attendance: finalAttendance,
        isEdit,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/summary', { state: { classId, date } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit attendance.');
    }
  };

  if (loading) return <div>Loading attendance...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-container">
      <h3>{isEdit ? `Edit` : `Add`} Attendance for {date}</h3>
      <form onSubmit={handleSubmit}>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Name</th>
              <th>Present</th>
              <th>Absent</th>
              <th>OD</th>
              <th>Reason (if Absent/OD)</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.regNoSuffix}>
                <td>{s.regNoPrefix}{s.regNoSuffix}</td>
                <td>{s.name}</td>
                <td>
                  <input
                    type="radio"
                    name={`attendance-${s.regNoSuffix}`}
                    checked={attendance[s.regNoSuffix]?.state === 'present'}
                    onChange={() => onStateChange(s.regNoSuffix, 'present')}
                    disabled={attendance[s.regNoSuffix]?.state === 'od'}
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={`attendance-${s.regNoSuffix}`}
                    checked={attendance[s.regNoSuffix]?.state === 'absent'}
                    onChange={() => onStateChange(s.regNoSuffix, 'absent')}
                    disabled={attendance[s.regNoSuffix]?.state === 'od'}
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={`attendance-${s.regNoSuffix}`}
                    checked={attendance[s.regNoSuffix]?.state === 'od'}
                    onChange={() => onStateChange(s.regNoSuffix, 'od')}
                  />
                </td>
                <td>
                  {(attendance[s.regNoSuffix]?.state === 'absent' || attendance[s.regNoSuffix]?.state === 'od') && (
                    <input
                      type="text"
                      className="reason"
                      value={attendance[s.regNoSuffix].reason}
                      onChange={e => onReasonChange(s.regNoSuffix, e.target.value)}
                      placeholder={`Reason for ${attendance[s.regNoSuffix].state === 'od' ? 'OD' : 'absent'}`}
                      required
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="login-button" type="submit" style={{ marginTop: '1rem' }}>
          {isEdit ? 'Update Attendance' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
}
