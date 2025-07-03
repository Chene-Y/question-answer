<template>
  <el-card class="exam-card">
    <div class="exam-header">
      <h2>答题</h2>
      <div v-if="questions.length" class="progress-bar">
        <el-progress :percentage="progressPercent" :show-text="false" :stroke-width="10" color="#409eff" />
        <span class="progress-text">第{{ currentIndex + 1 }}/{{ questions.length }}题</span>
      </div>
    </div>
    <div v-if="loading" class="loading"><el-spinner /> 题目加载中...</div>
    <div v-else>
      <el-form v-if="questions.length" @submit.prevent>
        <div v-for="(q, idx) in questions" :key="q.id" class="question-block" :class="{ active: idx === currentIndex }" v-show="idx === currentIndex">
          <div class="question-title">
            <b>第{{ idx + 1 }}题：</b>{{ q.title }}
            <el-tag size="small" style="margin:0 8px">{{ q.category }}</el-tag>
            <el-tag size="small" type="info">{{ q.difficulty }}</el-tag>
          </div>
          <div class="question-content">{{ q.content }}</div>
          <div v-if="q.question_type === 'multiple_choice'">
            <el-radio-group v-model="answers[q.id]">
              <el-radio v-for="(opt, i) in q.options" :key="i" :label="opt" class="option-radio">{{ opt }}</el-radio>
            </el-radio-group>
          </div>
          <div v-else-if="q.question_type === 'true_false'">
            <el-radio-group v-model="answers[q.id]">
              <el-radio label="True" class="option-radio">正确</el-radio>
              <el-radio label="False" class="option-radio">错误</el-radio>
            </el-radio-group>
          </div>
          <div v-else>
            <el-input v-model="answers[q.id]" placeholder="请输入答案" />
          </div>
          <div v-if="results[q.id]">
            <el-alert :title="results[q.id].correct ? '回答正确' : '回答错误'" :type="results[q.id].correct ? 'success' : 'error'" show-icon class="result-alert" />
            <el-button size="small" @click="showAnalysis(q.id)" class="analysis-btn">查看解析</el-button>
          </div>
        </div>
        <div class="exam-actions">
          <el-button type="primary" @click="prevQuestion" :disabled="currentIndex === 0">上一题</el-button>
          <el-button type="primary" @click="nextQuestion" :disabled="currentIndex === questions.length - 1">下一题</el-button>
          <el-button type="success" @click="submit" :disabled="!canSubmit" class="submit-btn">提交全部答案</el-button>
          <el-button type="primary" @click="goRanking" v-if="submitted" class="submit-btn">查看区域排名</el-button>
        </div>
      </el-form>
      <div v-else>暂无题目</div>
      <el-dialog v-model="analysisDialog.visible" title="题目解析" width="700px" class="analysis-dialog">
        <div class="analysis-container">
          <div class="analysis-section">
            <h4>题目解析</h4>
            <div v-if="analysisDialog.content" class="analysis-content">{{ analysisDialog.content }}</div>
            <div v-else>暂无解析</div>
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
                @click="askDeepSeekQuestion"
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
                placeholder="向DeepSeek AI提问，例如：'这道题的解题思路是什么？'、'相关知识点有哪些？'、'如何避免这类错误？'"
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
                  @click="setPresetQuestion('这道题的解题思路是什么？')"
                  :disabled="aiLoading"
                >
                  解题思路
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
                  @click="setPresetQuestion('如何避免这类错误？')"
                  :disabled="aiLoading"
                >
                  如何避免错误？
                </el-button>
                <el-button 
                  size="small" 
                  @click="setPresetQuestion('这道题的难点在哪里？')"
                  :disabled="aiLoading"
                >
                  难点分析
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
      <div v-if="submitted" icon="none" class="exam-result">
          <div class="question-status">
            <div class="status-dots">
              <div 
                v-for="(q, idx) in questions" 
                :key="q.id"
                class="status-dot"
                :class="{ 
                  'correct': results[q.id] && results[q.id].correct,
                  'wrong': results[q.id] && !results[q.id].correct,
                  'current': idx === currentIndex
                }"
                @click="jumpToQuestion(idx)"
                :title="`第${idx + 1}题: ${results[q.id] && results[q.id].correct ? '正确' : '错误'}`"
              >
                {{ idx + 1 }}
              </div>
            </div>
          </div>
          <div class="result-summary">
            <div>总分：{{ totalScore }} / {{ totalPoints }}</div>
            <div>正确率：{{ correctRate }}%</div>
            <div>错题数：{{ wrongCount }}</div>
          </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star, CopyDocument, Delete } from '@element-plus/icons-vue';
import { getRandomQuestions } from '@/api/questions';
import { submitBatchAnswers, askDeepSeek } from '@/api/answers';
import { getQuestionAnalysis } from '@/api/answers';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const questions = ref<any[]>([]);
const answers = reactive<Record<number, string>>({});
const results = reactive<Record<number, any>>({});
const submitted = ref(false);
const totalScore = ref(0);
const totalPoints = ref(0);
const analysisDialog = reactive({ visible: false, content: '' });
const currentIndex = ref(0);

// AI问答相关
const aiQuestion = ref('');
const aiAnswer = ref('');
const aiLoading = ref(false);

onMounted(async () => {
  loading.value = true;
  const { category, count } = route.query;
  const res = await getRandomQuestions({ category: category as string, count: count as unknown as number });
  if (res && (<any>res).questions) {
    questions.value = (<any>res).questions.map((q: any) => ({
      ...q,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
    }));
  } else {
    ElMessage.error('获取题目失败');
  }
  loading.value = false;
});

const progressPercent = computed(() => {
  if (!questions.value.length) return 0;
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100);
});

const correctRate = computed(() => {
  if (!submitted.value || !questions.value.length) return 0;
  const correct = Object.values(results).filter(r => r.correct).length;
  return Math.round((correct / questions.value.length) * 100);
});

const wrongCount = computed(() => {
  if (!submitted.value) return 0;
  return Object.values(results).filter(r => !r.correct).length;
});

const canSubmit = computed(() => {
  if (submitted.value) return false;
  return questions.value.every(q => answers[q.id] && answers[q.id].trim() !== '');
});

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++;
}

function jumpToQuestion(index: number) {
  currentIndex.value = index;
}

async function submit() {
  if (submitted.value || !canSubmit.value) {
    if (!canSubmit.value) {
      ElMessage.warning('请答完所有题目后再提交');
    }
    return;
  }
  
  const answerArr = questions.value.map(q => ({
    question_id: q.id,
    answer: answers[q.id] || ''
  }));
  
  try {
    const res = await submitBatchAnswers({ answers: answerArr });
    if (res && (<any>res).results) {
      (<any>res).results.forEach((r: any) => {
        results[r.question_id] = r;
      });
      totalScore.value = (<any>res).totalScore;
      totalPoints.value = (<any>res).totalPoints;
      submitted.value = true;
      ElMessage.success('答题完成！');
    } else {
      ElMessage.error('提交失败');
    }
  } catch (error) {
    ElMessage.error('提交失败');
  }
}

async function showAnalysis(qid: number) {
  const res = await getQuestionAnalysis(qid);
  analysisDialog.content = (<any>res)?.analysis || '暂无解析';
  analysisDialog.visible = true;
}

function goRanking() {
  router.replace({ name: 'Ranking', query: { category: route.query.category } });
}

// AI问答相关方法
const askDeepSeekQuestion = async () => {
  if (!aiQuestion.value.trim() || !questions.value[currentIndex.value]) return

  aiLoading.value = true
  try {
    const currentQuestion = questions.value[currentIndex.value]
    const context = {
      questionTitle: currentQuestion.title,
      questionContent: currentQuestion.content
    }
    const response = await askDeepSeek(aiQuestion.value, context)
    aiAnswer.value = response
    ElMessage.success('AI回答已生成')
  } catch (error: any) {
    ElMessage.error('AI回答生成失败，请稍后重试')
  } finally {
    aiLoading.value = false
  }
}

const setPresetQuestion = (question: string) => {
  aiQuestion.value = question
}

const copyAnswer = async () => {
  if (!aiAnswer.value) return
  
  try {
    await navigator.clipboard.writeText(aiAnswer.value)
    ElMessage.success('回答已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearAIAnswer = () => {
  aiAnswer.value = ''
  aiQuestion.value = ''
}
</script>

<style scoped>
.exam-card {
  max-width: 700px;
  margin: 40px auto;
  padding: 32px 24px;
  background: rgba(255,255,255,0.98);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.08);
  border: none;
}
.exam-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 24px;
}
.progress-bar {
  width: 100%;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.progress-text {
  font-size: 14px;
  color: #409eff;
  font-weight: 600;
}
.question-block {
  background: #f8fafd;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.08);
  padding: 24px 20px 16px 20px;
  margin-bottom: 32px;
  border: 1px solid #e4e7ed;
  transition: box-shadow 0.2s;
}
.question-block.active {
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.18);
  border-color: #409eff;
}
.question-title {
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2c3e50;
}
.question-content {
  color: #666;
  margin-bottom: 16px;
  font-size: 15px;
}
.option-radio {
  margin: 8px 0 8px 24px;
  min-width: 120px;
  font-size: 15px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.el-radio__input.is-checked + .el-radio__label {
  color: #409eff !important;
  font-weight: bold;
}
.el-radio__input.is-checked .el-radio__inner {
  border-color: #409eff !important;
  background: #409eff !important;
}
.result-alert {
  margin: 16px 0 8px 0;
}
.analysis-btn {
  margin-left: 8px;
}
.exam-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
.submit-btn {
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border: none;
}
.submit-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}
.analysis-dialog >>> .el-dialog__body {
  background: #f8fafd;
  border-radius: 12px;
}
.analysis-content {
  font-size: 15px;
  color: #333;
  padding: 12px 0;
}
.exam-result {
  margin-top: 32px;
  text-align: center;
}
.result-summary {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}
.question-status {
  margin: 20px 0;
  text-align: center;
}
.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}
.status-dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 500px;
  margin: 0 auto;
}
.status-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #c0c4cc;
}
.status-dot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.status-dot.correct {
  background: #67c23a;
}
.status-dot.wrong {
  background: #f56c6c;
}
.status-dot.current {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}
.ranking-btn {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border: none;
}
.loading {
  text-align: center;
  margin: 40px 0;
}

/* AI问答相关样式 */
.analysis-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #409eff;
  font-weight: 600;
}

.ai-qa-section {
  padding: 16px;
  background: linear-gradient(90deg, #e8f6ff 0%, #f3ffe6 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px #409eff11;
}

.ai-qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ai-qa-header h4 {
  margin: 0;
  font-size: 16px;
  color: #409eff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-qa-input {
  margin-bottom: 16px;
}

.ai-answer {
  margin-bottom: 16px;
  padding: 12px;
  background: linear-gradient(90deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 10px;
  box-shadow: 0 1px 4px #409eff0a;
}

.ai-answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #409eff;
}

.ai-answer-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #333;
}

.ai-answer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.preset-questions {
  margin-top: 16px;
}

.preset-label {
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 600px) {
  .exam-card {
    padding: 12px 4px;
  }
  .question-block {
    padding: 12px 8px 8px 8px;
  }
  .exam-header h2 {
    font-size: 20px;
  }
  .status-dots {
    gap: 6px;
  }
  .status-dot {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  
  /* 移动端AI问答样式调整 */
  .ai-qa-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .preset-buttons {
    flex-direction: column;
  }
  
  .preset-buttons .el-button {
    width: 100%;
  }
}
</style> 