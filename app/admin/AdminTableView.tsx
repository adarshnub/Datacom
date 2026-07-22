"use client";

import { useMemo, useState } from "react";
import {
  Braces,
  Check,
  CircleAlert,
  Code2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type JsonDocument = Record<string, unknown>;

type AdminTableViewProps = {
  collectionName: string;
  documents: JsonDocument[];
  draftIds: string[];
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onReload: (collectionName: string, preferredId?: string) => Promise<void>;
  onOpenJson: (document: JsonDocument) => void;
};

function serializeCell(value: unknown) {
  if (value === undefined) return "";
  if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
  return String(value);
}

function cellSummary(value: unknown) {
  if (value === null || value === undefined || value === "") return <span className="admin-table-empty">—</span>;
  if (Array.isArray(value)) return <span className="admin-table-complex"><Braces /> {value.length} items</span>;
  if (typeof value === "object") return <span className="admin-table-complex"><Braces /> {Object.keys(value).length} fields</span>;
  if (typeof value === "boolean") return <span className={`admin-table-boolean ${value ? "true" : "false"}`}>{value ? "TRUE" : "FALSE"}</span>;
  return <span title={String(value)}>{String(value)}</span>;
}

function parseCell(raw: string, sample: unknown, field: string) {
  if (field === "id") return raw.trim();
  if (raw === "" && sample === undefined) return undefined;
  if (typeof sample === "number") {
    const number = Number(raw);
    if (Number.isNaN(number)) throw new Error(`${field} must be a number.`);
    return number;
  }
  if (typeof sample === "boolean") {
    if (raw !== "true" && raw !== "false") throw new Error(`${field} must be true or false.`);
    return raw === "true";
  }
  if (sample === null && raw === "null") return null;
  if (typeof sample === "object" || raw.trim().startsWith("[") || raw.trim().startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`${field} contains invalid nested JSON.`);
    }
  }
  return raw;
}

export default function AdminTableView({
  collectionName,
  documents,
  draftIds,
  loading,
  query,
  onQueryChange,
  onReload,
  onOpenJson,
}: AdminTableViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [fieldDrafts, setFieldDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const columns = useMemo(() => {
    const fields = new Set<string>(["id"]);
    for (const document of documents) Object.keys(document).forEach((field) => fields.add(field));
    fields.delete("id");
    return ["id", ...fields];
  }, [documents]);

  const visibleDocuments = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter((document) => !term || JSON.stringify(document).toLowerCase().includes(term));
  }, [documents, query]);

  const sampleValues = useMemo(() => Object.fromEntries(
    columns.map((field) => [field, documents.find((document) => document[field] !== undefined)?.[field]]),
  ), [columns, documents]);

  function startEditing(document: JsonDocument) {
    setEditingId(String(document.id));
    setCreating(false);
    setFieldDrafts(Object.fromEntries(columns.map((field) => [field, serializeCell(document[field])])));
    setNotice(null);
  }

  function startCreating() {
    setEditingId(null);
    setCreating(true);
    setFieldDrafts(Object.fromEntries(columns.map((field) => [
      field,
      field === "id" ? `new-record-${Date.now().toString(36)}` : "",
    ])));
    setNotice(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setCreating(false);
    setFieldDrafts({});
  }

  async function saveRow() {
    const original = editingId ? documents.find((document) => document.id === editingId) : undefined;
    let nextDocument: JsonDocument;
    try {
      nextDocument = {};
      for (const field of columns) {
        const raw = fieldDrafts[field] ?? "";
        const existedOnOriginal = original ? Object.hasOwn(original, field) : false;
        if (field !== "id" && raw === "" && !existedOnOriginal) continue;
        const sample = original?.[field] ?? sampleValues[field];
        const value = parseCell(raw, sample, field);
        if (value !== undefined) nextDocument[field] = value;
      }
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "One or more fields are invalid." });
      return;
    }

    const id = typeof nextDocument.id === "string" ? nextDocument.id.trim() : "";
    if (!id) {
      setNotice({ kind: "error", message: "Every row requires a non-empty id." });
      return;
    }

    setSaving(true);
    const endpoint = creating
      ? `/api/admin/collections/${encodeURIComponent(collectionName)}`
      : `/api/admin/collections/${encodeURIComponent(collectionName)}/${encodeURIComponent(String(editingId))}`;
    const response = await fetch(endpoint, {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextDocument),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "The row could not be saved." });
      return;
    }

    cancelEditing();
    await onReload(collectionName, id);
    setNotice({ kind: "success", message: creating ? "New row saved as a draft." : "Row changes saved as a draft." });
  }

  async function deleteRow(id: string) {
    if (!window.confirm(`Stage "${id}" for deletion? It stays live until you publish.`)) return;
    setSaving(true);
    const response = await fetch(
      `/api/admin/collections/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice({ kind: "error", message: result.error || "The row could not be deleted." });
      return;
    }
    cancelEditing();
    await onReload(collectionName);
    setNotice({ kind: "success", message: "Deletion saved as a draft. Publish to make it live." });
  }

  function editableCell(field: string, original?: JsonDocument) {
    const sample = original?.[field] ?? sampleValues[field];
    const value = fieldDrafts[field] ?? "";
    const complex = typeof sample === "object" && sample !== null;

    if (typeof sample === "boolean") {
      return (
        <select value={value} onChange={(event) => setFieldDrafts((current) => ({ ...current, [field]: event.target.value }))}>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (complex) {
      return (
        <textarea
          value={value}
          onChange={(event) => setFieldDrafts((current) => ({ ...current, [field]: event.target.value }))}
          rows={3}
          spellCheck={false}
        />
      );
    }

    return (
      <input
        value={value}
        onChange={(event) => setFieldDrafts((current) => ({ ...current, [field]: event.target.value }))}
        disabled={field === "id" && !creating}
        inputMode={typeof sample === "number" ? "decimal" : "text"}
      />
    );
  }

  return (
    <section className="admin-table-shell" aria-label="Table data editor">
      <div className="admin-table-toolbar">
        <label><Search /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search every field…" /></label>
        <span>{visibleDocuments.length} of {documents.length} rows</span>
        <button onClick={() => void onReload(collectionName)}><RefreshCw /> Refresh</button>
        <button className="primary" onClick={startCreating} disabled={creating || editingId !== null}><Plus /> Add row</button>
      </div>

      {notice && (
        <div className={`admin-table-notice ${notice.kind}`} role="status">
          {notice.kind === "success" ? <Check /> : <CircleAlert />}
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss"><X /></button>
        </div>
      )}

      <div className="admin-table-scroll">
        <table>
          <thead>
            <tr>
              <th className="admin-table-row-index">#</th>
              {columns.map((field) => <th key={field}>{field}</th>)}
              <th className="admin-table-actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {creating && (
              <tr className="editing new-row">
                <td className="admin-table-row-index">NEW</td>
                {columns.map((field) => <td key={field}>{editableCell(field)}</td>)}
                <td className="admin-table-actions-column">
                  <div className="admin-table-row-actions">
                    <button className="save" onClick={saveRow} disabled={saving} title="Create row"><Save /></button>
                    <button onClick={cancelEditing} disabled={saving} title="Cancel"><X /></button>
                  </div>
                </td>
              </tr>
            )}

            {loading ? (
              <tr><td colSpan={columns.length + 2}><div className="admin-table-loading"><RefreshCw className="spin" /> Reading MongoDB…</div></td></tr>
            ) : visibleDocuments.length ? visibleDocuments.map((document, index) => {
              const id = String(document.id);
              const editing = editingId === id;
              return (
                <tr key={id} className={`${editing ? "editing" : ""} ${draftIds.includes(id) ? "draft" : ""}`.trim()}>
                  <td className="admin-table-row-index">
                    {String(index + 1).padStart(3, "0")}
                    {draftIds.includes(id) && <em>DRAFT</em>}
                  </td>
                  {columns.map((field) => (
                    <td key={field} className={field === "id" ? "id-cell" : ""}>
                      {editing ? editableCell(field, document) : cellSummary(document[field])}
                    </td>
                  ))}
                  <td className="admin-table-actions-column">
                    <div className="admin-table-row-actions">
                      {editing ? (
                        <>
                          <button className="save" onClick={saveRow} disabled={saving} title="Save row"><Save /></button>
                          <button onClick={cancelEditing} disabled={saving} title="Cancel"><X /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(document)} disabled={saving || creating || editingId !== null} title="Edit row"><Pencil /></button>
                          <button onClick={() => onOpenJson(document)} disabled={saving} title="Open in JSON editor"><Code2 /></button>
                          <button className="danger" onClick={() => void deleteRow(id)} disabled={saving} title="Delete row"><Trash2 /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={columns.length + 2}><div className="admin-table-loading"><CircleAlert /> No matching rows.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
