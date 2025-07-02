<template>
  <el-card class="import-card glass-card">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="flex:1"></div>
        <el-button @click="router.go(-1)" type="primary" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回
        </el-button>
      </div>
    </template>
    <h2 class="import-title">批量导入题目（Excel）</h2>
    <el-upload
      class="upload-demo import-upload"
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
      <div class="el-upload__tip" slot="tip">仅支持 .xlsx/.xls 格式，字段需包含：题目标题, 题目内容, 题目类型, 选项, 正确答案, 分值, 难度, 分类, 解析</div>
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
import { useRouter } from 'vue-router'

const userStore = useUserStore();
const uploadUrl = (import.meta.env.VITE_API_BASE || 'api') + '/questions/import-excel';
const headers = { Authorization: 'Bearer ' + userStore.token };
const result = ref<any>(null);
const router = useRouter()

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
.import-card.glass-card {
  max-width: 520px;
  margin: 48px auto;
  padding: 38px 32px 32px 32px;
  background: rgba(255,255,255,0.88) !important;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.13);
  border: none;
  backdrop-filter: blur(12px);
}
.import-title {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
  margin-bottom: 28px;
}
.import-upload {
  width: 100%;
  margin-bottom: 24px;
}
.upload-demo {
  border: 2px dashed #409eff;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafd 60%, #e8f6ff 100%);
  padding: 32px 0 18px 0;
  transition: border-color 0.2s;
}
.upload-demo:hover {
  border-color: #67c23a;
}
.el-upload__text {
  font-size: 16px;
  color: #409eff;
  margin-bottom: 8px;
}
.el-upload__tip {
  color: #888;
  font-size: 13px;
  margin-top: 8px;
}
.el-alert {
  margin-top: 28px;
  border-radius: 12px;
  font-size: 15px;
}
.el-button[type="primary"], .el-button[type="success"] {
  border-radius: 14px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px #409eff22;
  border: none;
  transition: all 0.2s;
}
.el-button[type="primary"]:hover, .el-button[type="success"]:hover {
  background: linear-gradient(135deg, #67c23a, #409eff);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px #67c23a33;
}
.el-button {
  border-radius: 12px;
}
</style> 