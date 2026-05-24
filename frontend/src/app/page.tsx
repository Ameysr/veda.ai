"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Users,
  FileText,
  ArrowRight,
  Activity,
  Plus,
  FolderHeart,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { getAssignments } from "@/lib/api";
import Link from "next/link";

interface RecentItem {
  id: string;
  title: string;
  subject: string;
  date: string;
}

export default function HomePage() {
  const router = useRouter();
  const [totalCount, setTotalCount] = useState(0);
  const [recentList, setRecentList] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getAssignments();
        setTotalCount(data.length);
        const sorted = data.slice(0, 3).map((a: any) => ({
          id: a.id,
          title: a.title,
          subject: a.subject,
          date: new Date(a.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }));
        setRecentList(sorted);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="min-h-full bg-[#f7f8fc]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1060] via-[#2d1b8c] to-[#3b24a8] px-8 py-10 text-white shadow-2xl">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-orange-500 opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-10 h-44 w-44 rounded-full bg-violet-400 opacity-25 blur-3xl" />
          <div className="pointer-events-none absolute right-40 bottom-0 h-32 w-32 rounded-full bg-indigo-300 opacity-10 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-orange-300 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                AI-Powered Classroom
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, Amey! 👋
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-indigo-200/80">
                Generate structured exam papers, manage student groups, and
                deploy assessments — all in one place.
              </p>
            </div>

            <button
              onClick={() => router.push("/create")}
              className="flex shrink-0 items-center gap-2 self-start rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-400 active:scale-95 sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </button>
          </div>
        </section>

        {/* ── Stats Row ───────────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              icon: <FileText className="h-5 w-5" />,
              label: "Total Papers",
              value: loading ? "…" : String(totalCount),
              color: "bg-orange-50 text-orange-500",
            },
            {
              icon: <Users className="h-5 w-5" />,
              label: "Student Groups",
              value: "3",
              color: "bg-violet-50 text-violet-500",
            },
            {
              icon: <BookOpen className="h-5 w-5" />,
              label: "Classes",
              value: "4",
              color: "bg-emerald-50 text-emerald-500",
            },
            {
              icon: <Activity className="h-5 w-5" />,
              label: "AI Toolkits",
              value: "12",
              color: "bg-blue-50 text-blue-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {s.label}
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-800">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Main Body ───────────────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* Left — Recent Assessments */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <FolderHeart className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-gray-800">
                  Recent Assessments
                </h2>
              </div>
              <Link
                href="/assignments"
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : recentList.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                <FileText className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">
                  No question papers yet.
                </p>
                <button
                  onClick={() => router.push("/create")}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                >
                  Create Your First Paper
                </button>
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-gray-50">
                {recentList.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => router.push(`/generate/${item.id}`)}
                    className="group flex cursor-pointer items-center justify-between py-3.5 transition first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-violet-600">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {item.subject} &nbsp;·&nbsp; {item.date}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-violet-400" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Right — Quick Actions */}
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-gray-800">Quick Actions</h2>

            {/* Primary CTA */}
            <div
              onClick={() => router.push("/create")}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">Create Assessment</p>
                  <p className="mt-0.5 text-xs text-white/80">
                    Launch the AI paper generator
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary cards */}
            {[
              {
                icon: <Sparkles className="h-5 w-5" />,
                label: "AI Toolkit",
                desc: "Explore rapid quiz utilities",
                href: "/toolkit",
                iconBg: "bg-purple-50 text-purple-500",
              },
              {
                icon: <Users className="h-5 w-5" />,
                label: "Class Groups",
                desc: "Manage cohort members",
                href: "/groups",
                iconBg: "bg-violet-50 text-violet-500",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                label: "All Assignments",
                desc: "Browse your question papers",
                href: "/assignments",
                iconBg: "bg-emerald-50 text-emerald-500",
              },
            ].map((a) => (
              <div
                key={a.label}
                onClick={() => router.push(a.href)}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-violet-100 hover:shadow-md active:scale-[0.98]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBg}`}
                >
                  {a.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{a.label}</p>
                  <p className="text-[11px] text-gray-400">{a.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-violet-400" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
