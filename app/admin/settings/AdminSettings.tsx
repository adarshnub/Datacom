"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  Database,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  Webhook,
  X,
} from "lucide-react";

type Draft = {
  _id: string;
  collection: string;
  documentId: string;
  operation: "upsert" | "delete";
  isNew: boolean;
  updatedAt: string;
  updatedBy: string;
};

type AdminSettingsProps = {
  initialDrafts: Draft[];
  operatorEmail: string;
  revalidationSecretConfigured: boolean;
  sessionSecretConfigured: boolean;
};

type Notice = { kind: "success" | "error"; message: string } | null;

export default function AdminSettings({
  initialDrafts,
  operatorEmail,
  revalidationSecretConfigured,
  sessionSecretConfigured,
}: AdminSettingsProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [working, setWorking] = useState<"publish" | "discard" | "revalidate" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  async function refreshDrafts() {
    const response = await fetch("/api/admin/drafts", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const result = await response.json().catch(() => ({})) as { data?: { drafts?: Draft[] } };
    setDrafts(result.data?.drafts || []);
    setSelected([]);
  }

  async function publish() {
    if (!drafts.length || working) return;
    setWorking("publish");
    setNotice(null);
    const response = await fetch("/api/admin/publish", { method: "POST" });
    const result = await response.json().catch(() => ({})) as { data?: { publishedCount?: number }; error?: string };
    setWorking(null);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "Drafts could not be published." });
      return;
    }
    const count = result.data?.publishedCount || 0;
    await refreshDrafts();
    setNotice({ kind: "success", message: `${count} change${count === 1 ? "" : "s"} published and the affected cache refreshed.` });
  }

  async function discard(ids?: string[]) {
    const count = ids?.length || drafts.length;
    if (!count || working || !window.confirm(`Discard ${count} unpublished change${count === 1 ? "" : "s"}?`)) return;
    setWorking("discard");
    setNotice(null);
    const response = await fetch("/api/admin/drafts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : {}),
    });
    const result = await response.json().catch(() => ({})) as { data?: { discardedCount?: number }; error?: string };
    setWorking(null);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "Drafts could not be discarded." });
      return;
    }
    await refreshDrafts();
    setNotice({ kind: "success", message: `${result.data?.discardedCount || 0} unpublished change${result.data?.discardedCount === 1 ? "" : "s"} discarded.` });
  }

  async function revalidate() {
    if (working) return;
    setWorking("revalidate");
    setNotice(null);
    const response = await fetch("/api/admin/revalidate", { method: "POST" });
    const result = await response.json().catch(() => ({})) as { data?: { revalidatedAt?: string }; error?: string };
    setWorking(null);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "The cache could not be refreshed." });
      return;
    }
    setNotice({ kind: "success", message: `All public content caches refreshed at ${new Date(result.data?.revalidatedAt || Date.now()).toLocaleTimeString()}.` });
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-workspace admin-settings-workspace">
      <header className="admin-topbar">
        <button className="admin-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button>
        <a className="admin-brand" href="/admin">
          <span className="admin-brand-mark"><i /><i /></span>
          <span><strong>DATACOM</strong><small>CONTROL PLANE</small></span>
        </a>
        <div className="admin-topbar-status"><span><i /> CMS SETTINGS</span><b>{drafts.length} UNPUBLISHED</b></div>
        <div className="admin-operator">
          <button className="admin-publish-action" onClick={() => void publish()} disabled={!drafts.length || Boolean(working)}>
            <CloudUpload /> {working === "publish" ? "Publishing…" : "Publish"}<b>{drafts.length}</b>
          </button>
          <span><small>OPERATOR</small>{operatorEmail}</span>
          <a href="/" target="_blank" rel="noreferrer">View site <ArrowUpRight /></a>
          <button onClick={logout} aria-label="Sign out"><LogOut /></button>
        </div>
      </header>

      {sidebarOpen && <button className="admin-sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-heading">
          <span>SYSTEM CONTROL</span>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <a className="admin-overview-link" href="/admin"><LayoutDashboard /> Content control <ChevronRight /></a>
        <a className="admin-overview-link active" href="/admin/settings"><Settings /> Settings <ChevronRight /></a>
        <div className="admin-sidebar-foot"><Database /><span><small>PRIMARY STORE</small>MongoDB Atlas</span><i /></div>
      </aside>

      <section className="admin-settings-main">
        <div className="admin-settings-heading">
          <div>
            <a href="/admin"><ArrowLeft /> Back to content</a>
            <span className="admin-kicker"><Settings /> SYSTEM / CMS</span>
            <h1>Settings & publishing</h1>
            <p>Review staged content, publish atomically, and manage public cache delivery.</p>
          </div>
        </div>

        {notice && (
          <div className={`admin-settings-notice ${notice.kind}`} role="status">
            {notice.kind === "success" ? <Check /> : <CircleAlert />}<span>{notice.message}</span>
          </div>
        )}

        <div className="admin-settings-grid">
          <article className="admin-settings-card admin-drafts-card">
            <div className="admin-settings-card-head">
              <span><FileClock /></span>
              <div><small>PUBLISHING QUEUE</small><h2>Unpublished drafts</h2></div>
              <b>{drafts.length}</b>
            </div>
            <div className="admin-settings-actions">
              <button onClick={() => void refreshDrafts()} disabled={Boolean(working)}><RefreshCw /> Refresh</button>
              <button className="danger" onClick={() => void discard(selected.length ? selected : undefined)} disabled={!drafts.length || Boolean(working)}>
                <Trash2 /> {selected.length ? `Discard selected (${selected.length})` : "Discard all"}
              </button>
            </div>
            <div className="admin-draft-list">
              {drafts.length ? drafts.map((draft) => (
                <label key={draft._id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(draft._id)}
                    onChange={(event) => setSelected((current) => event.target.checked
                      ? [...current, draft._id]
                      : current.filter((id) => id !== draft._id))}
                  />
                  <span className={`admin-draft-operation ${draft.operation}`}>{draft.operation === "delete" ? "DELETE" : draft.isNew ? "CREATE" : "UPDATE"}</span>
                  <span><strong>{draft.documentId}</strong><small>{draft.collection} · {new Date(draft.updatedAt).toLocaleString()}</small></span>
                  <em>{draft.updatedBy}</em>
                </label>
              )) : (
                <div className="admin-settings-empty"><Check /><strong>Everything is published</strong><span>Saving content in either editor will add it here.</span></div>
              )}
            </div>
          </article>

          <div className="admin-settings-stack">
            <article className="admin-settings-card">
              <div className="admin-settings-card-head">
                <span><Webhook /></span>
                <div><small>EXTERNAL INTEGRATION</small><h2>Revalidation webhook</h2></div>
              </div>
              <dl className="admin-settings-facts">
                <div><dt>Endpoint</dt><dd><code>POST /api/revalidate</code></dd></div>
                <div><dt>Authentication</dt><dd><code>x-revalidate-secret</code></dd></div>
                <div><dt>Secret</dt><dd className={revalidationSecretConfigured ? "ready" : "warning"}>{revalidationSecretConfigured ? "Configured" : "Missing"}</dd></div>
                <div><dt>Payload</dt><dd><code>{`{ "scope": "all" }`}</code></dd></div>
              </dl>
              <p className="admin-settings-help">The secret stays server-side. Rotate it in the deployment environment and never paste it into client code.</p>
            </article>

            <article className="admin-settings-card">
              <div className="admin-settings-card-head">
                <span><Database /></span>
                <div><small>PUBLIC DELIVERY</small><h2>Next.js content cache</h2></div>
              </div>
              <dl className="admin-settings-facts">
                <div><dt>Safety refresh</dt><dd>24 hours</dd></div>
                <div><dt>On publish</dt><dd className="ready">Affected tags only</dd></div>
                <div><dt>Manual action</dt><dd>All public routes</dd></div>
              </dl>
              <button className="admin-settings-primary" onClick={() => void revalidate()} disabled={Boolean(working)}>
                <RefreshCw className={working === "revalidate" ? "spin" : ""} /> {working === "revalidate" ? "Refreshing…" : "Revalidate all content"}
              </button>
            </article>

            <article className="admin-settings-card">
              <div className="admin-settings-card-head">
                <span><ShieldCheck /></span>
                <div><small>ENVIRONMENT</small><h2>Security status</h2></div>
              </div>
              <dl className="admin-settings-facts">
                <div><dt>Admin session signing</dt><dd className={sessionSecretConfigured ? "ready" : "warning"}>{sessionSecretConfigured ? "Configured" : "Missing"}</dd></div>
                <div><dt>Webhook signing</dt><dd className={revalidationSecretConfigured ? "ready" : "warning"}>{revalidationSecretConfigured ? "Configured" : "Missing"}</dd></div>
                <div><dt>Credentials</dt><dd>Server-only</dd></div>
              </dl>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
