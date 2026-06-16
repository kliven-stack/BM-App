import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                <BrandMark size={18} />
              </span>
              <span className="text-lg font-bold text-white">Blend Mode</span>
            </div>
            <p className="mt-4 max-w-xs text-sm">
              The growth partner that turns Google traffic into real leads and
              sales — the Blend Mode way.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/#services" className="hover:text-white">SEO</Link></li>
              <li><Link href="/#services" className="hover:text-white">Google Ads</Link></li>
              <li><Link href="/#services" className="hover:text-white">CRO</Link></li>
              <li><Link href="/#services" className="hover:text-white">Landing Pages</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/#results" className="hover:text-white">Results</Link></li>
              <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/login" className="hover:text-white">Client login</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Get started
            </p>
            <p className="mt-4 text-sm">
              Ready to grow? Pick a plan and we&apos;ll build your custom traffic
              blueprint.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              View pricing
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Blend Mode. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
