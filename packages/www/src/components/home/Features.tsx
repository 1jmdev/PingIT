import {
  Zap,
  FolderOpen,
  History,
  Code,
  Keyboard,
  Moon,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built for speed. Send requests instantly and get responses in milliseconds.",
  },
  {
    icon: Code,
    title: "Full HTTP Support",
    description:
      "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS. All methods at your fingertips.",
  },
  {
    icon: FolderOpen,
    title: "Workspaces",
    description:
      "Organize your API requests into workspaces. Keep projects separate and tidy.",
  },
  {
    icon: History,
    title: "Request History",
    description:
      "Every request is saved. Search and replay previous requests with one click.",
  },
  {
    icon: Moon,
    title: "Dark & Light Themes",
    description:
      "Easy on the eyes. Switch between dark and light mode whenever you want.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description:
      "Power user friendly. Navigate and execute requests without touching your mouse.",
  },
];

export function Features() {
  return (
    <section className="relative border-t border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500">
            Simple, powerful features without the bloat.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-400 transition-all duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-zinc-500">
                {feature.description}
              </p>

              {/* Subtle hover glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/[0.05] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
