import type { Metadata } from "next";
import { Bell, Lock, Palette, Globe, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "VedaAI | Settings",
  description: "Manage your VedaAI account preferences and school settings.",
};

const settingsSections = [
  {
    icon: Bell,
    label: "Notifications",
    description: "Manage alert and email preferences",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: Lock,
    label: "Privacy & Security",
    description: "Password, two-factor auth and data settings",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: Palette,
    label: "Appearance",
    description: "Theme, font size and display options",
    color: "bg-purple-50 text-purple-500",
  },
  {
    icon: Globe,
    label: "Language & Region",
    description: "Set your language, timezone and date format",
    color: "bg-green-50 text-green-500",
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-main sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your account preferences and school settings.
        </p>
      </div>

      {/* Profile Card */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=School"
          alt="School Logo"
          className="h-14 w-14 rounded-full bg-gray-50 p-1 shadow-sm"
        />
        <div>
          <p className="text-sm font-bold text-ink-main">Delhi Public School</p>
          <p className="text-xs text-ink-muted">Bokaro Steel City</p>
          <p className="mt-1 text-xs text-brand-orange font-medium cursor-pointer hover:underline">
            Edit profile →
          </p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        {settingsSections.map((section) => (
          <button
            key={section.label}
            className="group flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md text-left"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${section.color}`}>
              <section.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-main">{section.label}</p>
              <p className="text-xs text-ink-muted">{section.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-ink-muted transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
