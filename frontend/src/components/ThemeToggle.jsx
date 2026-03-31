import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="floating-control neo-icon-button"
      transition={{ duration: 0.18 }}
      whileTap={{ scale: 0.96 }}
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  );
}
