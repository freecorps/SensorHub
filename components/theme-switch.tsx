"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      className={`relative w-14 h-7 rounded-full flex items-center p-1 ${
        theme === "dark"
          ? "justify-end bg-gray-700"
          : "justify-start bg-gray-200"
      }`}
      onClick={toggleTheme}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "dark" ? 90 : 0,
          }}
          transition={{ duration: 1 }}
        >
          {theme === "dark" ? (
            <Moon className="w-3 h-3 text-gray-800" />
          ) : (
            <Sun className="w-3 h-3 text-yellow-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
