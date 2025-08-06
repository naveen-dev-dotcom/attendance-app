import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ClassSelectionPage from './pages/ClassSelectionPage';
import AttendancePage from './pages/AttendancePage';
import SummaryPage from './pages/SummaryPage';
import AttendanceSummaryRange from './pages/AttendanceSummaryRange';
import './app.css';


function App() {
  // A simple auth check (replace with real from context or localStorage)
  const isAuthenticated = !!localStorage.getItem('token');
  // const someClassId = "688debfd343520dd98ec7e9a";


  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protect routes */}
        <Route 
          path="/class-selection" 
          element={isAuthenticated ? <ClassSelectionPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/attendance" 
          element={isAuthenticated ? <AttendancePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/summary" 
          element={isAuthenticated ? <SummaryPage /> : <Navigate to="/login" />} 
        />
      <Route 
  path="/attendance-summary-range" 
  element={isAuthenticated ? <AttendanceSummaryRange /> : <Navigate to="/login" />}
/>


        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
