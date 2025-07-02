<template>
  <div class="register-bg">
    <div class="register-container">
      <el-card class="register-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><UserFilled /></el-icon>
            <span>用户注册</span>
          </div>
        </template>
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
          @submit.prevent="handleRegister"
          class="register-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              show-password
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item prop="role">
            <el-radio-group v-model="registerForm.role" size="large">
              <el-radio label="student">学生</el-radio>
              <el-radio label="teacher">教师</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleRegister"
              class="register-btn"
              size="large"
              style="width: 100%"
            >
              注册
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <span>已有账号？</span>
            <el-link type="primary" @click="$router.push('/login')" class="footer-link">
              立即登录
            </el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student' as 'teacher' | 'student'
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    loading.value = true
    await userStore.register(
      registerForm.username,
      registerForm.email,
      registerForm.password,
      registerForm.role
    )
    ElMessage.success('注册成功')
    router.push('/dashboard')
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.register-bg::before {
  content: '';
  position: absolute;
  left: 10vw;
  top: 10vh;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #409eff 0%, transparent 70%);
  opacity: 0.13;
  filter: blur(32px);
  z-index: 1;
}
.register-bg::after {
  content: '';
  position: absolute;
  right: 8vw;
  bottom: 8vh;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #67c23a 0%, transparent 70%);
  opacity: 0.13;
  filter: blur(28px);
  z-index: 1;
}
.register-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}
.glass-card {
  background: rgba(255,255,255,0.82) !important;
  border-radius: 28px;
  box-shadow: 0 8px 40px 0 #409eff33, 0 1.5px 8px #67c23a22 inset;
  border: 1.5px solid rgba(64,158,255,0.13);
  backdrop-filter: blur(24px) saturate(1.2);
  transition: box-shadow 0.3s, transform 0.2s;
  position: relative;
  overflow: hidden;
}
.glass-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px;
  pointer-events: none;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  opacity: 0.13;
  z-index: 2;
}
.glass-card:hover {
  box-shadow: 0 16px 56px 0 #409eff44, 0 2px 12px #67c23a44 inset;
  transform: translateY(-2px) scale(1.025);
}
.register-card {
  width: 410px;
  padding: 44px 38px 28px 38px;
  position: relative;
  z-index: 3;
}
.card-header {
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  justify-content: center;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px #23294688;
}
.header-icon {
  font-size: 40px;
  margin-right: 14px;
  color: #409eff;
  filter: drop-shadow(0 2px 8px #409eff88);
}
.register-form {
  margin-top: 24px;
}
.input-lg .el-input__wrapper {
  border-radius: 16px;
  font-size: 20px;
  padding: 12px 18px;
  background: rgba(255,255,255,0.92);
  border: 2px solid #b3d8ff;
  box-shadow: 0 1.5px 8px #409eff22 inset;
  transition: border 0.25s, box-shadow 0.25s;
  position: relative;
}
.input-lg .el-input__wrapper:focus-within {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 3px #409eff33;
}
.input-lg .el-input__wrapper:hover {
  border: 2px solid #67c23a;
  box-shadow: 0 0 0 2px #67c23a33;
}
.input-lg .el-input__inner {
  font-size: 20px;
  background: transparent;
  color: #fff;
  letter-spacing: 1px;
}
.input-lg .el-input__prefix {
  color: #409eff;
  font-size: 22px;
}
.register-btn {
  border-radius: 16px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
  box-shadow: 0 4px 24px #409eff22;
  transition: all 0.2s;
  border: none;
}
.register-btn:hover {
  background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
  color: #fff;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 32px #67c23a44;
}
.form-footer {
  text-align: center;
  margin-top: 32px;
  color: #b7b7c8;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-link {
  font-weight: bold;
  font-size: 16px;
  margin-left: 8px;
  letter-spacing: 1px;
  color: #409eff;
}
.footer-link:hover {
  color: #67c23a;
  text-decoration: underline;
}
@media (max-width: 600px) {
  .register-card {
    width: 98vw;
    padding: 16px 4px 12px 4px;
  }
  .glass-card {
    padding: 8px !important;
  }
  .header-icon {
    font-size: 28px;
  }
}
</style> 