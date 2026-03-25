import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <div>
      <header>
        <h1>Admin Panel</h1>
        <nav>
          <Link href="/admin/dashboard">Dashboard</Link>{" | "}
          <Link href="/admin/users">Users</Link>{" | "}
          <Link href="/admin/draws">Draws</Link>{" | "}
          <Link href="/admin/winners">Winners</Link>{" | "}
          <Link href="/admin/charities">Charities</Link>{" | "}
          <LogoutButton />
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}