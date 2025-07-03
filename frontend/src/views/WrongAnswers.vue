<template>
  <div class="wrong-answers-page">
    <el-card class="page-card">
      <template #header>
        <div class="page-header">
          <h2>错题统计</h2>
          <el-button @click="$router.go(-1)" type="primary" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <!-- 错题统计图表 -->
      <div class="chart-section">
        <h3>最近30天答题趋势</h3>
        <div v-if="statsLoading" class="loading">
          <el-spinner /> 加载统计中...
        </div>
        <div v-else ref="statsChart" style="height: 400px;"></div>
      </div>

      <el-divider />

      <!-- 错题列表 -->
      <div class="wrong-answers-section">
        <div class="section-header">
          <h3>错题列表</h3>
          <div class="stats-summary">
            <el-tag type="danger">错题总数：{{ wrongAnswersTotal }}</el-tag>
          </div>
        </div>

        <div v-if="wrongAnswersLoading" class="loading">
          <el-spinner /> 加载错题中...
        </div>
        <div v-else>
          <div v-if="wrongAnswers.length === 0" class="empty-state">
            <el-empty description="暂无错题记录" />
          </div>
          <div v-else class="wrong-answers-list">
            <div 
              v-for="item in wrongAnswers" 
              :key="item.id" 
              class="wrong-answer-item"
              @click="showAnalysis(item)"
            >
              <div class="question-header">
                <div class="question-title">{{ item.title }}</div>
                <div class="question-meta">
                  <el-tag size="small" type="danger">错题</el-tag>
                  <el-tag size="small" type="info">{{ item.category || '未分类' }}</el-tag>
                  <span class="date">{{ formatDate(item.submitted_at) }}</span>
                </div>
              </div>
              <div class="question-content">{{ item.content }}</div>
              <div class="answer-info">
                <span class="label">你的答案：</span>
                <span class="answer">{{ item.answer || '无' }}</span>
                <span class="score">得分：{{ item.score }}/{{ item.points }}</span>
              </div>
            </div>
            
            <el-pagination
              v-if="wrongAnswersTotal > 0"
              :current-page="wrongAnswersPage"
              :page-size="wrongAnswersPageSize"
              :total="wrongAnswersTotal"
              layout="total, sizes, prev, pager, next, jumper"
              :page-sizes="[5, 10, 20, 50]"
              @current-change="handleWrongAnswersPageChange"
              @size-change="handleWrongAnswersSizeChange"
              class="wrong-answers-pagination"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 错题解析弹窗 -->
    <el-dialog
      v-model="analysisDialogVisible"
      title="错题解析"
      width="80%"
      :before-close="handleAnalysisDialogClose"
    >
      <div v-if="currentAnalysis" class="analysis-content">
        <div class="question-section">
          <h4>题目内容</h4>
          <div class="question-text">{{ currentAnalysis.question.title }}</div>
          <div class="question-content">{{ currentAnalysis.question.content }}</div>
          <div v-if="currentAnalysis.question.options" class="question-options">
            <div class="options-label">选项：</div>
            <div class="options-list">
              <div v-for="(option, index) in currentAnalysis.question.options" :key="index" class="option-item">
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="answer-section">
          <h4>你的答案</h4>
          <div class="student-answer">{{ currentAnalysis.studentAnswer.answer || '无' }}</div>
          <div class="score-info">
            得分：{{ currentAnalysis.studentAnswer.score }}/{{ currentAnalysis.question.points }}
          </div>
        </div>
        
        <div class="analysis-section">
          <h4>解析</h4>
          <div class="analysis-text">{{ currentAnalysis.analysis }}</div>
        </div>

        <!-- DeepSeek AI 问答区域 -->
        <div class="ai-qa-section">
          <div class="ai-qa-header">
            <h4>
              <el-icon><Star /></el-icon>
              DeepSeek AI 智能问答
            </h4>
            <el-button 
              type="primary" 
              size="small" 
              @click="askDeepSeek"
              :loading="aiLoading"
              :disabled="!aiQuestion.trim()"
            >
              <el-icon><Star /></el-icon>
              {{ aiLoading ? 'AI思考中...' : '发送问题' }}
            </el-button>
          </div>
          
          <div class="ai-qa-input">
            <el-input
              v-model="aiQuestion"
              type="textarea"
              :rows="3"
              placeholder="向DeepSeek AI提问，例如：'这道题为什么我答错了？'、'如何避免这类错误？'、'相关知识点有哪些？'"
              maxlength="500"
              show-word-limit
            />
          </div>

          <div v-if="aiAnswer" class="ai-answer">
            <div class="ai-answer-header">
              <el-icon><Star /></el-icon>
              <span>DeepSeek AI 回答</span>
            </div>
            <div class="ai-answer-content">{{ aiAnswer }}</div>
            <div class="ai-answer-actions">
              <el-button size="small" @click="copyAnswer">
                <el-icon><CopyDocument /></el-icon>
                复制回答
              </el-button>
              <el-button size="small" @click="clearAIAnswer">
                <el-icon><Delete /></el-icon>
                清空回答
              </el-button>
            </div>
          </div>

          <!-- 预设问题快捷按钮 -->
          <div class="preset-questions">
            <div class="preset-label">快捷问题：</div>
            <div class="preset-buttons">
              <el-button 
                size="small" 
                @click="setPresetQuestion('这道题为什么我答错了？')"
                :disabled="aiLoading"
              >
                为什么答错了？
              </el-button>
              <el-button 
                size="small" 
                @click="setPresetQuestion('如何避免这类错误？')"
                :disabled="aiLoading"
              >
                如何避免错误？
              </el-button>
              <el-button 
                size="small" 
                @click="setPresetQuestion('相关知识点有哪些？')"
                :disabled="aiLoading"
              >
                相关知识点
              </el-button>
              <el-button 
                size="small" 
                @click="setPresetQuestion('这道题的解题思路是什么？')"
                :disabled="aiLoading"
              >
                解题思路
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as answersApi from '@/api/answers'
import { ArrowLeft, Star, CopyDocument, Delete } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'


// 统计相关
const statsLoading = ref(false)
const statsChart = ref()
const statsData = ref<any[]>([])
let chartInstance: echarts.ECharts | null = null

// 错题列表相关
const wrongAnswersLoading = ref(false)
const wrongAnswers = ref<any[]>([])
const wrongAnswersTotal = ref(0)
const wrongAnswersPage = ref(1)
const wrongAnswersPageSize = ref(10)

// 错题解析弹窗
const analysisDialogVisible = ref(false)
const currentAnalysis = ref<any>(null)

// DeepSeek AI 相关
const aiLoading = ref(false)
const aiQuestion = ref('')
const aiAnswer = ref('')

// 加载错题统计
const loadStats = async () => {
  statsLoading.value = true
  try {
    const response = await answersApi.getWrongAnswerStats()
    
    // API 响应拦截器已经返回了 response.data，所以直接使用 response.stats
    statsData.value = (<any>response).stats || []
    
    await nextTick()
    renderStatsChart()
  } catch (error) {
    statsData.value = []
    await nextTick()
    renderStatsChart()
  } finally {
    statsLoading.value = false
  }
}

// 渲染统计图表
const renderStatsChart = () => {
  if (!statsChart.value) {
    setTimeout(() => {
      if (statsChart.value) {
        renderStatsChart()
      }
    }, 100)
    return
  }
  
  // 销毁之前的图表实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(statsChart.value)
  
  // 如果没有数据，显示空状态
  if (!statsData.value || statsData.value.length === 0) {
    chartInstance.setOption({
      title: {
        text: '暂无答题数据',
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 16,
          color: '#999'
        }
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    })
    return
  }
  
  const dates = statsData.value.map(item => new Date(item.date).toLocaleDateString('zh-CN'))
  const correctData = statsData.value.map(item => item.correct_answers)
  const wrongData = statsData.value.map(item => item.wrong_answers)
  
  
  chartInstance.setOption({
    title: {
      text: '答题趋势分析',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params: any) {
        let result = params[0].axisValue + '<br/>'
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ': ' + param.value + '题<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['答对', '答错'],
      bottom: 10,
      textStyle: {
        fontSize: 14
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        fontSize: 12
      },
      name: '日期'
    },
    yAxis: {
      type: 'value',
      name: '题数',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '答对',
        type: 'line',
        data: correctData,
        smooth: true,
        itemStyle: { color: '#67c23a' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(128, 255, 165)'
          },
          {
            offset: 1,
            color: 'rgb(1, 191, 236)'
          }
        ])
      },
      },
      {
        name: '答错',
        type: 'line',
        data: wrongData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#f56c6c'
          },
          {
            offset: 1,
            color: 'rgb(255, 150, 0)'
          }
        ])
      },
      }
    ]
  })
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

// 加载错题列表
const loadWrongAnswers = async () => {
  wrongAnswersLoading.value = true
  try {
    const response = await answersApi.getWrongAnswers({
      page: wrongAnswersPage.value,
      pageSize: wrongAnswersPageSize.value
    })
    
    // API 响应拦截器已经返回了 response.data
    wrongAnswers.value = (<any>response).wrongAnswers || []
    wrongAnswersTotal.value = (<any>response).total || 0
  } catch (error) {
    console.error('Failed to load wrong answers:', error)
    wrongAnswers.value = []
    wrongAnswersTotal.value = 0
  } finally {
    wrongAnswersLoading.value = false
  }
}

// 错题分页
const handleWrongAnswersPageChange = (page: number) => {
  wrongAnswersPage.value = page
  loadWrongAnswers()
}

const handleWrongAnswersSizeChange = (size: number) => {
  wrongAnswersPageSize.value = size
  wrongAnswersPage.value = 1
  loadWrongAnswers()
}

// 显示错题解析
const showAnalysis = async (item: any) => {
  try {
    const response = await answersApi.getQuestionAnalysis(item.question_id)
    currentAnalysis.value = response
    analysisDialogVisible.value = true
  } catch (error) {
    console.error('Failed to load analysis:', error)
  }
}

// 关闭解析弹窗
const handleAnalysisDialogClose = () => {
  analysisDialogVisible.value = false
  currentAnalysis.value = null
  aiQuestion.value = ''
  aiAnswer.value = ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// DeepSeek AI 相关
const askDeepSeek = async () => {
  if (!aiQuestion.value.trim() || !currentAnalysis.value) {
    return;
  }
  
  aiLoading.value = true;
  try {
    const context = {
      questionTitle: currentAnalysis.value.question.title,
      questionContent: currentAnalysis.value.question.content,
      studentAnswer: currentAnalysis.value.studentAnswer.answer,
      correctAnswer: currentAnalysis.value.question.correct_answer,
      analysis: currentAnalysis.value.analysis
    };
    
    const response = await answersApi.askDeepSeek(aiQuestion.value, context);
    aiAnswer.value = response;
  } catch (error) {
    console.error('Failed to ask DeepSeek:', error);
    ElMessage.error('AI服务暂时不可用，请稍后重试');
  } finally {
    aiLoading.value = false;
  }
}

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(aiAnswer.value);
    ElMessage.success('回答已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败，请手动复制');
  }
}

const clearAIAnswer = () => {
  aiAnswer.value = '';
}

const setPresetQuestion = (question: string) => {
  aiQuestion.value = question;
}

onMounted(async () => {
  await nextTick()
  loadStats()
  loadWrongAnswers()
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style scoped>
.wrong-answers-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-card {
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  border-radius: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.chart-section {
  margin-bottom: 40px;
}

.chart-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.wrong-answers-section {
  margin-top: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.stats-summary {
  display: flex;
  gap: 12px;
}

.empty-state {
  padding: 60px 0;
}

.wrong-answers-list {
  margin-top: 16px;
}

.wrong-answer-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.wrong-answer-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.question-title {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  flex: 1;
  margin-right: 16px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.date {
  color: #999;
  font-size: 12px;
}

.question-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 14px;
}

.answer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 6px;
}

.label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.answer {
  color: #f56c6c;
  font-weight: 600;
}

.score {
  color: #e6a23c;
  font-weight: 500;
  margin-left: auto;
}

.wrong-answers-pagination {
  margin-top: 32px;
  text-align: center;
}

.analysis-content {
  max-height: 600px;
  overflow-y: auto;
}

.question-section,
.answer-section,
.analysis-section {
  margin-bottom: 32px;
}

.question-section h4,
.answer-section h4,
.analysis-section h4 {
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.question-text {
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  font-size: 16px;
}

.question-content {
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}

.question-options {
  margin-top: 16px;
}

.options-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #666;
}

.student-answer {
  color: #f56c6c;
  font-weight: 600;
  padding: 12px 16px;
  background: #fef0f0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.score-info {
  color: #e6a23c;
  font-weight: 500;
  font-size: 14px;
}

.analysis-text {
  color: #666;
  line-height: 1.8;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.ai-qa-section {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafd 0%, #e8f6ff 100%);
  border-radius: 12px;
  border: 2px solid #e8f6ff;
}

.ai-qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ai-qa-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-qa-header h4 .el-icon {
  color: #667eea;
  font-size: 18px;
}

.ai-qa-input {
  margin-bottom: 16px;
}

.ai-qa-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e8f6ff;
  transition: all 0.3s ease;
}

.ai-qa-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.ai-answer {
  margin-top: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.ai-answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.ai-answer-content {
  color: #333;
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.6);
  padding: 12px;
  border-radius: 8px;
}

.ai-answer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.preset-questions {
  margin-top: 20px;
}

.preset-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  font-size: 14px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-buttons .el-button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e8f6ff;
  color: #667eea;
  transition: all 0.3s ease;
}

.preset-buttons .el-button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.preset-buttons .el-button:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style> 