<template>
  <div class="question-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2>{{ question?.title }}</h2>
          </div>
          <div class="header-right">
            <el-tag
              :type="getDifficultyType(question?.difficulty)"
              size="large"
            >
              {{ getDifficultyText(question?.difficulty) }}
            </el-tag>
            <el-tag
              type="info"
              size="large"
              style="margin-left: 8px"
            >
              {{ getTypeText(question?.question_type) }}
            </el-tag>
            <el-tag
              type="success"
              size="large"
              style="margin-left: 8px"
            >
              {{ question?.points }} 分
            </el-tag>
          </div>
        </div>
      </template>

      <div v-if="question" class="question-content">
        <!-- Question Info -->
        <div class="question-info">
          <div class="info-item">
            <span class="label">分类：</span>
            <el-tag v-if="question.category" type="primary">
              {{ question.category }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">创建者：</span>
            <span>{{ question.created_by_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span>{{ formatDate(question.created_at) }}</span>
          </div>
        </div>

        <!-- Question Content -->
        <div class="content-section">
          <h3>题目内容</h3>
          <div class="content-text">{{ question.content }}</div>
        </div>

        <!-- Options for multiple choice and true/false -->
        <div v-if="question.options && question.options.length > 0" class="options-section">
          <h3>选项</h3>
          <div class="options-list">
            <div
              v-for="(option, index) in question.options"
              :key="index"
              class="option-item"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
        </div>

        <!-- Answer Section for Students -->
        <div v-if="userStore.isStudent && !hasAnswered" class="answer-section">
          <h3>你的答案</h3>
          <el-form ref="answerFormRef" :model="answerForm" :rules="answerRules">
            <el-form-item prop="answer">
              <!-- Multiple choice -->
              <el-radio-group
                v-if="question.question_type === 'multiple_choice'"
                v-model="answerForm.answer"
              >
                <el-radio
                  v-for="(option, index) in question.options"
                  :key="index"
                  :label="option"
                  class="answer-option"
                >
                  {{ String.fromCharCode(65 + index) }}. {{ option }}
                </el-radio>
              </el-radio-group>

              <!-- True/False -->
              <el-radio-group
                v-else-if="question.question_type === 'true_false'"
                v-model="answerForm.answer"
              >
                <el-radio label="True" class="answer-option">True</el-radio>
                <el-radio label="False" class="answer-option">False</el-radio>
              </el-radio-group>

              <!-- Short answer and essay -->
              <el-input
                v-else
                v-model="answerForm.answer"
                type="textarea"
                :rows="question.question_type === 'essay' ? 6 : 3"
                :placeholder="question.question_type === 'essay' ? '请输入详细答案...' : '请输入答案...'"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="submitting"
                @click="submitAnswer"
              >
                提交答案
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Answer Result for Students -->
        <div v-if="userStore.isStudent && hasAnswered && answerResult" class="result-section">
          <h3>答题结果</h3>
          <div class="result-content">
            <div class="result-item">
              <span class="label">你的答案：</span>
              <span>{{ answerResult.answer }}</span>
            </div>
            <div class="result-item">
              <span class="label">是否正确：</span>
              <el-tag :type="answerResult.isCorrect ? 'success' : 'danger'">
                {{ answerResult.isCorrect ? '正确' : '错误' }}
              </el-tag>
            </div>
            <div class="result-item">
              <span class="label">得分：</span>
              <span>{{ answerResult.score }} / {{ question.points }}</span>
            </div>
            <div v-if="!answerResult.isCorrect && question.correct_answer" class="result-item">
              <span class="label">正确答案：</span>
              <span class="correct-answer">{{ question.correct_answer }}</span>
            </div>
          </div>
        </div>

        <!-- Correct Answer for Teachers -->
        <div v-if="userStore.isTeacher && question.correct_answer" class="answer-section">
          <h3>正确答案</h3>
          <div class="correct-answer">{{ question.correct_answer }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import * as questionsApi from '@/api/questions'
import * as answersApi from '@/api/answers'
import type { Question } from '@/types'

const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const submitting = ref(false)
const question = ref<Question | null>(null)
const hasAnswered = ref(false)
const answerResult = ref<any>(null)

const answerFormRef = ref<FormInstance>()
const answerForm = reactive({
  answer: ''
})

const answerRules: FormRules = {
  answer: [
    { required: true, message: '请输入答案', trigger: 'blur' }
  ]
}

const getDifficultyType = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
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

const loadQuestion = async () => {
  const questionId = parseInt(route.params.id as string)
  if (!questionId) return

  loading.value = true
  try {
    const response = await questionsApi.getQuestionById(questionId)
    question.value = response.question

    // Check if student has already answered
    if (userStore.isStudent) {
      try {
        const answersResponse = await answersApi.getStudentAnswers()
        const hasAnsweredThis = answersResponse.answers?.some(
          (answer: any) => answer.question_id === questionId
        )
        hasAnswered.value = hasAnsweredThis || false

        if (hasAnsweredThis) {
          const answer = answersResponse.answers?.find(
            (answer: any) => answer.question_id === questionId
          )
          if (answer) {
            answerResult.value = {
              answer: answer.answer,
              isCorrect: answer.is_correct,
              score: answer.score
            }
          }
        }
      } catch (error) {
        console.error('Failed to check answer status:', error)
      }
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const submitAnswer = async () => {
  if (!answerFormRef.value || !question.value) return

  try {
    await answerFormRef.value.validate()
    submitting.value = true

    const response = await answersApi.submitAnswer({
      question_id: question.value.id,
      answer: answerForm.answer
    })

    answerResult.value = response
    hasAnswered.value = true

    ElMessage.success('答案提交成功')
  } catch (error: any) {
    
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadQuestion()
})
</script>

<style scoped>
.question-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 0;
}

.el-card {
  background: rgba(255,255,255,0.88) !important;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border: none;
  backdrop-filter: blur(12px);
  padding: 32px 24px 18px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
}

.header-right .el-tag {
  margin-left: 8px;
  font-size: 15px;
  border-radius: 8px;
  padding: 2px 12px;
}

.question-content {
  margin-top: 20px;
}

.question-info {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 18px;
  background: linear-gradient(90deg, #e8f6ff 0%, #f3ffe6 100%);
  border-radius: 14px;
  box-shadow: 0 2px 8px #409eff11;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.label {
  font-weight: 600;
  color: #409eff;
}

.content-section,
.options-section,
.answer-section,
.result-section {
  margin-bottom: 28px;
}

.content-section h3,
.options-section h3,
.answer-section h3,
.result-section h3 {
  margin: 0 0 12px 0;
  font-size: 17px;
  color: #409eff;
  font-weight: 600;
}

.content-text {
  line-height: 1.7;
  color: #222;
  font-size: 16px;
  background: #f8fafd;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 1px 4px #409eff0a;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 10px;
  box-shadow: 0 1px 4px #409eff0a;
  font-size: 15px;
}

.option-label {
  font-weight: bold;
  color: #409eff;
  min-width: 20px;
}

.option-text {
  flex: 1;
}

.answer-option {
  display: block;
  margin-bottom: 12px;
  border-radius: 8px;
  padding: 6px 12px;
  background: #f8fafd;
  transition: background 0.2s;
}
.answer-option:hover {
  background: #e8f6ff;
}

.result-content {
  padding: 18px 20px;
  background: linear-gradient(90deg, #f8fafd 60%, #e8f6ff 100%);
  border-radius: 12px;
  box-shadow: 0 1px 4px #409eff0a;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 15px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.correct-answer {
  color: #67c23a;
  font-weight: 600;
  font-size: 15px;
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
.el-button {
  border-radius: 12px;
}
</style> 