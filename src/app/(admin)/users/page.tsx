import { createClient } from "@/lib/supabase/client";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.name} - {user.email} - Role: {user.role} - Charity: {user.charity_id || "None"}
          </li>
        ))}
      </ul>
    </div>
  );
}