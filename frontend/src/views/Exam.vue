<template>
  <el-card class="exam-card">
    <h2>答题</h2>
    <div v-if="loading" class="loading"><el-spinner /> 题目加载中...</div>
    <div v-else>
      <el-form v-if="questions.length" @submit.prevent>
        <div v-for="(q, idx) in questions" :key="q.id" class="question-block">
          <div class="question-title">
            <b>第{{ idx + 1 }}题：</b>{{ q.title }}
            <el-tag size="small" style="margin-left:8px">{{ q.category }}</el-tag>
            <el-tag size="small" type="info">{{ q.difficulty }}</el-tag>
          </div>
          <div class="question-content">{{ q.content }}</div>
          <div v-if="q.question_type === 'multiple_choice'">
            <el-radio-group v-model="answers[q.id]">
              <el-radio v-for="(opt, i) in q.options" :key="i" :label="opt">{{ opt }}</el-radio>
            </el-radio-group>
          </div>
          <div v-else-if="q.question_type === 'true_false'">
            <el-radio-group v-model="answers[q.id]">
              <el-radio label="True">正确</el-radio>
              <el-radio label="False">错误</el-radio>
            </el-radio-group>
          </div>
          <div v-else>
            <el-input v-model="answers[q.id]" placeholder="请输入答案" />
          </div>
          <div v-if="results[q.id]">
            <el-alert :title="results[q.id].correct ? '回答正确' : '回答错误'" :type="results[q.id].correct ? 'success' : 'error'" show-icon />
            <el-button size="small" @click="showAnalysis(q.id)">查看解析</el-button>
          </div>
        </div>
        <el-form-item>
          <el-button type="primary" @click="submit" :disabled="submitted">提交答案</el-button>
        </el-form-item>
      </el-form>
      <div v-else>暂无题目</div>
      <el-dialog v-model="analysisDialog.visible" title="题目解析" width="500px">
        <div v-if="analysisDialog.content">{{ analysisDialog.content }}</div>
        <div v-else>暂无解析</div>
      </el-dialog>
      <el-result v-if="submitted" icon="success" title="答题完成">
        <template #sub-title>
          <div>总分：{{ totalScore }} / {{ totalPoints }}</div>
          <el-button type="primary" @click="goRanking">查看局域网排名</el-button>
        </template>
      </el-result>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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

async function submit() {
  if (submitted.value) return;
  const answerArr = questions.value.map(q => ({
    question_id: q.id,
    answer: answers[q.id] || ''
  }));
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
}

async function showAnalysis(qid: number) {
  const res = await getQuestionAnalysis(qid);
  analysisDialog.content = res?.analysis || '暂无解析';
  analysisDialog.visible = true;
}

function goRanking() {
  router.push({ name: 'Ranking', query: { category: route.query.category } });
}
</script>

<style scoped>
.exam-card {
  max-width: 700px;
  margin: 40px auto;
  padding: 32px 24px;
}
.question-block {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.question-title {
  font-size: 16px;
  margin-bottom: 8px;
}
.loading {
  text-align: center;
  margin: 40px 0;
}
</style> 