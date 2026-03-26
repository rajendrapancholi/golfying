import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [profileRes, subRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("is_active")
      .eq("user_id", user?.id)
      .maybeSingle(),
  ]);

  const userWithRole = user ? { ...user, userRole: profileRes.data?.role } : null;
  return (
    <>
      <Navbar user={userWithRole} subscription={subRes.data} />
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <main className="flex-1 container px-6 py-8">
          <div className="grid gap-6">{children}</div>
        </main>
      </div>
      <Footer />
    </>
  );
}
