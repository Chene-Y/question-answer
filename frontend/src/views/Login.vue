<template>
  <div class="login-bg">
    <div class="login-container">
      <el-card class="login-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><User /></el-icon>
            <span>用户登录</span>
          </div>
        </template>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              size="large"
              class="input-lg"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-btn"
              size="large"
              style="width: 100%"
            >
              登录
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <span>还没有账号？</span>
            <el-link type="primary" @click="$router.push('/register')" class="footer-link">
              立即注册
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
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
    loading.value = true
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    // 错误已由store处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-bg::before {
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
.login-bg::after {
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
.login-container {
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
.login-card {
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
.login-form {
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
.login-btn {
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
.login-btn:hover {
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
  .login-card {
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