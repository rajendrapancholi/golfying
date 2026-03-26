"use client";

import Link from "next/link";
import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Heart,
  Trophy,
  Settings,
  StarsIcon,
  TrophyIcon,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import LogoutButton from "../auth/LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user: (User & { userRole?: string }) | null;
  subscription?: { is_active: boolean } | null;
}

const Navbar: React.FC<NavbarProps> = ({ user, subscription }) => {
  const [dropdown, setDropdown] = useState<boolean>(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
console.log('Debug Auth Role: ', user?.role); 

// This shows 'admin' or 'subscriber' (Your Profile Table)
console.log('Debug Custom Role: ', user?.userRole); 
  return (
    <>
      {dropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdown(false)}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform">
                G
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                Golf<span className="text-primary">ying</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Home
              </Link>

              {user && (
                <>
                  {subscription?.is_active ? (
                    <>
                      <Link
                        href="/winnings"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Winnings
                      </Link>
                      <Link
                        href="/draws"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Draws
                      </Link>
                      <Link
                        href="/my-subscription"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <TrophyIcon size={16} className="text-amber-500" /> My
                        Subscription
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/subscribe"
                      className="text-sm font-medium text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
                    >
                      <StarsIcon
                        size={16}
                        className="text-amber-500 animate-pulse"
                      />
                      <span>Upgrade plan</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-xs text-muted-foreground hidden lg:inline border-r pr-4 border-border">
                {user.email}
              </span>
            )}

            <ThemeToggle />

            {!user ? (
              <Link
                href="/login"
                className="px-5 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-border hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full font-bold text-sm">
                    {(user.user_metadata?.full_name ||
                      user.email ||
                      "U")[0].toUpperCase()}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${dropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* DROPDOWN MENU */}
                {dropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdown(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-border mb-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {user.user_metadata?.full_name || "Subscriber"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="px-2 space-y-1">
                        <DropdownLink
                          href={user.userRole==='admin'?'/admin-dashboard': '/dashboard'}
                          icon={<LayoutDashboard size={16} />}
                          label="Dashboard"
                        />
                        <DropdownLink
                          href="/charities"
                          icon={<Heart size={16} />}
                          label="My Charity"
                        />
                        <DropdownLink
                          href="/winnings"
                          icon={<Trophy size={16} />}
                          label="Winnings"
                        />
                        <DropdownLink
                          href="/settings"
                          icon={<Settings size={16} />}
                          label="Settings"
                        />
                      </div>

                      <div className="mt-2 pt-2 border-t border-border px-2">
                        <LogoutButton />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

function DropdownLink({
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
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
    >
      {icon} {label}
    </Link>
  );
}

export default Navbar;
