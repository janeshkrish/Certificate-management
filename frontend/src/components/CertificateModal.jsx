import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Pencil,
  QrCode,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

import { formatDate, openExternalUrl, toTitleCase } from "../utils/format";
import CertificateFileViewer from "./CertificateFileViewer";

export default function CertificateModal({
  isOpen,
  mode = "detail",
  domains = [],
  certificate,
  initialDomainId = "",
  isAdmin = false,
  submitting = false,
  requestError = "",
  onClose,
  onDeleteRequest,
  onEditRequest,
  onSubmit
}) {
  const [form, setForm] = useState({
    title: "",
    domain_id: "",
    issuer: "",
    issue_date: "",
    verification_link: "",
    description: "",
    visibility: "public",
    file: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || mode === "detail") {
      return;
    }

    if (certificate && mode === "edit") {
      setForm({
        title: certificate.title,
        domain_id: certificate.domain.id,
        issuer: certificate.issuer,
        issue_date: certificate.issue_date,
        verification_link: certificate.verification_link || "",
        description: certificate.description,
        visibility: certificate.visibility,
        file: null
      });
      setErrors({});
      return;
    }

    setForm({
      title: "",
      domain_id: initialDomainId || domains[0]?.id || "",
      issuer: "",
      issue_date: "",
      verification_link: "",
      description: "",
      visibility: "public",
      file: null
    });
    setErrors({});
  }, [certificate, domains, initialDomainId, isOpen, mode]);

  const isFormMode = mode === "create" || mode === "edit";

  function validateForm(nextForm) {
    const validationErrors = {};

    if (!nextForm.title.trim()) {
      validationErrors.title = "Title is required.";
    } else if (nextForm.title.trim().length < 3) {
      validationErrors.title = "Title must be at least 3 characters.";
    }

    if (!nextForm.domain_id) {
      validationErrors.domain_id = "Select a domain.";
    }

    if (!nextForm.issuer.trim()) {
      validationErrors.issuer = "Issuer is required.";
    } else if (nextForm.issuer.trim().length < 2) {
      validationErrors.issuer = "Issuer must be at least 2 characters.";
    }

    if (!nextForm.issue_date) {
      validationErrors.issue_date = "Issue date is required.";
    }

    if (!nextForm.description.trim()) {
      validationErrors.description = "Description is required.";
    } else if (nextForm.description.trim().length < 10) {
      validationErrors.description = "Description must be at least 10 characters.";
    }

    if (nextForm.verification_link.trim()) {
      try {
        new URL(nextForm.verification_link);
      } catch {
        validationErrors.verification_link = "Enter a valid URL.";
      }
    }

    if (mode === "create" && !nextForm.file) {
      validationErrors.file = "Certificate file is required.";
    }

    return validationErrors;
  }

  function updateField(name, value) {
    setForm((current) => {
      const nextForm = { ...current, [name]: value };
      if (errors[name]) {
        setErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          const validationErrors = validateForm(nextForm);
          if (validationErrors[name]) {
            nextErrors[name] = validationErrors[name];
          } else {
            delete nextErrors[name];
          }
          return nextErrors;
        });
      }
      return nextForm;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "verification_link") {
        payload.append(key, String(value || ""));
        return;
      }

      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    await onSubmit(payload);
  }

  function getFieldClass(baseClassName, fieldName) {
    return `${baseClassName} ${errors[fieldName] ? "neo-input-error" : ""}`.trim();
  }

  const submitDisabled = submitting || Object.keys(validateForm(form)).length > 0;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="neo-panel relative max-h-[92vh] w-full max-w-4xl overflow-y-auto p-5 sm:p-7"
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {certificate?.domain?.name ? (
                    <span className="neo-chip neo-chip-accent">{certificate.domain.name}</span>
                  ) : null}
                  {certificate?.visibility ? (
                    <span className="neo-chip neo-chip-muted">{toTitleCase(certificate.visibility)}</span>
                  ) : null}
                  {isFormMode ? (
                    <span className="neo-chip neo-chip-muted">
                      {mode === "create" ? "Create certificate" : "Edit certificate"}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h2 className="section-title text-2xl sm:text-3xl">
                    {isFormMode
                      ? mode === "create"
                        ? "New Certificate"
                        : "Edit Certificate"
                      : certificate?.title}
                  </h2>
                  {isFormMode ? null : (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                      {certificate?.description}
                    </p>
                  )}
                </div>
              </div>

              <button className="neo-icon-button" onClick={onClose} type="button">
                <X size={18} />
              </button>
            </div>

            {isFormMode ? (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {requestError ? (
                  <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-600">
                    {requestError}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Title</span>
                    <input
                      className={getFieldClass("neo-input", "title")}
                      required
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                    />
                    {errors.title ? <p className="error-text">{errors.title}</p> : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Domain</span>
                    <select
                      className={getFieldClass("neo-select", "domain_id")}
                      required
                      value={form.domain_id}
                      onChange={(event) => updateField("domain_id", event.target.value)}
                    >
                      <option value="" disabled>
                        Select a domain
                      </option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                    {errors.domain_id ? <p className="error-text">{errors.domain_id}</p> : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Issuer</span>
                    <input
                      className={getFieldClass("neo-input", "issuer")}
                      required
                      value={form.issuer}
                      onChange={(event) => updateField("issuer", event.target.value)}
                    />
                    {errors.issuer ? <p className="error-text">{errors.issuer}</p> : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Issue Date</span>
                    <input
                      className={getFieldClass("neo-input", "issue_date")}
                      required
                      type="date"
                      value={form.issue_date}
                      onChange={(event) => updateField("issue_date", event.target.value)}
                    />
                    {errors.issue_date ? <p className="error-text">{errors.issue_date}</p> : null}
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-muted">Verification Link (Optional)</span>
                    <input
                      className={getFieldClass("neo-input", "verification_link")}
                      type="url"
                      value={form.verification_link}
                      onChange={(event) => updateField("verification_link", event.target.value)}
                    />
                    {errors.verification_link ? <p className="error-text">{errors.verification_link}</p> : null}
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-muted">Description</span>
                    <textarea
                      className={getFieldClass("neo-textarea min-h-32", "description")}
                      required
                      value={form.description}
                      onChange={(event) => updateField("description", event.target.value)}
                    />
                    {errors.description ? <p className="error-text">{errors.description}</p> : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Visibility</span>
                    <select
                      className="neo-select"
                      value={form.visibility}
                      onChange={(event) => updateField("visibility", event.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">
                      File {mode === "create" ? "(Required)" : "(Optional)"}
                    </span>
                    <input
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      className={getFieldClass(
                        "neo-input cursor-pointer file:mr-4 file:rounded-2xl file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white",
                        "file"
                      )}
                      required={mode === "create"}
                      type="file"
                      onChange={(event) => updateField("file", event.target.files?.[0] || null)}
                    />
                    {errors.file ? <p className="error-text">{errors.file}</p> : null}
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button className="neo-button" disabled={submitting} onClick={onClose} type="button">
                    Cancel
                  </button>
                  <button className="neo-button neo-button-primary" disabled={submitDisabled} type="submit">
                    {submitting ? "Saving..." : mode === "create" ? "Create Certificate" : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : certificate ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                <div className="space-y-5">
                  <CertificateFileViewer certificate={certificate} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="neo-inset p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issuer</p>
                      <p className="mt-3 text-base font-semibold text-ink">{certificate.issuer}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issued</p>
                      <div className="mt-3 flex items-center gap-2 text-base font-semibold text-ink">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SHA-256 Hash</p>
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

                  {isAdmin ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        className="neo-button flex items-center justify-center gap-2"
                        onClick={() => onEditRequest?.(certificate)}
                        type="button"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        className="neo-button flex items-center justify-center gap-2 text-rose-600"
                        onClick={() => onDeleteRequest?.(certificate)}
                        type="button"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
