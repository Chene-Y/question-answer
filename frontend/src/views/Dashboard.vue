<template>
  <div class="dashboard">
    <el-row :gutter="24" class="dashboard-row">
      <el-col :span="16">
        <el-card class="welcome-card">
          <h2>欢迎，{{ userStore.user?.username || '用户' }}！</h2>
          <div v-if="isStudent">
            <el-alert type="info" show-icon>
              <template #title>你可以在下方快速开始自主答题、查看学习统计、区域排名等操作。</template>
            </el-alert>
          </div>
          <div v-else>
            <el-alert type="success" show-icon>
              <template #title>欢迎使用教师端，您可以在下方快速管理题库、批量导入题目、查看题目统计等。</template>
            </el-alert>
          </div>
        </el-card>
        <el-card class="quick-actions-card">
          <h3>快速操作</h3>
          <el-row :gutter="32" class="quick-actions-row">
            <template v-if="isStudent">
              <el-col :span="8">
                <el-button type="primary" size="large" class="quick-action-btn" @click="goSelectExam">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><Edit /></el-icon>
                  <div>自主答题</div>
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="info" size="large" class="quick-action-btn" @click="goStats">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><PieChart /></el-icon>
                  <div>学习统计</div>
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="warning" size="large" class="quick-action-btn" @click="goRanking">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><Medal /></el-icon>
                  <div>区域排名</div>
                </el-button>
              </el-col>
            </template>
            <template v-else>
              <el-col :span="8">
                <el-button type="primary" size="large" class="quick-action-btn" @click="goQuestions">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><Document /></el-icon>
                  <div>题目管理</div>
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="success" size="large" class="quick-action-btn" @click="goImport">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><UploadFilled /></el-icon>
                  <div>批量导入</div>
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="info" size="large" class="quick-action-btn" @click="goStats">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><PieChart /></el-icon>
                  <div>题目统计</div>
                </el-button>
              </el-col>
            </template>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="profile-card">
          <h3>个人信息</h3>
          <div>用户名：{{ userStore.user?.username }}</div>
          <div>角色：{{ userStore.user?.role === 'student' ? '学生' : '教师' }}</div>
          <div>邮箱：{{ userStore.user?.email }}</div>
        </el-card>
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>统计信息</span>
            </div>
          </template>
          
          <div class="stats-content">
            <div class="stat-item" v-if="userStore.isTeacher">
              <div class="stat-number">{{ stats.totalQuestions || 0 }}</div>
              <div class="stat-label">总题目数</div>
            </div>
            <div class="stat-item" v-if="userStore.isStudent">
              <div class="stat-number">{{ stats.totalAnswered || 0 }}</div>
              <div class="stat-label">已答题目</div>
            </div>
            <div class="stat-item" v-if="userStore.isStudent">
              <div class="stat-number">{{ stats.accuracy || 0 }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.totalScore || 0 }}</div>
              <div class="stat-label">{{ userStore.isTeacher ? '出题量' : '我的得分' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import * as questionsApi from '@/api/questions'
import * as answersApi from '@/api/answers'
import { useRouter } from 'vue-router'
import { Edit, PieChart, Medal, Document, UploadFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const stats = ref({
  totalQuestions: 0,
  totalAnswered: 0,
  accuracy: 0,
  totalScore: 0
})

const isStudent = computed(() => userStore.user?.role === 'student')

const getRoleText = () => {
  return userStore.isTeacher 
    ? '您是教师，可以创建和管理题目，查看学生答题情况。'
    : '您是学生，可以答题查看学习进度。'
}

const loadStats = async () => {
  try {
    if (userStore.isTeacher) {
      const questionsResponse = await questionsApi.getQuestions({page: 1, pageSize: 10000})
      stats.value.totalQuestions = questionsResponse.total || 0
      stats.value.totalScore = questionsResponse.questions.filter((question: any) => question.created_by_user_id === userStore.user.id).length
    } else {
      const statsResponse = await answersApi.getStudentStats()
      if (statsResponse.stats) {
        stats.value.totalAnswered = statsResponse.stats.totalAnswered
        stats.value.accuracy = Math.round(statsResponse.stats.accuracy)
        stats.value.totalScore = statsResponse.stats.totalScore
      }
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

function goSelectExam() {
  router.push('/select')
}
function goStats() {
  router.push('/stats')
}
function goRanking() {
  router.push('/ranking')
}
function goQuestions() {
  router.push('/questions')
}
function goImport() {
  router.push('/import')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-row {
  margin-top: 32px;
}

.welcome-card {
  margin-bottom: 24px;
}

.quick-actions-card {
  margin-bottom: 24px;
}

.quick-actions-row {
  margin-top: 16px;
  min-height: 120px;
}

.quick-action-btn {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 1px;
}

.profile-card {
  min-height: 180px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}
</style> 