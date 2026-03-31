import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { formatDate, toTitleCase } from "../utils/format";

export default function CertificateCard({
  certificate,
  isAdmin = false,
  onClick,
  onEdit,
  onDelete
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(certificate);
    }
  }

  return (
    <motion.article
      aria-label={`Open ${certificate.title}`}
      className="neo-panel-soft flex h-full cursor-pointer flex-col gap-4 p-4 sm:p-5"
      role="button"
      tabIndex={0}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick?.(certificate)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="section-title text-lg leading-snug sm:text-xl">{certificate.title}</h3>
        <span className={`neo-chip ${certificate.visibility === "public" ? "neo-chip-accent" : "neo-chip-muted"}`}>
          {toTitleCase(certificate.visibility)}
        </span>
      </div>

      <div className="neo-inset flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-accent" />
          <span>{formatDate(certificate.issue_date)}</span>
        </div>
        <ChevronRight size={18} className="text-accent" />
      </div>

      {isAdmin && (onEdit || onDelete) ? (
        <div className="flex gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
          <button className="neo-icon-button" onClick={() => onEdit?.(certificate)} type="button">
            <Pencil size={16} />
          </button>
          <button className="neo-icon-button text-rose-600" onClick={() => onDelete?.(certificate)} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ) : null}
    </motion.article>
  );
}
