import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/profile" />} path="/" />
      <Route element={<ProfilePage />} path="/profile" />
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route element={<Navigate replace to="/profile" />} path="*" />
    </Routes>
  );
}

