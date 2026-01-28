import { Download as DownloadIcon, Apple, Monitor, ExternalLink } from "lucide-react";

const platforms = [
  {
    name: "Windows",
    icon: Monitor,
    version: "0.1.0",
    filename: "PingIT-0.1.0-setup.exe",
    size: "~75 MB",
    requirements: "Windows 10 or later",
    primary: true,
  },
  {
    name: "macOS",
    icon: Apple,
    version: "0.1.0",
    filename: "PingIT-0.1.0.dmg",
    size: "~80 MB",
    requirements: "macOS 11.0 or later",
    primary: false,
  },
  {
    name: "Linux",
    icon: Monitor,
    version: "0.1.0",
    filename: "PingIT-0.1.0.AppImage",
    size: "~85 MB",
    requirements: "Ubuntu 20.04+ or equivalent",
    primary: false,
  },
];

export function Download() {
  return (
    <div className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Download PingIT
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-500">
            Free and open source for all major platforms. No account required.
          </p>
        </div>

        {/* Platform cards */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              {/* Subtle hover glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.08] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-400 transition-all duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                  <platform.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>

                {/* Platform name */}
                <h2 className="text-2xl font-semibold text-white">
                  {platform.name}
                </h2>
                
                {/* Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">Version</span>
                    <span className="text-zinc-400">{platform.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">Size</span>
                    <span className="text-zinc-400">{platform.size}</span>
                  </div>
                  <p className="pt-1 text-sm text-zinc-600">{platform.requirements}</p>
                </div>

                {/* Download button */}
                <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white/[0.06] text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.1]">
                  <DownloadIcon className="h-4 w-4" />
                  Download
                </button>

                <p className="mt-3 text-center font-mono text-xs text-zinc-600">
                  {platform.filename}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {/* System requirements */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="text-lg font-semibold text-white">
              System Requirements
            </h3>
            <ul className="mt-5 space-y-3.5">
              {[
                "64-bit operating system",
                "4 GB RAM minimum (8 GB recommended)",
                "200 MB available disk space",
                "Internet connection for API testing",
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-zinc-500">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Build from source */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="text-lg font-semibold text-white">
              Build from Source
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
              Want to build PingIT yourself? Clone the repository and follow 
              the build instructions in the README.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <code className="font-mono text-sm text-zinc-400">
                git clone https://github.com/1jmdev/PingIT.git
              </code>
            </div>
            <a
              href="https://github.com/1jmdev/PingIT"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-blue-400 transition-colors duration-200 hover:text-blue-300"
            >
              View build instructions
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Version history */}
        <div className="mt-16">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Release Notes
          </h3>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400">
                v0.1.0
              </span>
              <span className="text-sm text-zinc-600">Initial Release</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-[15px] text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                Full HTTP method support (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                JSON response viewer with syntax highlighting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                Workspace management
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                Request history with search
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                Dark and light themes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                Keyboard shortcuts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
