import Link from "next/link";
import { getProfile, homeForRole } from "@/lib/auth";
import { Icon } from "@/components/icons";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import PricingPlans from "@/components/marketing/PricingPlans";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

export const dynamic = "force-dynamic";

const INCLUDED = [
  "Custom traffic blueprint",
  "Dedicated account team",
  "Transparent monthly reporting",
  "No long-term contracts",
];

const FAQS = [
  {
    q: "Can I change plans later?",
    a: "Absolutely. Upgrade, downgrade or cancel anytime from your client portal — changes take effect on your next billing cycle.",
  },
  {
    q: "What happens after I subscribe?",
    a: "You'll get instant access to your client portal where you can track websites, metrics, invoices and support. Our team reaches out within one business day to kick off your blueprint.",
  },
  {
    q: "Do you offer custom plans?",
    a: "Yes. If you need something beyond Dominate — multiple brands, enterprise scale or extra channels — get in touch and we'll tailor a package.",
  },
  {
    q: "How does billing work?",
    a: "Plans are billed securely through Stripe, monthly or yearly. Yearly billing gives you two months free.",
  },
];

export default async function PricingPage() {
  const profile = await getProfile();
  const authed = Boolean(profile);
  const homeHref = profile ? homeForRole(profile.role) : "/login";

  return (
    <div className="bg-white dark:bg-slate-950">
      <MarketingNav authed={authed} homeHref={homeHref} />
      <FloatingThemeToggle />

      {/* Header */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-300">
            Pricing
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Pick the plan that matches your ambition. Every plan includes a
            custom strategy and a team that obsesses over your results.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 pt-8 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PricingPlans />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            {INCLUDED.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Icon name="star" size={15} className="text-brand-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20 dark:bg-slate-900/40 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl">
            Pricing FAQ
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="card group [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-gray-900">
                  {f.q}
                  <span className="text-gray-400 transition-transform group-open:rotate-180">
                    <Icon name="chevronRight" size={18} className="rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500">Still have questions?</p>
            <Link
              href="/login"
              className="mt-2 inline-flex font-semibold text-brand-600 hover:underline"
            >
              Sign in to your client portal →
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
