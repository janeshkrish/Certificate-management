import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
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
    <main className="page-shell flex items-center justify-center">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="neo-card mesh-overlay flex min-h-[560px] flex-col justify-between p-8 sm:p-10">
          <div>
            <span className="soft-badge">
              <ShieldCheck size={14} />
              Secure Admin Access
            </span>
            <h1 className="section-title mt-6 max-w-xl text-4xl leading-tight sm:text-5xl">
              AI-Powered Certificate Management System
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              A production-oriented dashboard to manage certificate domains, upload verified
              credentials, generate hashes and QR codes, and publish a polished public profile.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="neo-card-soft p-5">
              <p className="text-sm font-semibold text-muted">Authentication</p>
              <p className="mt-2 text-xl font-extrabold">JWT + bcrypt</p>
            </div>
            <div className="neo-card-soft p-5">
              <p className="text-sm font-semibold text-muted">Storage</p>
              <p className="mt-2 text-xl font-extrabold">Cloudinary</p>
            </div>
            <div className="neo-card-soft p-5">
              <p className="text-sm font-semibold text-muted">Public View</p>
              <p className="mt-2 text-xl font-extrabold">Read-only profile</p>
            </div>
          </div>
        </section>

        <section className="neo-card mx-auto flex w-full max-w-xl items-center p-8 sm:p-10">
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="neo-card-soft rounded-2xl p-4">
                <LockKeyhole size={22} className="text-accent" />
              </div>
              <div>
                <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">Admin Login</p>
                <h2 className="section-title mt-1 text-3xl">Welcome back</h2>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Email</span>
                <input
                  autoComplete="email"
                  className="neo-input"
                  placeholder="admin@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted">Password</span>
                <input
                  autoComplete="current-password"
                  className="neo-input"
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {error ? (
                <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <button className="neo-button neo-button-primary w-full" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-sm text-muted">
              Public visitors can browse visible certificates on{" "}
              <Link className="font-bold text-accent" to="/profile">
                /profile
              </Link>
              .
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

