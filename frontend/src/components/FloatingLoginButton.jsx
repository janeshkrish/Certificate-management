import { motion } from "framer-motion";
import { LayoutDashboard, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function FloatingLoginButton() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (location.pathname === "/login" || location.pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="floating-login"
      initial={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link className="neo-button" to={isAuthenticated ? "/dashboard" : "/login"}>
        {isAuthenticated ? <LayoutDashboard size={16} /> : <LockKeyhole size={16} />}
        {isAuthenticated ? "Dashboard" : "Admin Login"}
      </Link>
    </motion.div>
  );
}
