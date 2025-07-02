<template>
  <div class="questions-page">
    <el-card class="questions-card">
      <div style="display: flex; justify-content: space-between; align-items: center;margin-bottom: 20px;">
        <el-button type="success" @click="goCreate" class="create-btn">新建题目</el-button>
        <el-button @click="router.go(-1)" type="primary" plain class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回
        </el-button>
      </div>
      <div class="questions-header">
        <el-input v-model="search" placeholder="搜索题目标题/内容" class="search-input" @input="handleFilterChange" clearable />
        <el-select v-model="filterCategory" placeholder="分类" class="filter-select" clearable @change="handleFilterChange">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
        <el-select v-model="filterDifficulty" placeholder="难度" class="filter-select" clearable @change="handleFilterChange">
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
        <el-select v-model="filterType" placeholder="题型" class="filter-select" clearable @change="handleFilterChange">
          <el-option label="选择题" value="multiple_choice" />
          <el-option label="判断题" value="true_false" />
          <el-option label="简答题" value="short_answer" />
          <el-option label="论述题" value="essay" />
        </el-select>
      </div>
      <el-table :data="questions" class="questions-table" stripe border>
        <el-table-column prop="title" label="题目标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" />
        <el-table-column prop="question_type" label="类型">
          <template #default="{ row }">
            <el-tag size="small">{{ typeText(row.question_type) }}</el-tag>
            <el-tag size="small" :type="getDifficultyType(row.difficulty)" style="margin-left: 10px;">{{ getDifficultyText(row.difficulty) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="分值" width="80" />
        <el-table-column prop="created_by_name" label="创建人" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="goDetail(row.id)">详情</el-button>
            <el-button size="small" type="primary" @click="goEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteQuestion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: flex-end;">
        <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        class="questions-pagination"
      />
      </div>
      
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as questionsApi from '@/api/questions'
import type { Question } from '@/types'

const router = useRouter()

const loading = ref(false)
const questions = ref<Question[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const categories = ref<string[]>([])
const filterCategory = ref('')
const filterDifficulty = ref('')
const filterType = ref('')


const getCategories = async () => {
  const response = await questionsApi.getQuestions({
    page: 1,
    pageSize: 10000,
  })
  // Extract unique categories
  const uniqueCategories = [...new Set((<any>response).questions.map((q: any) => q.category).filter(Boolean))]
  categories.value = uniqueCategories as string[]
}

const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await questionsApi.getQuestions({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      category: filterCategory.value,
      difficulty: filterDifficulty.value,
      type: filterType.value
    })
    questions.value = (<any>response).questions || []
    total.value = (<any>response).total

  } catch (error) {
    console.error('Failed to load questions:', error)
    ElMessage.error('加载题目失败')
  } finally {
    loading.value = false
  }
}

const getDifficultyType = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}


const deleteQuestion = async (question: Question) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目"${question.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await questionsApi.deleteQuestion(question.id)
    ElMessage.success('删除成功')
    loadQuestions()
  } catch (error) {
  }
}

const goCreate = () => {
  router.push('/questions/create')
}

const goDetail = (id: number) => {
  router.push(`/questions/${id}`)
}

const goEdit = (id: number) => {
  router.push(`/questions/create?id=${id}`)
}

const typeText = (type: string) => {
  switch (type) {
    case 'multiple_choice': return '选择题'
    case 'true_false': return '判断题'
    case 'short_answer': return '简答题'
    case 'essay': return '论述题'
    default: return type
  }
}

const handlePageChange = (val: number) => {
  page.value = val
  loadQuestions()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  loadQuestions()
}

const handleFilterChange = () => {
  page.value = 1
  loadQuestions()
}

onMounted(() => {
  getCategories()
  loadQuestions()
})
</script>

<style scoped>
.questions-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 32px 0;
  background: none;
}

.questions-card {
  max-width: 1300px;
  margin: 40px auto;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border-radius: 22px;
  background: rgba(255,255,255,0.85);
  border: none;
  backdrop-filter: blur(12px);
}

.questions-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
  border-radius: 12px !important;
  font-size: 15px;
}

.create-btn {
  border-radius: 14px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px #409eff22;
  border: none;
  transition: all 0.2s;
}
.create-btn:hover {
  background: linear-gradient(135deg, #67c23a, #409eff);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px #67c23a33;
}

.el-button[type="primary"] {
  border-radius: 14px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px #409eff22;
  border: none;
  transition: all 0.2s;
}
.el-button[type="primary"]:hover {
  background: linear-gradient(135deg, #67c23a, #409eff);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px #67c23a33;
}
.el-button[type="danger"] {
  border-radius: 14px;
}
.el-button {
  border-radius: 12px;
}

.questions-table {
  margin-top: 8px;
  border-radius: 12px;
  font-size: 15px;
  overflow: hidden;
  --el-table-header-bg-color: linear-gradient(90deg, #409eff22 0%, #67c23a22 100%);
}
.el-table th {
  background: linear-gradient(90deg, #409eff22 0%, #67c23a22 100%) !important;
  color: #222;
  font-weight: 600;
  font-size: 15px;
}
.el-table tr {
  transition: background 0.2s;
}
.el-table tr:hover {
  background: #e8f6ff !important;
}
.el-table .el-button {
  min-width: 56px;
}

.questions-pagination {
  margin-top: 28px;
  text-align: right;
}

.filter-select {
  width: 120px;
  margin-right: 8px;
  border-radius: 12px !important;
}
</style> 