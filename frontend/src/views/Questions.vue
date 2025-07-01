<template>
  <div class="questions-page">
    <el-card class="questions-card">
      <div class="questions-header">
        <el-input v-model="search" placeholder="搜索题目标题/内容" class="search-input" @keyup.enter="loadQuestions" clearable />
        <el-button type="primary" @click="loadQuestions">搜索</el-button>
        <el-button type="success" @click="goCreate" class="create-btn">新建题目</el-button>
      </div>
      <el-table :data="questions" class="questions-table" stripe border>
        <el-table-column prop="title" label="题目标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="question_type" label="类型" width="130">
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
        <el-table-column label="操作" width="210">
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
import { useUserStore } from '@/stores/user'
import * as questionsApi from '@/api/questions'
import type { Question } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const questions = ref<Question[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const categories = ref<string[]>([])

const filters = {
  search: '',
  category: '',
  difficulty: '',
  type: ''
}

const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await questionsApi.getQuestions({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value
    })
    questions.value = response.questions || []
    total.value = response.total
    
    // Extract unique categories
    const uniqueCategories = [...new Set(questions.value.map(q => q.category).filter(Boolean))]
    categories.value = uniqueCategories
  } catch (error) {
    console.error('Failed to load questions:', error)
    ElMessage.error('加载题目失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadQuestions()
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

const getTypeText = (type: string) => {
  switch (type) {
    case 'multiple_choice': return '选择题'
    case 'true_false': return '判断题'
    case 'short_answer': return '简答题'
    case 'essay': return '论述题'
    default: return '未知'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const viewQuestion = (question: Question) => {
  router.push(`/questions/${question.id}`)
}

const editQuestion = (question: Question) => {
  router.push(`/questions/create?id=${question.id}`)
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
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const answerQuestion = (question: Question) => {
  router.push(`/questions/${question.id}`)
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

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.questions-page {
  max-width: 1200px;
  margin: 0 auto;
}

.questions-card {
  max-width: 1100px;
  margin: 40px auto;
  padding: 32px 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  border-radius: 12px;
  background: #fff;
}

.questions-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  width: 260px;
  margin-right: 16px;
}

.create-btn {
  margin-left: auto;
}

.questions-table {
  margin-top: 8px;
  border-radius: 8px;
  font-size: 15px;
}

.questions-pagination {
  margin-top: 24px;
  text-align: right;
}
</style> 