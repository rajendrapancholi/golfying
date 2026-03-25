import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("Debug subscription: ", subscription);

  return (
    <>
      <Navbar user={user} subscription={subscription}/>
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <main className="flex-1 container px-6 py-8">
          <div className="grid gap-6">{children}</div>
        </main>
      </div>
      <Footer/>
    </>
  );
}
