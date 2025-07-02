<template>
  <div class="dashboard">
    <el-row :gutter="24" class="dashboard-row">
      <el-col :span="16">
        <el-card class="welcome-card glass-card">
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
        <el-card class="quick-actions-card glass-card">
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
              <el-col :span="8" style="margin-top: 16px;">
                <el-button type="danger" size="large" class="quick-action-btn" @click="goWrongAnswers">
                  <el-icon style="font-size:32px;margin-bottom:8px;"><Warning /></el-icon>
                  <div>错题统计</div>
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
        <el-card class="profile-card glass-card">
          <div class="profile-avatar">
            {{ userStore.user?.username?.charAt(0) || 'U' }}
          </div>
          <div class="profile-info-block">
            <div class="profile-row">
              <span class="profile-label">用户名</span>
              <span class="profile-value">{{ userStore.user?.username }}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">角色</span>
              <el-tag :type="userStore.user?.role === 'student' ? 'success' : 'primary'" class="profile-role-tag">
                {{ userStore.user?.role === 'student' ? '学生' : '教师' }}
              </el-tag>
            </div>
            <div class="profile-row">
              <span class="profile-label">邮箱</span>
              <el-tooltip content="点击复制邮箱" placement="top">
                <span class="profile-value profile-email" @click="copyEmail">{{ userStore.user?.email }}</span>
              </el-tooltip>
            </div>
            <div class="profile-row">
              <span class="profile-label">注册时间</span>
              <span class="profile-value">{{ userStore.user?.created_at ? userStore.user.created_at.slice(0, 10) : '' }}</span>
            </div>
          </div>
        </el-card>
        <el-card style="margin-top: 20px;" class="glass-card">
          <template #header>
            <div class="card-header">
              <span>统计信息</span>
            </div>
          </template>
          <div class="stats-content">
            <div class="stat-item" v-if="userStore.isTeacher">
              <div class="stat-number primary">{{ stats.totalQuestions || 0 }}</div>
              <div class="stat-label">总题目数</div>
            </div>
            <div class="stat-item" v-if="userStore.isStudent">
              <div class="stat-number info">{{ stats.totalAnswered || 0 }}</div>
              <div class="stat-label">已答题目</div>
            </div>
            <div class="stat-item" v-if="userStore.isStudent">
              <div class="stat-number success">{{ stats.accuracy || 0 }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number warning">{{ stats.totalScore || 0 }}</div>
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
import { Edit, PieChart, Medal, Document, UploadFilled, Warning } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const stats = ref({
  totalQuestions: 0,
  totalAnswered: 0,
  accuracy: 0,
  totalScore: 0
})

const isStudent = computed(() => userStore.user?.role === 'student')

const loadStats = async () => {
  try {
    if (userStore.isTeacher) {
      const questionsResponse = await questionsApi.getQuestions({page: 1, pageSize: 10000})
      stats.value.totalQuestions = (<any>questionsResponse).total || 0
      stats.value.totalScore = (<any>questionsResponse).questions.filter((question: any) =>{ 
        if (userStore.user) {
          return question.created_by_user_id === userStore.user.id
        }
        return false
      }).length
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
function goWrongAnswers() {
  router.push('/wrong-answers')
}

function copyEmail() {
  if (userStore.user?.email) {
    navigator.clipboard.writeText(userStore.user.email)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.dashboard-row {
  margin-top: 32px;
}
.glass-card {
  background: rgba(255,255,255,0.85) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.08);
  border: none;
}
.welcome-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
}
.quick-actions-card {
  margin-bottom: 24px;
}
.quick-actions-row {
  margin-top: 16px;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.quick-action-btn {
  width: 100%;
  height: 90px;
  border-radius: 18px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  box-shadow: 0 4px 16px rgba(64,158,255,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-bottom: 8px;
}
.quick-action-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 32px rgba(64,158,255,0.18);
  background: linear-gradient(135deg, #67c23a, #409eff);
}
.profile-card {
  margin-bottom: 20px;
  text-align: center;
  padding: 32px 0 24px 0;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  background: rgba(255,255,255,0.92) !important;
  position: relative;
}
.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px auto;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
  border: 3px solid #fff;
}
.profile-info-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  margin-top: 6px;
}
.profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  background: linear-gradient(90deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 8px;
  padding: 6px 18px;
  box-shadow: 0 1px 4px #409eff0a;
  min-width: 220px;
  max-width: 320px;
  margin: 0 auto;
}
.profile-label {
  color: #409eff;
  font-weight: 600;
  min-width: 60px;
}
.profile-value {
  color: #333;
  font-weight: 500;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-role-tag {
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  padding: 2px 14px;
}
.profile-email {
  cursor: pointer;
  color: #409eff;
  text-decoration: underline dotted;
  transition: color 0.2s;
}
.profile-email:hover {
  color: #67c23a;
}
.stats-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
.stat-item {
  flex: 1 1 40%;
  margin-bottom: 12px;
  text-align: center;
}
.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
  display: inline-block;
}
.stat-number.primary {
  color: #409eff;
}
.stat-number.info {
  color: #67c23a;
}
.stat-number.success {
  color: #e6a23c;
}
.stat-number.warning {
  color: #f56c6c;
}
.stat-label {
  color: #7f8c8d;
  font-size: 14px;
}
@media (max-width: 900px) {
  .dashboard-row {
    flex-direction: column;
  }
  .el-col {
    width: 100% !important;
    max-width: 100% !important;
  }
}
@media (max-width: 600px) {
  .dashboard {
    padding: 8px;
  }
  .glass-card {
    padding: 8px !important;
  }
  .profile-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  .stat-number {
    font-size: 18px;
  }
}
</style> 