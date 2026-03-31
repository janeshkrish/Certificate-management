import { CalendarDays, ExternalLink, FileText, Pencil, QrCode, ShieldCheck, Trash2 } from "lucide-react";

import { formatDate, toTitleCase, truncateHash } from "../utils/format";

export default function CertificateCard({ certificate, isAdmin = false, onEdit, onDelete }) {
  return (
    <article className="neo-card group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="soft-badge">{certificate.domain.name}</span>
          <h3 className="section-title mt-4 text-2xl leading-tight">{certificate.title}</h3>
          <p className="mt-2 text-sm text-muted">{certificate.issuer}</p>
        </div>

        <div className="rounded-[18px] bg-shell p-3 shadow-[inset_6px_6px_14px_#bcbcbc,inset_-6px_-6px_14px_#ffffff]">
          <img
            alt={`QR for ${certificate.title}`}
            className="h-20 w-20 rounded-xl object-cover"
            src={certificate.qr_code_data_url}
          />
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-muted">{certificate.description}</p>

      <div className="mt-6 grid gap-3 text-sm text-ink">
        <div className="neo-inset flex items-center gap-3 px-4 py-3">
          <ShieldCheck size={16} className="text-accent" />
          <span className="font-semibold">{certificate.certificate_number}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="neo-inset flex items-center gap-3 px-4 py-3">
            <CalendarDays size={16} className="text-accent" />
            <span>{formatDate(certificate.issue_date)}</span>
          </div>
          <div className="neo-inset flex items-center gap-3 px-4 py-3">
            <QrCode size={16} className="text-accent" />
            <span>{toTitleCase(certificate.visibility)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[18px] bg-white/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SHA-256</p>
        <p className="mt-2 break-all text-sm font-semibold text-ink">{truncateHash(certificate.data_hash)}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          className="neo-button flex items-center gap-2"
          href={certificate.file_url}
          rel="noreferrer"
          target="_blank"
        >
          <FileText size={16} />
          View File
        </a>
        <a
          className="neo-button flex items-center gap-2"
          href={certificate.verification_link}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink size={16} />
          Verify
        </a>
      </div>

      {isAdmin ? (
        <div className="mt-6 flex gap-3 border-t border-white/20 pt-6">
          <button className="neo-button flex items-center gap-2" onClick={() => onEdit?.(certificate)} type="button">
            <Pencil size={16} />
            Edit
          </button>
          <button
            className="neo-button flex items-center gap-2 text-rose-700"
            onClick={() => onDelete?.(certificate)}
            type="button"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      ) : null}
    </article>
  );
}

