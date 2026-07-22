"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, RadioTower } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setError(result.error || "Unable to sign in.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-shell">
      <div className="admin-login-grid" aria-hidden="true" />
      <section className="admin-login-story">
        <Link className="admin-brand" href="/" aria-label="Datacom website">
          <span className="admin-brand-mark"><i /><i /></span>
          <span><strong>DATACOM</strong><small>CONTROL PLANE</small></span>
        </Link>
        <div>
          <span className="admin-kicker"><RadioTower size={14} /> CONTENT OPERATIONS / DUBAI</span>
          <h1>The website,<br /><em>under control.</em></h1>
          <p>Manage product intelligence, compliance evidence and public content from one secured workspace.</p>
        </div>
        <div className="admin-login-signal">
          <span><i /> DATABASE LINK</span>
          <strong>ONLINE</strong>
        </div>
      </section>

      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <div className="admin-login-card">
          <span className="admin-card-index">AUTH / 01</span>
          <div className="admin-login-icon"><LockKeyhole /></div>
          <h2 id="admin-login-title">Operator sign in</h2>
          <p>Use your Datacom administration credentials to continue.</p>

          <form onSubmit={handleSubmit}>
            <label>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@datacom.com"
                required
                autoFocus
              />
            </label>
            <label>
              <span>Password</span>
              <div className="admin-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            {error && <p className="admin-form-error" role="alert">{error}</p>}
            <button className="admin-login-submit" type="submit" disabled={submitting}>
              {submitting ? "Authenticating…" : "Enter control plane"}
              <ArrowRight />
            </button>
          </form>
          <small className="admin-session-note">Protected by an 8-hour signed operator session.</small>
        </div>
      </section>
    </main>
  );
}
