import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
      
      {/* Subtle glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-zinc-400">Free & Open Source</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-8 max-w-4xl text-center text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          API Testing,{" "}
          <span className="text-zinc-500">Simplified</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-zinc-400 md:text-xl">
          A fast, lightweight desktop app for testing and debugging your APIs. 
          No account needed. No subscriptions. Just pure productivity.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/download"
            className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-7 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-zinc-100 hover:shadow-white/20"
          >
            <Download className="h-4 w-4" />
            Download for Free
          </Link>
          <Link
            to="/docs"
            className="group inline-flex h-12 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
          >
            View Documentation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* App preview */}
        <div className="mt-20 md:mt-24">
          <div className="relative mx-auto max-w-4xl">
            {/* Glow effect behind preview */}
            <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-blue-500/[0.08] blur-3xl" />
            
            {/* Main preview container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f0f] shadow-2xl shadow-black/50">
              {/* Window chrome */}
              <div className="flex h-11 items-center gap-2 border-b border-white/[0.06] bg-[#0a0a0a] px-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-700/80" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700/80" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700/80" />
                </div>
                <div className="ml-4 flex h-6 flex-1 items-center justify-center rounded-md bg-white/[0.04] px-3">
                  <span className="text-xs text-zinc-600">PingIT</span>
                </div>
                <div className="w-16" />
              </div>
              
              {/* App content */}
              <div className="flex h-80 md:h-[400px]">
                {/* Sidebar */}
                <div className="hidden w-60 shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] p-4 md:block">
                  <div className="mb-4 flex h-9 items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-sm text-zinc-600">
                    Search history...
                  </div>
                  <div className="space-y-1">
                    {[
                      { method: "GET", color: "text-emerald-400", path: "/api/users", active: true },
                      { method: "POST", color: "text-amber-400", path: "/api/auth/login", active: false },
                      { method: "PUT", color: "text-blue-400", path: "/api/users/1", active: false },
                      { method: "DELETE", color: "text-red-400", path: "/api/posts/42", active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          item.active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${item.color}`}>
                          {item.method}
                        </span>
                        <span className={`truncate text-xs ${item.active ? "text-zinc-300" : "text-zinc-600"}`}>
                          {item.path}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main panel */}
                <div className="flex flex-1 flex-col">
                  {/* Request bar */}
                  <div className="border-b border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a]">
                      <div className="flex h-10 items-center border-r border-white/[0.06] px-3">
                        <span className="text-xs font-semibold text-emerald-400">GET</span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value="https://api.example.com/users"
                        className="h-10 flex-1 bg-transparent px-3 text-sm text-zinc-300 outline-none"
                      />
                      <button className="m-1 h-8 rounded-lg bg-blue-500 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-600">
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Response area */}
                  <div className="flex-1 overflow-hidden p-4">
                    <div className="h-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
                      {/* Response header */}
                      <div className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          200 OK
                        </span>
                        <span className="text-xs text-zinc-600">127ms</span>
                        <span className="text-xs text-zinc-600">1.2 KB</span>
                      </div>
                      {/* Response body */}
                      <div className="p-4">
                        <pre className="text-xs leading-relaxed">
                          <code>
                            <span className="text-zinc-600">{"{"}</span>{"\n"}
                            <span className="text-zinc-600">{"  "}</span>
                            <span className="text-blue-400">"users"</span>
                            <span className="text-zinc-600">: [</span>{"\n"}
                            <span className="text-zinc-600">{"    {"}</span>{"\n"}
                            <span className="text-zinc-600">{"      "}</span>
                            <span className="text-blue-400">"id"</span>
                            <span className="text-zinc-600">: </span>
                            <span className="text-amber-400">1</span>
                            <span className="text-zinc-600">,</span>{"\n"}
                            <span className="text-zinc-600">{"      "}</span>
                            <span className="text-blue-400">"name"</span>
                            <span className="text-zinc-600">: </span>
                            <span className="text-emerald-400">"John Doe"</span>{"\n"}
                            <span className="text-zinc-600">{"    },"}</span>{"\n"}
                            <span className="text-zinc-600">{"    {"}</span>{"\n"}
                            <span className="text-zinc-600">{"      "}</span>
                            <span className="text-blue-400">"id"</span>
                            <span className="text-zinc-600">: </span>
                            <span className="text-amber-400">2</span>
                            <span className="text-zinc-600">,</span>{"\n"}
                            <span className="text-zinc-600">{"      "}</span>
                            <span className="text-blue-400">"name"</span>
                            <span className="text-zinc-600">: </span>
                            <span className="text-emerald-400">"Jane Smith"</span>{"\n"}
                            <span className="text-zinc-600">{"    }"}</span>{"\n"}
                            <span className="text-zinc-600">{"  ]"}</span>{"\n"}
                            <span className="text-zinc-600">{"}"}</span>
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
