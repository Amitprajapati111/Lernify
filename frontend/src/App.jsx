import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VirtualClassroom from './pages/VirtualClassroom';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAcademic from './pages/admin/ManageAcademic';
import AdminReports from './pages/admin/AdminReports';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentAssessments from './pages/student/StudentAssessments';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherEvaluation from './pages/teacher/TeacherEvaluation';
import GlobalCourses from './pages/admin/GlobalCourses';
import GlobalLiveClasses from './pages/admin/GlobalLiveClasses';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <ManageUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/academic"
          element={
            <PrivateRoute>
              <ManageAcademic />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute>
              <AdminReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <PrivateRoute>
              <GlobalCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/live-classes"
          element={
            <PrivateRoute>
              <GlobalLiveClasses />
            </PrivateRoute>
          }
        />
        <Route
          path="/classes/:roomId"
          element={
            <PrivateRoute>
              <VirtualClassroom />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/subjects"
          element={
            <PrivateRoute>
              <StudentSubjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/materials"
          element={
            <PrivateRoute>
              <StudentMaterials />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/assessments"
          element={
            <PrivateRoute>
              <StudentAssessments />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <PrivateRoute>
              <TeacherCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/evaluation"
          element={
            <PrivateRoute>
              <TeacherEvaluation />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
