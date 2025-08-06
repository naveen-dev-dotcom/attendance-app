import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId, date } = location.state || {};

  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if no classId/date passed
  useEffect(() => {
    if (!classId || !date) {
      navigate('/class-selection');
    }
  }, [classId, date, navigate]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/attendance?classId=${classId}&date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceSessions(res.data);

        if (res.data.length === 0) {
          setSummary({
            total: 0,
            presentCount: 0,
            absentCount: 0,
            presentPercentage: 0,
            absentPercentage: 0,
            reasons: [],
          });
          setLoading(false);
          return;
        }

        // Calculate summary based on attendance data of latest session (or you could combine all sessions)
        const latestSession = res.data[res.data.length - 1];
        const total = latestSession.attendance.length;
        const presentCount = latestSession.attendance.filter(a => a.present).length;
        const absentCount = total - presentCount;
        const presentPercentage = total ? ((presentCount / total) * 100).toFixed(2) : 0;
        const absentPercentage = total ? ((absentCount / total) * 100).toFixed(2) : 0;

        // Collect all absence reasons along with regNoSuffix
        const reasons = latestSession.attendance
          .filter(a => !a.present && a.reason && a.reason.trim() !== '')
          .map(a => ({ regNoSuffix: a.regNoSuffix, reason: a.reason }));

        setSummary({
          total,
          presentCount,
          absentCount,
          presentPercentage,
          absentPercentage,
          reasons,
          date: new Date(latestSession.date).toLocaleDateString(),
          time: latestSession.time,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch attendance summary.');
        setLoading(false);
      }
    };

    if (classId && date) {
      fetchAttendance();
    }
  }, [classId, date]);

  if (loading) return <p>Loading attendance summary...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!summary) return null;

return (
  <div>
    <h2>
      Attendance Summary for {summary.date} {summary.time ? `at ${summary.time}` : ''}
    </h2>
    <p>Total Students: {summary.total}</p>
    <p>Present: {summary.presentCount} ({summary.presentPercentage}%)</p>
    <p>Absent: {summary.absentCount} ({summary.absentPercentage}%)</p>

    {summary.absentCount > 0 && (
      <>
        <h3>Absence Reasons:</h3>
        <ul>
          {summary.reasons.map(({ regNoSuffix, reason }, index) => (
            <li key={index}>
              Reg No Suffix: <strong>{regNoSuffix}</strong> - Reason: <em>{reason}</em>
            </li>
          ))}
        </ul>
      </>
    )}

    <br />

    <button onClick={() => navigate('/class-selection')}>Back to Class Selection</button>

    <button 
      className="button-space" 
      onClick={() => navigate('/attendance', { state: { classId, date } })}
    >
      Edit Attendance
    </button>

    <button
      className="button-space"
      onClick={() => {
        const classId = localStorage.getItem('selectedClassId');
        if (!classId) {
          alert('No class selected. Please select a class first.');
          return;
        }
        navigate('/attendance-summary-range', { state: { classId } });
      }}
    >
      View Attendance Summary (Range)
    </button>
  </div>
);

}
