import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchCertificate, getApiErrorMessage } from "../api/client";
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

      if (!id) {
        if (active) {
          setCertificate(null);
          setError("Certificate not found.");
          setLoading(false);
        }
        return;
      }

      try {
        const nextCertificate = await fetchCertificate(id);

        if (active) {
          setCertificate(nextCertificate);
        }
      } catch (requestError) {
        if (active) {
          setCertificate(null);
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
        domainHref={certificate?.domain?.id ? `/domain/${certificate.domain.id}` : ""}
      />
    </Layout>
  );
}
