import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../lib/admin-auth";
import { adminCollections } from "../lib/admin-config";
import { getCollectionWorkspace } from "../lib/admin-drafts";
import { getDatabase } from "../lib/mongodb";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content control | Datacom Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const database = await getDatabase();
  const counts = await Promise.all(
    adminCollections.map(async (collection) => ({
      name: collection.name,
      count: await database.collection(collection.name).countDocuments(),
    })),
  );
  const countIndex = Object.fromEntries(counts.map((item) => [item.name, item.count]));
  const collections = adminCollections.map((collection) => ({
    ...collection,
    count: countIndex[collection.name] || 0,
  }));
  const firstCollection = adminCollections[0].name;
  const workspace = await getCollectionWorkspace(firstCollection);

  return (
    <AdminDashboard
      collections={collections}
      initialDocuments={workspace.documents}
      initialDraftIds={workspace.draftIds}
      initialDraftCount={workspace.totalDraftCount}
      operatorEmail={session.email}
    />
  );
}
