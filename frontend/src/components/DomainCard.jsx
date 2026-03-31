import { motion } from "framer-motion";
import { FolderKanban, Trash2 } from "lucide-react";

export default function DomainCard({ domain, active = false, isAdmin = false, onClick, onDelete }) {
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(domain);
    }
  }

  return (
    <motion.article
      aria-label={`Open ${domain.name}`}
      className={`neo-panel-soft flex h-full cursor-pointer flex-col justify-between gap-5 p-5 sm:p-6 ${
        active ? "neo-panel-active" : ""
      }`}
      role="button"
      tabIndex={0}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick?.(domain)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="neo-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
          <FolderKanban size={20} className="text-accent" />
        </div>

        {isAdmin && onDelete ? (
          <button
            aria-label={`Delete ${domain.name}`}
            className="neo-icon-button text-rose-600"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(domain);
            }}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <h3 className="section-title text-xl sm:text-2xl">{domain.name}</h3>
        <p className="text-sm text-muted">
          {domain.certificate_count || 0} certificate{domain.certificate_count === 1 ? "" : "s"}
        </p>
      </div>
    </motion.article>
  );
}
