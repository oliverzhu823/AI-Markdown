import { AIContext } from '@/services/ai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  messages: Message[];
  lastUpdateTime: number;
}

export interface AIContext {
  text: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

export const contextManager = {
  getMessages: (model: string) => [],
  addMessage: (model: string, role: string, content: string) => {},
  clearMessages: (model: string) => {}
};
