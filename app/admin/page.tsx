import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../lib/admin-auth";
import { adminCollections } from "../lib/admin-config";
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
  const initialRecords = await database.collection(firstCollection).find({}).sort({ _position: 1 }).limit(1000).toArray();
  const initialDocuments = initialRecords.map(({ _id, _position, _sourceFile, ...document }) => {
    void _id;
    void _position;
    void _sourceFile;
    return document;
  });

  return <AdminDashboard collections={collections} initialDocuments={initialDocuments} operatorEmail={session.email} />;
}
