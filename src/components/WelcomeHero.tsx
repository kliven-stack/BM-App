import Link from "next/link";
import { Icon, type IconName } from "./icons";

// Gradient welcome banner for the dashboard overviews.
export default function WelcomeHero({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  ctaIcon,
}: {
  title: string;
  subtitle: string;
  ctaHref?: string;
  ctaLabel?: string;
  ctaIcon?: IconName;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-slate-300">{subtitle}</p>
        </div>
        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600"
          >
            {ctaIcon && <Icon name={ctaIcon} size={16} />}
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
