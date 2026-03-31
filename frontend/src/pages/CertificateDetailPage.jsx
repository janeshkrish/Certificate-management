import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchProfile, getApiErrorMessage } from "../api/client";
import CertificateDetail from "../components/CertificateDetail";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";

export default function CertificateDetailPage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCertificate() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfile();
        const nextCertificate = response.certificates.find((item) => item.id === id) || null;

        if (!nextCertificate) {
          throw new Error("Certificate not found.");
        }

        if (active) {
          setCertificate(nextCertificate);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, "Failed to load certificate."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCertificate();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout narrow>
        <LoadingState message="Loading certificate..." />
      </Layout>
    );
  }

  if (error || !certificate) {
    return (
      <Layout narrow>
        <div className="neo-panel mx-auto max-w-lg p-8 text-center">
          <p className="text-base font-semibold text-rose-600">{error || "Certificate not found."}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout narrow>
      <CertificateDetail
        certificate={certificate}
        domainHref={`/domain/${certificate.domain.id}`}
      />
    </Layout>
  );
}
