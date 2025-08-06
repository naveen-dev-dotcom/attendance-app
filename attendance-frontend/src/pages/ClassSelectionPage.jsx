import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ClassSelectionPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substr(0, 10));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        setError('Could not fetch classes.');
      }
    };
    fetchClasses();
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (!selectedClass || !date) {
      setError('Please select both class and date.');
      return;
    }
    localStorage.setItem('selectedClassId', selectedClass);
    navigate('/attendance', { state: { classId: selectedClass, date } });
  };

  const handleViewStudentSummary = () => {
    if (!selectedClass) {
      setError('Please select a class first to view student summary.');
      return;
    }
    // Clear any previous error, then navigate
    setError('');
    navigate('/summary', { state: { classId: selectedClass } });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="login-box">
      <h2>Select Class and Date</h2>

      {/* Centered logout button with spacing */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <form onSubmit={handleNext}>
        <div className="form-group">
          <label>
            Class:&nbsp;
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="styled-select"
              required
            >
              <option value="">--Select Class--</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Date:&nbsp;
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <button type="submit" className="login-button">Next</button>
        </div>
      </form>

      {/* Button to view student summary without attendance entry */}
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <button onClick={handleViewStudentSummary} className="login-button">
          View Student Attendance Summary
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
