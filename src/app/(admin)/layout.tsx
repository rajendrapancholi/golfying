import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Trophy,
  CheckCircle,
  Heart,
  LogOut,
  Settings,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth Protection
  if (!user) redirect("/login");

  // Role Verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-72 border-r border-border bg-card p-8 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="mb-10">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary italic">
            GOLFYI<span className="text-foreground">NG</span>
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Admin Control Center
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <AdminNavLink
            href="/admin-dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Overview"
          />
          <AdminNavLink
            href="/admin-users"
            icon={<Users size={18} />}
            label="Users & Subs"
          />
          <AdminNavLink
            href="/admin-draws"
            icon={<Trophy size={18} />}
            label="Draw Engine"
          />
          <AdminNavLink
            href="/admin-winners"
            icon={<CheckCircle size={18} />}
            label="Verify Winners"
          />
          <AdminNavLink
            href="/admin-charities"
            icon={<Heart size={18} />}
            label="Charity List"
          />
        </nav>

        <div className="pt-6 border-t border-border space-y-1">
          <AdminNavLink
            href="/admin-settings"
            icon={<Settings size={18} />}
            label="System Settings"
          />
          <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={18} />
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Management Portal
            </span>
            <h1 className="text-lg font-bold">Golfying Administration</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user.email}</p>
              <p className="text-[10px] text-success font-black uppercase">
                System Admin
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
          {/* Content wrapper with PRD-defined spacing */}
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper Component for Sidebar Links
function AdminNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 group"
    >
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}
