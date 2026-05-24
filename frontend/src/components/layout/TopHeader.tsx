"use client";

import { ArrowLeft, LayoutGrid, Bell, ChevronDown, Menu } from "lucide-react";
import { VedaLogo } from "./VedaLogo";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Desktop Left: Breadcrumb */}
      <div className="hidden items-center gap-4 sm:flex">
        <button className="rounded-full p-2 text-ink-muted hover:bg-gray-100 hover:text-ink-main">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <LayoutGrid className="h-4 w-4" />
          <span>Assignment</span>
        </div>
      </div>

      {/* Mobile Left: Logo */}
      <div className="flex items-center sm:hidden">
        <VedaLogo className="h-8 w-8" />
        <span className="ml-2.5 text-lg font-bold tracking-tight text-ink-main">
          VedaAI
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button className="relative rounded-full p-2 text-ink-muted hover:bg-gray-100 hover:text-ink-main">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="hidden items-center gap-3 rounded-full border border-gray-200 py-1 pl-1 pr-3 sm:flex cursor-pointer hover:bg-gray-50">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amey"
            alt="Amey"
            className="h-8 w-8 rounded-full bg-gray-100"
          />
          <span className="text-sm font-medium text-ink-main">Amey</span>
          <ChevronDown className="h-4 w-4 text-ink-muted" />
        </div>

        {/* Mobile Profile Avatar only */}
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amey"
          alt="Amey"
          className="h-8 w-8 rounded-full bg-gray-100 sm:hidden"
        />

        {/* Mobile Hamburger Menu */}
        <button className="ml-1 rounded-md p-2 text-ink-main hover:bg-gray-100 sm:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
