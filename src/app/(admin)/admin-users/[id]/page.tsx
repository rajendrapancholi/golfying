import ManageUserClient from "@/components/admin/ManageUserClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ManageUserPage({
  params,
}: {
  params: Promise<{ id: string }>; // Define as a Promise
}) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { id } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*, scores(*), subscriptions(*)")
    .eq("id", id)
    .single();
  
 const { data: { user: authUser }, error: userError } = await adminClient.auth.admin.getUserById(id);

  if (error || userError) console.error("Supabase Error:", error?.message || userError?.message);

  if (!profile || !authUser)
    return <div className="p-12 text-center font-bold">User Not Found</div>;

  return <ManageUserClient user={{...profile, email: authUser.email}} />;
}
