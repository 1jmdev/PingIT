import { Link } from "react-router-dom";
import { Github } from "lucide-react";

const footerLinks = {
  product: [
    { href: "/", label: "Home" },
    { href: "/download", label: "Download" },
    { href: "/docs", label: "Documentation" },
  ],
  resources: [
    { href: "https://github.com/1jmdev/PingIT", label: "GitHub", external: true },
    { href: "https://github.com/1jmdev/PingIT/issues", label: "Report Issue", external: true },
    { href: "https://github.com/1jmdev/PingIT/releases", label: "Releases", external: true },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20">
                <span className="text-base font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-white">PingIT</span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-zinc-500">
              A fast, free, and open-source API testing and debugging tool. 
              Built for developers who value speed and simplicity.
            </p>
            <a
              href="https://github.com/1jmdev/PingIT"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-white"
            >
              <Github className="h-4 w-4" />
              Star us on GitHub
            </a>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[15px] text-zinc-500 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource links */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] text-zinc-500 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-sm text-zinc-600">
            MIT License. Free and open source forever.
          </p>
          <p className="text-sm text-zinc-600">
            Built with care for developers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
