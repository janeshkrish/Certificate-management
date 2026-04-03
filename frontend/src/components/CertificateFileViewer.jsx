import { AlertCircle, ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { getCertificateFileKind, isHttpUrl, openExternalUrl } from "../utils/format";

export default function CertificateFileViewer({ certificate, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const fileUrl = certificate?.file_url?.trim() || "";
  const fileKind = getCertificateFileKind(fileUrl, certificate?.file_format, certificate?.file_resource_type);
  const hasValidUrl = isHttpUrl(fileUrl);
  const pdfSrc = fileKind === "pdf" && hasValidUrl ? `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1` : "";
  const previewFailed =
    !hasValidUrl ||
    fileKind === "unknown" ||
    (fileKind === "image" && imageFailed) ||
    (fileKind === "pdf" && pdfFailed);

  useEffect(() => {
    setImageFailed(false);
    setPdfFailed(false);
  }, [fileUrl]);

  function renderFallbackState(message) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <AlertCircle className="text-rose-600" size={22} />
        <p className="text-base font-semibold text-rose-600">{message}</p>
        <button
          className="neo-button neo-button-primary flex items-center justify-center gap-2"
          disabled={!hasValidUrl}
          onClick={() => openExternalUrl(fileUrl)}
          type="button"
        >
          <ExternalLink size={16} />
          Open Certificate
        </button>
      </div>
    );
  }

  return (
    <div className={`neo-panel-soft p-5 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate File</p>
        <button
          className="neo-button flex items-center justify-center gap-2"
          disabled={!hasValidUrl}
          onClick={() => openExternalUrl(fileUrl)}
          type="button"
        >
          <ExternalLink size={16} />
          Open Certificate
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[28px] border border-white/70 bg-white/80">
        {!hasValidUrl ? (
          renderFallbackState("File unavailable.")
        ) : previewFailed ? (
          renderFallbackState("Preview unavailable for this certificate.")
        ) : fileKind === "pdf" ? (
          <div>
            <iframe
              className="min-h-[420px] w-full bg-white"
              loading="lazy"
              onError={() => setPdfFailed(true)}
              referrerPolicy="no-referrer"
              src={pdfSrc}
              title={`Preview of ${certificate?.title || "certificate file"}`}
            />
          </div>
        ) : fileKind === "image" && !imageFailed ? (
          <img
            alt={`Certificate file for ${certificate?.title || "certificate"}`}
            className="max-h-[520px] w-full object-contain bg-slate-50"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={fileUrl}
          />
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <FileText className="text-accent" size={22} />
            <button
              className="neo-button neo-button-primary flex items-center justify-center gap-2"
              disabled={!hasValidUrl}
              onClick={() => openExternalUrl(fileUrl)}
              type="button"
            >
              <ExternalLink size={16} />
              Open Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
