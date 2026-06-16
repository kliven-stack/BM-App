"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import { Icon } from "@/components/icons";

type NavLink = {
  label: string;
  href: string;
  section?: string; // same-page anchor on the homepage
  route?: string; // dedicated route
};

const LINKS: NavLink[] = [
  { label: "Services", href: "/#services", section: "services" },
  { label: "Results", href: "/#results", section: "results" },
  { label: "Pricing", href: "/pricing", route: "/pricing" },
  { label: "FAQ", href: "/#faq", section: "faq" },
];

const SECTION_IDS = ["services", "results", "faq"];

export default function MarketingNav({
  authed,
  homeHref,
}: {
  authed: boolean;
  homeHref: string;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scrollspy: highlight the nav item for whichever section is in view.
  useEffect(() => {
    if (pathname !== "/") {
      setActive(null);
      return;
    }
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  function isActive(link: NavLink): boolean {
    if (link.route) return pathname === link.route;
    if (pathname === "/" && link.section) return active === link.section;
    return false;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
            <BrandMark size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Blend Mode
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {LINKS.map((link) => {
            const activeLink = isActive(link);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => link.section && setActive(link.section)}
                className={`relative py-1 transition-colors ${
                  activeLink ? "text-brand-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-brand-400 transition-all duration-300 ${
                    activeLink ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {authed ? (
            <Link
              href={homeHref}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-slate-300 hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link
                href="/pricing"
                className="hidden rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 sm:block"
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-200 hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? "plus" : "menu"} size={20} className={mobileOpen ? "rotate-45" : ""} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link)
                    ? "bg-white/5 text-brand-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              {authed ? (
                <Link
                  href={homeHref}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-medium text-slate-200"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
