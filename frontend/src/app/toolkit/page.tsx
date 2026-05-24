import type { Metadata } from "next";
import { Smartphone, Sparkles, BookOpen, BarChart2, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "VedaAI | AI Teacher's Toolkit",
  description: "Powerful AI tools to help you teach smarter, not harder.",
};

const tools = [
  {
    icon: Sparkles,
    name: "Question Generator",
    description: "Instantly generate quiz and exam questions from any topic or document.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: BookOpen,
    name: "Lesson Planner",
    description: "Create structured lesson plans aligned to your curriculum in seconds.",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: BarChart2,
    name: "Performance Insights",
    description: "Get AI-powered insights on student performance and learning gaps.",
    color: "bg-green-50 text-green-500",
  },
  {
    icon: MessageSquare,
    name: "Feedback Writer",
    description: "Generate personalised, constructive feedback for student work.",
    color: "bg-purple-50 text-purple-500",
  },
];

export default function ToolkitPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-main sm:text-3xl">
          AI Teacher&apos;s Toolkit
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Powerful AI tools to help you teach smarter, not harder.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-main group-hover:text-brand-orange transition-colors">
                {tool.name}
              </h2>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
