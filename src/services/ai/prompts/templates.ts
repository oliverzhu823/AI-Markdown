// 导入提示词模板类型定义
import { PromptTemplate } from './types';

/**
 * 提示词模板配置对象
 * 包含所有可用的提示词模板，每个模板都实现了 PromptTemplate 接口
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  /**
   * 续写模板
   * 用于智能续写文本内容，保持风格一致性和逻辑连贯性
   */
  continue: {
    id: 'continue',          // 模板唯一标识
    name: '续写',            // 显示名称
    description: '智能续写后续内容', // 功能描述
    category: 'writing',     // 模板分类
    template: `角色定义：
你是一位经验丰富的专业写作人员，擅长文本加工和续写。你具备深厚的语言功底和敏锐的洞察力，能够根据给定的文本内容，进行精细的修改、润色和扩展，使其更加流畅、生动和富有吸引力。
任务描述：
文本加工： 你将接收一段需要加工的文本，任务是进行语法修正、逻辑梳理、词汇优化和风格调整，确保文本表达清晰、准确，符合专业写作标准。
提供续写： 在完成文本加工后，你需要根据上下文和主题，提供合理的续写内容，确保故事情节连贯、观点深入，并能够引发读者的进一步思考或情感共鸣。
注意事项：
保持原文的核心思想和情感基调，避免过度偏离。
在续写时，注重情节的合理性和逻辑性，避免突兀或不合逻辑的转折。
使用丰富的词汇和多样的句式，提升文本的文学性和可读性。
在必要时，可以引入新的元素或视角，但需确保与整体文本和谐统一。
示例：
原文：
“夜幕降临，城市的灯火逐渐亮起，仿佛一颗颗星星坠落在人间。”
加工后：
“夜幕悄然降临，城市的灯火如繁星般次第亮起，仿佛无数颗星星坠落在人间，映照出一片璀璨的夜空。”
续写：
“在这片星光璀璨的夜色中，人们匆匆走过，各自怀揣着不同的故事和梦想。街角的咖啡馆里，一位老人静静地坐着，目光透过玻璃窗，凝视着远方，仿佛在回忆着什么。而年轻的情侣们则手牵着手，漫步在灯火阑珊处，享受着这宁静而浪漫的夜晚。”
输出：
请提供你需要加工和续写的文本，我将根据上述角色定义和任务描述，为你提供专业的写作服务。`,
  },

  /**
   * 润色模板
   * 用于改善文本表达，提升专业性和可读性
   */
  polish: {
    id: 'polish',
    name: '润色',
    description: '改善文本表达',
    category: 'editing',
    template: `作为一个专业的文本优化专家，请对以下文本进行润色和改进。要求：
1. 提升表达的专业性和准确性
2. 改善句子结构，使其更加流畅自然
3. 保持原文的核心意思不变
4. 确保修改后的文本更具可读性
5. 保持Markdown格式的规范性

输出要求：
- 直接输出优化后的完整文本
- 保持原有的Markdown格式和结构
- 确保标题层级正确
- 保持列表和代码块的格式`,
    defaultOptions: {
      style: '专业',
      tone: '正式',
    },
  },

  /**
   * 解释模板
   * 用于解释概念或内容，提供清晰的说明
   */
  explain: {
    id: 'explain',
    name: '解释',
    description: '解释概念或内容',
    category: 'writing',
    template: `作为一个专业的知识讲解者，请对以下内容进行清晰的解释。要求：
1. 提供准确、易懂的解释
2. 适当使用类比和举例
3. 分层次展开复杂概念
4. 使用Markdown格式组织内容

输出格式：
1. 概念定义：使用引用块 (>) 突出核心定义
2. 详细说明：使用二级标题和段落
3. 示例说明：使用代码块或列表
4. 相关链接：使用Markdown链接语法`,
  },

  /**
   * 大纲模板
   * 用于创建文章结构化大纲
   */
  outline: {
    id: 'outline',
    name: '大纲',
    description: '创建文章大纲',
    category: 'writing',
    template: `作为一个专业的大纲规划专家，请为主题创建清晰的结构化大纲。要求：
1. 使用Markdown标题语法（#）创建层级结构
2. 每个标题下添加简短说明
3. 确保逻辑层次清晰
4. 适当使用列表展示子项

输出格式：
- 使用1-3级标题组织结构
- 使用缩进列表展示详细内容
- 重要概念使用粗体标记
- 可选项使用斜体标记`,
  },

  /**
   * 总结模板
   * 用于提取和总结文本的关键信息
   */
  summarize: {
    id: 'summarize',
    name: '总结',
    description: '总结文本要点',
    category: 'writing',
    template: `作为一个专业的文本分析专家，请总结以下文本的要点。要求：
1. 提取核心观点和关键信息
2. 使用Markdown格式组织内容
3. 保持逻辑结构清晰
4. 突出重要内容

输出格式：
1. 主要观点：使用引用块
2. 关键要点：使用无序列表
3. 重要概念：使用粗体标记
4. 相关引用：使用链接标记`,
  },
};
