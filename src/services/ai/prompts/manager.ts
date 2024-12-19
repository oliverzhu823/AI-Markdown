import { PromptTemplate, PromptOptions, PromptContext, AIContext } from './types';
import { PROMPT_TEMPLATES } from './templates';
import { AIContext } from '../context';

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description?: string;
  defaultOptions?: PromptOptions;
  category?: string;
}

interface PromptContext {
  text: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  content?: string;
}

const templates: Record<string, PromptTemplate> = {
  improve: {
    id: 'improve',
    name: '改进文本',
    template: '请帮我改进以下文本，使其更加清晰、准确和专业：\n\n{{text}}',
    description: '改进选中的文本，使其更加清晰和专业'
  },
  explain: {
    id: 'explain',
    name: '解释内容',
    template: '请解释以下内容：\n\n{{text}}',
    description: '解释选中的内容'
  },
  continue: {
    id: 'continue',
    name: '继续写作',
    template: '请基于以下内容继续写作：\n\n{{text}}',
    description: '基于当前内容继续写作'
  }
};

export class PromptManager {
  private templates: Map<string, PromptTemplate>;
  private customTemplates: Map<string, PromptTemplate>;

  constructor() {
    this.templates = new Map(Object.entries(PROMPT_TEMPLATES));
    this.customTemplates = new Map();
  }

  /**
   * 获取提示词模板
   */
  getTemplate(id: string): PromptTemplate | undefined {
    return this.customTemplates.get(id) || this.templates.get(id);
  }

  /**
   * 添加自定义提示词模板
   */
  addCustomTemplate(template: PromptTemplate): void {
    this.customTemplates.set(template.id, template);
  }

  /**
   * 移除自定义提示词模板
   */
  removeCustomTemplate(id: string): boolean {
    return this.customTemplates.delete(id);
  }

  /**
   * 获取所有提示词模板
   */
  getAllTemplates(): PromptTemplate[] {
    return [...this.templates.values(), ...this.customTemplates.values()];
  }

  /**
   * 按分类获取提示词模板
   */
  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * 生成完整的提示词
   */
  generatePrompt(
    templateId: string,
    context: PromptContext,
    options?: PromptOptions
  ): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let prompt = template.template;

    // 添加选项
    const finalOptions = { ...template.defaultOptions, ...options };
    if (finalOptions) {
      if (finalOptions.style) {
        prompt += `\n风格要求：${finalOptions.style}`;
      }
      if (finalOptions.tone) {
        prompt += `\n语气要求：${finalOptions.tone}`;
      }
      if (finalOptions.length) {
        const lengthMap = {
          short: '简短',
          medium: '适中',
          long: '详细',
        };
        prompt += `\n长度要求：${lengthMap[finalOptions.length]}`;
      }
      if (finalOptions.format) {
        prompt += `\n格式要求：${finalOptions.format}`;
      }
      if (finalOptions.language) {
        prompt += `\n语言要求：${finalOptions.language}`;
      }
    }

    // 添加上下文
    if (context.selection) {
      prompt += `\n\n选中文本：\n${context.selection.text}`;
    } else if (context.content) {
      prompt += `\n\n当前文档：\n${context.content}`;
    } else {
      prompt = prompt.replace('{{text}}', context.text);
    }

    return prompt;
  }
}

export function getPromptTemplate(templateId: string): PromptTemplate {
  const template = templates[templateId];
  if (!template) {
    throw new Error(`未找到模板: ${templateId}`);
  }
  return template;
}

export function generatePrompt(templateId: string, context: PromptContext): string {
  const template = templates[templateId];
  if (!template) {
    throw new Error(`未找到模板: ${templateId}`);
  }

  return template.template.replace('{{text}}', context.text);
}

// 导出单例实例
export const promptManager = new PromptManager();
