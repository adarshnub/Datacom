import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/admin-auth";
import { getDrafts } from "../../lib/admin-drafts";
import AdminSettings from "./AdminSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CMS settings | Datacom Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const drafts = await getDrafts();
  return (
    <AdminSettings
      initialDrafts={drafts}
      operatorEmail={session.email}
      revalidationSecretConfigured={(process.env.REVALIDATION_SECRET?.length || 0) >= 32}
      sessionSecretConfigured={(process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32}
    />
  );
}
