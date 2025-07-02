<template>
  <div class="create-question">
    <el-card>
      <template #header>
        <div class="page-header">
          <h2>{{ isEdit ? '修改题目' : '创建题目' }}</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="题目标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入题目标题"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <el-form-item label="题目类型" prop="question_type">
          <el-radio-group v-model="form.question_type" @change="handleTypeChange">
            <el-radio label="multiple_choice">选择题</el-radio>
            <el-radio label="true_false">判断题</el-radio>
            <el-radio label="short_answer">简答题</el-radio>
            <el-radio label="essay">论述题</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Options for multiple choice -->
        <template v-if="form.question_type === 'multiple_choice'">
          <el-form-item label="选项" prop="options">
            <div class="options-container">
              <div
                v-for="(_option, index) in form.options"
                :key="index"
                class="option-item"
              >
                <el-input
                  v-model="form.options[index]"
                  :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                  style="width: 300px"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeOption(index)"
                  :disabled="form.options.length <= 2"
                >
                  删除
                </el-button>
              </div>
              <el-button type="primary" size="small" @click="addOption">
                添加选项
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- Options for true/false -->
        <template v-if="form.question_type === 'true_false'">
          <el-form-item label="选项">
            <div class="options-container">
              <el-input
                v-model="form.options[0]"
                placeholder="True"
                style="width: 300px"
                disabled
              />
              <el-input
                v-model="form.options[1]"
                placeholder="False"
                style="width: 300px"
                disabled
              />
            </div>
          </el-form-item>
        </template>

        <!-- Correct answer -->
        <el-form-item
          v-if="form.question_type !== 'essay'"
          label="正确答案"
          prop="correct_answer"
        >
          <el-select
            v-if="form.question_type === 'multiple_choice'"
            v-model="form.correct_answer"
            placeholder="选择正确答案"
            style="width: 300px"
          >
            <el-option
              v-for="(option, index) in form.options"
              :key="index"
              :label="option"
              :value="option"
            />
          </el-select>
          
          <el-radio-group
            v-else-if="form.question_type === 'true_false'"
            v-model="form.correct_answer"
          >
            <el-radio label="True">True</el-radio>
            <el-radio label="False">False</el-radio>
          </el-radio-group>
          
          <el-input
            v-else
            v-model="form.correct_answer"
            placeholder="请输入正确答案"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="分值" prop="points">
          <el-input-number
            v-model="form.points"
            :min="1"
            :max="100"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="form.difficulty">
            <el-radio label="easy">简单</el-radio>
            <el-radio label="medium">中等</el-radio>
            <el-radio label="hard">困难</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-input
            v-model="form.category"
            placeholder="请输入题目分类"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="解析" prop="analysis">
          <el-input
            v-model="form.analysis"
            type="textarea"
            :rows="3"
            placeholder="请输入本题解析（必填，可用于答题后展示）"
            maxlength="500"
            show-word-limit
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '修改题目' : '创建题目' }}
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import * as questionsApi from '@/api/questions'
import type { CreateQuestionRequest } from '@/types'
import { getQuestionById } from '@/api/questions'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

let form = ref<CreateQuestionRequest & { options: string[], analysis?: string }>({
  title: '',
  content: '',
  question_type: 'multiple_choice',
  options: ['', ''],
  correct_answer: '',
  points: 1,
  difficulty: 'medium',
  category: '',
  analysis: ''
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { min: 3, max: 255, message: '标题长度在 3 到 255 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  question_type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  correct_answer: [
    { required: true, message: '请输入正确答案', trigger: 'blur' }
  ],
  points: [
    { required: true, message: '请输入分值', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请输入题目分类', trigger: 'blur' }
  ],
  analysis: [
    { required: true, message: '请输入本题解析', trigger: 'blur' }
  ]
}

const handleTypeChange = () => {
  // Reset options and correct answer when type changes
  if (form.value.question_type === 'multiple_choice') {
    form.value.options = ['', '']
  } else if (form.value.question_type === 'true_false') {
    form.value.options = ['True', 'False']
  } else {
    form.value.options = []
  }
  form.value.correct_answer = ''
}

const addOption = () => {
  if (form.value.options.length < 6) {
    form.value.options.push('')
  }
}

const removeOption = (index: number) => {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1)
    // Update correct answer if it was the removed option
    if (form.value.correct_answer === form.value.options[index]) {
      form.value.correct_answer = ''
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const questionData: CreateQuestionRequest = {
      title: form.value.title,
      content: form.value.content,
      question_type: form.value.question_type,
      correct_answer: form.value.correct_answer,
      points: form.value.points,
      difficulty: form.value.difficulty,
      category: form.value.category,
      analysis: form.value.analysis
    }
    
    // Add options for multiple choice and true/false
    if (form.value.question_type === 'multiple_choice' || form.value.question_type === 'true_false') {
      questionData.options = form.value.options.filter(option => option.trim() !== '')
    }
    
    await questionsApi.createQuestion(questionData)
    ElMessage.success('题目创建成功')
    router.push('/questions')
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

onBeforeMount(async () => {
  const id = router.currentRoute.value.query.id
  if (id) {
    const res = await getQuestionById(id as unknown as number)
    form.value = (<any>res).question
    isEdit.value = true
  }
})

onMounted(() => {
  handleTypeChange()
})
</script>

<style scoped>
.create-question {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 0;
}

.el-card {
  background: rgba(255,255,255,0.85) !important;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border: none;
  backdrop-filter: blur(12px);
  padding: 32px 24px 18px 24px;
}
.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
  text-align: center;
}
.el-form {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.el-form-item {
  margin-bottom: 0 !important;
}
.el-input, .el-textarea {
  border-radius: 12px !important;
  font-size: 16px;
}
.el-input__inner, .el-textarea__inner {
  border-radius: 12px !important;
  font-size: 16px;
}
.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
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