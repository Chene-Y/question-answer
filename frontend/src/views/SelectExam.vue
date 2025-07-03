<template>
  <div class="select-exam-page">
    <div class="page-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    
    <el-card class="select-exam-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon">📚</div>
            <div class="header-content">
              <h1>自主答题</h1>
              <p>选择你感兴趣的科目，开始你的学习之旅</p>
            </div>
          </div>
          <el-button @click="goBack" type="primary" plain class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <div class="exam-form-container">
        <el-form :model="form" label-width="0" class="select-exam-form">
          <!-- 科目选择 -->
          <div class="form-section">
            <div class="section-title">
              <div class="title-icon">🎯</div>
              <h3>选择科目</h3>
            </div>
            <el-select 
              v-model="form.category" 
              placeholder="请选择你想练习的科目" 
              filterable
              class="category-select"
              size="large"
            >
              <el-option 
                v-for="cat in categories" 
                :key="cat" 
                :label="cat" 
                :value="cat"
              />
            </el-select>
          </div>

          <!-- 题量选择 -->
          <div class="form-section">
            <div class="section-title">
              <div class="title-icon">📊</div>
              <h3>选择题量</h3>
            </div>
            <div class="count-selector">
              <div class="count-options">
                <div 
                  v-for="count in countOptions" 
                  :key="count"
                  class="count-option"
                  :class="{ active: form.count === count }"
                  @click="form.count = count"
                >
                  <div class="count-number">{{ count }}</div>
                  <div class="count-label">{{ getCountLabel(count) }}</div>
                </div>
              </div>
              <div class="custom-count">
                <span class="custom-label">自定义:</span>
                <el-input-number 
                  v-model="form.count" 
                  :min="1" 
                  :max="50" 
                  size="large"
                  class="custom-input"
                />
              </div>
            </div>
          </div>

          <!-- 开始答题按钮 -->
          <div class="form-section">
            <el-button 
              type="primary" 
              @click="startExam" 
              :disabled="!form.category || !form.count"
              size="large"
              class="start-button"
              :loading="loading"
            >
              <div class="button-content">
                <span class="button-icon">🚀</span>
                <span class="button-text">开始答题</span>
              </div>
            </el-button>
          </div>
        </el-form>

        <!-- 快速开始选项 -->
        <div class="quick-start">
          <div class="quick-title">
            <span class="quick-icon">⚡</span>
            <span>快速开始</span>
          </div>
          <div class="quick-options">
            <el-button 
              v-for="quick in quickOptions" 
              :key="quick.label"
              @click="quickStart(quick)"
              type="info"
              plain
              size="small"
              class="quick-button"
            >
              {{ quick.label }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getQuestions } from '@/api/questions';
import { ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();
const form = ref({ category: '', count: 10 });
const categories = ref<string[]>([]);
const loading = ref(false);

// 预设的题量选项
const countOptions = [5, 10, 15, 20, 25];

// 快速开始选项
const quickOptions = ref<any[]>([]);

onMounted(async () => {
  // 获取所有题目，提取科目
  const res = await getQuestions({
    page: 1,
    pageSize: 10000
  });
  if (res && res.questions) {
    const set = new Set<string>();
    res.questions.forEach((q: any) => {
      if (q.category) set.add(q.category);
    });
    categories.value = Array.from(set);
    for (const element of categories.value) {
        quickOptions.value.push({ label: `${element}  10题`, category: element, count: 10 });
    }
  } else {
    ElMessage.error('获取科目失败');
  }
});

const getCountLabel = (count: number) => {
  if (count <= 5) return '简单';
  if (count <= 15) return '适中';
  if (count <= 25) return '挑战';
  return '困难';
};

const quickStart = (option: any) => {
  form.value.category = option.category;
  form.value.count = option.count;
  startExam();
};

async function startExam() {
  if (!form.value.category || !form.value.count) {
    ElMessage.warning('请选择科目和题量');
    return;
  }
  
  loading.value = true;
  try {
    router.push({
      name: 'Exam',
      query: {
        category: form.value.category,
        count: form.value.count
      }
    });
  } catch (error) {
    ElMessage.error('跳转失败');
  } finally {
    loading.value = false;
  }
}

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.select-exam-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.select-exam-card {
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: none;
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 48px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.header-content h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.header-content p {
  margin: 8px 0 0 0;
  color: #7f8c8d;
  font-size: 16px;
}

.back-btn {
  margin-left: auto;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.exam-form-container {
  padding: 24px 0;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 24px;
}

.section-title h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.category-select {
  width: 100%;
}

.count-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.count-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.count-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.count-option:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.count-option.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
}

.count-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.count-label {
  font-size: 12px;
  opacity: 0.8;
}

.custom-count {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.custom-label {
  font-weight: 500;
  color: #2c3e50;
}

.custom-input {
  width: 120px;
}

.start-button {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border: none;
  transition: all 0.3s ease;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-icon {
  font-size: 20px;
}

.quick-start {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
}

.quick-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.quick-icon {
  font-size: 18px;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-button {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.quick-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .select-exam-page {
    padding: 10px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .count-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .custom-count {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .custom-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-icon {
    font-size: 36px;
  }
  
  .count-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 