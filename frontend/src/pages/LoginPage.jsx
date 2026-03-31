import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import Layout from "../components/Layout";
import LoginCard from "../components/LoginCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Login failed."));
    }
  }

  return (
    <Layout centered narrow>
      <LoginCard
        email={email}
        error={error}
        loading={loading}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
