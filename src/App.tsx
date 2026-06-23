import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import CinematicTimeline from "./components/CinematicTimeline";
import AdminPanel from "./components/AdminPanel";

type ViewMode = "landing" | "admin";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("landing");

  // Keep routing simple and intuitive via URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#admin") {
        setViewMode("admin");
      } else {
        setViewMode("landing");
      }
    };

    // Run-on mount and register listener
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (mode: ViewMode) => {
    setViewMode(mode);
    window.location.hash = mode === "admin" ? "admin" : "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CinematicTimeline onEnterAdmin={() => handleNavigate("admin")} />
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <AdminPanel onBackToSite={() => handleNavigate("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

