import { ArrowRight, LayoutDashboard, LogIn, Search, Sparkles } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchProfile, getApiErrorMessage } from "../api/client";
import CertificateCard from "../components/CertificateCard";
import DomainSidebar from "../components/DomainSidebar";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfile();
        if (active) {
          setProfile(response);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, "Failed to load the public profile."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-shell flex items-center justify-center">
        <LoadingState message="Loading public profile..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="neo-card max-w-xl p-10 text-center">
          <p className="text-xl font-extrabold text-rose-700">{error}</p>
        </div>
      </main>
    );
  }

  const certificates = (profile?.certificates || []).filter((certificate) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesDomain = selectedDomain === "all" || certificate.domain.slug === selectedDomain;
    const matchesSearch =
      !searchTerm ||
      certificate.title.toLowerCase().includes(searchTerm) ||
      certificate.issuer.toLowerCase().includes(searchTerm) ||
      certificate.certificate_number.toLowerCase().includes(searchTerm);

    return matchesDomain && matchesSearch;
  });

  return (
    <main className="page-shell space-y-8">
      <section className="neo-card mesh-overlay p-8 sm:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <span className="soft-badge">
              <Sparkles size={14} />
              Public Profile
            </span>
            <h1 className="section-title mt-6 text-4xl leading-tight sm:text-6xl">
              {profile.owner_name}
            </h1>
            <p className="mt-3 text-xl font-semibold text-accent">{profile.headline}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {profile.bio}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="neo-button neo-button-primary inline-flex items-center gap-2"
                to={isAuthenticated ? "/dashboard" : "/login"}
              >
                {isAuthenticated ? <LayoutDashboard size={16} /> : <LogIn size={16} />}
                {isAuthenticated ? "Open Dashboard" : "Admin Login"}
              </Link>
              <a className="neo-button inline-flex items-center gap-2" href="#certificates">
                Browse Certificates
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 xl:max-w-xl">
            <StatCard label="Public Certificates" value={profile.stats.public_certificates} accent="text-accent" />
            <StatCard label="Domains" value={profile.stats.domains} />
            <StatCard label="Verified Items" value={profile.stats.total_certificates} />
          </div>
        </div>
      </section>

      <section className="panel-grid" id="certificates">
        <DomainSidebar
          domainCountLabel="Certification Domains"
          domains={profile.domains}
          selectedDomain={selectedDomain}
          onSelectDomain={(value) => startTransition(() => setSelectedDomain(value))}
        />

        <div className="space-y-6">
          <div className="neo-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">Certificate Directory</p>
              <h2 className="section-title mt-2 text-3xl">Public Credentials</h2>
            </div>

            <div className="neo-inset flex items-center gap-3 px-4 py-3 sm:min-w-[320px]">
              <Search size={18} className="text-accent" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Search title, issuer, or certificate ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {certificates.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {certificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          ) : (
            <div className="neo-card p-10 text-center">
              <h3 className="section-title text-2xl">No certificates found</h3>
              <p className="mt-3 text-muted">
                Try another domain or search term. Only public certificates appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

