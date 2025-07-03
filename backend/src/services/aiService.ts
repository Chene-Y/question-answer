import axios from 'axios';

// AI服务配置接口
interface AIServiceConfig {
  provider: 'deepseek' | 'mock';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

// 题目生成请求接口
interface QuestionGenerationRequest {
  subject: string;
  knowledgePoints: string;
  count: number;
  questionTypes?: string[];
  difficulty?: string;
}

// 生成的题目接口
interface GeneratedQuestion {
  title: string;
  content: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation?: string;
}

class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  // 生成题目的主要方法
  async generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
    switch (this.config.provider) {
      case 'deepseek':
        return this.generateWithDeepSeek(request);
      case 'mock':
      default:
        return this.generateMockQuestions(request);
    }
  }

  // DeepSeek模型集成
  private async generateWithDeepSeek(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
    try {
      const prompt = this.buildDeepSeekPrompt(request);
      
      // 支持多种DeepSeek API端点
      const apiUrl = this.config.apiUrl || 'https://api.deepseek.com/v1/chat/completions';
      
      const response = await axios.post(
        apiUrl,
        {
          model: this.config.model || 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的题目生成助手，能够根据给定的科目和知识点生成高质量的题目。请严格按照JSON格式返回结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 3000000 // 3000秒超时
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content, request);
    } catch (error: any) {
      console.error('DeepSeek API调用失败:', error.response?.data || error.message);
      
      // 如果是API错误，提供更详细的错误信息
      if (error.response?.status === 401) {
        throw new Error('DeepSeek API密钥无效，请检查配置');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API调用频率过高，请稍后重试');
      } else if (error.response?.status >= 500) {
        throw new Error('DeepSeek服务暂时不可用，请稍后重试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('DeepSeek API请求超时，请检查网络连接');
      }
      
      throw new Error('DeepSeek AI服务调用失败，请检查API配置和网络连接');
    }
  }

  // 构建DeepSeek提示词
  private buildDeepSeekPrompt(request: QuestionGenerationRequest): string {
    return `请为${request.subject}科目生成${request.count}道关于"${request.knowledgePoints}"的题目。

要求：
1. 题目类型包括：选择题、判断题、简答题、论述题
2. 难度分布：简单(1分)、中等(2分)、困难(3分)
3. 每道题都要包含：标题、内容、题型、选项(选择题)、正确答案、解析
4. 题目要符合教学大纲要求，内容准确、表述清晰
5. 选择题要有4个选项，选项要合理且有干扰性
6. 判断题要明确对错
7. 简答题和论述题要有明确的答题要点

请严格按照以下JSON格式返回，不要包含任何其他文字：
[
  {
    "title": "题目标题",
    "content": "题目内容",
    "question_type": "multiple_choice|true_false|short_answer|essay",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correct_answer": "正确答案",
    "points": 1,
    "difficulty": "easy|medium|hard",
    "category": "${request.subject}",
    "explanation": "题目解析"
  }
]`;
  }

  // 解析AI响应
  private parseAIResponse(content: string, request: QuestionGenerationRequest): GeneratedQuestion[] {
    try {
      // 清理响应内容，提取JSON部分
      let cleanedContent = content.trim();
      
      // 移除可能的markdown代码块标记
      cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // 尝试提取JSON数组
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        
        // 验证和清理题目数据
        return questions.map((q: any, index: number) => ({
          title: q.title || `${request.subject}${request.knowledgePoints}相关题目${index + 1}`,
          content: q.content || '题目内容',
          question_type: this.validateQuestionType(q.question_type) || 'multiple_choice',
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: q.correct_answer || '',
          points: this.validatePoints(q.points) || 1,
          difficulty: this.validateDifficulty(q.difficulty) || 'medium',
          category: q.category || request.subject,
          explanation: q.explanation || '题目解析'
        }));
      }
      
      // 如果无法解析JSON，返回模拟数据
      console.warn('无法解析DeepSeek响应，使用模拟数据');
      console.warn('原始响应:', content);
      return this.generateMockQuestions(request);
    } catch (error) {
      console.error('解析DeepSeek响应失败:', error);
      console.error('原始响应:', content);
      return this.generateMockQuestions(request);
    }
  }

  // 验证题目类型
  private validateQuestionType(type: string): string {
    const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
    return validTypes.includes(type) ? type : 'multiple_choice';
  }

  // 验证分值
  private validatePoints(points: any): number {
    const num = parseInt(points);
    return (num >= 1 && num <= 10) ? num : 1;
  }

  // 验证难度
  private validateDifficulty(difficulty: string): string {
    const validDifficulties = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty) ? difficulty : 'medium';
  }

  // 模拟题目生成（备用方案）
  private generateMockQuestions(request: QuestionGenerationRequest): GeneratedQuestion[] {
    const generatedQuestions: GeneratedQuestion[] = [];
    const questionTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < request.count; i++) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const points = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
      
      let question: GeneratedQuestion = {
        title: `${request.subject}${request.knowledgePoints}相关题目${i + 1}`,
        content: `这是一道关于${request.knowledgePoints}的${request.subject}题目。请根据所学知识进行作答。`,
        question_type: questionType as any,
        points: points,
        difficulty: difficulty as any,
        category: request.subject,
        explanation: `这道题目考察了${request.knowledgePoints}的相关知识点。`
      };

      // 根据题目类型生成不同的内容
      if (questionType === 'multiple_choice') {
        question.options = [
          `选项A：${request.knowledgePoints}相关内容A`,
          `选项B：${request.knowledgePoints}相关内容B`, 
          `选项C：${request.knowledgePoints}相关内容C`,
          `选项D：${request.knowledgePoints}相关内容D`
        ];
        question.correct_answer = 'A';
      } else if (questionType === 'true_false') {
        question.content = `关于${request.knowledgePoints}的说法是否正确：${request.knowledgePoints}是${request.subject}中的重要概念。`;
        question.correct_answer = '正确';
      } else if (questionType === 'short_answer') {
        question.content = `请简要说明${request.knowledgePoints}的定义和特点。`;
        question.correct_answer = `${request.knowledgePoints}的定义和特点说明`;
      } else if (questionType === 'essay') {
        question.content = `请详细论述${request.knowledgePoints}在${request.subject}中的应用和意义。`;
        question.correct_answer = `${request.knowledgePoints}的应用和意义详细论述`;
      }

      generatedQuestions.push(question);
    }

    return generatedQuestions;
  }
}

// 创建AI服务实例
export const createAIService = (config: AIServiceConfig): AIService => {
  return new AIService(config);
};

// 默认配置（使用环境变量）
export const getDefaultAIService = (): AIService => {
  const provider = 'deepseek';
  const config: AIServiceConfig = {
    provider,
    apiKey: 'sk-64f0e2b0cece44189652ffab25949c46',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  };

  return createAIService(config);
}; 