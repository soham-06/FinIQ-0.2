import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./assets/AuthContext";
import Login from "./assets/Login";
import Home from "./assets/Home";
import Modules from "./assets/Modules";
import Topics from "./assets/Topics";
import TopicDetailsWrapper from "./assets/TopicDetailsWrapper";
import FloatingNotes from "./assets/FloatingNotes";

const clientId = "452988976233-v5cck196uoeii6abjlmsi5mto4r6asf9.apps.googleusercontent.com";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// ✅ Wrapper to access location and conditionally render FloatingNotes
function AppWrapper() {
  const location = useLocation();
  const hideFloatingNotes = location.pathname === "/login"; // You can add more paths if needed

  return (
    <>
      {!hideFloatingNotes && <FloatingNotes />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/topics/:level" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
        <Route path="/levels/:levelId/topics/:topicId" element={<ProtectedRoute><TopicDetailsWrapper /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <AppWrapper />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
