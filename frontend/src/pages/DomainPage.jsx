import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchProfile, getApiErrorMessage } from "../api/client";
import CertificateCard from "../components/CertificateCard";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function DomainPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [domain, setDomain] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDomain() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfile();
        const nextDomain = response.domains.find((item) => item.id === id) || null;

        if (!nextDomain) {
          throw new Error("Domain not found.");
        }

        const nextCertificates = response.certificates.filter((item) => item.domain.id === id);

        if (active) {
          setDomain(nextDomain);
          setCertificates(nextCertificates);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, "Failed to load domain."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDomain();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout narrow>
        <LoadingState message="Loading certificates..." />
      </Layout>
    );
  }

  if (error || !domain) {
    return (
      <Layout narrow>
        <div className="neo-panel mx-auto max-w-lg p-8 text-center">
          <p className="text-base font-semibold text-rose-600">{error || "Domain not found."}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold text-accent" to="/profile">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Domains
            </span>
          </Link>
          <span className="neo-chip neo-chip-muted">{certificates.length}</span>
          <h1 className="section-title text-2xl sm:text-3xl">{domain.name}</h1>
        </div>

        {certificates.length ? (
          <motion.div
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            variants={gridVariants}
          >
            {certificates.map((certificate) => (
              <motion.div key={certificate.id} variants={cardVariants}>
                <CertificateCard
                  certificate={certificate}
                  onClick={() => navigate(`/certificate/${certificate.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="neo-panel p-10 text-center">
            <p className="section-title text-xl">No certificates in this domain</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
