<template>
  <div class="stats-page">
    <el-card class="stats-card">
      <template #header>
        <div class="page-header">
          <div class="header-content">
            <h2>{{ isTeacher ? '📊 题目统计' : '📈 答题统计' }}</h2>
            <p>{{ isTeacher ? '查看题目库的整体情况' : '查看你的学习进度和表现' }}</p>
          </div>
          <el-button @click="goBack" type="primary" plain class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>统计加载中...</p>
      </div>
      
      <div v-else>
        <!-- 教师端统计 -->
        <template v-if="isTeacher">
          <!-- 概览卡片 -->
          <div class="stats-overview">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon primary">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalQuestions }}</div>
                    <div class="stat-label">总题目数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon success">
                    <el-icon><Collection /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.categoryCount }}</div>
                    <div class="stat-label">题目类别</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.teacherCount }}</div>
                    <div class="stat-label">参与教师</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon info">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalPoints }}</div>
                    <div class="stat-label">题目总分</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 图表区域 -->
          <div class="charts-section">
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>📋 按类别题目分布</h3>
                  </div>
                  <div ref="categoryChart" style="height: 300px;"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>👨‍🏫 按教师题目分布</h3>
                  </div>
                  <div ref="teacherChart" style="height: 300px;"></div>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="24" style="margin-top: 24px;">
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>📊 题目难度分布</h3>
                  </div>
                  <div ref="difficultyChart" style="height: 300px;"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>📝 题目类型分布</h3>
                  </div>
                  <div ref="typeChart" style="height: 300px;"></div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 详细统计表格 -->
          <div class="detailed-stats">
            <div class="section-title">
              <h3>📋 详细统计</h3>
            </div>
            <el-table :data="detailedStats" style="width: 100%" class="stats-table">
              <el-table-column prop="category" label="类别" />
              <el-table-column prop="count" label="题目数量" />
              <el-table-column prop="totalPoints" label="总分" />
              <el-table-column prop="avgPoints" label="平均分" />
              <el-table-column prop="difficulty" label="难度分布" width="320">
                <template #default="scope">
                  <el-tag style="margin-right: 5px;" v-for="difficulty in Object.keys(scope.row.difficulties)" :key="difficulty" :type="getDifficultyType(difficulty)">
                    {{ difficulty === 'easy' ? '简单' : difficulty === 'hard' ? '困难' : '中等' }}：{{ scope.row.difficulties[difficulty] }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <!-- 学生端统计 -->
        <template v-else>
          <!-- 概览卡片 -->
          <div class="stats-overview">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon primary">
                    <el-icon><EditPen /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalAnswered }}</div>
                    <div class="stat-label">已答题数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon success">
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.correctAnswers }}</div>
                    <div class="stat-label">正确答题</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <el-icon><Trophy /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalScore }}</div>
                    <div class="stat-label">总得分</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-icon info">
                    <el-icon><Aim /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalPossible }}</div>
                    <div class="stat-label">总分</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 进度指标 -->
          <div class="progress-section">
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="progress-card">
                  <div class="progress-header">
                    <h3>🎯 正确率</h3>
                    <span class="progress-value">{{ stats.accuracy.toFixed(2) }}%</span>
                  </div>
                  <el-progress 
                    :percentage="stats.accuracy" 
                    :color="getProgressColor(stats.accuracy)"
                    :stroke-width="12"
                    :show-text="false"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="progress-card">
                  <div class="progress-header">
                    <h3>📊 得分率</h3>
                    <span class="progress-value">{{ stats.percentage.toFixed(2) }}%</span>
                  </div>
                  <el-progress 
                    :percentage="stats.percentage" 
                    :color="getProgressColor(stats.percentage)"
                    :stroke-width="12"
                    :show-text="false"
                  />
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 图表区域 -->
          <div class="charts-section">
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>📈 答题分布</h3>
                  </div>
                  <div ref="answerPieChart" style="height: 300px;"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-header">
                    <h3>📋 按类别答题情况</h3>
                  </div>
                  <div ref="categoryAnswerChart" style="height: 300px;"></div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 学习建议 -->
          <div class="suggestions-section">
            <div class="section-title">
              <h3>💡 学习建议</h3>
            </div>
            <div class="suggestions">
              <div v-for="(suggestion, index) in learningSuggestions" :key="index" class="suggestion-item">
                <div class="suggestion-icon">{{ suggestion.icon }}</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">{{ suggestion.title }}</div>
                  <div class="suggestion-desc">{{ suggestion.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getQuestions } from '@/api/questions';
import { getStudentStats, getCategoryAnswerStats } from '@/api/answers';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Document, Collection, User, Star, EditPen, CircleCheck, Trophy, Aim } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const router = useRouter();
const userStore = useUserStore();
const isTeacher = userStore.isTeacher;
const isStudent = userStore.isStudent;

const loading = ref(true);
const stats = ref<any>({});
const questions = ref<any[]>([]);
const detailedStats = ref<any[]>([]);
const categoryAnswerStats = ref<any[]>([]);

// 图表引用
const categoryChart = ref();
const teacherChart = ref();
const difficultyChart = ref();
const typeChart = ref();
const answerPieChart = ref();
const categoryAnswerChart = ref();

onMounted(async () => {
  loading.value = true;
  try {
    if (isTeacher) {
      await loadTeacherStats();
    } else {
      await loadStudentStats();
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  } finally {
    loading.value = false;
  }
});

async function loadTeacherStats() {
  const res = await getQuestions({ page: 1, pageSize: 10000 });
  if (res && res.questions) {
    questions.value = res.questions;
    calcTeacherStats();
    await nextTick();
    setTimeout(() => {
      renderTeacherCharts();
    }, 100)
  } else {
    ElMessage.error('获取题目失败');
  }
}

async function loadStudentStats() {
  const res = await getStudentStats();
  if (res && res.stats) {
    stats.value = res.stats;
    // 获取类别答题统计
    const catRes = await getCategoryAnswerStats();
    if (catRes && catRes.stats) {
      categoryAnswerStats.value = catRes.stats;
    }
    await nextTick();
    setTimeout(() => {
      renderStudentCharts();
    }, 100)
  } else {
    ElMessage.error('获取答题统计失败');
  }
}

function calcTeacherStats() {
  const qs = questions.value;
  
  // 基础统计
  stats.value.totalQuestions = qs.length;
  stats.value.categoryCount = new Set(qs.map((q: any) => q.category)).size;
  stats.value.teacherCount = new Set(qs.map((q: any) => q.created_by_name)).size;
  stats.value.totalPoints = qs.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
  
  // 详细统计
  const categoryStats: Record<string, any> = {};
  qs.forEach((q: any) => {
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = {
        category: q.category,
        count: 0,
        totalPoints: 0,
        difficulties: { easy: 0, medium: 0, hard: 0 }
      };
    }
    categoryStats[q.category].count++;
    categoryStats[q.category].totalPoints += q.points || 0;
    
    const difficulty = q.difficulty?.toLowerCase() || 'medium';
    if (difficulty.includes('简单') || difficulty.includes('easy')) {
      categoryStats[q.category].difficulties.easy++;
    } else if (difficulty.includes('困难') || difficulty.includes('hard')) {
      categoryStats[q.category].difficulties.hard++;
    } else {
      categoryStats[q.category].difficulties.medium++;
    }
  });
  
  detailedStats.value = Object.values(categoryStats).map((stat: any) => ({
    ...stat,
    avgPoints: Math.round(stat.totalPoints / stat.count * 100) / 100,
    difficulty: `简单：${stat.difficulties.easy}  中等：${stat.difficulties.medium}  困难：${stat.difficulties.hard}`
  }));
}

function renderTeacherCharts() {
  // 按类别题目量
  const catMap: Record<string, number> = {};
  const teacherMap: Record<string, number> = {};
  const difficultyMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};
  
  questions.value.forEach(q => {
    // 类别统计
    if (q.category) {
      catMap[q.category] = (catMap[q.category] || 0) + 1;
    }
    
    // 教师统计
    if (q.created_by_name) {
      teacherMap[q.created_by_name] = (teacherMap[q.created_by_name] || 0) + 1;
    }
    
    // 难度统计
    const difficulty = q.difficulty?.toLowerCase() || '中等';
    if (difficulty.includes('简单') || difficulty.includes('easy')) {
      difficultyMap['简单'] = (difficultyMap['简单'] || 0) + 1;
    } else if (difficulty.includes('困难') || difficulty.includes('hard')) {
      difficultyMap['困难'] = (difficultyMap['困难'] || 0) + 1;
    } else {
      difficultyMap['中等'] = (difficultyMap['中等'] || 0) + 1;
    }
    
    // 题型统计
    const type = q.question_type === 'multiple_choice' ? '选择题' : q.question_type === 'true_false' ? '判断题' : q.question_type === 'short_answer' ? '简答题' :  q.question_type === 'essay' ? '论述题' : '其他';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  
  // 渲染图表
  renderPieChart(categoryChart.value, '按类别题目分布', catMap);
  renderPieChart(teacherChart.value, '按教师题目分布', teacherMap);
  renderPieChart(difficultyChart.value, '题目难度分布', difficultyMap);
  renderPieChart(typeChart.value, '题目类型分布', typeMap);
}

function renderStudentCharts() {
  // 答题分布饼图
  const answerData = [
    { value: stats.value.correctAnswers || 0, name: '答对', itemStyle: { color: '#67c23a' } },
    { value: (stats.value.totalAnswered || 0) - (stats.value.correctAnswers || 0), name: '答错', itemStyle: { color: '#f56c6c' } }
  ];
  renderPieChart(answerPieChart.value, '答题分布', null, answerData);
  // 按类别答题情况（真实数据）
  const categoryAnswerData = categoryAnswerStats.value.map((item: any) => ({
    name: item.category || '未分类',
    correct: Number(item.correct),
    total: Number(item.total)
  }));
  renderBarChart(categoryAnswerChart.value, '按类别答题情况', categoryAnswerData);
}

function renderPieChart(element: any, title: string, dataMap: any, customData?: any[]) {
  if (!element) return;
  
  const data = customData || Object.keys(dataMap || {}).map(k => ({ 
    name: k, 
    value: dataMap[k],
    itemStyle: { color: getRandomColor() }
  }));
  
  const chart = echarts.init(element);
  chart.setOption({
    title: { 
      text: title, 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: { 
      bottom: 10, 
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    
    series: [{ 
      type: 'pie', 
      data,
      radius: ['30%', '60%'],
      center: ['50%', '50%'],
      label: {
        show: true,
        formatter: '{b}: {c}'
      }
    }]
  });
}

function renderBarChart(element: any, title: string, data: any[]) {
  if (!element) return;
  
  const chart = echarts.init(element);
  chart.setOption({
    title: { 
      text: title, 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { 
      bottom: 10, 
      left: 'center' 
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '答对',
        type: 'bar',
        data: data.map(d => d.correct),
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '总数',
        type: 'bar',
        data: data.map(d => d.total),
        itemStyle: { color: '#409eff' }
      }
    ]
  });
}

function getProgressColor(percentage: number) {
  if (percentage >= 90) return '#67c23a';
  if (percentage >= 80) return '#e6a23c';
  if (percentage >= 70) return '#f56c6c';
  return '#909399';
}

function getRandomColor() {
  // 生成亮色系的随机十六进制颜色
  // H: 0~360, S: 60~100%, L: 60~80%
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 40) + 60;
  const l = Math.floor(Math.random() * 20) + 60;
  // HSL转RGB
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return hslToHex(h, s, l);
}

const learningSuggestions = computed(() => {
  const suggestions = [];
  
  if (stats.value.accuracy < 70) {
    suggestions.push({
      icon: '📚',
      title: '加强基础知识',
      desc: '建议多复习基础知识，提高答题准确率'
    });
  }
  
  if (stats.value.totalAnswered < 20) {
    suggestions.push({
      icon: '🎯',
      title: '增加练习量',
      desc: '多做题可以提高答题速度和准确率'
    });
  }
  
  if (stats.value.percentage < 80) {
    suggestions.push({
      icon: '💡',
      title: '注意答题技巧',
      desc: '仔细审题，注意答题格式和要求'
    });
  }
  
  if (suggestions.length === 0) {
    suggestions.push({
      icon: '🎉',
      title: '表现优秀',
      desc: '继续保持，你的学习表现很棒！'
    });
  }
  
  return suggestions;
});

function goBack() {
  router.back();
}

function getDifficultyType(difficulty: string) {
  if (difficulty.includes('简单') || difficulty.includes('easy')) return 'success';
  if (difficulty.includes('困难') || difficulty.includes('hard')) return 'danger';
  return 'warning';
}
</script>

<style scoped>
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.header-content p {
  margin: 8px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.back-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.loading-container {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.loading-container p {
  margin-top: 16px;
  font-size: 16px;
}

.stats-overview {
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafd, #e9ecef);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.info {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.progress-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 360px;
}

.chart-header {
  margin-bottom: 16px;
  text-align: center;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.detailed-stats {
  margin-bottom: 32px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.stats-table {
  border-radius: 8px;
  overflow: hidden;
}

.suggestions-section {
  margin-bottom: 32px;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.suggestion-item {
  background: linear-gradient(135deg, #f8fafd, #e9ecef);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.suggestion-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-content h2 {
    font-size: 20px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .chart-card {
    height: 300px;
    padding: 16px;
  }
  
  .suggestions {
    grid-template-columns: 1fr;
  }
}
</style> 