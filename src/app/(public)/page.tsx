import Link from "next/link";
import { Heart, Trophy, Target, ArrowRight, Zap } from "lucide-react";

export default async function LandingPage() {
  return (
    <div className="flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* SECTION 1: HERO - Using variables for theme support */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide animate-pulse">
              <Zap size={16} /> THE NEW ERA OF GOLF GIVING
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              PLAY FOR <span className="text-primary">PURPOSE.</span> <br />
              WIN FOR <span className="text-muted-foreground underline decoration-primary/30">IMPACT.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-muted-foreground font-medium">
              The premium subscription platform where your golf performance
              fuels global change. Log scores, support charities, and enter
              monthly $10,000+ prize draws.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="px-10 py-5 bg-foreground text-background rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10"
              >
                Initiate Subscription
              </Link>
              <Link
                href="#mechanics"
                className="px-10 py-5 bg-card text-foreground border-2 border-border rounded-2xl font-bold text-lg hover:bg-muted transition-all"
              >
                How it Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MECHANICS - Using 'bg-muted' for section contrast */}
      <section id="mechanics" className="py-24 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4 p-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold">1. Log Rounds</h3>
              <p className="text-muted-foreground">
                Enter your last 5 Stableford scores (1-45). Our rolling engine automatically replaces the oldest round.
              </p>
            </div>

            <div className="space-y-4 p-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                <Heart size={24} />
              </div>
              <h3 className="text-2xl font-bold">2. Fuel Charity</h3>
              <p className="text-muted-foreground">
                10% of every subscription goes directly to your cause. You play, they win. Simple as that.
              </p>
            </div>

            <div className="space-y-4 p-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center text-white shadow-lg shadow-info/20">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-bold">3. Win the Pool</h3>
              <p className="text-muted-foreground">
                Matched numbers win the 40/35/25 prize pool. No 5-match winner? The Jackpot rolls over to next month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CHARITIES - Requirement 08 Integration */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-12 tracking-tight">
            Featured Impact Partners
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Ocean Cleanup",
              "Cancer Research",
              "Trees for Future",
              "Clean Water",
            ].map((name) => (
              <div
                key={name}
                className="p-8 border-2 border-border bg-card rounded-3xl hover:border-primary/50 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-foreground">{name}</p>
              </div>
            ))}
          </div>
          <Link
            href="/charities"
            className="inline-flex items-center gap-2 mt-12 text-primary font-bold hover:gap-4 transition-all"
          >
            Explore All Charities <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
