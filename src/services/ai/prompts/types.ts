import { AIContext } from '@/services/ai';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: 'writing' | 'editing' | 'translation' | 'analysis';
  defaultOptions?: PromptOptions;
}

export interface PromptOptions {
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  format?: string;
  language?: string;
}

export interface PromptContext extends AIContext {
  format?: string;
  language?: string;
}

export interface PromptResult {
  text: string;
  metadata?: {
    confidence?: number;
    suggestions?: string[];
    changes?: Array<{
      original: string;
      revised: string;
      reason: string;
    }>;
  };
}
