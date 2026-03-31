import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function DomainSidebar({
  domains,
  selectedDomain,
  onSelectDomain,
  isAdmin = false,
  onAddDomain,
  onDeleteDomain,
  domainCountLabel = "Available Domains"
}) {
  const [name, setName] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !onAddDomain) {
      return;
    }

    const shouldReset = await onAddDomain(trimmed);
    if (shouldReset !== false) {
      setName("");
    }
  }

  return (
    <aside className="neo-card mesh-overlay h-fit p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">
            {domainCountLabel}
          </p>
          <h2 className="section-title mt-2 text-2xl">Domain Sidebar</h2>
        </div>
        <span className="soft-badge">{domains.length}</span>
      </div>

      {isAdmin ? (
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            className="neo-input"
            placeholder="Add a new domain"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button className="neo-button neo-button-primary flex w-full items-center justify-center gap-2" type="submit">
            <Plus size={16} />
            Add Domain
          </button>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        <button
          className={`w-full rounded-[18px] px-4 py-3 text-left transition ${
            selectedDomain === "all" ? "neo-card-soft font-bold text-accent" : "neo-inset text-ink"
          }`}
          onClick={() => onSelectDomain("all")}
          type="button"
        >
          <div className="flex items-center justify-between gap-4">
            <span>All Domains</span>
            <span className="text-sm text-muted">
              {domains.reduce((sum, domain) => sum + (domain.certificate_count || 0), 0)}
            </span>
          </div>
        </button>

        {domains.map((domain) => (
          <div
            key={domain.id}
            className={`rounded-[18px] p-3 ${
              selectedDomain === domain.slug ? "neo-card-soft" : "neo-inset"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                className="w-full text-left"
                onClick={() => onSelectDomain(domain.slug)}
                type="button"
              >
                <p className="font-bold text-ink">{domain.name}</p>
                <p className="mt-1 text-sm text-muted">{domain.certificate_count || 0} certificates</p>
              </button>

              {isAdmin ? (
                <button
                  className="neo-button p-3"
                  onClick={() => onDeleteDomain?.(domain)}
                  title={`Delete ${domain.name}`}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

