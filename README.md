# DeepSeek Harness Desktop

**English** | [中文](./README.zh.md)

Unofficial desktop wrapper for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

**Website:** https://scigeolight.github.io/dsh-desktop/

## Features

- One-click Windows / macOS installers
- Bundles official `@deepseek-ai/dsh` Web UI locally
- No manual CLI / port management
- Download site with “Star the author” or “Download directly” modal

## Platforms

| Platform | Package |
| --- | --- |
| Windows x64 | NSIS installer + ZIP |
| macOS Apple Silicon | DMG + ZIP |
| macOS Intel | DMG + ZIP |

> **iOS:** DeepSeek Harness is a Node.js local agent runtime with a Web UI. A full native iOS app is not practical in the same form. Use Windows/macOS desktop builds, or run `npx @deepseek-ai/dsh web` and open it in a mobile browser on the same network if needed.

## Download

- Latest release: https://github.com/SciGeoLight/dsh-desktop/releases/latest
- Website (click-to-download): https://scigeolight.github.io/dsh-desktop/

## Develop

```bash
npm install
npm start
```

### Build installers

```bash
# Windows
npm run dist:win

# macOS (on a Mac)
npm run dist:mac
```

Artifacts are written to `dist/`.

## How it works

Electron shell starts the official `dsh web` server on a free localhost port, then loads the Web UI in a desktop window. User data is stored under the app userData directory.

## Disclaimer

This is an unofficial community project. Models, sessions, plugins, and agent behavior remain provided by DeepSeek Harness. The upstream project is in developer preview and may introduce breaking changes.

## License

MIT
