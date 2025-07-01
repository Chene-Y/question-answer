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
                v-for="(option, index) in form.options"
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
import { ref, reactive, onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import * as questionsApi from '@/api/questions'
import type { CreateQuestionRequest } from '@/types'
import { getQuestionById } from '@/api/questions'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

let form = ref<CreateQuestionRequest & { options: string[] }>({
  title: '',
  content: '',
  question_type: 'multiple_choice',
  options: ['', ''],
  correct_answer: '',
  points: 1,
  difficulty: 'medium',
  category: ''
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
      category: form.value.category
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
    const res = await getQuestionById(id)
    form.value = res.question
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
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
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
</style> 