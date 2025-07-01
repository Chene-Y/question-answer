<template>
  <el-card class="ranking-card">
    <h2>局域网学生分数排名</h2>
    <el-table :data="ranking" style="width: 100%" v-loading="loading">
      <el-table-column prop="username" label="学生" width="180" />
      <el-table-column prop="total_score" label="总分" width="120" />
      <el-table-column prop="rank" label="排名" width="120" />
    </el-table>
    <el-button class="back-btn" @click="goBack">返回</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRanking } from '@/api/answers';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const ranking = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const res = await getRanking({ category: route.query.category });
  if (res && res.ranking) {
    ranking.value = res.ranking;
    ranking.value.forEach((item, index) => {
      item.rank = index + 1;
    });
  } else {
    ElMessage.error('获取排名失败');
  }
  loading.value = false;
});

function goBack() {
  router.back();
}
</script>

<style scoped>
.ranking-card {
  max-width: 500px;
  margin: 40px auto;
  padding: 32px 24px;
}
.back-btn {
  margin-top: 24px;
}
</style> 