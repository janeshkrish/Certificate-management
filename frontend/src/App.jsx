import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import FloatingLoginButton from "./components/FloatingLoginButton";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";
import CertificateDetailPage from "./pages/CertificateDetailPage";
import DashboardPage from "./pages/DashboardPage";
import DomainPage from "./pages/DomainPage";
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
  const location = useLocation();

  return (
    <>
      <ThemeToggle />
      <FloatingLoginButton />

      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route element={<Navigate replace to="/profile" />} path="/" />
          <Route element={<ProfilePage />} path="/profile" />
          <Route element={<DomainPage />} path="/domain/:id" />
          <Route element={<CertificateDetailPage />} path="/certificate/:id" />
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
      </AnimatePresence>
    </>
  );
}
