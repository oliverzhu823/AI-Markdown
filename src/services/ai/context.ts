import { AIContext } from '@/services/ai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  messages: Message[];
  lastUpdateTime: number;
}

export class ContextManager {
  private static instance: ContextManager;
  private conversations: Map<string, ConversationContext>;
  private readonly maxMessages: number = 10;
  private readonly contextTimeout: number = 30 * 60 * 1000; // 30分钟超时

  private constructor() {
    this.conversations = new Map();
  }

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * 添加消息到会话
   */
  addMessage(id: string, role: Message['role'], content: string): void {
    const context = this.getOrCreateContext(id);
    
    // 添加新消息
    context.messages.push({ role, content });
    context.lastUpdateTime = Date.now();

    // 保持消息数量在限制范围内
    if (context.messages.length > this.maxMessages) {
      // 保留system消息
      const systemMessages = context.messages.filter(m => m.role === 'system');
      const recentMessages = context.messages
        .filter(m => m.role !== 'system')
        .slice(-(this.maxMessages - systemMessages.length));
      
      context.messages = [...systemMessages, ...recentMessages];
    }
  }

  /**
   * 获取会话的所有有效消息
   */
  getMessages(id: string): Message[] {
    const context = this.conversations.get(id);
    if (!context) return [];

    // 检查会话是否超时
    if (Date.now() - context.lastUpdateTime > this.contextTimeout) {
      this.clearConversation(id);
      return [];
    }

    return context.messages;
  }

  /**
   * 清除会话历史
   */
  clearConversation(id: string): void {
    const context = this.conversations.get(id);
    if (context) {
      // 保留system消息
      const systemMessages = context.messages.filter(m => m.role === 'system');
      context.messages = systemMessages;
      context.lastUpdateTime = Date.now();
    }
  }

  /**
   * 获取或创建会话上下文
   */
  private getOrCreateContext(id: string): ConversationContext {
    let context = this.conversations.get(id);
    
    if (!context || Date.now() - context.lastUpdateTime > this.contextTimeout) {
      context = {
        messages: [],
        lastUpdateTime: Date.now(),
      };
      this.conversations.set(id, context);
    }

    return context;
  }
}

// 导出单例实例
export const contextManager = ContextManager.getInstance();
