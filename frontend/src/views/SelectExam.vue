<template>
  <el-card class="select-exam-card">
    <h2>选择科目与题量</h2>
    <el-form :model="form" label-width="80px" class="select-exam-form">
      <el-form-item label="科目">
        <el-select v-model="form.category" placeholder="请选择科目" filterable>
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </el-form-item>
      <el-form-item label="题量">
        <el-input-number v-model="form.count" :min="1" :max="50" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="startExam" :disabled="!form.category || !form.count">开始答题</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getQuestions } from '@/api/questions';

const router = useRouter();
const form = ref({ category: '', count: 10 });
const categories = ref<string[]>([]);

onMounted(async () => {
  // 获取所有题目，提取科目
  const res = await getQuestions();
  if (res && res.questions) {
    const set = new Set<string>();
    res.questions.forEach((q: any) => {
      if (q.category) set.add(q.category);
    });
    categories.value = Array.from(set);
  } else {
    ElMessage.error('获取科目失败');
  }
});

function startExam() {
  if (!form.value.category || !form.value.count) {
    ElMessage.warning('请选择科目和题量');
    return;
  }
  router.push({
    name: 'Exam',
    query: {
      category: form.value.category,
      count: form.value.count
    }
  });
}
</script>

<style scoped>
.select-exam-card {
  max-width: 400px;
  margin: 40px auto;
  padding: 32px 24px;
}
.select-exam-form {
  margin-top: 24px;
}
</style> 