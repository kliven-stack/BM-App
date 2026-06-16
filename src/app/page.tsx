import Link from "next/link";
import { getProfile, homeForRole } from "@/lib/auth";
import { Icon, type IconName } from "@/components/icons";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";

export const dynamic = "force-dynamic";

const STATS = [
  { value: 14, suffix: "+", label: "Years of expertise" },
  { value: 500, suffix: "+", label: "Websites launched" },
  { value: 30, suffix: "M+", label: "Visits driven" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Success rate" },
];

const SERVICES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "search",
    title: "Search Engine Optimization",
    desc: "Climb to the top of Google for the keywords your buyers actually search — and stay there.",
  },
  {
    icon: "star",
    title: "Google Ads",
    desc: "High-intent traffic on tap. We build, test and scale campaigns that turn clicks into customers.",
  },
  {
    icon: "flame",
    title: "Conversion Optimization",
    desc: "Stop leaking traffic. We turn more of your existing visitors into leads and sales.",
  },
  {
    icon: "users",
    title: "Facebook & Social Ads",
    desc: "Put your offer in front of the right audience across the platforms where they spend their time.",
  },
  {
    icon: "globe",
    title: "Landing Pages",
    desc: "Fast, focused pages engineered for a single goal: doubling your leads and sales.",
  },
  {
    icon: "settings",
    title: "Marketing Automation",
    desc: "Email flows and workflows that nurture leads and recover sales while you sleep.",
  },
];

const VALUES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "star",
    title: "Unmatched results",
    desc: "A 99.9% track record of driving meaningful traffic. We measure success in leads and revenue — not vanity metrics.",
  },
  {
    icon: "bell",
    title: "Professional communication",
    desc: "Most agencies go quiet. We keep you in the loop, so you always know exactly what's happening with your project.",
  },
  {
    icon: "lifebuoy",
    title: "Honest expectations",
    desc: "We'll tell you what we can do, then we'll do it. If we don't know, we'll say so. No hype, no fluff.",
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus Delgado",
    role: "Founder, Delgado Roofing",
    quote:
      "Within four months we ranked on page one for our biggest keywords. Our phone hasn't stopped ringing since. Best marketing decision we've made.",
  },
  {
    name: "Priya Nair",
    role: "CEO, Bloom Skincare",
    quote:
      "They rebuilt our landing pages and doubled our conversion rate. Same ad budget, twice the sales. The ROI speaks for itself.",
  },
  {
    name: "Tom Whitfield",
    role: "Owner, Whitfield Law",
    quote:
      "Finally an agency that actually communicates. I always know what's being done and why. Our organic traffic is up over 300%.",
  },
];

const FAQS = [
  {
    q: "What exactly does Blend Mode do?",
    a: "We're a full-service digital marketing partner. We grow your visibility on Google through SEO and ads, turn that traffic into leads with conversion-optimized pages, and nurture those leads with automation — all measured against real business outcomes.",
  },
  {
    q: "How do I know I'll get a return on my investment?",
    a: "Every business is different, so we build a strategy tailored to yours and track it against leads and revenue, not vanity metrics. With 14 years of experience and a 99.9% success rate, we're confident — and transparent about — the results we drive.",
  },
  {
    q: "Do you work with small businesses or only large ones?",
    a: "Both. Our approach scales from local service businesses to established brands. If you're serious about growth, there's a plan that fits.",
  },
  {
    q: "How long until I see results?",
    a: "Paid channels can produce traffic within days. SEO is a compounding investment that typically shows momentum in the first few months and keeps building from there.",
  },
  {
    q: "Can I change or cancel my plan?",
    a: "Yes. Plans are billed monthly (or yearly for a discount) and you can upgrade, downgrade or cancel anytime from your client portal.",
  },
];

export default async function HomePage() {
  const profile = await getProfile();
  const authed = Boolean(profile);
  const homeHref = profile ? homeForRole(profile.role) : "/login";

  return (
    <div className="bg-white dark:bg-slate-950">
      <MarketingNav authed={authed} homeHref={homeHref} />
      <FloatingThemeToggle />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Digital growth agency
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Explode your{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                visibility
              </span>{" "}
              on Google
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Imagine a flood of eager buyers discovering you on Google every
              day. We help you outrank competitors and turn traffic into leads
              and sales — with a custom blueprint built just for your business.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
              >
                See pricing & get started
              </Link>
              <Link
                href="/#services"
                className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Explore services
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-bold text-white">
                    <Counter
                      value={s.value}
                      suffix={s.suffix}
                      decimals={s.decimals}
                    />
                  </dt>
                  <dd className="mt-1 text-xs text-slate-400">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero metric card */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Organic traffic</p>
                  <p className="font-display text-4xl font-bold text-white">
                    +312%
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
                  ▲ Last 6 months
                </span>
              </div>
              <div className="mt-6 flex h-32 items-end gap-2">
                {[28, 35, 30, 48, 55, 62, 70, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="font-display text-xl font-bold text-white">4.8x</p>
                  <p className="text-xs text-slate-400">ROI</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="font-display text-xl font-bold text-white">#1</p>
                  <p className="text-xs text-slate-400">Rankings</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="font-display text-xl font-bold text-white">2x</p>
                  <p className="text-xs text-slate-400">Leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section id="services" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              What we do
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl">
              Everything you need to dominate Google
            </h2>
            <p className="mt-4 text-gray-500">
              One partner, one blueprint, every channel that moves the needle —
              working together to grow your traffic, leads and sales.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="card h-full transition-shadow hover:shadow-md">
                  <span className="icon-chip h-11 w-11">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Values */}
      <section
        id="results"
        className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-900/40 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Why Blend Mode
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl">
              A growth partner you can trust
            </h2>
            <p className="mt-4 text-gray-500">
              Less worry. More time back. And a team that treats your business
              like its own.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="card h-full">
                  <span className="icon-chip h-11 w-11">
                    <Icon name={v.icon} size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Testimonials */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Client stories
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl">
              Results our clients rave about
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} className="h-full">
              <figure className="card flex h-full flex-col">
                <div className="flex gap-1 text-brand-500">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Icon key={si} name="star" size={16} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm text-gray-600">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">
                      {t.name}
                    </span>
                    <span className="block text-xs text-gray-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- FAQ */}
      <section
        id="faq"
        className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-900/40 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl">
              Common questions
            </h2>
          </div>

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
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
            The long wait is over. Success is one click away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Pick a plan and we&apos;ll craft a custom traffic blueprint to grow
            your leads and sales — starting this month.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
            >
              View pricing
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Client login
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
