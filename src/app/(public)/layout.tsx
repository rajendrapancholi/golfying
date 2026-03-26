import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, subRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("is_active")
      .eq("user_id", user?.id)
      .maybeSingle(),
  ]);

  const userWithRole = user
    ? { ...user, userRole: profileRes.data?.role }
    : null;
  return (
    <>
      <Navbar user={userWithRole} subscription={subRes.data} />
      {children}
      <Footer/>
    </>
  );
}
