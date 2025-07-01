# 故障排除指南

## 常见问题及解决方案

### 1. crypto.getRandomValues is not a function

**问题描述：**
```
TypeError: crypto$2.getRandomValues is not a function
```

**解决方案：**

#### 方案1：使用浏览器环境
确保在浏览器环境中运行，而不是Node.js环境：
```bash
# 在frontend目录下运行
npm run dev
```

#### 方案2：检查Node.js版本
确保使用Node.js 16+版本：
```bash
node --version
```

#### 方案3：清除缓存并重新安装
```bash
# 清除node_modules和缓存
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 方案4：使用不同的启动方式
如果问题持续存在，可以尝试：
```bash
# 使用npx直接运行vite
npx vite --port 3000
```

### 2. TypeScript类型错误

**问题描述：**
```
Cannot find module 'vue' or its corresponding type declarations
```

**解决方案：**
```bash
# 重新安装依赖
npm install

# 或者单独安装类型定义
npm install --save-dev @types/node
```

### 3. 端口冲突

**问题描述：**
```
Port 3000 is already in use
```

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者使用不同端口
npm run dev -- --port 3001
```

### 4. 依赖版本冲突

**问题描述：**
```
Peer dependency conflicts
```

**解决方案：**
```bash
# 使用--legacy-peer-deps
npm install --legacy-peer-deps

# 或者使用yarn
yarn install
```

### 5. 构建错误

**问题描述：**
```
Build failed with errors
```

**解决方案：**
```bash
# 检查TypeScript错误
npx vue-tsc --noEmit

# 修复lint错误
npm run lint -- --fix
```

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（Chrome, Firefox, Safari, Edge）

## 开发环境设置

1. **安装依赖：**
   ```bash
   npm install
   ```

2. **启动开发服务器：**
   ```bash
   npm run dev
   ```

3. **访问应用：**
   - 打开浏览器访问 http://localhost:3000

## 生产环境构建

1. **构建应用：**
   ```bash
   npm run build
   ```

2. **预览构建结果：**
   ```bash
   npm run preview
   ```

## 调试技巧

1. **查看控制台错误：**
   - 打开浏览器开发者工具
   - 查看Console标签页的错误信息

2. **网络请求调试：**
   - 查看Network标签页
   - 检查API请求是否正常

3. **Vue DevTools：**
   - 安装Vue DevTools浏览器扩展
   - 查看组件状态和路由信息

## 联系支持

如果问题仍然存在，请：
1. 检查错误日志
2. 提供详细的错误信息
3. 说明使用的操作系统和Node.js版本 