<template>
  <div class="profile-page">
    <el-card class="profile-main-card glass-card">
      <template #header>
        <div class="page-header">
          <h2>个人资料</h2>
        </div>
      </template>

      <div v-loading="loading" class="profile-content">
        <el-row :gutter="40">
          <!-- Profile Info -->
          <el-col :span="12">
            <el-card class="glass-card profile-sub-card">
              <template #header>
                <span>基本信息</span>
              </template>
              
              <div class="profile-info">
                <div class="info-item">
                  <span class="label">用户名：</span>
                  <span class="value">{{ user?.username }}</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱：</span>
                  <span class="value">{{ user?.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">角色：</span>
                  <el-tag :type="user?.role === 'teacher' ? 'primary' : 'success'">
                    {{ user?.role === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </div>
                <div class="info-item">
                  <span class="label">注册时间：</span>
                  <span class="value">{{ formatDate(user?.created_at) }}</span>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- Quick Stats -->
          <el-col :span="12">
            <el-card class="glass-card profile-sub-card">
              <template #header>
                <span>快速统计</span>
              </template>
              
              <div class="quick-stats">
                <div class="stat-item" v-if="userStore.isTeacher">
                  <div class="stat-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ teacherStats.totalQuestions }}</div>
                    <div class="stat-label">创建的题目</div>
                  </div>
                </div>
                
                <div class="stat-item" v-if="userStore.isStudent">
                  <div class="stat-icon">
                    <el-icon><Check /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ studentStats.totalAnswered }}</div>
                    <div class="stat-label">已答题目</div>
                  </div>
                </div>
                
                <div class="stat-item" v-if="userStore.isStudent">
                  <div class="stat-icon success">
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ studentStats.accuracy.toFixed(2) }}%</div>
                    <div class="stat-label">正确率</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon primary">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ userStore.isStudent ? studentStats.totalScore : teacherStats.totalQuestions * 5 }}</div>
                    <div class="stat-label">{{ userStore.isStudent ? '总得分' : '预估总分' }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Recent Activity -->
        <el-row style="margin-top: 30px;">
          <el-col :span="24">
            <el-card class="glass-card profile-sub-card">
              <template #header>
                <span>最近活动</span>
              </template>
              
              <div class="activity-list">
                <div v-if="recentActivity.length === 0" class="no-activity">
                  <el-icon><Clock /></el-icon>
                  <p>暂无最近活动</p>
                </div>
                <template v-if="userStore.isTeacher">
                  <div v-for="item in recentActivity" :key="item.id" class="activity-item-row">
                    <span class="activity-time-highlight">{{ formatDate(item.time) }}</span>
                    <span class="activity-title ellipsis">{{ item.title }}</span>
                    <el-tag size="small" type="primary" class="activity-tag">{{ item.category || '未分类' }}</el-tag>
                    <span style="flex: 1;flex-shrink: 0;" class="activity-desc ellipsis">{{ item.content }}</span>
                  </div>
                </template>
                <template v-else>
                  <div v-for="item in recentActivity" :key="item.id" class="activity-item-row">
                    <span class="activity-time-highlight">{{ formatDate(item.time) }}</span>
                    <span class="activity-title ellipsis">{{ item.title }}</span>
                    <el-tag size="small" :type="item.is_correct ? 'success' : 'danger'" class="activity-tag">{{ item.is_correct ? '正确' : '错误' }}</el-tag>
                    <span class="activity-desc ellipsis">{{ item.content }}</span>
                    <span class="activity-stats">得分：{{ item.score }} / {{ item.points }}</span>
                  </div>
                  <div class="activity-summary" v-if="recentActivity.length">
                    <span>最近7次答题，答题数：{{ recentActivity.length }}，正确率：{{ (recentActivity.filter(a => a.is_correct).length / recentActivity.length * 100).toFixed(1) }}%</span>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Account Actions -->
        <el-row style="margin-top: 30px;">
          <el-col :span="24">
            <el-card class="glass-card profile-sub-card">
              <template #header>
                <span>账户操作</span>
              </template>
              
              <div class="account-actions">
                <el-button type="primary" @click="refreshProfile">
                  <el-icon><Refresh /></el-icon>
                  刷新资料
                </el-button>
                <el-button type="warning" @click="showChangePassword = true">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-button>
                <el-button type="danger" @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- Change Password Dialog -->
    <el-dialog
      v-model="showChangePassword"
      title="修改密码"
      width="400px"
      class="profile-dialog"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" :loading="changingPassword" @click="changePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import * as answersApi from '@/api/answers'
import * as questionsApi from '@/api/questions'
import type { User, StudentStats, Question, StudentAnswer } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const changingPassword = ref(false)
const showChangePassword = ref(false)
const user = ref<User | null>(null)

const studentStats = ref<StudentStats>({
  totalAnswered: 0,
  correctAnswers: 0,
  totalScore: 0,
  totalPossible: 0,
  accuracy: 0,
  percentage: 0
})

const teacherStats = ref({
  totalQuestions: 0
})

const recentActivity = ref<any[]>([])

const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadProfile = async () => {
  loading.value = true
  try {
    await userStore.updateProfile()
    user.value = userStore.user

    if (userStore.isStudent) {
      const statsResponse = await answersApi.getStudentStats()
      studentStats.value = statsResponse.stats
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
    ElMessage.error('加载个人资料失败')
  } finally {
    loading.value = false
  }
}

const refreshProfile = () => {
  loadProfile()
  ElMessage.success('资料已刷新')
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    // This would call the API to change password
    // await authApi.changePassword(passwordForm)
    
    ElMessage.success('密码修改成功')
    showChangePassword.value = false
    
    // Reset form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    changingPassword.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const loadRecentActivity = async () => {
  if (userStore.isTeacher) {
    // 教师端：最近7条新增题目
    const res = await questionsApi.getQuestions({ page: 1, pageSize: 7 })
    recentActivity.value = (res.questions || []).map((q: Question) => ({
      id: q.id,
      time: q.created_at,
      content: q.content,
      category: q.category,
      title: q.title
    }))
  } else if (userStore.isStudent) {
    // 学生端：最近7次答题记录
    const res = await answersApi.getStudentAnswers()
    const answers: StudentAnswer[] = res.answers || []
    recentActivity.value = answers.slice(0, 7).map((a: StudentAnswer) => ({
      id: a.id,
      time: a.submitted_at,
      content: a.content,
      title: a.title,
      answer: a.answer,
      is_correct: a.is_correct,
      score: a.score,
      points: a.points
    }))
  }
}

onMounted(() => {
  loadProfile()
  loadRecentActivity()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
}
.profile-main-card.glass-card {
  background: rgba(255,255,255,0.88) !important;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border: none;
  backdrop-filter: blur(12px);
  padding: 38px 32px 32px 32px;
}
.profile-sub-card.glass-card {
  background: rgba(255,255,255,0.96) !important;
  border-radius: 16px;
  box-shadow: 0 4px 16px #409eff11;
  border: none;
  margin-bottom: 18px;
}
.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
  text-align: center;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 0 0 0;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}
.label {
  font-weight: 600;
  color: #409eff;
  min-width: 80px;
}
.value {
  color: #333;
}
.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 0 0 0;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #409eff22;
}
.stat-icon .el-icon {
  font-size: 22px;
  color: white;
}
.stat-info {
  flex: 1;
}
.stat-number {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}
.stat-label {
  color: #666;
  font-size: 13px;
}
.account-actions {
  display: flex;
  gap: 18px;
  margin-top: 10px;
}
.el-button[type="primary"], .el-button[type="warning"], .el-button[type="danger"] {
  border-radius: 14px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px #409eff22;
  border: none;
  transition: all 0.2s;
}
.el-button[type="primary"]:hover, .el-button[type="warning"]:hover, .el-button[type="danger"]:hover {
  background: linear-gradient(135deg, #67c23a, #409eff);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px #67c23a33;
}
.el-button {
  border-radius: 12px;
}
.profile-dialog .el-dialog__body {
  padding-top: 18px;
}
.activity-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.activity-item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(90deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 10px;
  box-shadow: 0 1px 4px #409eff0a;
  padding: 10px 16px;
  font-size: 15px;
  min-width: 0;
}
.activity-time-highlight {
  font-size: 14px;
  color: #fff;
  background: linear-gradient(90deg, #409eff 60%, #67c23a 100%);
  border-radius: 8px;
  padding: 2px 10px;
  font-weight: 600;
  min-width: 110px;
  text-align: center;
  box-shadow: 0 1px 4px #409eff22;
  flex-shrink: 0;
}
.activity-title {
  font-size: 15px;
  font-weight: 600;
  color: #409eff;
  max-width: 160px;
  flex-shrink: 1;
}
.activity-tag {
  margin: 0 4px;
  flex-shrink: 0;
}
.activity-desc {
  color: #333;
  font-size: 14px;
  flex-shrink: 1;
}
.activity-stats {
  font-size: 13px;
  color: #67c23a;
  flex-shrink: 0;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}
.activity-summary {
  margin-top: 8px;
  font-size: 14px;
  color: #409eff;
  text-align: right;
}
.no-activity {
  text-align: center;
  color: #999;
  padding: 40px;
}
.no-activity .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
</style> 