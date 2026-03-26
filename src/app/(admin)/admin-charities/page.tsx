import { createAdminClient } from "@/lib/supabase/admin";
import CharityList from "@/components/admin/CharityList"; 

export default async function AdminCharitiesPage() {
  const supabase = await createAdminClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("name");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <CharityList initialCharities={charities || []} />
    </div>
  );
}





// import { createAdminClient } from "@/lib/supabase/admin";
// import { saveCharityAction, deleteCharityAction } from "@/app/actions/charities";
// import { Plus, Edit2, Trash2, Heart, Image as ImageIcon } from "lucide-react";

// export default async function AdminCharitiesPage() {
//   const supabase = await createAdminClient();
//   const { data: charities } = await supabase.from("charities").select("*").order("name");

//   return (
//     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
//       <header className="flex justify-between items-center">
//         <div>
//           <h1 className="text-4xl font-black tracking-tight">Charity Curation</h1>
//           <p className="text-muted-foreground italic">Manage the causes that define our heroes' impact.</p>
//         </div>
//         <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20">
//           <Plus size={20} /> Add New Cause
//         </button>
//       </header>

//       <div className="grid md:grid-cols-2 gap-6">
//         {charities?.map((charity) => (
//           <div key={charity.id} className="bg-card border border-border rounded-4xl p-8 flex flex-col justify-between group hover:border-primary/40 transition-all shadow-sm">
//             <div className="space-y-6">
//               <div className="w-20 h-20 bg-muted rounded-3xl overflow-hidden border border-border flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
//                 {charity.logo_url ? (
//                   <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover" />
//                 ) : (
//                   <Heart size={32} fill="currentColor" />
//                 )}
//               </div>
              
//               <div>
//                 <h3 className="text-2xl font-black text-foreground">{charity.name}</h3>
//                 <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
//                   {charity.description}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2 mt-8 pt-6 border-t border-border">
//               <button className="flex-1 bg-muted hover:bg-primary/10 hover:text-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
//                 <Edit2 size={14} /> Edit Details
//               </button>
//               <form action={async () => { "use server"; await deleteCharityAction(charity.id); }}>
//                 <button className="bg-destructive/10 text-destructive p-3 rounded-xl hover:bg-destructive hover:text-white transition-all">
//                   <Trash2 size={18} />
//                 </button>
//               </form>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
