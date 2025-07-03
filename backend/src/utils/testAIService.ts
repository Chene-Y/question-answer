import { getDefaultAIService } from '../services/aiService';

// 测试AI服务功能
async function testAIService() {
  console.log('🧪 开始测试DeepSeek AI服务...\n');

  const aiService = getDefaultAIService();
  const provider = process.env.AI_PROVIDER || 'mock';
  
  console.log(`📋 当前AI服务提供商: ${provider}`);
  console.log(`🔑 DeepSeek API密钥配置: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
  console.log(`🌐 DeepSeek API地址: ${process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'}`);
  console.log(`🤖 DeepSeek模型: ${process.env.DEEPSEEK_MODEL || 'deepseek-chat'}\n`);

  try {
    console.log('🚀 开始生成测试题目...');
    
    const testRequest = {
      subject: '数学',
      knowledgePoints: '函数、导数',
      count: 2
    };

    console.log(`📝 测试参数:`, testRequest);
    
    const startTime = Date.now();
    const questions = await aiService.generateQuestions(testRequest);
    const endTime = Date.now();
    
    console.log(`✅ 生成完成! 耗时: ${endTime - startTime}ms`);
    console.log(`📊 生成题目数量: ${questions.length}\n`);
    
    // 显示生成的题目
    questions.forEach((question, index) => {
      console.log(`📖 题目 ${index + 1}:`);
      console.log(`   标题: ${question.title}`);
      console.log(`   内容: ${question.content}`);
      console.log(`   类型: ${question.question_type}`);
      console.log(`   难度: ${question.difficulty}`);
      console.log(`   分值: ${question.points}分`);
      console.log(`   分类: ${question.category}`);
      if (question.options && question.options.length > 0) {
        console.log(`   选项: ${question.options.join(', ')}`);
      }
      console.log(`   答案: ${question.correct_answer}`);
      console.log(`   解析: ${question.explanation}`);
      console.log('');
    });
    
    console.log('🎉 DeepSeek AI服务测试成功!');
    
    if (provider === 'mock') {
      console.log('\n💡 提示: 当前使用Mock模式，如需测试真实DeepSeek服务，请配置DEEPSEEK_API_KEY');
    }
    
  } catch (error) {
    console.error('❌ DeepSeek AI服务测试失败:', error);
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查DEEPSEEK_API_KEY配置');
    console.log('2. 确认DeepSeek API密钥有效');
    console.log('3. 检查网络连接');
    console.log('4. 查看DeepSeek服务状态');
    console.log('5. 访问 https://platform.deepseek.com/ 获取API密钥');
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testAIService();
}

export { testAIService }; 