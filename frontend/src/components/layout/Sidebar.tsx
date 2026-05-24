"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  Smartphone,
  Clock,
  Settings,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { VedaLogo } from "./VedaLogo";
import { getAssignments } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [badgeCount, setBadgeCount] = useState(5);

  useEffect(() => {
    async function fetchCount() {
      try {
        const list = await getAssignments();
        // Fall back to 5 if no assignments found, otherwise show actual metadata list count
        setBadgeCount(list.length || 5);
      } catch (err) {
        console.warn("Failed to load assignment count for sidebar badge:", err);
      }
    }
    fetchCount();
  }, []);

  const navItems = [
    { name: "Home", href: "/", icon: LayoutGrid },
    { name: "My Groups", href: "/groups", icon: Users },
    { name: "Assignments", href: "/assignments", icon: FileText, badge: badgeCount },
    { name: "AI Teacher's Toolkit", href: "/toolkit", icon: Smartphone },
    { name: "My Library", href: "/library", icon: Clock },
  ];

  const isCurrent = (href: string) => pathname === href || (href === '/assignments' && pathname === '/');

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-gray-100 bg-surface-sidebar py-6 sm:flex z-50">
      {/* Logo */}
      <div className="mb-8 flex items-center px-6">
        <VedaLogo className="h-9 w-9" />
        <span className="ml-3 text-xl font-bold tracking-tight text-ink-main">
          VedaAI
        </span>
      </div>

      {/* Create Button */}
      <div className="px-6 mb-8">
        <button
          onClick={() => router.push('/create')}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-orange bg-[#1f1f23] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#2e2e34] hover:scale-[1.02] active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-white" />
          Create Assignment
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isCurrent(item.href)
                ? "bg-gray-100 text-ink-main"
                : "text-ink-muted hover:bg-gray-50 hover:text-ink-main"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={clsx(
                  "h-5 w-5",
                  isCurrent(item.href) ? "text-ink-main" : "text-gray-400 group-hover:text-ink-main"
                )}
              />
              {item.name}
            </div>
            {item.badge && (
              <span className="flex h-5 items-center justify-center rounded-full bg-brand-orange px-2 text-xs font-bold text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Profile/Settings */}
      <div className="mt-auto px-4 pb-4">
        <Link
          href="/settings"
          className="group mb-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-ink-main"
        >
          <Settings className="h-5 w-5 text-gray-400 group-hover:text-ink-main" />
          Settings
        </Link>

        <div className="flex items-center gap-3 rounded-2xl bg-gray-100 p-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=School"
            alt="School Logo"
            className="h-10 w-10 rounded-full bg-white p-1 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink-main line-clamp-1">
              Delhi Public School
            </span>
            <span className="text-xs text-ink-muted">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
