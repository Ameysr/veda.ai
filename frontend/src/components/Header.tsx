import Link from "next/link";
import { VedaLogo } from "./layout/VedaLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <VedaLogo className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-ink-main">
            VedaAI
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link
            href="/"
            className="font-semibold text-ink-main hover:text-brand-orange transition-colors"
          >
            Create Assignment
          </Link>
        </nav>
      </div>
    </header>
  );
}
