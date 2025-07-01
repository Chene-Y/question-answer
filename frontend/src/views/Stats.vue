<template>
  <div class="stats-page">
    <el-card class="stats-card">
      <h2>{{ isTeacher ? '题目统计' : '答题统计' }}</h2>
      <div v-if="loading" class="loading"><el-spinner /> 统计加载中...</div>
      <div v-else>
        <template v-if="isTeacher">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="总题目数" :value="stats.totalQuestions" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="题型数" :value="stats.typeCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="题目总分" :value="stats.totalPoints" />
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 32px">
            <el-col :span="12">
              <div ref="categoryChart" style="height: 300px;" />
            </el-col>
            <el-col :span="12">
              <div ref="categoryScoreChart" style="height: 300px;" />
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="已答题数" :value="stats.totalAnswered" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="正确数" :value="stats.correctAnswers" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="总得分" :value="stats.totalScore" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="总分" :value="stats.totalPossible" />
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 32px">
            <el-col :span="12">
              <el-statistic title="正确率" :value="stats.accuracy" suffix="%" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="得分率" :value="stats.percentage" suffix="%" />
            </el-col>
          </el-row>
          <el-row style="margin-top: 32px">
            <el-col :span="24">
              <div ref="answerPieChart" style="height: 320px;" />
            </el-col>
          </el-row>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { getQuestions } from '@/api/questions';
import { getStudentStats } from '@/api/answers';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

const userStore = useUserStore();
const isTeacher = userStore.isTeacher;
const isStudent = userStore.isStudent;

const loading = ref(true);
const stats = ref<any>({});
const questions = ref<any[]>([]);
const categoryChart = ref();
const categoryScoreChart = ref();
const answerPieChart = ref();

onMounted(async () => {
  loading.value = true;
  if (isTeacher) {
    const res = await getQuestions({page: 1, pageSize: 10000});
    if (res && res.questions) {
      questions.value = res.questions;
      calcStats();
    } else {
      ElMessage.error('获取题目失败');
    }
    loading.value = false;
    await nextTick();
    renderCharts();
  } else {
    const res = await getStudentStats();
    if (res && res.stats) {
      stats.value = res.stats;
    } else {
      ElMessage.error('获取答题统计失败');
    }
    loading.value = false;
    await nextTick();
    renderAnswerPie();
  }
});

function calcStats() {
  const qs = questions.value;
  stats.value.totalQuestions = qs.length;
  stats.value.typeCount = new Set(qs.map((q: any) => q.category)).size;
  stats.value.totalPoints = qs.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
}

function renderCharts() {
  // 按类别题目量
  const catMap: Record<string, number> = {};
  // 按教师题目量
  const teacherMap: Record<string, number> = {};
  questions.value.forEach(q => {
    if (q.category) {
      catMap[q.category] = (catMap[q.category] || 0) + 1;
    }
    if (q.created_by_name) {
      teacherMap[q.created_by_name] = (teacherMap[q.created_by_name] || 0) + 1;
    }
  });
  const catData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
  const teacherData = Object.keys(teacherMap).map(k => ({ name: k, value: teacherMap[k] }));
  const catChart = echarts.init(categoryChart.value);
  catChart.setOption({
    title: { text: '按类别题目量', left: 'center' },
    tooltip: {},
    series: [{ type: 'pie', data: catData }]
  });
  const teacherChart = echarts.init(categoryScoreChart.value);
  teacherChart.setOption({
    title: { text: '按教师题目量', left: 'center' },
    tooltip: {},
    series: [{ type: 'pie', data: teacherData }]
  });
}

function renderAnswerPie() {
  if (!answerPieChart.value) return;
  const data = [
    { value: stats.value.correctAnswers || 0, name: '答对' },
    { value: (stats.value.totalAnswered || 0) - (stats.value.correctAnswers || 0), name: '答错' }
  ];
  const chart = echarts.init(answerPieChart.value);
  chart.setOption({
    title: { text: '答题正确/错误分布', left: 'center' },
    tooltip: {},
    legend: { bottom: 10, left: 'center' },
    series: [{ type: 'pie', data }]
  });
}
</script>

<style scoped>
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-icon.success {
  background: #67c23a;
}

.stat-icon.warning {
  background: #e6a23c;
}

.stat-icon.primary {
  background: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.progress-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-label {
  width: 120px;
  font-weight: 500;
  color: #333;
}

.progress-item .el-progress {
  flex: 1;
}

.stats-card {
  max-width: 900px;
  margin: 40px auto;
  padding: 32px 24px;
}
.loading {
  text-align: center;
  margin: 40px 0;
}
</style> 