import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchProfile, getApiErrorMessage } from "../api/client";
import DomainCard from "../components/DomainCard";
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfile();
        if (active) {
          setDomains(response.domains || []);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, "Failed to load domains."));
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
      <Layout narrow>
        <LoadingState message="Loading domains..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout narrow>
        <div className="neo-panel mx-auto max-w-lg p-8 text-center">
          <p className="text-base font-semibold text-rose-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!domains.length) {
    return (
      <Layout narrow>
        <div className="neo-panel mx-auto max-w-lg p-10 text-center">
          <p className="section-title text-xl">No domains available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        variants={gridVariants}
      >
        {domains.map((domain) => (
          <motion.div key={domain.id} variants={cardVariants}>
            <DomainCard domain={domain} onClick={() => navigate(`/domain/${domain.id}`)} />
          </motion.div>
        ))}
      </motion.div>
    </Layout>
  );
}
