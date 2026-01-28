# PingIT

A modern, open-source API testing and development tool built with Tauri, React, and TypeScript. PingIT helps developers test, debug, and document APIs with an intuitive desktop interface.

**Status:** Development 🚧  
**Version:** 0.1.0  
**License:** MIT

## Features

- 🔒 **Desktop Application** - Native desktop experience built with Tauri
- 📝 **Request Builder** - Create and send HTTP requests with ease
- 🚀 **Full HTTP Support** - GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- 📦 **Multiple Body Types** - Raw, form-data, x-www-form-urlencoded, binary
- 🌐 **Workspace Management** - Organize requests into workspaces
- 📜 **Request History** - Save and revisit past requests
- 👥 **Tabbed Interface** - Work with multiple requests simultaneously
- 🎨 **Response Viewer** - View responses with JSON tree viewer
- ⚙️ **Customization** - Dark/Light theme support
- 📊 **Response Details** - View status, headers, size, and timing information

## Installation

### Prerequisites

- Node.js 18+ (or Bun)
- Rust and Cargo
- System-specific dependencies for Tauri

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/1jmdev/pingit.git
cd pingit
```

2. Install dependencies
```bash
bun install  # or npm install
```

3. Start development server
```bash
bun run dev
```

4. Run Tauri in development mode
```bash
bun run tauri dev
```

### Building

Build the application for production:
```bash
bun run build
bun run tauri build
```

## Usage

### Creating Requests

1. Select your HTTP method (GET, POST, etc.)
2. Enter the API endpoint URL
3. Add headers, parameters, or body content as needed
4. Click send to execute the request
5. View the response in the response panel

### Managing Workspaces

- Create multiple workspaces to separate projects
- Switch between workspaces from the sidebar
- Requests are organized by workspace

### Request History

All sent requests are automatically saved to history:
- Browse past requests in the sidebar
- Click any request to load it in a new tab
- Response data is preserved for reference

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Desktop Framework:** Tauri 2
- **State Management:** Zustand
- **Icons:** Lucide React
- **Code Editor:** CodeMirror
- **Build Tool:** Vite

## Development

PingIT is actively in development. We welcome contributions!

### Project Structure

```
pingit/
├── src/                 # Frontend React application
│   ├── components/      # React components
│   ├── stores/          # State management (Zustand)
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── db/         # Database layer
│   │   └── lib.rs      # Core functionality
│   └── icons/          # Application icons
└── package.json        # Node dependencies
```

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please read our code of conduct and submit issues for any bugs or feature requests.

## Roadmap

- [ ] Import/Export workspaces
- [ ] Request collections and folders
- [ ] Environment variables
- [ ] Scripting for pre/post request hooks
- [ ] WebSocket support
- [ ] Automated testing
- [ ] Team collaboration features
- [ ] Cloud sync

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) for the desktop framework
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.