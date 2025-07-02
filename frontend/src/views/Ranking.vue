<template>
  <div class="ranking-page">
    <el-card class="ranking-card">
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2>🏆 排行榜</h2>
            <p class="subtitle">综合答题能力排名</p>
          </div>
          <div class="header-right">
            <!-- <el-select 
              v-model="selectedCategory" 
              placeholder="选择类别" 
              clearable 
              @change="loadRanking"
              class="category-select"
            >
              <el-option label="全部类别" value="" />
              <el-option label="数学" value="数学" />
              <el-option label="语文" value="语文" />
              <el-option label="英语" value="英语" />
              <el-option label="物理" value="物理" />
              <el-option label="化学" value="化学" />
              <el-option label="生物" value="生物" />
              <el-option label="历史" value="历史" />
              <el-option label="地理" value="地理" />
              <el-option label="政治" value="政治" />
            </el-select> -->
            <el-button @click="goBack" type="primary" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载排名中...</p>
      </div>
      
      <div v-else-if="ranking.length === 0" class="empty-state">
        <el-empty description="暂无排名数据" />
      </div>
      
      <div v-else class="ranking-content">
        <!-- 前三名特殊展示 -->
        <div class="top-three">
          <div 
            v-for="(item, index) in ranking.slice(0, 3)" 
            :key="item.id"
            class="top-item"
            :class="`rank-${index + 1}`"
          >
            <div class="rank-badge">
              <span class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="user-info">
              <div class="username">{{ item.username }}</div>
              <div class="comprehensive-score">
                综合得分: {{ item.comprehensive_score }}
              </div>
            </div>
            <div class="stats">
              <div class="stat-item">
                <span class="label">总分:</span>
                <span class="value">{{ item.total_score }}</span>
              </div>
              <div class="stat-item">
                <span class="label">正确率:</span>
                <span class="value">{{ item.accuracy_rate }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">答题数:</span>
                <span class="value">{{ item.total_answered }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他排名列表 -->
        <div class="ranking-list">
          <div class="list-header">
            <h3>完整排名</h3>
            <div class="filter-info" v-if="selectedCategory">
              筛选类别: {{ selectedCategory }}
            </div>
          </div>
          
          <el-table 
            :data="ranking.slice(3)" 
            style="width: 100%" 
            :row-class-name="getRowClassName"
            class="ranking-table"
          >
            <el-table-column label="排名" align="center">
              <template #default="{ $index }">
                <div class="rank-cell">
                  <span class="rank-number">{{ $index + 4 }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="username" label="学生姓名">
              <template #default="{ row }">
                <div class="username-cell">
                  <span class="username">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="综合得分" align="center">
              <template #default="{ row }">
                <div class="comprehensive-score-cell">
                  <span class="score">{{ row.comprehensive_score }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="总分" align="center">
              <template #default="{ row }">
                <span class="total-score">{{ row.total_score }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="正确率" align="center">
              <template #default="{ row }">
                <div class="accuracy-cell">
                  <el-progress 
                    :percentage="row.accuracy_rate" 
                    :color="getAccuracyColor(row.accuracy_rate)"
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <span class="accuracy-text">{{ row.accuracy_rate.toFixed(2) }}%</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="答题数" align="center">
              <template #default="{ row }">
                <span class="answered-count">{{ row.total_answered }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="得分率" align="center">
              <template #default="{ row }">
                <div class="score-rate-cell">
                  <el-progress 
                    :percentage="row.score_rate" 
                    :color="getScoreRateColor(row.score_rate)"
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <span class="score-rate-text">{{ row.score_rate.toFixed(2) }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRanking } from '@/api/answers';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const ranking = ref<any[]>([]);
const loading = ref(true);
const selectedCategory = ref('');

onMounted(async () => {
  selectedCategory.value = (route.query.category as string) || '';
  await loadRanking();
});

const loadRanking = async () => {
  loading.value = true;
  try {
    const res = await getRanking({ category: selectedCategory.value });
    if (res && res.ranking) {
      ranking.value = res.ranking;
    } else {
      ElMessage.error('获取排名失败');
    }
  } catch (error) {
    console.error('Load ranking error:', error);
    ElMessage.error('获取排名失败');
  } finally {
    loading.value = false;
  }
};

const getRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex < 3) return 'top-row';
  return '';
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 90) return '#67c23a';
  if (accuracy >= 80) return '#e6a23c';
  if (accuracy >= 70) return '#f56c6c';
  return '#909399';
};

const getScoreRateColor = (scoreRate: number) => {
  if (scoreRate >= 90) return '#67c23a';
  if (scoreRate >= 80) return '#e6a23c';
  if (scoreRate >= 70) return '#f56c6c';
  return '#909399';
};

function goBack() {
  router.back();
}
</script>

<style scoped>
.ranking-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.ranking-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  border: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin: 4px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-select {
  width: 140px;
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

.empty-state {
  padding: 60px 0;
}

.ranking-content {
  margin-top: 24px;
}

/* 前三名特殊样式 */
.top-three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.top-item:hover {
  transform: translateY(-4px);
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  box-shadow: 0 8px 32px rgba(192, 192, 192, 0.3);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  box-shadow: 0 8px 32px rgba(205, 127, 50, 0.3);
}

.rank-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.rank-1 .rank-badge {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
}

.rank-2 .rank-badge {
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
}

.rank-3 .rank-badge {
  background: linear-gradient(135deg, #d35400, #e67e22);
}

.user-info {
  margin-bottom: 16px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.comprehensive-score {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.label {
  font-size: 12px;
  color: #7f8c8d;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 排名列表样式 */
.ranking-list {
  margin-top: 32px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.filter-info {
  color: #7f8c8d;
  font-size: 14px;
  padding: 4px 12px;
  background: #ecf0f1;
  border-radius: 20px;
}

.ranking-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.rank-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.username-cell {
  display: flex;
  align-items: center;
}

.username {
  font-weight: 600;
  color: #2c3e50;
}

.comprehensive-score-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.total-score {
  font-weight: 600;
  color: #2c3e50;
}

.accuracy-cell,
.score-rate-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.accuracy-text,
.score-rate-text {
  font-size: 12px;
  font-weight: 500;
  color: #7f8c8d;
}

.answered-count {
  font-weight: 600;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-three {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .category-select {
    width: 120px;
  }
}

@media (max-width: 480px) {
  .ranking-page {
    padding: 10px;
  }
  
  .top-item {
    padding: 16px;
  }
  
  .header-left h2 {
    font-size: 24px;
  }
}
</style> 