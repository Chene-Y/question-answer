# DeepSeek AI模型集成指南

## 概述

本系统已集成DeepSeek大语言模型，用于智能生成高质量的题目。DeepSeek是一个强大的开源大语言模型，在中文理解和生成方面表现优异。

## DeepSeek模型特点

### 🚀 **技术优势**
- **开源免费**：支持本地部署，无需付费API
- **中文能力强**：在中文理解和生成方面表现优秀
- **多模态支持**：支持文本、代码等多种输入
- **高性能**：响应速度快，生成质量高
- **可定制**：支持微调和自定义训练

### 📚 **适用场景**
- 教育题目生成
- 知识问答
- 内容创作
- 代码生成
- 学术研究

## 部署方式

### 1. 云端API方式（推荐）

#### 获取DeepSeek API密钥
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册账号并登录
3. 进入API管理页面
4. 创建新的API密钥
5. 复制密钥到环境变量

#### 配置环境变量
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
```

### 2. 本地部署方式

#### 使用Ollama部署
```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 拉取DeepSeek模型
ollama pull deepseek-coder:6.7b

# 启动本地服务
ollama serve
```

#### 配置本地API
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=local
DEEPSEEK_API_URL=http://localhost:11434/api/chat
DEEPSEEK_MODEL=deepseek-coder:6.7b
```

### 3. 自建服务器部署

#### 使用Docker部署
```bash
# 拉取DeepSeek镜像
docker pull deepseek/deepseek-coder:latest

# 运行容器
docker run -d \
  --name deepseek-coder \
  -p 8000:8000 \
  -v /path/to/models:/models \
  deepseek/deepseek-coder:latest
```

## 配置步骤

### 1. 安装依赖
```bash
cd backend
npm install axios
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑.env文件，配置DeepSeek参数
nano .env
```

### 3. 测试配置
```bash
# 运行AI服务测试
npm run test-ai
```

### 4. 启动服务
```bash
# 启动后端服务
npm run dev

# 启动前端服务
cd ../frontend
npm run dev
```

## 使用方法

### 1. 访问AI出题功能
1. 登录教师账号
2. 点击首页的"AI出题"按钮
3. 选择科目、输入知识点、设置题量
4. 点击"开始生成"
5. 预览生成的题目
6. 编辑或直接导入到题库

### 2. 自定义生成参数
可以在前端页面调整以下参数：
- **科目选择**：数学、语文、英语、物理、化学等
- **知识点描述**：详细描述要考察的知识点
- **题目数量**：1-50道题目
- **题型偏好**：选择题、判断题、简答题、论述题

## 提示词优化

### 系统提示词
```
你是一个专业的题目生成助手，能够根据给定的科目和知识点生成高质量的题目。请严格按照JSON格式返回结果。
```

### 用户提示词模板
```
请为{科目}科目生成{数量}道关于"{知识点}"的题目。

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
    "category": "{科目}",
    "explanation": "题目解析"
  }
]
```

## 错误处理

### 常见错误及解决方案

#### 1. API密钥错误
```
错误：DeepSeek API密钥无效，请检查配置
解决：检查DEEPSEEK_API_KEY是否正确
```

#### 2. 网络连接问题
```
错误：DeepSeek API请求超时，请检查网络连接
解决：检查网络连接，确保能访问DeepSeek API
```

#### 3. 服务不可用
```
错误：DeepSeek服务暂时不可用，请稍后重试
解决：检查DeepSeek服务状态，稍后重试
```

#### 4. 调用频率过高
```
错误：DeepSeek API调用频率过高，请稍后重试
解决：降低调用频率，增加请求间隔
```

#### 5. 响应解析失败
```
错误：无法解析DeepSeek响应，使用模拟数据
解决：检查DeepSeek返回的数据格式
```

## 性能优化

### 1. 请求优化
- 设置合理的超时时间（30秒）
- 使用流式响应减少等待时间
- 批量生成减少API调用次数

### 2. 缓存机制
- 缓存相同参数的生成结果
- 避免重复调用相同内容
- 提高响应速度

### 3. 错误重试
- 网络错误自动重试
- 指数退避策略
- 提高成功率

## 成本控制

### 1. 本地部署
- 使用Ollama本地部署，无需API费用
- 一次性硬件投入，长期使用
- 完全控制数据和隐私

### 2. 云端API
- 按使用量计费，成本可控
- 无需维护服务器
- 自动扩展能力

### 3. 混合部署
- 开发测试使用本地部署
- 生产环境使用云端API
- 灵活切换，成本最优

## 安全考虑

### 1. API密钥安全
- 使用环境变量存储密钥
- 不要提交到代码仓库
- 定期轮换密钥

### 2. 数据隐私
- 本地部署保护数据隐私
- 云端API注意数据传输安全
- 遵守相关法律法规

### 3. 访问控制
- 仅教师用户可使用AI功能
- 记录使用日志
- 监控异常行为

## 扩展功能

### 1. 多模型支持
- 支持不同版本的DeepSeek模型
- 根据需求选择合适模型
- 模型性能对比

### 2. 自定义训练
- 使用教育数据微调模型
- 提高题目生成质量
- 适应特定学科需求

### 3. 质量评估
- 集成题目质量评估
- 自动筛选高质量题目
- 持续优化生成效果

## 技术支持

### 官方资源
- [DeepSeek官网](https://www.deepseek.com/)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [DeepSeek GitHub](https://github.com/deepseek-ai)

### 社区支持
- [DeepSeek Discord](https://discord.gg/deepseek)
- [DeepSeek 论坛](https://forum.deepseek.com/)

### 故障排除
如遇到问题，请检查：
1. 环境变量配置是否正确
2. API密钥是否有效
3. 网络连接是否正常
4. 服务日志中的错误信息

更多技术支持请联系开发团队。 