<template>
  <div class="my-answers">
    <el-card>
      <template #header>
        <div class="page-header">
          <h2>{{ userStore.isTeacher ? '学生答题情况' : '我的答题记录' }}</h2>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="answers"
        style="width: 100%"
      >
        <el-table-column prop="title" label="题目" min-width="200">
          <template #default="{ row }">
            <div class="question-title">
              <span class="title-text">{{ row.title }}</span>
              <el-tag
                :type="getTypeColor(row.question_type)"
                size="small"
                style="margin-left: 8px"
              >
                {{ getTypeText(row.question_type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="answer" label="答案" min-width="150">
          <template #default="{ row }">
            <div class="answer-text">
              {{ row.answer }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="is_correct" label="结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_correct ? 'success' : 'danger'">
              {{ row.is_correct ? '正确' : '错误' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-text">{{ row.score }} / {{ row.points }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="userStore.isTeacher"
          prop="student_name"
          label="学生"
          width="120"
        />

        <el-table-column prop="submitted_at" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submitted_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="viewQuestion(row.question_id)"
            >
              查看题目
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Statistics -->
      <div class="statistics" v-if="answers.length > 0">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalAnswered }}</div>
                <div class="stat-label">总答题数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.correctAnswers }}</div>
                <div class="stat-label">正确答题数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.accuracy }}%</div>
                <div class="stat-label">正确率</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalScore }}</div>
                <div class="stat-label">总得分</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import * as answersApi from '@/api/answers'
import type { StudentAnswer } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const answers = ref<StudentAnswer[]>([])

const stats = computed(() => {
  const totalAnswered = answers.value.length
  const correctAnswers = answers.value.filter(answer => answer.is_correct).length
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
  const totalScore = answers.value.reduce((sum, answer) => sum + (answer.score || 0), 0)

  return {
    totalAnswered,
    correctAnswers,
    accuracy,
    totalScore
  }
})

const getTypeColor = (type?: string) => {
  switch (type) {
    case 'multiple_choice': return 'primary'
    case 'true_false': return 'success'
    case 'short_answer': return 'warning'
    case 'essay': return 'danger'
    default: return 'info'
  }
}

const getTypeText = (type?: string) => {
  switch (type) {
    case 'multiple_choice': return '选择题'
    case 'true_false': return '判断题'
    case 'short_answer': return '简答题'
    case 'essay': return '论述题'
    default: return '未知'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadAnswers = async () => {
  loading.value = true
  try {
    const response = await answersApi.getStudentAnswers()
    answers.value = response.answers || []
  } catch (error) {
    console.error('Failed to load answers:', error)
    ElMessage.error('加载答题记录失败')
  } finally {
    loading.value = false
  }
}

const viewQuestion = (questionId: number) => {
  router.push(`/questions/${questionId}`)
}

onMounted(() => {
  loadAnswers()
})
</script>

<style scoped>
.my-answers {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.question-title {
  display: flex;
  align-items: center;
}

.title-text {
  flex: 1;
  font-weight: 500;
}

.answer-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-text {
  font-weight: 500;
  color: #409eff;
}

.statistics {
  margin-top: 30px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}
</style> 