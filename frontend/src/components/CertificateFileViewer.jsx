import { AlertCircle, ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { getCertificateFileKind, isHttpUrl, openExternalUrl } from "../utils/format";

export default function CertificateFileViewer({ certificate, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const fileUrl = certificate?.file_url?.trim() || "";
  const fileKind = getCertificateFileKind(fileUrl, certificate?.file_format, certificate?.file_resource_type);
  const hasValidUrl = isHttpUrl(fileUrl);
  const pdfSrc = fileKind === "pdf" && hasValidUrl ? `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1` : "";

  useEffect(() => {
    setImageFailed(false);
  }, [fileUrl]);

  function renderErrorState(message) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <AlertCircle className="text-rose-600" size={22} />
        <p className="text-base font-semibold text-rose-600">{message}</p>
        <p className="max-w-md text-sm leading-6 text-muted">
          The certificate file could not be previewed here. Use the new-tab action to verify the asset directly.
        </p>
      </div>
    );
  }

  return (
    <div className={`neo-panel-soft p-5 ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate File</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {fileKind === "pdf"
              ? "Inline PDF preview with a direct-open fallback."
              : fileKind === "image"
                ? "Inline image preview."
                : "Preview is available only for PDF and image files."}
          </p>
        </div>

        <button
          className="neo-button flex items-center justify-center gap-2"
          disabled={!hasValidUrl}
          onClick={() => openExternalUrl(fileUrl)}
          type="button"
        >
          <ExternalLink size={16} />
          Open in New Tab
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[28px] border border-white/70 bg-white/80">
        {!hasValidUrl ? (
          renderErrorState("Certificate file URL is missing or invalid.")
        ) : fileKind === "pdf" ? (
          <div>
            <iframe
              className="min-h-[420px] w-full bg-white"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={pdfSrc}
              title={`Preview of ${certificate?.title || "certificate file"}`}
            />
            <div className="border-t border-slate-200/70 px-4 py-3 text-sm text-muted">
              If the preview stays blank, open the file in a new tab. Browser PDF support varies.
            </div>
          </div>
        ) : fileKind === "image" && !imageFailed ? (
          <img
            alt={`Certificate file for ${certificate?.title || "certificate"}`}
            className="max-h-[520px] w-full object-contain bg-slate-50"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={fileUrl}
          />
        ) : fileKind === "image" ? (
          renderErrorState("The certificate image failed to load.")
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <FileText className="text-accent" size={22} />
            <p className="text-base font-semibold text-ink">Unsupported preview type.</p>
            <p className="max-w-md text-sm leading-6 text-muted">
              This asset can still be opened directly if the storage URL is valid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
