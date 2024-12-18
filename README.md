# AI Markdown Editor

一个现代化的 AI 驱动的 Markdown 编辑器，支持智能写作、文本润色和多种 AI 模型。

## 特性

- 🚀 基于 React + TypeScript + Vite 构建
- 🎨 使用 Tailwind CSS 实现美观的 UI 设计
- 🤖 支持多种 AI 模型（DeepSeek、OpenAI、Claude）
- ✨ 实时 Markdown 预览和语法高亮
- 📝 智能写作助手功能
- 🔄 流式响应，实时显示 AI 输出
- 🌙 支持亮色/暗色主题
- 💾 自动保存和历史记录
- 🔌 可扩展的 AI 模型适配器架构

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8.0

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-markdown.git
cd ai-markdown

# 安装依赖
pnpm install
```

### 配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env
```

2. 在 `.env` 文件中配置你的 AI API 密钥：
```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

### 开发

```bash
# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 构建生产版本
pnpm build
```

## 部署到 Cloudflare Pages

本项目完全兼容 Cloudflare Pages，以下是部署步骤：

1. 在 Cloudflare Pages 中创建新项目
2. 连接你的 Git 仓库
3. 配置构建设置：
   - 构建命令：`pnpm build`
   - 构建输出目录：`dist`
   - Node.js 版本：18.x
4. 配置环境变量：
   - 添加所有 `.env` 文件中的变量到 Cloudflare Pages 的环境变量设置中

### 环境变量要求

确保在 Cloudflare Pages 中设置以下环境变量：
- `VITE_DEEPSEEK_API_KEY`：DeepSeek API 密钥
- `VITE_DEEPSEEK_API_URL`：DeepSeek API 地址
- `VITE_DEFAULT_AI_MODEL`：默认 AI 模型
- `VITE_DEFAULT_AI_TEMPERATURE`：默认温度值
- `VITE_APP_NAME`：应用名称
- `VITE_APP_VERSION`：应用版本
- `VITE_DEFAULT_THEME`：默认主题

## 技术栈

- ⚡️ [Vite](https://vitejs.dev/) - 下一代前端构建工具
- ⚛️ [React](https://reactjs.org/) - 用户界面库
- 🎯 [TypeScript](https://www.typescriptlang.org/) - 类型安全
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- 📝 [Marked](https://marked.js.org/) - Markdown 解析器
- 🔄 [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- 🎭 [Headless UI](https://headlessui.dev/) - 无样式 UI 组件
- 🎯 [ESLint](https://eslint.org/) - 代码质量
- 🔍 [TypeScript ESLint](https://typescript-eslint.io/) - TypeScript 代码规范

## 许可证

[MIT](LICENSE)
