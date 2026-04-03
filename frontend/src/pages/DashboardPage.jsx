import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChartNoAxesColumn, Globe, Layers3, Lock, LogOut, Plus, Search } from "lucide-react";
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
import DomainCard from "../components/DomainCard";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import StatsCard from "../components/StatsCard";
import { useAuth } from "../context/AuthContext";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [domains, setDomains] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [domainName, setDomainName] = useState("");
  const [domainError, setDomainError] = useState("");
  const [domainSubmitting, setDomainSubmitting] = useState(false);
  const [selectedDomainSlug, setSelectedDomainSlug] = useState(null);
  const [modalState, setModalState] = useState({ open: false, mode: "detail", certificate: null });
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
      setDomainSubmitting(true);
      setError("");
      const createdDomain = await createDomain({ name });
      await loadDashboard();
      startTransition(() => setSelectedDomainSlug(createdDomain.slug));
      return true;
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return false;
      }
      setError(getApiErrorMessage(requestError, "Failed to create domain."));
      return false;
    } finally {
      setDomainSubmitting(false);
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
      if (selectedDomainSlug === domain.slug) {
        startTransition(() => setSelectedDomainSlug(null));
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

  async function handleCreateDomain(event) {
    event.preventDefault();
    const trimmed = domainName.trim();
    if (!trimmed) {
      setDomainError("Domain name is required.");
      return;
    }

    if (trimmed.length < 2) {
      setDomainError("Domain name must be at least 2 characters.");
      return;
    }

    setDomainError("");
    const reset = await handleAddDomain(trimmed);
    if (reset) {
      setDomainName("");
    }
  }

  function openDetailModal(certificate) {
    setModalState({ open: true, mode: "detail", certificate });
  }

  function openCreateModal() {
    setModalState({ open: true, mode: "create", certificate: null });
  }

  function openEditModal(certificate) {
    setModalState({ open: true, mode: "edit", certificate });
  }

  function closeModal() {
    setModalState({ open: false, mode: "detail", certificate: null });
  }

  async function handleSubmitCertificate(formData) {
    try {
      setSubmitting(true);
      setError("");

      if (modalState.mode === "edit" && modalState.certificate) {
        await updateCertificate(modalState.certificate.id, formData);
      } else {
        await createCertificate(formData);
      }

      closeModal();
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (requestError?.response?.status === 422) {
        setError("Invalid input. Please check required fields.");
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
      closeModal();
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
      <Layout narrow>
        <LoadingState message="Loading dashboard..." />
      </Layout>
    );
  }

  const selectedDomain = domains.find((domain) => domain.slug === selectedDomainSlug) || null;
  const visibleCertificates = certificates.filter((certificate) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesDomain = selectedDomain ? certificate.domain.slug === selectedDomain.slug : false;
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
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="section-title text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              {admin?.full_name || "Administrator"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="neo-button" to="/profile">
              <Globe size={16} />
              Public
            </Link>
            <button className="neo-button" onClick={logout} type="button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatsCard icon={Layers3} label="Domains" value={domains.length} />
          <StatsCard icon={ChartNoAxesColumn} label="Certificates" value={certificates.length} />
          <StatsCard icon={Globe} label="Public" value={publicCount} />
          <StatsCard icon={Lock} label="Private" value={privateCount} />
        </section>

        <section className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto]" onSubmit={handleCreateDomain}>
            <input
              className={`neo-input ${domainError ? "neo-input-error" : ""}`.trim()}
              placeholder="New domain"
              value={domainName}
              onChange={(event) => {
                const nextValue = event.target.value;
                setDomainName(nextValue);
                if (domainError && nextValue.trim().length >= 2) {
                  setDomainError("");
                }
              }}
            />
            <button
              className="neo-button neo-button-primary"
              disabled={!domainName.trim() || domainSubmitting}
              type="submit"
            >
              <Plus size={16} />
              {domainSubmitting ? "Adding..." : "Add Domain"}
            </button>
          </form>
          {domainError ? <p className="error-text">{domainError}</p> : null}

          {domains.length ? (
            <motion.div
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              initial="hidden"
              variants={gridVariants}
            >
              {domains.map((domain) => (
                <motion.div key={domain.id} variants={cardVariants}>
                  <DomainCard
                    active={selectedDomainSlug === domain.slug}
                    domain={domain}
                    isAdmin
                    onClick={() => startTransition(() => setSelectedDomainSlug(domain.slug))}
                    onDelete={handleDeleteDomain}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="neo-panel p-10 text-center">
              <p className="section-title text-xl">Create a domain to start managing certificates</p>
            </div>
          )}
        </section>

        <AnimatePresence mode="wait">
          {selectedDomain ? (
            <motion.section
              key={selectedDomain.id}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 18 }}
            >
              <div className="neo-panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <button
                      className="text-sm font-semibold text-accent"
                      onClick={() => startTransition(() => setSelectedDomainSlug(null))}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Domains
                      </span>
                    </button>
                    <h2 className="section-title mt-3 text-2xl sm:text-3xl">{selectedDomain.name}</h2>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="neo-inset flex items-center gap-3 px-4 py-3 sm:min-w-[280px]">
                      <Search size={18} className="text-accent" />
                      <input
                        className="w-full bg-transparent outline-none"
                        placeholder="Search certificates"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <button className="neo-button neo-button-primary" onClick={openCreateModal} type="button">
                      <Plus size={16} />
                      Add Certificate
                    </button>
                  </div>
                </div>
              </div>

              {visibleCertificates.length ? (
                <motion.div
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  initial="hidden"
                  variants={gridVariants}
                >
                  {visibleCertificates.map((certificate) => (
                    <motion.div key={certificate.id} variants={cardVariants}>
                      <CertificateCard
                        certificate={certificate}
                        isAdmin
                        onClick={openDetailModal}
                        onDelete={handleDeleteCertificate}
                        onEdit={openEditModal}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="neo-panel p-10 text-center">
                  <p className="section-title text-xl">No certificates in this domain</p>
                </div>
              )}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <CertificateModal
        certificate={modalState.certificate}
        domains={domains}
        initialDomainId={selectedDomain?.id || ""}
        isAdmin
        isOpen={modalState.open}
        mode={modalState.mode}
        requestError={error}
        submitting={submitting}
        onClose={closeModal}
        onDeleteRequest={handleDeleteCertificate}
        onEditRequest={openEditModal}
        onSubmit={handleSubmitCertificate}
      />
    </Layout>
  );
}
