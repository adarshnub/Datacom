import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/admin-auth";
import AdminLogin from "./AdminLogin";

export const metadata: Metadata = {
  title: "Admin sign in | Datacom Control",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLogin />;
}
