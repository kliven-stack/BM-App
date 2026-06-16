import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

// Shared wrapper for the public auth pages (login, reset password). Provides the
// branded background, logo/heading, and a globally-accessible theme toggle.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      {/* Decorative gradient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-600/10" />
      </div>

      {/* Global theme toggle */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25">
            <BrandMark size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </main>
  );
}
