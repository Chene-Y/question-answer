<template>
  <el-card class="import-card">
    <h2>批量导入题目（Excel）</h2>
    <el-upload
      class="upload-demo"
      drag
      :action="uploadUrl"
      :headers="headers"
      :show-file-list="false"
      :on-success="onSuccess"
      :on-error="onError"
      :before-upload="beforeUpload"
      accept=".xlsx,.xls"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">仅支持 .xlsx/.xls 格式，字段需包含：title, content, question_type, options, correct_answer, points, difficulty, category, analysis</div>
    </el-upload>
    <el-alert v-if="result" :title="result.message" :type="result.fail === 0 ? 'success' : 'warning'" show-icon style="margin-top:24px">
      <template #default>
        <div>成功：{{ result.success }}，失败：{{ result.fail }}</div>
        <div v-if="result.errors && result.errors.length">
          <el-collapse>
            <el-collapse-item title="失败详情" name="1">
              <div v-for="(err, i) in result.errors" :key="i" style="margin-bottom:8px;">
                <div>第{{ i+1 }}行：{{ err.error }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
    </el-alert>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const uploadUrl = (import.meta.env.VITE_API_BASE || 'api') + '/questions/import-excel';
const headers = { Authorization: 'Bearer ' + userStore.token };
const result = ref<any>(null);

function onSuccess(res: any) {
  result.value = res;
  console.log(res);
  
  if (res.fail === 0) {
    ElMessage.success('全部导入成功！');
  } else {
    ElMessage.warning('部分导入失败，请查看详情');
  }
}
function onError() {
  ElMessage.error('上传失败，请重试');
}
function beforeUpload(file: File) {
  const isExcel = file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件');
    return false;
  }
  return true;
}
</script>

<style scoped>
.import-card {
  max-width: 500px;
  margin: 40px auto;
  padding: 32px 24px;
}
</style> 