import { LayoutDashboard, LogOut, Plus, Search, ShieldCheck } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createCertificate,
  createDomain,
  fetchCertificates,
  fetchDomains,
  getApiErrorMessage,
  removeCertificate,
  removeDomain,
  updateCertificate
} from "../api/client";
import CertificateCard from "../components/CertificateCard";
import CertificateModal from "../components/CertificateModal";
import DomainSidebar from "../components/DomainSidebar";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [domains, setDomains] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [domainsResponse, certificatesResponse] = await Promise.all([
        fetchDomains(),
        fetchCertificates()
      ]);
      setDomains(domainsResponse);
      setCertificates(certificatesResponse);
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to load dashboard data."));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDomain(name) {
    try {
      setError("");
      await createDomain({ name });
      await loadDashboard();
      return true;
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return false;
      }
      setError(getApiErrorMessage(requestError, "Failed to create domain."));
      return false;
    }
  }

  async function handleDeleteDomain(domain) {
    const shouldDelete = window.confirm(`Delete the ${domain.name} domain?`);
    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      await removeDomain(domain.id);
      if (selectedDomain === domain.slug) {
        startTransition(() => setSelectedDomain("all"));
      }
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to delete domain."));
    }
  }

  function openCreateModal() {
    setEditingCertificate(null);
    setModalOpen(true);
  }

  function openEditModal(certificate) {
    setEditingCertificate(certificate);
    setModalOpen(true);
  }

  async function handleSubmitCertificate(formData) {
    try {
      setSubmitting(true);
      setError("");

      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, formData);
      } else {
        await createCertificate(formData);
      }

      setModalOpen(false);
      setEditingCertificate(null);
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to save certificate."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCertificate(certificate) {
    const shouldDelete = window.confirm(`Delete certificate "${certificate.title}"?`);
    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      await removeCertificate(certificate.id);
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to delete certificate."));
    }
  }

  if (loading) {
    return (
      <main className="page-shell flex items-center justify-center">
        <LoadingState message="Loading admin dashboard..." />
      </main>
    );
  }

  const visibleCertificates = certificates.filter((certificate) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesDomain = selectedDomain === "all" || certificate.domain.slug === selectedDomain;
    const matchesSearch =
      !searchTerm ||
      certificate.title.toLowerCase().includes(searchTerm) ||
      certificate.issuer.toLowerCase().includes(searchTerm) ||
      certificate.certificate_number.toLowerCase().includes(searchTerm);

    return matchesDomain && matchesSearch;
  });

  const publicCount = certificates.filter((certificate) => certificate.visibility === "public").length;
  const privateCount = certificates.length - publicCount;

  return (
    <main className="page-shell space-y-8">
      <section className="neo-card mesh-overlay p-8 sm:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <span className="soft-badge">
              <ShieldCheck size={14} />
              Admin Session
            </span>
            <h1 className="section-title mt-6 text-4xl leading-tight sm:text-5xl">
              Dashboard Control Center
            </h1>
            <p className="mt-4 text-base leading-8 text-muted sm:text-lg">
              Manage domains, publish certificates, control visibility, and maintain a verifiable
              credential portfolio from a single admin-only console.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="neo-button inline-flex items-center gap-2" to="/profile">
                <LayoutDashboard size={16} />
                Public Profile
              </Link>
              <button className="neo-button inline-flex items-center gap-2" onClick={logout} type="button">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <div className="neo-card-soft max-w-md p-6">
            <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">Logged in as</p>
            <h2 className="section-title mt-2 text-2xl">{admin?.full_name || "Administrator"}</h2>
            <p className="mt-2 break-all text-sm font-semibold text-muted">{admin?.email}</p>
            <p className="mt-4 rounded-2xl bg-white/35 px-4 py-3 text-sm text-muted">
              Only authenticated admin sessions can create, edit, or delete records.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Domains" value={domains.length} accent="text-accent" />
          <StatCard label="Certificates" value={certificates.length} />
          <StatCard label="Public" value={publicCount} />
          <StatCard label="Private" value={privateCount} accent="text-amber-700" />
        </div>
      </section>

      <section className="panel-grid">
        <DomainSidebar
          domains={domains}
          isAdmin
          selectedDomain={selectedDomain}
          onAddDomain={handleAddDomain}
          onDeleteDomain={handleDeleteDomain}
          onSelectDomain={(value) => startTransition(() => setSelectedDomain(value))}
        />

        <div className="space-y-6">
          <div className="neo-card flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">Certificate Management</p>
              <h2 className="section-title mt-2 text-3xl">Manage Credentials</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="neo-inset flex items-center gap-3 px-4 py-3 sm:min-w-[320px]">
                <Search size={18} className="text-accent" />
                <input
                  className="w-full bg-transparent outline-none"
                  placeholder="Search title, issuer, or certificate ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <button
                className="neo-button neo-button-primary inline-flex items-center justify-center gap-2"
                disabled={!domains.length}
                onClick={openCreateModal}
                type="button"
              >
                <Plus size={16} />
                Add Certificate
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          {!domains.length ? (
            <div className="neo-card p-10 text-center">
              <h3 className="section-title text-2xl">Create a domain first</h3>
              <p className="mt-3 text-muted">
                Certificates require a domain such as AI, DevOps, IoT, Internship, or MongoDB.
              </p>
            </div>
          ) : visibleCertificates.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {visibleCertificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  isAdmin
                  onDelete={handleDeleteCertificate}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          ) : (
            <div className="neo-card p-10 text-center">
              <h3 className="section-title text-2xl">No matching certificates</h3>
              <p className="mt-3 text-muted">
                Adjust the selected domain or search term, or add a new certificate.
              </p>
            </div>
          )}
        </div>
      </section>

      <CertificateModal
        certificate={editingCertificate}
        domains={domains}
        isOpen={modalOpen}
        mode={editingCertificate ? "edit" : "create"}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingCertificate(null);
        }}
        onSubmit={handleSubmitCertificate}
      />
    </main>
  );
}

