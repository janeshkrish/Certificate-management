import { ArrowLeft, CalendarDays, ExternalLink, FileText, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, openExternalUrl, toTitleCase } from "../utils/format";
import CertificateFileViewer from "./CertificateFileViewer";

export default function CertificateDetail({ certificate, domainHref }) {
  const safeCertificate = certificate || {};
  const domain = safeCertificate.domain || {};
  const visibility = safeCertificate.visibility || "public";
  const title = safeCertificate.title || "Certificate";
  const description = safeCertificate.description || "Certificate details are unavailable.";
  const issuer = safeCertificate.issuer || "Unknown issuer";
  const certificateNumber = safeCertificate.certificate_number || "Unavailable";
  const dataHash = safeCertificate.data_hash || "Unavailable";
  const issueDate = safeCertificate.issue_date || null;
  const fileUrl = safeCertificate.file_url || "";
  const verificationLink = safeCertificate.verification_link || "";
  const qrCodeDataUrl = safeCertificate.qr_code_data_url || "";

  return (
    <div className="neo-panel mx-auto w-full max-w-4xl p-5 sm:p-7">
      {domainHref ? (
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-accent" to={domainHref}>
          <ArrowLeft size={16} />
          Back
        </Link>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="neo-chip neo-chip-accent">{domain.name || "Unknown domain"}</span>
        <span className={`neo-chip ${visibility === "public" ? "neo-chip-accent" : "neo-chip-muted"}`}>
          {toTitleCase(visibility)}
        </span>
      </div>

      <h1 className="section-title mt-5 text-2xl leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{description}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="space-y-4">
          <CertificateFileViewer certificate={safeCertificate} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="neo-inset p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issuer</p>
              <p className="mt-3 text-sm font-semibold text-ink sm:text-base">{issuer}</p>
            </div>
            <div className="neo-inset p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Date</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink sm:text-base">
                <CalendarDays size={16} className="text-accent" />
                <span>{formatDate(issueDate)}</span>
              </div>
            </div>
          </div>

          <div className="neo-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate ID</p>
            <div className="mt-3 flex items-center gap-2 break-all text-sm font-semibold text-ink sm:text-base">
              <ShieldCheck size={16} className="shrink-0 text-accent" />
              <span>{certificateNumber}</span>
            </div>
          </div>

          <div className="neo-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SHA-256</p>
            <p className="mt-3 break-all text-sm leading-7 text-ink">{dataHash}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="neo-panel-soft p-5 text-center">
            <div className="neo-inset mx-auto flex h-48 w-48 items-center justify-center rounded-[24px] p-4">
              {qrCodeDataUrl ? (
                <img
                  alt={`QR code for ${title}`}
                  className="h-full w-full rounded-2xl object-cover"
                  src={qrCodeDataUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-muted">
                  QR unavailable
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted">
              <QrCode size={16} />
              QR verification
            </div>
          </div>

          <div className="grid gap-3">
            <button
              className="neo-button neo-button-primary flex items-center justify-center gap-2"
              disabled={!fileUrl}
              onClick={() => openExternalUrl(fileUrl)}
              type="button"
            >
              <FileText size={16} />
              {fileUrl ? "Open File" : "File unavailable"}
            </button>
            {verificationLink ? (
              <button
                className="neo-button flex items-center justify-center gap-2"
                onClick={() => openExternalUrl(verificationLink)}
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
