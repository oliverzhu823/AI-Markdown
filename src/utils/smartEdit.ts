import { TextRange } from './editorUtils';
import { getAICompletion, AIContext, generatePrompt } from '@/services/ai';

export interface SmartEditSuggestion {
  type: 'completion' | 'correction' | 'enhancement';
  text: string;
  range?: TextRange;
  confidence: number;
  explanation?: string;
}

export interface SmartEditOptions {
  maxSuggestions?: number;
  minConfidence?: number;
  context?: AIContext;
  onPartialSuggestion?: (suggestion: SmartEditSuggestion) => void;
}

const DEFAULT_OPTIONS: SmartEditOptions = {
  maxSuggestions: 3,
  minConfidence: 0.7,
};

// 智能补全
export async function getSmartCompletions(
  text: string,
  cursorPosition: number,
  options: SmartEditOptions = {}
): Promise<SmartEditSuggestion[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const context = text.substring(Math.max(0, cursorPosition - 500), cursorPosition);
  
  try {
    console.log('请求智能补全，上下文长度:', context.length);
    const prompt = generatePrompt(
      '请根据上下文提供3个最合适的补全建议。每个建议需要包含：\n' +
      '1. 补全文本\n' +
      '2. 置信度（0-1）\n' +
      '3. 解释为什么这是好的补全\n' +
      '请以JSON格式返回结果。',
      { content: context }
    );

    const response = await getAICompletion({
      prompt,
      context: opts.context,
      onPartialResponse: opts.onPartialSuggestion
        ? (partial) => {
            try {
              console.log('收到部分响应:', partial.text);
              const suggestions = JSON.parse(partial.text);
              suggestions.forEach((s: any) => {
                if (s.confidence >= (opts.minConfidence || 0)) {
                  opts.onPartialSuggestion?.({
                    type: 'completion',
                    text: s.text,
                    confidence: s.confidence,
                    explanation: s.explanation,
                  });
                }
              });
            } catch (e) {
              console.log('解析部分响应失败，等待完整响应');
            }
          }
        : undefined,
    });

    console.log('收到完整响应:', response);
    if (response.error) {
      console.error('AI 请求失败:', response.error);
      return [];
    }

    try {
      const suggestions = JSON.parse(response.text);
      return suggestions
        .filter((s: any) => s.confidence >= (opts.minConfidence || 0))
        .slice(0, opts.maxSuggestions)
        .map((s: any) => ({
          type: 'completion',
          text: s.text,
          confidence: s.confidence,
          explanation: s.explanation,
        }));
    } catch (e) {
      console.error('解析智能补全结果失败:', e);
      return [];
    }
  } catch (e) {
    console.error('获取智能补全失败:', e);
    return [];
  }
}

// 语法检查和修正
export async function getGrammarSuggestions(
  text: string,
  range: TextRange,
  options: SmartEditOptions = {}
): Promise<SmartEditSuggestion[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const selectedText = text.substring(range.start, range.end);

  const prompt = generatePrompt(
    '请检查以下文本的语法和表达，提供改进建议。每个建议需要包含：\n' +
    '1. 修改后的文本\n' +
    '2. 置信度（0-1）\n' +
    '3. 修改原因\n' +
    '请以JSON格式返回结果。',
    { content: selectedText }
  );

  const response = await getAICompletion({
    prompt,
    context: opts.context,
    onPartialResponse: opts.onPartialSuggestion
      ? (partial) => {
          try {
            const suggestions = JSON.parse(partial.text);
            suggestions.forEach((s: any) => {
              if (s.confidence >= (opts.minConfidence || 0)) {
                opts.onPartialSuggestion?.({
                  type: 'correction',
                  text: s.text,
                  range,
                  confidence: s.confidence,
                  explanation: s.explanation,
                });
              }
            });
          } catch (e) {
            // 忽略解析错误，等待完整响应
          }
        }
      : undefined,
  });

  try {
    const suggestions = JSON.parse(response.text);
    return suggestions
      .filter((s: any) => s.confidence >= (opts.minConfidence || 0))
      .slice(0, opts.maxSuggestions)
      .map((s: any) => ({
        type: 'correction',
        text: s.text,
        range,
        confidence: s.confidence,
        explanation: s.explanation,
      }));
  } catch (e) {
    console.error('解析语法检查结果失败:', e);
    return [];
  }
}

// 内容增强建议
export async function getEnhancementSuggestions(
  text: string,
  range: TextRange,
  options: SmartEditOptions = {}
): Promise<SmartEditSuggestion[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const selectedText = text.substring(range.start, range.end);

  const prompt = generatePrompt(
    '请分析以下文本，提供改进建议以增强其表达效果。每个建议需要包含：\n' +
    '1. 增强后的文本\n' +
    '2. 置信度（0-1）\n' +
    '3. 增强理由\n' +
    '请以JSON格式返回结果。',
    { content: selectedText }
  );

  const response = await getAICompletion({
    prompt,
    context: opts.context,
    onPartialResponse: opts.onPartialSuggestion
      ? (partial) => {
          try {
            const suggestions = JSON.parse(partial.text);
            suggestions.forEach((s: any) => {
              if (s.confidence >= (opts.minConfidence || 0)) {
                opts.onPartialSuggestion?.({
                  type: 'enhancement',
                  text: s.text,
                  range,
                  confidence: s.confidence,
                  explanation: s.explanation,
                });
              }
            });
          } catch (e) {
            // 忽略解析错误，等待完整响应
          }
        }
      : undefined,
  });

  try {
    const suggestions = JSON.parse(response.text);
    return suggestions
      .filter((s: any) => s.confidence >= (opts.minConfidence || 0))
      .slice(0, opts.maxSuggestions)
      .map((s: any) => ({
        type: 'enhancement',
        text: s.text,
        range,
        confidence: s.confidence,
        explanation: s.explanation,
      }));
  } catch (e) {
    console.error('解析内容增强结果失败:', e);
    return [];
  }
}

// 智能建议触发器
export function shouldTriggerSuggestions(
  text: string,
  cursorPosition: number,
  lastTypedChar: string
): boolean {
  // 在以下情况触发建议：
  // 1. 输入空格后
  if (lastTypedChar === ' ') {
    const wordsBefore = text
      .substring(Math.max(0, cursorPosition - 100), cursorPosition)
      .split(' ')
      .filter(Boolean);
    return wordsBefore.length >= 3;
  }

  // 2. 输入标点符号后
  if (/[.,!?;:]/.test(lastTypedChar)) {
    return true;
  }

  // 3. 段落结束后（连续两个换行）
  if (lastTypedChar === '\n') {
    const textBefore = text.substring(Math.max(0, cursorPosition - 2), cursorPosition);
    return textBefore === '\n\n';
  }

  return false;
}
