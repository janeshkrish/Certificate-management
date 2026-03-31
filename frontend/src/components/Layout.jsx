import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: "easeInOut" } }
};

export default function Layout({ centered = false, children, narrow = false }) {
  return (
    <motion.main
      animate="animate"
      className="page-shell"
      exit="exit"
      initial="initial"
      variants={pageVariants}
    >
      <div
        className={`mx-auto w-full ${narrow ? "max-w-4xl" : "max-w-6xl"} ${
          centered ? "flex min-h-[calc(100vh-6rem)] items-center justify-center" : ""
        }`}
      >
        {children}
      </div>
    </motion.main>
  );
}
