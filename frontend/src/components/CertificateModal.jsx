import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function CertificateModal({
  isOpen,
  mode = "create",
  domains,
  certificate,
  submitting = false,
  onClose,
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (certificate) {
      setForm({
        title: certificate.title,
        domain_id: certificate.domain.id,
        issuer: certificate.issuer,
        issue_date: certificate.issue_date,
        verification_link: certificate.verification_link,
        description: certificate.description,
        visibility: certificate.visibility,
        file: null
      });
      return;
    }

    setForm({
      title: "",
      domain_id: domains[0]?.id || "",
      issuer: "",
      issue_date: "",
      verification_link: "",
      description: "",
      visibility: "public",
      file: null
    });
  }, [certificate, domains, isOpen]);

  if (!isOpen) {
    return null;
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    await onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="neo-card max-h-[92vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">
              {mode === "create" ? "Create Certificate" : "Edit Certificate"}
            </p>
            <h2 className="section-title mt-2 text-3xl">
              {mode === "create" ? "New Certificate" : certificate?.title}
            </h2>
          </div>
          <button className="neo-button p-3" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-muted">Title</span>
              <input
                className="neo-input"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-muted">Domain</span>
              <select
                className="neo-select"
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
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-muted">Issuer</span>
              <input
                className="neo-input"
                required
                value={form.issuer}
                onChange={(event) => updateField("issuer", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-muted">Issue Date</span>
              <input
                className="neo-input"
                required
                type="date"
                value={form.issue_date}
                onChange={(event) => updateField("issue_date", event.target.value)}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-muted">Verification Link</span>
              <input
                className="neo-input"
                required
                type="url"
                value={form.verification_link}
                onChange={(event) => updateField("verification_link", event.target.value)}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-muted">Description</span>
              <textarea
                className="neo-textarea min-h-32"
                required
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
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
                className="neo-input file:mr-4 file:rounded-xl file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white"
                required={mode === "create"}
                type="file"
                onChange={(event) => updateField("file", event.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button className="neo-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="neo-button neo-button-primary" disabled={submitting} type="submit">
              {submitting ? "Saving..." : mode === "create" ? "Create Certificate" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
