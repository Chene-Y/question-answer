<template>
  <div class="ai-generate-container">
    <el-card class="generate-card glass-card">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="flex:1"></div>
          <el-button @click="router.go(-1)" type="primary" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>
      
      <!-- AI模型展示区域 -->
      <div class="ai-model-section">
        <div class="model-info">
          <div class="model-logo">
            <div class="logo-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="logo-text">
              <h1 class="model-name">DeepSeek AI</h1>
              <p class="model-desc">智能题目生成引擎</p>
            </div>
          </div>
          <div class="model-features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>中文理解能力强</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>高质量题目生成</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>多题型支持</span>
            </div>
          </div>
        </div>
        <div class="model-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalGenerated }}</div>
            <div class="stat-label">已生成题目</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ avgTime }}s</div>
            <div class="stat-label">平均耗时</div>
          </div>
        </div>
      </div>

      <h2 class="generate-title">AI智能出题</h2>
      
      <!-- 输入表单 -->
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">
            <el-icon class="form-icon"><Edit /></el-icon>
            <span>题目生成参数</span>
          </div>
          <div class="form-subtitle">请填写以下信息，DeepSeek将为您生成高质量的题目</div>
        </div>
        
        <el-form :model="form" :rules="rules" ref="formRef" class="generate-form">
          <div class="form-row">
            <div class="form-group">
              <div class="form-label">
                <el-icon><Collection /></el-icon>
                <span>科目选择</span>
              </div>
              <el-form-item prop="subject">
                <el-select 
                  v-model="form.subject" 
                  placeholder="请选择科目" 
                  class="form-select enhanced-select"
                  size="large"
                  allow-create
                  filterable
                >
                  <el-option label="数学" value="数学">
                    <div class="option-content">
                      <el-icon><Plus /></el-icon>
                      <span>数学</span>
                    </div>
                  </el-option>
                  <el-option label="语文" value="语文">
                    <div class="option-content">
                      <el-icon><Document /></el-icon>
                      <span>语文</span>
                    </div>
                  </el-option>
                  <el-option label="英语" value="英语">
                    <div class="option-content">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>英语</span>
                    </div>
                  </el-option>
                  <el-option label="物理" value="物理">
                    <div class="option-content">
                      <el-icon><Lightning /></el-icon>
                      <span>物理</span>
                    </div>
                  </el-option>
                  <el-option label="化学" value="化学">
                    <div class="option-content">
                      <el-icon><Tools /></el-icon>
                      <span>化学</span>
                    </div>
                  </el-option>
                  <el-option label="生物" value="生物">
                    <div class="option-content">
                      <el-icon><Sunny /></el-icon>
                      <span>生物</span>
                    </div>
                  </el-option>
                  <el-option label="历史" value="历史">
                    <div class="option-content">
                      <el-icon><Clock /></el-icon>
                      <span>历史</span>
                    </div>
                  </el-option>
                  <el-option label="地理" value="地理">
                    <div class="option-content">
                      <el-icon><Location /></el-icon>
                      <span>地理</span>
                    </div>
                  </el-option>
                  <el-option label="政治" value="政治">
                    <div class="option-content">
                      <el-icon><Document /></el-icon>
                      <span>政治</span>
                    </div>
                  </el-option>
                  <el-option label="计算机" value="计算机">
                    <div class="option-content">
                      <el-icon><Monitor /></el-icon>
                      <span>计算机</span>
                    </div>
                  </el-option>
                  <el-option label="其他" value="其他">
                    <div class="option-content">
                      <el-icon><More /></el-icon>
                      <span>其他</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            
            <div class="form-group">
              <div class="form-label">
                <el-icon><List /></el-icon>
                <span>题目数量</span>
              </div>
              <el-form-item prop="count">
                <el-input-number 
                  v-model="form.count" 
                  :min="1" 
                  :max="50" 
                  placeholder="生成题目数量"
                  class="form-number enhanced-number"
                  size="large"
                  controls-position="right"
                />
                <div class="number-hint">建议：1-20题效果最佳</div>
              </el-form-item>
            </div>
            
            <div class="form-group">
              <div class="form-label">
                <el-icon><Star /></el-icon>
                <span>生成操作</span>
              </div>
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="generateQuestions" 
                  :loading="generating"
                  class="generate-btn enhanced-btn"
                  size="large"
                >
                  <el-icon><Star /></el-icon>
                  {{ generating ? 'DeepSeek生成中...' : '开始生成' }}
                </el-button>
                <div class="btn-hint">点击开始AI智能生成</div>
              </el-form-item>
            </div>
          </div>
          
          <div class="form-group full-width">
            <div class="form-label">
              <el-icon><Document /></el-icon>
              <span>知识点描述</span>
            </div>
            <el-form-item prop="knowledgePoints">
              <el-input
                v-model="form.knowledgePoints"
                type="textarea"
                :rows="4"
                placeholder="请输入具体的知识点，例如：函数、导数、积分等，多个知识点用逗号分隔。详细描述有助于生成更精准的题目。"
                class="form-textarea enhanced-textarea"
                maxlength="500"
                show-word-limit
              />
              <div class="textarea-hint">
                <el-icon><InfoFilled /></el-icon>
                <span>详细描述知识点，AI将根据您的描述生成相关题目</span>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 题目预览列表 -->
      <div v-if="generatedQuestions.length > 0" class="questions-preview">
        <div class="preview-header">
          <h3>生成题目预览 ({{ generatedQuestions.length }}题)</h3>
          <div class="preview-actions">
            <el-button type="success" @click="importAllQuestions" :loading="importing">
              <el-icon><Upload /></el-icon>
              全部导入
            </el-button>
            <el-button type="warning" @click="clearAllQuestions">
              <el-icon><Delete /></el-icon>
              清空列表
            </el-button>
          </div>
        </div>
        
        <div class="questions-list">
          <div 
            v-for="(question, index) in generatedQuestions" 
            :key="index"
            class="question-item"
          >
            <div class="question-header">
              <div class="question-info">
                <span class="question-index">题目 {{ index + 1 }}</span>
                <el-tag :type="getQuestionTypeColor(question.question_type)" size="small">
                  {{ getQuestionTypeText(question.question_type) }}
                </el-tag>
                <el-tag :type="getDifficultyColor(question.difficulty)" size="small">
                  {{ getDifficultyText(question.difficulty) }}
                </el-tag>
                <span class="question-points">{{ question.points }}分</span>
              </div>
              <div class="question-actions">
                <el-button type="primary" size="small" @click="duplicateQuestion(index)">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button type="danger" size="small" @click="deleteQuestion(index)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="question-content">
              <div class="question-title">
                <strong>{{ question.title }}</strong>
              </div>
              <div class="question-text">{{ question.content }}</div>
              
              <!-- 选择题选项 -->
              <div v-if="question.question_type === 'multiple_choice' && question.options" class="question-options">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-text">{{ option }}</span>
                </div>
              </div>
              
              <!-- 正确答案 -->
              <div class="correct-answer">
                <strong>正确答案：</strong>
                <span class="answer-text">{{ question.correct_answer || '无' }}</span>
              </div>
              
              <!-- 解析 -->
              <div v-if="question.explanation" class="question-explanation">
                <strong>解析：</strong>
                <span class="explanation-text">{{ question.explanation }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!generating" class="empty-state">
        <el-empty description="暂无生成题目，请填写信息后点击生成">
          <el-icon style="font-size: 64px; color: #409eff; margin-bottom: 16px;">
            <Star />
          </el-icon>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { ArrowLeft, Star, Upload, Delete, CopyDocument, Check, Edit, Collection, List, Plus, Document, ChatDotRound, Lightning, Tools, Sunny, Clock, Location, Monitor, More, InfoFilled } from '@element-plus/icons-vue'
import * as questionsApi from '@/api/questions'
import type { CreateQuestionRequest } from '@/types'

const router = useRouter()
const formRef = ref()
const generating = ref(false)
const importing = ref(false)
const generatedQuestions = ref<any[]>([])

// AI模型统计数据
const totalGenerated = ref(0)
const successRate = ref(98)
const avgTime = ref(3.2)

const form = reactive({
  subject: '',
  knowledgePoints: '',
  count: 5
})

const rules = {
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  knowledgePoints: [{ required: true, message: '请输入知识点', trigger: 'blur' }],
  count: [{ required: true, message: '请设置题量', trigger: 'blur' }]
}

onMounted(() => {
  getQuestions()
})

// 生成题目
const generateQuestions = async () => {
  try {
    await formRef.value.validate()
    generating.value = true
    
    const response = await questionsApi.generateQuestionsByAI({
      subject: form.subject,
      knowledgePoints: form.knowledgePoints,
      count: form.count
    })
    
    if (response.questions) {
      generatedQuestions.value = response.questions
      totalGenerated.value += response.questions.length
      ElMessage.success(`DeepSeek成功生成 ${response.questions.length} 道题目`)
    }
  } catch (error: any) {
    console.error('生成题目失败:', error)
    ElMessage.error(error.response?.data?.message || '生成题目失败，请重试')
  } finally {
    generating.value = false
  }
}

const getQuestions = async () => {
  const response = await questionsApi.getQuestions({
    page: 1,
    pageSize: 10000
  })
  if (response.questions) {
    totalGenerated.value = response.questions.filter((question: any) => question.created_by_user_id === 8).length
  }
}

// 删除题目
const deleteQuestion = (index: number) => {
  generatedQuestions.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// 复制题目
const duplicateQuestion = (index: number) => {
  const question = { ...generatedQuestions.value[index] }
  generatedQuestions.value.splice(index + 1, 0, question)
  ElMessage.success('复制成功')
}

// 清空所有题目
const clearAllQuestions = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有生成的题目吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    generatedQuestions.value = []
    ElMessage.success('已清空所有题目')
  } catch {
    // 用户取消
  }
}

// 全部导入
const importAllQuestions = async () => {
  if (generatedQuestions.value.length === 0) {
    ElMessage.warning('没有可导入的题目')
    return
  }
  
  try {
    importing.value = true
    
    const questions: CreateQuestionRequest[] = generatedQuestions.value.map(q => ({
      title: q.title,
      content: q.content,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points,
      difficulty: q.difficulty,
      category: q.category,
      analysis: q.explanation
    }))
    
    const response = await questionsApi.batchCreateQuestions(questions)
    
    if (response.successCount > 0) {
      ElMessage.success(`成功导入 ${response.successCount} 道题目`)
      if (response.failCount > 0) {
        ElMessage.warning(`失败 ${response.failCount} 道题目`)
      }
      // 导入成功后跳转到题目管理页面
      router.push('/questions')
    } else {
      ElMessage.error('导入失败')
    }
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.response?.data?.message || '导入失败，请重试')
  } finally {
    importing.value = false
  }
}

// 获取题目类型颜色
const getQuestionTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    multiple_choice: 'primary',
    true_false: 'success',
    short_answer: 'warning',
    essay: 'danger'
  }
  return colors[type] || 'info'
}

// 获取题目类型文本
const getQuestionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    multiple_choice: '选择题',
    true_false: '判断题',
    short_answer: '简答题',
    essay: '论述题'
  }
  return texts[type] || type
}

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return colors[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
  const texts: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || difficulty
}
</script>

<style scoped>
.ai-generate-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.generate-card.glass-card {
  background: rgba(255,255,255,0.88) !important;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border: none;
  backdrop-filter: blur(12px);
  padding: 32px;
}

/* AI模型展示区域样式 */
.ai-model-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.ai-model-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 24px;
  z-index: 1;
  position: relative;
}

.model-logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.model-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 4px 0;
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.model-desc {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
}

.model-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.feature-item .el-icon {
  color: #4ade80;
  font-size: 16px;
}

.model-stats {
  display: flex;
  gap: 32px;
  z-index: 1;
  position: relative;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 80px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #4ade80;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.generate-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
  margin-bottom: 32px;
}

/* 表单容器样式 */
.form-container {
  background: linear-gradient(135deg, #f8fafd 0%, #e8f6ff 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 2px solid #e8f6ff;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.form-icon {
  font-size: 24px;
  color: #667eea;
}

.form-subtitle {
  color: #666;
  font-size: 14px;
  opacity: 0.8;
}

.generate-form {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  font-size: 14px;
}

.form-label .el-icon {
  color: #667eea;
  font-size: 16px;
}

/* 增强的选择器样式 */
.enhanced-select {
  width: 100%;
}

.enhanced-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e8f6ff;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.enhanced-select :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.enhanced-select :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.option-content .el-icon {
  color: #667eea;
  font-size: 16px;
}

/* 增强的数字输入框样式 */
.enhanced-number {
  width: 100%;
}

.enhanced-number :deep(.el-input-number__decrease),
.enhanced-number :deep(.el-input-number__increase) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.enhanced-number :deep(.el-input-number__decrease:hover),
.enhanced-number :deep(.el-input-number__increase:hover) {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: scale(1.05);
}

.enhanced-number :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e8f6ff;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.enhanced-number :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.enhanced-number :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.number-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* 增强的按钮样式 */
.enhanced-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.enhanced-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.enhanced-btn:hover::before {
  left: 100%;
}

.enhanced-btn:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(118, 75, 162, 0.4);
}

.enhanced-btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* 增强的文本域样式 */
.enhanced-textarea {
  width: 100%;
}

.enhanced-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid #e8f6ff;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
}

.enhanced-textarea :deep(.el-textarea__inner:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.enhanced-textarea :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.enhanced-textarea :deep(.el-input__count) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 12px;
}

.textarea-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.textarea-hint .el-icon {
  color: #667eea;
  font-size: 14px;
}

/* 表单验证样式 */
.generate-form :deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.generate-form :deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56c6c;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

.generate-form :deep(.el-form-item.is-success .el-input__wrapper) {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .form-group:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-title {
    font-size: 18px;
  }
  
  .form-subtitle {
    font-size: 13px;
  }
  
  .ai-generate-container {
    padding: 10px;
  }
  
  .generate-card.glass-card {
    padding: 20px;
  }
  
  .ai-model-section {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .model-info {
    flex-direction: column;
    gap: 16px;
  }
  
  .model-stats {
    gap: 16px;
  }
  
  .stat-item {
    min-width: 60px;
    padding: 12px 16px;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .question-info {
    flex-wrap: wrap;
  }
}

.questions-preview {
  margin-top: 32px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e8f6ff;
}

.preview-header h3 {
  color: #409eff;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  background: linear-gradient(135deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #e8f6ff;
  transition: all 0.2s;
}

.question-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8f6ff;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-index {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
}

.question-points {
  color: #67c23a;
  font-weight: bold;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.question-content {
  line-height: 1.6;
}

.question-title {
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
}

.question-text {
  margin-bottom: 16px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.question-options {
  margin-bottom: 16px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
}

.option-text {
  color: #666;
  flex: 1;
}

.correct-answer {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(103, 194, 58, 0.1);
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.answer-text {
  color: #67c23a;
  font-weight: bold;
}

.question-explanation {
  padding: 8px 12px;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 6px;
  border-left: 4px solid #e6a23c;
}

.explanation-text {
  color: #e6a23c;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.el-button {
  border-radius: 8px;
  font-weight: 600;
}

.el-button[type="success"] {
  background: linear-gradient(135deg, #67c23a, #409eff);
  border: none;
  color: #fff;
}

.el-button[type="warning"] {
  background: linear-gradient(135deg, #e6a23c, #f56c6c);
  border: none;
  color: #fff;
}

.el-button[type="danger"] {
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
  border: none;
  color: #fff;
}
</style> 