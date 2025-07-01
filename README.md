# 题目管理系统

一个基于 Vue 3.0 + TypeScript + Express + MySQL 的完整题目管理系统，支持教师创建题目和学生在线答题。

## 功能特性

### 教师端功能
- ✅ 用户注册/登录
- ✅ 题目创建（支持选择题、判断题、简答题、论述题）
- ✅ 题目管理（增删改查）
- ✅ 查看学生答题情况和统计
- ✅ 个人资料管理

### 学生端功能
- ✅ 用户注册/登录
- ✅ 查看可答题目列表
- ✅ 在线答题（支持多种题型）
- ✅ 查看答题结果和正确答案
- ✅ 学习统计和进度跟踪
- ✅ 个人资料管理

## 技术栈

### 前端
- **Vue 3.0** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理库
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP 客户端
- **Vite** - 构建工具

### 后端
- **Express** - Node.js Web 应用框架
- **TypeScript** - 类型安全的 JavaScript
- **MySQL** - 关系型数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **mysql2** - MySQL 驱动

## 项目结构

```
question-answer/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── types/          # 类型定义
│   │   └── database/       # 数据库相关
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   ├── types/         # 类型定义
│   │   └── views/         # 页面组件
│   ├── package.json
│   └── vite.config.ts
└── package.json           # 根目录管理脚本
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd question-answer
```

### 2. 安装依赖
```bash
# 安装所有依赖（包括前端和后端）
npm run install:all
```

### 3. 数据库配置
1. 创建 MySQL 数据库
2. 复制环境变量文件：
   ```bash
   cd backend
   cp env.example .env
   ```
3. 编辑 `.env` 文件，配置数据库连接信息：
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=question_management
   ```
4. 执行数据库初始化脚本：
   ```bash
   mysql -u root -p < src/database/schema.sql
   ```

### 4. 启动服务
```bash
# 同时启动前端和后端服务
npm run dev

# 或者分别启动
npm run dev:frontend  # 前端服务 (http://localhost:3000)
npm run dev:backend   # 后端服务 (http://localhost:3001)
```

### 5. 访问应用
- 前端应用：http://localhost:3000
- 后端 API：http://localhost:3001/api

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 题目相关
- `GET /api/questions` - 获取题目列表
- `GET /api/questions/:id` - 获取题目详情
- `POST /api/questions` - 创建题目（教师）
- `PUT /api/questions/:id` - 更新题目（教师）
- `DELETE /api/questions/:id` - 删除题目（教师）

### 答题相关
- `POST /api/answers/submit` - 提交答案（学生）
- `GET /api/answers/my-answers` - 获取答题记录
- `GET /api/answers/my-stats` - 获取学习统计
- `GET /api/answers/question-stats/:questionId` - 获取题目统计（教师）

## 开发指南

### 前端开发
```bash
cd frontend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm run lint         # 代码检查
```

### 后端开发
```bash
cd backend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
```

### 数据库管理
- 数据库脚本位于 `backend/src/database/schema.sql`
- 包含表结构创建和示例数据插入

## 部署说明

### 生产环境部署
1. 构建前端：
   ```bash
   cd frontend
   npm run build
   ```

2. 构建后端：
   ```bash
   cd backend
   npm run build
   ```

3. 配置生产环境变量
4. 使用 PM2 或 Docker 部署

### Docker 部署（可选）
```bash
# 构建镜像
docker build -t question-management .

# 运行容器
docker run -p 3000:3000 -p 3001:3001 question-management
```

## 功能截图

### 登录页面
- 支持用户名/密码登录
- 角色选择（教师/学生）

### 教师端
- 题目管理界面
- 创建题目表单
- 学生答题统计

### 学生端
- 题目列表
- 答题界面
- 学习统计

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至：[your-email@example.com]

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 初始版本发布
- ✅ 完整的教师和学生功能
- ✅ Vue 3.0 + TypeScript 前端
- ✅ Express + MySQL 后端
- ✅ JWT 认证系统
- ✅ 响应式设计 