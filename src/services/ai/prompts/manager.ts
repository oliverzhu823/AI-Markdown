import { PromptTemplate, PromptOptions, PromptContext } from './types';
import { PROMPT_TEMPLATES } from './templates';

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
    }

    return prompt;
  }
}

// 导出单例实例
export const promptManager = new PromptManager();
