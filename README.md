# 🗂️ Modern File Explorer

A lightweight, blazing-fast file explorer built with Tauri, React, and Rust. Designed to be a modern alternative to traditional file managers with a focus on performance and user experience.

![Platform](https://img.shields.io/badge/Platform-Linux%20(Primary)-blue)
![Platform](https://img.shields.io/badge/Windows-Experimental-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🚀 Performance
- **Ultra Lightweight** - Only ~30 MB RAM usage (3-5x lighter than traditional file managers)
- **Small Footprint** - ~10 MB compiled package
- **Real-time Watcher** - Automatic file system updates without manual refresh

### ⌨️ Productivity
- **Command Palette** (`Ctrl+K`) - Quick access to all actions
- **Smart Search** - Global and folder-specific search capabilities
- **Keyboard Shortcuts** - Full keyboard navigation support
  - `F2` - Rename
  - `Ctrl+C/X/V` - Copy/Cut/Paste
  - `Ctrl+Del` - Move to trash
  - `Ctrl+Shift+F` - Open search

### 📋 File Operations
- **Clipboard Support** - Full cut, copy, paste operations
- **Create Files/Folders** - Quick creation from command palette
- **Show Hidden Files** - Toggle visibility of hidden files
- **Recent Files** - Quick access to recently visited locations

### 💾 Device Management
- **USB Detection** - Automatic detection and listing of USB devices
- **Multiple Drives** - Support for system and external drives

### 🎨 User Interface
- **Modern Design** - Clean, intuitive interface built with shadcn/ui
- **Theme Support** - Light, Dark, and System themes
- **Grid/List Views** - Multiple view options for file browsing
- **Customizable Settings** - Appearance, keyboard shortcuts, and preferences

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + TypeScript |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Rust (via Tauri) |
| **File Operations** | Tauri FS Plugin |
| **Build Tool** | Tauri CLI |

## 📊 Performance Comparison

| File Manager | RAM Usage | Package Size |
|--------------|-----------|--------------|
| GNOME Files (Nautilus) | ~150 MB | ~8 MB |
| Windows Explorer | ~100 MB | Built-in |
| **This Explorer** | **~30 MB** | **~10 MB** |

## 🖥️ Platform Support

This file explorer is developed and tested on **Linux (Pop!_OS)**.

- ✅ **Linux**: Fully tested and optimized
- 🧪 **Windows**: Experimental support (builds available, testing needed)
- ❓ **macOS**: Untested

> Community testing and contributions for other platforms are welcome!

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/file-explorer.git
cd file-explorer

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Installing the .deb Package (Linux)

```bash
# After building, find the .deb in src-tauri/target/release/bundle/deb/
sudo dpkg -i file-explorer_0.1.0_amd64.deb
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+Shift+F` | Open search |
| `F2` | Rename file/folder |
| `Ctrl+C` | Copy |
| `Ctrl+X` | Cut |
| `Ctrl+V` | Paste |
| `Ctrl+Del` | Move to trash |

*All shortcuts are customizable in Settings > Keyboard shortcuts*

## 🚧 Roadmap

### In Progress
- [ ] Drag and drop support
- [ ] Enhanced delete confirmation with toast notifications
- [ ] Performance optimizations (migrate more operations to Rust)

### Planned Features
- [ ] File preview panel
- [ ] Bulk operations
- [ ] Archive support (zip, tar, etc.)
- [ ] Cloud storage integration
- [ ] Custom themes
- [ ] Plugins system
- [ ] Multi-tab support
- [ ] Advanced search filters

## 🤝 Contributing

Contributions are welcome! Whether it's:
- 🐛 Bug reports
- 💡 Feature requests
- 🧪 Testing on Windows/macOS
- 📝 Documentation improvements
- 💻 Code contributions

Please feel free to open an issue or submit a pull request.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by modern file managers and developer tools

## 📬 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/file-explorer](https://github.com/yourusername/file-explorer)

---

<p align="center">Made with ❤️ and Rust 🦀</p>
