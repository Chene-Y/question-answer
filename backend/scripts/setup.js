#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 题目管理系统后端设置脚本');
console.log('==============================\n');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 错误: 需要 Node.js 16 或更高版本');
  console.error(`当前版本: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js 版本检查通过: ${nodeVersion}`);

// 检查是否在正确的目录
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ 错误: 请在 backend 目录下运行此脚本');
  process.exit(1);
}

// 安装依赖
console.log('\n📦 安装依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依赖安装完成');
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message);
  process.exit(1);
}

// 创建环境变量文件
const envExamplePath = path.join(__dirname, '..', 'env.example');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('\n⚙️ 创建环境变量文件...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ 环境变量文件创建完成');
    console.log('📝 请编辑 .env 文件配置数据库连接信息');
  } catch (error) {
    console.error('❌ 环境变量文件创建失败:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 环境变量文件已存在');
}

// 创建日志目录
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('\n📁 创建日志目录...');
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ 日志目录创建完成');
  } catch (error) {
    console.error('❌ 日志目录创建失败:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 日志目录已存在');
}

// 编译TypeScript
console.log('\n🔨 编译TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ TypeScript编译完成');
} catch (error) {
  console.error('❌ TypeScript编译失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 设置完成！');
console.log('\n📋 下一步操作:');
console.log('1. 编辑 .env 文件配置数据库连接');
console.log('2. 确保MySQL服务正在运行');
console.log('3. 运行 npm run dev 启动开发服务器');
console.log('\n📚 更多信息请查看 README.md');

// 检查是否有.env文件并提示配置
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_password') || envContent.includes('your_jwt_secret')) {
    console.log('\n⚠️  提醒: 请更新 .env 文件中的默认配置值');
  }
} 