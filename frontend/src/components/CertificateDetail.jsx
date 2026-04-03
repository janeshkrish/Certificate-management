import { ArrowLeft, CalendarDays, ExternalLink, FileText, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, openExternalUrl, toTitleCase } from "../utils/format";
import CertificateFileViewer from "./CertificateFileViewer";

export default function CertificateDetail({ certificate, domainHref }) {
  return (
    <div className="neo-panel mx-auto w-full max-w-4xl p-5 sm:p-7">
      {domainHref ? (
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-accent" to={domainHref}>
          <ArrowLeft size={16} />
          Back
        </Link>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="neo-chip neo-chip-accent">{certificate.domain.name}</span>
        <span className={`neo-chip ${certificate.visibility === "public" ? "neo-chip-accent" : "neo-chip-muted"}`}>
          {toTitleCase(certificate.visibility)}
        </span>
      </div>

      <h1 className="section-title mt-5 text-2xl leading-tight sm:text-4xl">{certificate.title}</h1>
      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{certificate.description}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="space-y-4">
          <CertificateFileViewer certificate={certificate} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="neo-inset p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issuer</p>
              <p className="mt-3 text-sm font-semibold text-ink sm:text-base">{certificate.issuer}</p>
            </div>
            <div className="neo-inset p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Date</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink sm:text-base">
                <CalendarDays size={16} className="text-accent" />
                <span>{formatDate(certificate.issue_date)}</span>
              </div>
            </div>
          </div>

          <div className="neo-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate ID</p>
            <div className="mt-3 flex items-center gap-2 break-all text-sm font-semibold text-ink sm:text-base">
              <ShieldCheck size={16} className="shrink-0 text-accent" />
              <span>{certificate.certificate_number}</span>
            </div>
          </div>

          <div className="neo-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SHA-256</p>
            <p className="mt-3 break-all text-sm leading-7 text-ink">{certificate.data_hash}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="neo-panel-soft p-5 text-center">
            <div className="neo-inset mx-auto flex h-48 w-48 items-center justify-center rounded-[24px] p-4">
              <img
                alt={`QR code for ${certificate.title}`}
                className="h-full w-full rounded-2xl object-cover"
                src={certificate.qr_code_data_url}
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted">
              <QrCode size={16} />
              QR verification
            </div>
          </div>

          <div className="grid gap-3">
            <button
              className="neo-button neo-button-primary flex items-center justify-center gap-2"
              onClick={() => openExternalUrl(certificate.file_url)}
              type="button"
            >
              <FileText size={16} />
              Open File
            </button>
            {certificate.verification_link ? (
              <button
                className="neo-button flex items-center justify-center gap-2"
                onClick={() => openExternalUrl(certificate.verification_link)}
                type="button"
              >
                <ExternalLink size={16} />
                Verify
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
