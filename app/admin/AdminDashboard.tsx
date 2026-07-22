"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Braces,
  Check,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  Code2,
  Database,
  FileJson,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  TableProperties,
  Trash2,
  X,
} from "lucide-react";
import AdminTableView from "./AdminTableView";

type AdminCollection = {
  name: string;
  label: string;
  description: string;
  group: string;
  count: number;
};

type AdminDashboardProps = {
  collections: AdminCollection[];
  initialDocuments: JsonDocument[];
  initialDraftIds: string[];
  initialDraftCount: number;
  operatorEmail: string;
};

type JsonDocument = Record<string, unknown>;
type ViewMode = "table" | "json";

function documentTitle(document: JsonDocument) {
  const question = document.q && typeof document.q === "object" && "en" in document.q
    ? String((document.q as { en: unknown }).en)
    : "";
  return String(document.name || document.title || document.code || question || document.id || "Untitled record");
}

function documentMeta(document: JsonDocument) {
  return String(document.family || document.issuer || document.path || document.scope || document.id || "JSON document");
}

export default function AdminDashboard({
  collections: initialCollections,
  initialDocuments,
  initialDraftIds,
  initialDraftCount,
  operatorEmail,
}: AdminDashboardProps) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);
  const [activeName, setActiveName] = useState(initialCollections[0]?.name || "");
  const [documents, setDocuments] = useState<JsonDocument[]>(initialDocuments);
  const [selectedId, setSelectedId] = useState<string | null>(initialDocuments[0] ? String(initialDocuments[0].id) : null);
  const [draft, setDraft] = useState(initialDocuments[0] ? JSON.stringify(initialDocuments[0], null, 2) : "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftIds, setDraftIds] = useState(initialDraftIds);
  const [draftCount, setDraftCount] = useState(initialDraftCount);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const lineRailRef = useRef<HTMLDivElement>(null);

  const activeCollection = collections.find((collection) => collection.name === activeName) || collections[0];
  const selectedDocument = documents.find((document) => document.id === selectedId) || null;

  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter((document) => !term || JSON.stringify(document).toLowerCase().includes(term));
  }, [documents, query]);

  const loadDocuments = useCallback(async (collectionName: string, preferredId?: string) => {
    setLoading(true);
    setNotice(null);
    const response = await fetch(`/api/admin/collections/${encodeURIComponent(collectionName)}`, { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const result = await response.json().catch(() => ({})) as {
      documents?: JsonDocument[];
      draftIds?: string[];
      totalDraftCount?: number;
      error?: string;
    };
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "Could not load this collection." });
      setLoading(false);
      return;
    }

    const nextDocuments = result.documents || [];
    setDocuments(nextDocuments);
    setDraftIds(result.draftIds || []);
    setDraftCount(result.totalDraftCount || 0);
    setCollections((current) => current.map((item) => item.name === collectionName ? { ...item, count: nextDocuments.length } : item));
    const nextSelected = nextDocuments.find((item) => item.id === preferredId) || nextDocuments[0] || null;
    setSelectedId(nextSelected ? String(nextSelected.id) : null);
    setDraft(nextSelected ? JSON.stringify(nextSelected, null, 2) : "");
    setCreating(false);
    setLoading(false);
  }, [router]);

  function selectDocument(document: JsonDocument) {
    setSelectedId(String(document.id));
    setDraft(JSON.stringify(document, null, 2));
    setCreating(false);
    setNotice(null);
  }

  function beginCreate() {
    setSelectedId(null);
    setCreating(true);
    setDraft(JSON.stringify({ id: "new-record", name: "New record" }, null, 2));
    setNotice(null);
  }

  async function saveDocument() {
    if (!activeCollection) return;
    let parsed: JsonDocument;
    try {
      parsed = JSON.parse(draft) as JsonDocument;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error();
    } catch {
      setNotice({ kind: "error", message: "The editor must contain one valid JSON object." });
      return;
    }

    const id = typeof parsed.id === "string" ? parsed.id.trim() : "";
    if (!id) {
      setNotice({ kind: "error", message: "Every record requires a non-empty string id." });
      return;
    }

    setSaving(true);
    setNotice(null);
    const endpoint = creating
      ? `/api/admin/collections/${encodeURIComponent(activeCollection.name)}`
      : `/api/admin/collections/${encodeURIComponent(activeCollection.name)}/${encodeURIComponent(String(selectedId))}`;
    const response = await fetch(endpoint, {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "The record could not be saved." });
      return;
    }

    await loadDocuments(activeCollection.name, id);
    setNotice({ kind: "success", message: creating ? "New record saved as a draft." : "Changes saved as a draft." });
  }

  async function deleteDocument() {
    if (!activeCollection || !selectedId || !window.confirm(`Stage "${selectedId}" for deletion? It stays live until you publish.`)) return;
    setSaving(true);
    const response = await fetch(
      `/api/admin/collections/${encodeURIComponent(activeCollection.name)}/${encodeURIComponent(selectedId)}`,
      { method: "DELETE" },
    );
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "The record could not be deleted." });
      return;
    }
    await loadDocuments(activeCollection.name);
    setNotice({ kind: "success", message: "Deletion saved as a draft. Publish to make it live." });
  }

  async function publishChanges() {
    if (!draftCount || publishing) return;
    setPublishing(true);
    setNotice(null);
    const response = await fetch("/api/admin/publish", { method: "POST" });
    const result = await response.json().catch(() => ({})) as {
      data?: { publishedCount?: number };
      error?: string;
    };
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    setPublishing(false);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "Draft changes could not be published." });
      return;
    }
    await loadDocuments(activeName, selectedId || undefined);
    const count = result.data?.publishedCount || 0;
    setNotice({ kind: "success", message: `${count} draft change${count === 1 ? "" : "s"} published. The live cache is refreshed.` });
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const groupedCollections = collections.reduce<Record<string, AdminCollection[]>>((groups, collection) => {
    (groups[collection.group] ||= []).push(collection);
    return groups;
  }, {});
  const totalDocuments = collections.reduce((sum, collection) => sum + collection.count, 0);

  return (
    <main className="admin-workspace">
      <header className="admin-topbar">
        <button className="admin-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button>
        <a className="admin-brand" href="/admin">
          <span className="admin-brand-mark"><i /><i /></span>
          <span><strong>DATACOM</strong><small>CONTROL PLANE</small></span>
        </a>
        <div className="admin-topbar-status">
          <span><i /> CONTENT WORKSPACE</span>
          <b>{totalDocuments} RECORDS</b>
        </div>
        <div className="admin-operator">
          <button
            className="admin-publish-action"
            onClick={() => void publishChanges()}
            disabled={!draftCount || publishing}
            title={draftCount ? `Publish ${draftCount} draft changes` : "No unpublished changes"}
          >
            <CloudUpload /> {publishing ? "Publishing…" : "Publish"}
            <b>{draftCount}</b>
          </button>
          <span><small>OPERATOR</small>{operatorEmail}</span>
          <a href="/" target="_blank" rel="noreferrer">View site <ArrowUpRight /></a>
          <button onClick={logout} aria-label="Sign out"><LogOut /></button>
        </div>
      </header>

      {sidebarOpen && <button className="admin-sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-heading">
          <span>DATA NETWORK</span>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <a className="admin-overview-link active" href="/admin"><LayoutDashboard /> Content control <ChevronRight /></a>
        <a className="admin-overview-link" href="/admin/settings"><Settings /> Settings <ChevronRight /></a>
        {Object.entries(groupedCollections).map(([group, items]) => (
          <div className="admin-nav-group" key={group}>
            <span>{group}</span>
            {items.map((collection) => (
              <button
                key={collection.name}
                className={activeName === collection.name ? "active" : ""}
                onClick={() => {
                  setActiveName(collection.name);
                  setQuery("");
                  setSidebarOpen(false);
                  void loadDocuments(collection.name);
                }}
              >
                <FileJson />
                <span><strong>{collection.label}</strong><small>{collection.count} records</small></span>
              </button>
            ))}
          </div>
        ))}
        <div className="admin-sidebar-foot"><Database /><span><small>PRIMARY STORE</small>MongoDB Atlas</span><i /></div>
      </aside>

      <section className="admin-main">
        <div className="admin-page-heading">
          <div>
            <span className="admin-kicker"><Braces size={14} /> COLLECTION / {activeCollection?.name}</span>
            <h1>{activeCollection?.label}</h1>
            <p>{activeCollection?.description}</p>
          </div>
          <div className="admin-heading-actions">
            <div className="admin-view-toggle" role="group" aria-label="Data view">
              <button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")} aria-pressed={viewMode === "table"}>
                <TableProperties /> Table
              </button>
              <button className={viewMode === "json" ? "active" : ""} onClick={() => setViewMode("json")} aria-pressed={viewMode === "json"}>
                <Code2 /> JSON
              </button>
            </div>
            <button onClick={() => void loadDocuments(activeName)}><RefreshCw /> Refresh</button>
            {viewMode === "json" && <button className="primary" onClick={beginCreate}><Plus /> New record</button>}
          </div>
        </div>

        {viewMode === "table" ? (
          <AdminTableView
            key={activeName}
            collectionName={activeName}
            documents={documents}
            draftIds={draftIds}
            loading={loading}
            query={query}
            onQueryChange={setQuery}
            onReload={loadDocuments}
            onOpenJson={(document) => {
              selectDocument(document);
              setViewMode("json");
            }}
          />
        ) : (
          <div className="admin-data-grid">
          <section className="admin-record-browser" aria-label="Collection records">
            <div className="admin-record-tools">
              <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter records…" /></label>
              <span>{filteredDocuments.length.toString().padStart(3, "0")}</span>
            </div>
            <div className="admin-record-list">
              {loading ? (
                <div className="admin-empty-state"><RefreshCw className="spin" /><p>Reading MongoDB…</p></div>
              ) : filteredDocuments.length ? (
                filteredDocuments.map((document, index) => (
                  <button
                    className={`${selectedId === document.id && !creating ? "active" : ""} ${draftIds.includes(String(document.id)) ? "draft" : ""}`.trim()}
                    key={String(document.id)}
                    onClick={() => selectDocument(document)}
                  >
                    <span>{String(index + 1).padStart(3, "0")}</span>
                    <div><strong>{documentTitle(document)}{draftIds.includes(String(document.id)) && <em>DRAFT</em>}</strong><small>{documentMeta(document)}</small></div>
                    <ChevronRight />
                  </button>
                ))
              ) : (
                <div className="admin-empty-state"><FileJson /><p>No matching records.</p><button onClick={beginCreate}>Create the first one</button></div>
              )}
            </div>
          </section>

          <section className="admin-editor" aria-label="JSON record editor">
            <div className="admin-editor-head">
              <div>
                <span>{creating ? "NEW DRAFT" : selectedDocument && draftIds.includes(String(selectedDocument.id)) ? "DRAFT / EDITING" : selectedDocument ? "EDITING" : "NO SELECTION"}</span>
                <strong>{creating ? "Unsaved document" : selectedDocument ? documentTitle(selectedDocument) : "Select a record"}</strong>
              </div>
              <div>
                <button
                  onClick={() => {
                    try { setDraft(JSON.stringify(JSON.parse(draft), null, 2)); } catch { setNotice({ kind: "error", message: "Fix invalid JSON before formatting." }); }
                  }}
                  disabled={!draft}
                >
                  <Braces /> Format
                </button>
                {!creating && selectedId && <button className="danger" onClick={deleteDocument} disabled={saving}><Trash2 /> Delete</button>}
              </div>
            </div>

            {notice && (
              <div className={`admin-notice ${notice.kind}`} role="status">
                {notice.kind === "success" ? <Check /> : <CircleAlert />}{notice.message}
                <button onClick={() => setNotice(null)} aria-label="Dismiss"><X /></button>
              </div>
            )}

            <div className="admin-code-wrap">
              <div className="admin-code-rail" ref={lineRailRef}>{Array.from({ length: Math.max(1, draft.split("\n").length) }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onScroll={(event) => {
                  if (lineRailRef.current) lineRailRef.current.scrollTop = event.currentTarget.scrollTop;
                }}
                spellCheck={false}
                aria-label="JSON document"
                placeholder="Select a record or create a new one."
              />
            </div>

            <div className="admin-editor-foot">
              <span><i /> Saves remain drafts until global publish</span>
              <div>
                <button
                  onClick={() => {
                    if (creating) beginCreate();
                    else if (selectedDocument) setDraft(JSON.stringify(selectedDocument, null, 2));
                  }}
                  disabled={!draft || saving}
                >
                  Reset
                </button>
                <button className="save" onClick={saveDocument} disabled={!draft || saving}>
                  <Save /> {saving ? "Saving…" : creating ? "Save new draft" : "Save draft"}
                </button>
              </div>
            </div>
          </section>
          </div>
        )}
      </section>
    </main>
  );
}
