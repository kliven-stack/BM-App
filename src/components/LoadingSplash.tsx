import BrandMark from "./BrandMark";

// Full-screen branded loading overlay, shown during the sign-in → dashboard
// transition.
export default function LoadingSplash({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-white dark:bg-slate-950">
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25">
          <BrandMark size={26} />
        </div>
        <span className="absolute -inset-2 animate-spin rounded-3xl border-2 border-transparent border-t-brand-500" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
