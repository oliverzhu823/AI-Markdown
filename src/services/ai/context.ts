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

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  messages: AIMessage[];
}

export const defaultConfig: AIConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  messages: []
};

export const contextManager = {
  getMessages: (model: string) => [],
  addMessage: (model: string, role: string, content: string) => {},
  clearMessages: (model: string) => {}
};
