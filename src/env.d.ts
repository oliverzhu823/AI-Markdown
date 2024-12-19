/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Keys
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_DEEPSEEK_API_URL: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_API_URL?: string

  // App Configuration
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_APP_VERSION?: string

  // Feature Flags
  readonly VITE_ENABLE_AI?: string
  readonly VITE_ENABLE_THEMES?: string
  readonly VITE_ENABLE_PLUGINS?: string

  // Build Configuration
  readonly VITE_BUILD_MODE?: 'development' | 'production' | 'staging'
  readonly VITE_PUBLIC_PATH?: string
  readonly VITE_ASSET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 声明全局变量
declare global {
  interface Window {
    // 添加任何需要在 window 对象上声明的属性
    __MARKDOWN_APP_STATE__?: any
  }
}
