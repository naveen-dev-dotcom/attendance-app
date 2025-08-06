import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId, date } = location.state || {};

  const [attendanceSession, setAttendanceSession] = useState(null); // select attendance session for the date (if any)
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentReport, setStudentReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!classId) {
      // No classId, redirect to class selection
      navigate("/class-selection");
      return;
    }

    async function fetchData() {
      try {
        const token = localStorage.getItem("token");

        // Fetch students for this class
        const stuRes = await axios.get(
          `http://localhost:5000/students?classId=${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudents(stuRes.data);

        if (date) {
          // Fetch attendance session for selected date if date is present
          const attRes = await axios.get(
            `http://localhost:5000/attendance?classId=${classId}&date=${date}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const sessions = attRes.data;
          if (!sessions || sessions.length === 0) {
            setAttendanceSession(null);
            setSummary({
              total: 0,
              presentCount: 0,
              absentCount: 0,
              presentPercentage: 0,
              absentPercentage: 0,
              odCount: 0,
              reasons: [],
            });
            setCanEdit(false);
          } else {
            const session = sessions[0];
            setAttendanceSession(session);

            // Calculate summary based on attendance for that date
            const total = session.attendance.length;
            const ods = session.attendance.filter((a) => a.od).length;
            const present = session.attendance.filter(
              (a) => a.present && !a.od
            ).length;
            const absent = total - present - ods;
            const reasons = session.attendance
              .filter((a) => (!a.present || a.od) && a.reason)
              .map((a) => ({
                regNoSuffix: a.regNoSuffix,
                reason: a.reason,
                od: a.od,
              }));

            setSummary({
              total,
              presentCount: present,
              absentCount: absent,
              presentPercentage: total
                ? ((present / total) * 100).toFixed(2)
                : 0,
              absentPercentage: total ? ((absent / total) * 100).toFixed(2) : 0,
              odCount: ods,
              date: new Date(session.date).toLocaleDateString(),
              reasons,
            });

            // Check if attendance is editable (within 24 hours)
            const createdTime = new Date(session.createdAt).getTime();
            const now = Date.now();
            setCanEdit(now - createdTime <= 24 * 60 * 60 * 1000);
          }
        } else {
          // If no date selected, reset session and summary since no attendance date is selected
          setAttendanceSession(null);
          setSummary(null);
          setCanEdit(false);
        }

        setLoading(false);
      } catch (e) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    }

    fetchData();
  }, [classId, date, navigate]);

  // Fetch full student attendance report for this class irrespective of date (range)
  const onStudentChange = async (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    setStudentReport(null);
    if (!studentId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/attendance/student/${studentId}?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudentReport(res.data);
    } catch {
      setStudentReport(null);
    }
  };

  // Navigate to edit attendance (only if date and attendance exists)
  const handleEditAttendance = () => {
    if (!attendanceSession) {
      alert("No attendance session available for editing.");
      return;
    }
    navigate("/attendance", {
      state: { classId, date, isEdit: true },
    });
  };

  if (loading) return <div>Loading summary...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div
      className="attendance-container"
      style={{ height: "100%", overflow: "auto" }}
    >
      {date && summary && (
        <>
          <h3>Attendance Summary for {summary.date || date}</h3>
          <div>
            <b>Total Students:</b> {summary.total} <br />
            <b>Present:</b> {summary.presentCount} ({summary.presentPercentage}
            %)
            <br />
            <b>Absent:</b> {summary.absentCount} ({summary.absentPercentage}%)
            <br />
            <b>OD:</b> {summary.odCount}
          </div>

          {summary.reasons.length > 0 && (
            <>
              <h4>Absences and OD Reasons</h4>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Type</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.reasons.map((r, i) => (
                    <tr key={i}>
                      <td>{r.regNoSuffix}</td>
                      <td>{r.od ? "OD" : "Absent"}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {canEdit && (
            <button
              className="button-space"
              onClick={handleEditAttendance}
              style={{ marginTop: 16 }}
            >
              Edit Attendance
            </button>
          )}

          <button
            className="button-space"
            onClick={() => {
              const classId = localStorage.getItem("selectedClassId");
              if (!classId) {
                alert("No class selected. Please select a class first.");
                return;
              }
              navigate("/attendance-summary-range", { state: { classId } });
            }}
          >
            View Attendance Summary (Range)
          </button>

          <hr />
        </>
      )}

      {/* Student Attendance Report Section - always visible */}
      <label style={{ fontWeight: "bold" }}>
        Pick a student to view overall attendance details:
      </label>
      <select
        className="styled-select"
        value={selectedStudent}
        onChange={onStudentChange}
        style={{ marginLeft: 10, marginBottom: 16 }}
      >
        <option value="">-- Select Student --</option>
        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name} ({s.regNoPrefix}
            {s.regNoSuffix})
          </option>
        ))}
      </select>

      {studentReport && (
        <div>
          <h4>
            {studentReport.student.name} ({studentReport.student.regNo})
          </h4>
          <p>
            Total Sessions: {studentReport.stats.total} <br />
            Present: {studentReport.stats.presentCount} <br />
            Absent: {studentReport.stats.absentCount} <br />
            OD: {studentReport.stats.odCount}
          </p>

          <h5>Absents</h5>
          {studentReport.absents.length === 0 ? (
            <i>None</i>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {studentReport.absents.map((a, i) => (
                  <tr key={i}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h5>OD Days</h5>
          {studentReport.ods.length === 0 ? (
            <i>None</i>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {studentReport.ods.map((a, i) => (
                  <tr key={i}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
