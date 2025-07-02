<template>
  <el-card class="exam-card">
    <div class="exam-header">
      <h2>答题</h2>
      <div v-if="questions.length" class="progress-bar">
        <el-progress :percentage="progressPercent" :show-text="false" stroke-width="10" color="#409eff" />
        <span class="progress-text">第{{ currentIndex + 1 }}/{{ questions.length }}题</span>
      </div>
    </div>
    <div v-if="loading" class="loading"><el-spinner /> 题目加载中...</div>
    <div v-else>
      <el-form v-if="questions.length" @submit.prevent>
        <div v-for="(q, idx) in questions" :key="q.id" class="question-block" :class="{ active: idx === currentIndex }" v-show="idx === currentIndex">
          <div class="question-title">
            <b>第{{ idx + 1 }}题：</b>{{ q.title }}
            <el-tag size="small" style="margin-left:8px">{{ q.category }}</el-tag>
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
      <el-dialog v-model="analysisDialog.visible" title="题目解析" width="500px" class="analysis-dialog">
        <div v-if="analysisDialog.content" class="analysis-content">{{ analysisDialog.content }}</div>
        <div v-else>暂无解析</div>
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
import { getRandomQuestions } from '@/api/questions';
import { submitBatchAnswers } from '@/api/answers';
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

onMounted(async () => {
  loading.value = true;
  const { category, count } = route.query;
  const res = await getRandomQuestions({ category, count });
  if (res && res.questions) {
    questions.value = res.questions.map((q: any) => ({
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
    if (res && res.results) {
      res.results.forEach((r: any) => {
        results[r.question_id] = r;
      });
      totalScore.value = res.totalScore;
      totalPoints.value = res.totalPoints;
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
  analysisDialog.content = res?.analysis || '暂无解析';
  analysisDialog.visible = true;
}

function goRanking() {
  router.replace({ name: 'Ranking', query: { category: route.query.category } });
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
}
</style> 