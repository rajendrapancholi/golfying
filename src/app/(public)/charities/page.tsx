import { selectCharityAction } from "@/app/actions/charities";
import { createClient } from "@/lib/supabase/server";
import { Heart, Calendar, Search, Globe } from "lucide-react";

export default async function CharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select(`*, charity_events(id, title, event_date)`)
    .order("is_featured", { ascending: false });

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      {/* HEADER */}
      <section className="bg-slate-900 dark:bg-black pt-32 pb-28 px-6 text-center border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
            <Globe size={12} /> Global Impact Partners
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Play for a <span className="text-blue-500">Mission.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your golf performance fuels these causes. 10% of your subscription is automatically distributed to your chosen partner.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        {/* SEARCH & FILTER */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search missions, partners, or events..." 
            className="w-full pl-16 pr-8 py-7 rounded-3xl border border-border bg-card shadow-2xl shadow-black/5 focus:ring-4 focus:ring-primary/10 outline-none text-lg font-medium placeholder:text-muted-foreground"
          />
        </div>

        {/* CHARITY GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16 pb-24">
          {charities?.map((charity) => (
            <div 
              key={charity.id} 
              className={`group bg-card rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col ${
                charity.is_featured ? 'border-primary' : 'border-border'
              }`}
            >
              {/* LOGO AREA*/}
              <div className="h-56 bg-muted/30 relative flex items-center justify-center p-12 overflow-hidden">
                {charity.is_featured && (
                  <div className="absolute top-6 right-6 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase z-10 shadow-lg shadow-primary/20">
                    Featured
                  </div>
                )}
                <img 
                  src={charity.logo_url} 
                  alt={charity.name} 
                  className="max-h-full w-auto object-contain filter grayscale group-hover:grayscale-0 dark:brightness-90 dark:group-hover:brightness-100 transition-all duration-700 opacity-80 group-hover:opacity-100"
                />
              </div>

              {/* CONTENT AREA */}
              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-primary transition-colors">
                  {charity.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  {charity.description}
                </p>

                {/* EVENTS */}
                {charity.charity_events?.length > 0 && (
                  <div className="mb-8 p-5 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar size={14} className="text-primary" /> Upcoming Golf Days
                    </p>
                    <div className="space-y-2">
                      {charity.charity_events.slice(0, 2).map((event: any) => (
                        <div key={event.id} className="text-xs font-bold text-foreground flex justify-between items-center">
                          <span>{event.title}</span>
                          <span className="text-muted-foreground font-medium">{new Date(event.event_date).toLocaleDateString('en-GB')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form action={selectCharityAction}>
                  <input type="hidden" name="charity_id" value={charity.id} />
                  <button className="w-full py-5 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-3 transition-all bg-foreground text-background hover:bg-primary hover:text-white shadow-xl group-hover:shadow-primary/20">
                    <Heart size={18} className="group-hover:fill-current" /> Select Mission
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
