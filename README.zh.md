# DeepSeek Harness Desktop

[English](./README.md) | **中文**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的非官方桌面包装。

**发布站：** https://scigeolight.github.io/dsh-desktop/

## 功能

- Windows / macOS 一键安装包
- 内置官方 `@deepseek-ai/dsh` Web UI
- 无需手动管 CLI / 端口
- 下载站点击后弹出「支持作者（GitHub 加星）」或「先体验，直接下载」

## 平台

| 平台 | 安装包 |
| --- | --- |
| Windows x64 | NSIS 安装包 + ZIP |
| macOS Apple Silicon | DMG + ZIP |

> **iOS：** DeepSeek Harness 是本机 Node.js Agent + Web UI，无法做成同等形态的 App Store 应用。请用 Windows/macOS 桌面版，或运行 `npx @deepseek-ai/dsh web` 后在同一网络的手机浏览器打开。

## 下载

- 最新版本：https://github.com/SciGeoLight/dsh-desktop/releases/latest
- 点击下载：https://scigeolight.github.io/dsh-desktop/

## 开发

```bash
npm install
npm start
```

### 打包

```bash
# Windows
npm run dist:win

# macOS（需在 Mac 上）
npm run dist:mac
```

产物在 `dist/`。

## 原理

Electron 在本机空闲端口启动官方 `dsh web`，再把 Web UI 加载进桌面窗口。用户数据在应用 userData 目录。

## 声明

这是社区非官方项目。模型、会话、插件与 Agent 行为仍由 DeepSeek Harness 提供。上游处于开发者预览，可能发生不兼容变更。

## License

MIT
