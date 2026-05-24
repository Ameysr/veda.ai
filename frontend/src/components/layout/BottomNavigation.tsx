"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Clock, Smartphone, Plus } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Home", href: "/", icon: LayoutGrid },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Library", href: "/library", icon: Clock },
  { name: "AI Toolkit", href: "/toolkit", icon: Smartphone },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isCurrent = (href: string) => pathname === href || (href === '/assignments' && pathname === '/');

  return (
    <>
      {/* FAB */}
      <Link
        href="/create"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-fab transition-transform hover:scale-105 active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6 text-brand-orange" />
      </Link>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 z-40 w-full rounded-t-3xl bg-ink-dark px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] sm:hidden">
        <ul className="flex items-center justify-between">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1",
                  isCurrent(item.href) ? "text-white" : "text-gray-400"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
