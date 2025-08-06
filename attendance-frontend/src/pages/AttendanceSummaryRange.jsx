import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';

export default function AttendanceSummaryRange() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const location = useLocation();
  const classId = location.state?.classId;

  if (!classId) {
  return <p style={{ color: 'red' }}>Class ID missing. Please go back and select a class.</p>;
}
  

  const fetchSummary = async () => {
    setError('');
    if (!classId) {
      setError('Class ID is required.');
      return;
    }
    if (!fromDate || !toDate) {
      setError('Please select both From and To dates.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/attendance/summary-range', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          classId,
          fromDate,
          toDate
        }
      });
      setSummaryData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch summary');
      setSummaryData(null);
    }
  };

  // Prepare data for charts
  const absentChartData = summaryData?.topAbsent.map(s => ({ name: s.name, Absent: s.absentCount })) || [];
  const presentChartData = summaryData?.topPresent.map(s => ({ name: s.name, Present: s.presentCount })) || [];

  return (
    <div className="attendance-container hide-scrollbar">
      
     <div className='login-container'>
      <h2>Attendance Summary (Date Range)</h2>
       <label className='form-group'>
        From Date: 
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
      </label>
      &nbsp;&nbsp;
      <label className='form-group'>
        To Date:
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
      </label>
      &nbsp;&nbsp;
     </div>
      <button className='login-button' onClick={fetchSummary}>Get Summary</button>
      <br />
      {error && <p className="error">{error}</p>}

      {summaryData && (
        <div>
          <h3>Overall Attendance</h3>
          <p>Total Present: {summaryData.overallAttendance.totalPresent}</p>
          <p>Total Absent: {summaryData.overallAttendance.totalAbsent}</p>
          <p>Present %: {summaryData.overallAttendance.overallPresentPercent}%</p>
          <p>Absent %: {summaryData.overallAttendance.overallAbsentPercent}%</p>

          <h3>Top 5 Absent Students</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={absentChartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Absent" fill="#ff4d4d" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Top 5 Present Students</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={presentChartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Full Report</h3>
          <table border="1" cellPadding="5" className="attendance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>Present Count</th>
                <th>Absent Count</th>
                <th>Total Sessions</th>
                <th>Present %</th>
                <th>Absent %</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.fullReport.map(s => (
                <tr key={s.studentId}>
                  <td>{s.name}</td>
                  <td>{s.regNo}</td>
                  <td>{s.presentCount}</td>
                  <td>{s.absentCount}</td>
                  <td>{s.totalSessions}</td>
                  <td>{s.presentPercentage}%</td>
                  <td>{s.absentPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
