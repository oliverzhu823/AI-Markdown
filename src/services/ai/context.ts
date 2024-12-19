import { Message } from './models';

class ContextManager {
  private messages: Map<string, Message[]>;

  constructor() {
    this.messages = new Map();
  }

  getMessages(model: string): Message[] {
    return this.messages.get(model) || [];
  }

  addMessage(model: string, role: 'user' | 'assistant', content: string) {
    const messages = this.getMessages(model);
    messages.push({ role, content });
    this.messages.set(model, messages);
  }

  clearMessages(model: string) {
    this.messages.delete(model);
  }
}

export const contextManager = new ContextManager();
