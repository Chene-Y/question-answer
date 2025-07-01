<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <h2>个人资料</h2>
        </div>
      </template>

      <div v-loading="loading" class="profile-content">
        <el-row :gutter="40">
          <!-- Profile Info -->
          <el-col :span="12">
            <el-card>
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
            <el-card>
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
                    <div class="stat-number">{{ studentStats.accuracy }}%</div>
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
            <el-card>
              <template #header>
                <span>最近活动</span>
              </template>
              
              <div class="activity-list">
                <div v-if="recentActivity.length === 0" class="no-activity">
                  <el-icon><Clock /></el-icon>
                  <p>暂无最近活动</p>
                </div>
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ formatDate(activity.time) }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Account Actions -->
        <el-row style="margin-top: 30px;">
          <el-col :span="24">
            <el-card>
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
import type { User, StudentStats } from '@/types'

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

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
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

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 18px;
  color: white;
}

.stat-icon.success {
  background: #67c23a;
}

.stat-icon.primary {
  background: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.stat-label {
  color: #666;
  font-size: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon .el-icon {
  font-size: 16px;
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #666;
}

.account-actions {
  display: flex;
  gap: 12px;
}
</style> 