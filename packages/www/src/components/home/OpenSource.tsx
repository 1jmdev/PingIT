import { Link } from "react-router-dom";
import { Github, Heart } from "lucide-react";

export function OpenSource() {
  return (
    <section className="border-t border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 text-center md:p-16 lg:p-20">
          {/* Background decoration */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" />
          
          <div className="relative">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm">
              <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
              <span className="text-zinc-400">Open Source</span>
            </div>

            {/* Headline */}
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Free Forever.{" "}
              <span className="text-zinc-500">No Strings Attached.</span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500">
              PingIT is completely free and open source under the MIT license. 
              No hidden costs, no premium tiers, no data collection.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://github.com/1jmdev/PingIT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-medium text-white transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
              <Link
                to="/download"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-100"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
