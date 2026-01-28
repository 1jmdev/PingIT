import { useState } from "react";
import { ChevronRight, ExternalLink, Book } from "lucide-react";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
## Getting Started with PingIT

Welcome to PingIT! This guide will help you get up and running in minutes.

### Installation

1. Download PingIT for your operating system from the [Download](/download) page
2. Run the installer and follow the on-screen instructions
3. Launch PingIT from your applications menu

### Your First Request

1. Open PingIT and you'll see a new tab ready for your first request
2. Select an HTTP method (GET, POST, etc.) from the dropdown
3. Enter your API endpoint URL
4. Click **Send** or press \`Ctrl+Enter\`
5. View the response in the panel below

That's it! You're ready to start testing APIs.
    `,
  },
  {
    id: "workspaces",
    title: "Workspaces",
    content: `
## Workspaces

Workspaces help you organize your API requests by project or context.

### Creating a Workspace

1. Click the workspace dropdown in the sidebar
2. Select "New Workspace"
3. Enter a name for your workspace
4. Click Create

### Switching Workspaces

Click the workspace dropdown and select the workspace you want to switch to. Each workspace maintains its own request history.

### Managing Workspaces

- **Rename**: Right-click on a workspace to rename it
- **Delete**: Right-click and select Delete (this will remove all associated history)
    `,
  },
  {
    id: "requests",
    title: "Making Requests",
    content: `
## Making Requests

PingIT supports all standard HTTP methods for comprehensive API testing.

### HTTP Methods

| Method | Description |
|--------|-------------|
| GET | Retrieve data from a server |
| POST | Send data to create a resource |
| PUT | Update an existing resource |
| PATCH | Partially update a resource |
| DELETE | Remove a resource |
| HEAD | Get headers only |
| OPTIONS | Get supported methods |

### Request Body

For POST, PUT, and PATCH requests, you can add a request body:

- **None**: No body content
- **Form Data**: Key-value pairs as multipart form data
- **x-www-form-urlencoded**: URL-encoded form data
- **Raw (JSON)**: JSON body with syntax highlighting
- **Binary**: Upload a file

### Headers

Add custom headers using the Headers tab. Common headers like User-Agent and Accept are included by default.
    `,
  },
  {
    id: "responses",
    title: "Response Viewer",
    content: `
## Response Viewer

The response viewer provides detailed information about API responses.

### Response Information

- **Status Code**: Color-coded status (green for 2xx, yellow for 3xx, orange for 4xx, red for 5xx)
- **Response Time**: How long the request took in milliseconds
- **Response Size**: Size of the response body

### JSON Viewer

JSON responses are displayed in an interactive tree viewer:

- Click on objects/arrays to expand or collapse them
- Keys, strings, numbers, booleans, and null values are color-coded
- Copy the entire response or individual values

### Headers Tab

View all response headers returned by the server in a clean table format.
    `,
  },
  {
    id: "history",
    title: "Request History",
    content: `
## Request History

PingIT automatically saves every request you send, making it easy to revisit and replay previous API calls.

### Viewing History

The sidebar shows your recent requests with:

- HTTP method (color-coded)
- Request URL path
- Timestamp

### Searching History

Use the search bar at the top of the sidebar to filter requests by URL or method.

### Replaying Requests

Click any item in the history to reload it into the current tab. The original request details and response will be restored.

### Clearing History

To clear your request history, go to Settings and select "Clear History."
    `,
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts",
    content: `
## Keyboard Shortcuts

Speed up your workflow with these keyboard shortcuts.

| Shortcut | Action |
|----------|--------|
| \`Ctrl+Enter\` | Send request |
| \`Ctrl+T\` | New tab |
| \`Ctrl+W\` | Close current tab |
| \`Ctrl+B\` | Toggle sidebar |
| \`Ctrl+,\` | Open settings |

### Tips

- Use tabs to work on multiple requests simultaneously
- The sidebar can be hidden to maximize your workspace
- All shortcuts use Ctrl on Windows/Linux and Cmd on macOS
    `,
  },
  {
    id: "faq",
    title: "FAQ",
    content: `
## Frequently Asked Questions

### Is PingIT really free?

Yes! PingIT is completely free and open source under the MIT license. There are no premium tiers, no subscriptions, and no hidden costs.

### Where is my data stored?

All your data (workspaces, history, settings) is stored locally on your computer. PingIT never sends your data to any external servers.

### Can I import/export my requests?

Import and export functionality is planned for a future release. Stay tuned!

### How do I report a bug?

Please open an issue on our [GitHub repository](https://github.com/1jmdev/PingIT/issues). Include steps to reproduce the bug and your system information.

### Can I contribute to PingIT?

Absolutely! We welcome contributions. Check out our GitHub repository for contribution guidelines.
    `,
  },
];

export function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Page header */}
        <div className="mb-12 md:hidden">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Documentation
          </h1>
          <p className="mt-2 text-zinc-500">
            Learn how to use PingIT effectively.
          </p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24">
              {/* Header */}
              <div className="mb-6 flex items-center gap-2.5 text-zinc-400">
                <Book className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Documentation
                </span>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                      }`}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isActive ? "rotate-90 text-blue-400" : ""
                        }`}
                      />
                      {section.title}
                    </button>
                  );
                })}
              </nav>

              {/* Help card */}
              <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-sm text-zinc-500">
                  Can't find what you're looking for?
                </p>
                <a
                  href="https://github.com/1jmdev/PingIT/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-400 transition-colors duration-200 hover:text-blue-300"
                >
                  Open an issue
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </aside>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-white/[0.15]"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id} className="bg-[#111]">
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <main className="min-w-0 flex-1">
            <article>
              <div
                className="docs-content"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(currentSection?.content || ""),
                }}
              />
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(content: string): string {
  return content
    .replace(
      /^## (.*$)/gm,
      '<h2 class="text-2xl md:text-3xl font-bold text-white mt-0 mb-6 first:mt-0">$1</h2>'
    )
    .replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold text-white mt-10 mb-4">$1</h3>'
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-zinc-200 font-medium">$1</strong>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[13px] font-mono text-zinc-300">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-400 underline underline-offset-2 decoration-blue-400/30 transition-colors hover:text-blue-300 hover:decoration-blue-300/50">$1</a>'
    )
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      return `<tr class="border-b border-white/[0.06]">${cells
        .map(
          (c) =>
            `<td class="px-4 py-3 text-[15px] text-zinc-400">${c}</td>`
        )
        .join("")}</tr>`;
    })
    .replace(/^\|[-| ]+\|$/gm, "")
    .replace(
      /(<tr.*<\/tr>\n?)+/g,
      '<div class="my-6 overflow-hidden rounded-xl border border-white/[0.06]"><table class="w-full">$&</table></div>'
    )
    .replace(
      /^- (.*$)/gm,
      '<li class="text-[15px] text-zinc-400 leading-relaxed">$1</li>'
    )
    .replace(
      /(<li>.*<\/li>\n?)+/g,
      '<ul class="my-4 space-y-2 list-disc list-inside marker:text-zinc-600">$&</ul>'
    )
    .replace(
      /^\d+\. (.*$)/gm,
      '<li class="text-[15px] text-zinc-400 leading-relaxed">$1</li>'
    )
    .replace(
      /^(?!<[a-z])(.*[a-zA-Z].*)$/gm,
      '<p class="text-[15px] text-zinc-400 leading-relaxed mb-4">$1</p>'
    )
    .replace(/<p class="text-\[15px\] text-zinc-400 leading-relaxed mb-4"><\/p>/g, "");
}
