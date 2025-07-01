<template>
  <el-container class="app-container">
    <el-header class="app-header">
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
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();
const isStudent = computed(() => userStore.user?.role === 'student');
const isTeacher = computed(() => userStore.user?.role === 'teacher');

function logout() {
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 60px;
}
.logo {
  font-size: 22px;
  font-weight: bold;
  margin-right: 40px;
  letter-spacing: 2px;
}
.nav-menu {
  background: transparent;
  color: #fff;
  flex: 1;
}
.el-menu--horizontal > .el-menu-item {
  color: #fff;
}
.el-menu--horizontal > .el-menu-item.is-active {
  background: #66b1ff;
  color: #fff;
}
.app-main {
  padding: 0;
  min-height: 80vh;
}
</style> 