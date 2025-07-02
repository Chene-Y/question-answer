<template>
  <el-container class="app-container">
    <el-header v-if="userStore.isLoggedIn" class="app-header glass-header">
      <div class="logo">题目管理系统</div>
      <el-menu mode="horizontal" :default-active="$route.path" class="nav-menu" router>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/profile">个人中心</el-menu-item>
        <el-menu-item index="/logout" @click="logout">退出</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();

function logout() {
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
}
</script>

<style scoped>
:deep(.el-menu--horizontal.el-menu) {
  border: 0;
}
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}
.app-header {
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.glass-header {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  border-bottom: 1px solid rgba(200,200,200,0.15);
}
.logo {
  font-size: 22px;
  font-weight: bold;
  margin-right: 40px;
  letter-spacing: 2px;
  color: #333;
  text-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.nav-menu {
  background: transparent;
  color: #333;
  flex: 1;
}
.el-menu--horizontal > .el-menu-item {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin: 0 4px;
  transition: background 0.2s, color 0.2s;
}
.el-menu--horizontal > .el-menu-item.is-active {
  color: #fff;
  border-bottom: 0;
  background-color: transparent !important;
}
.app-main {
  padding: 0;
  min-height: 80vh;
}
</style> 