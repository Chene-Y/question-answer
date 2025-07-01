# 题目管理系统后端

基于 Express.js + TypeScript + MySQL 的题目管理系统后端API。

## 功能特性

- 🔐 JWT认证和授权
- 👥 用户角色管理 (教师/学生)
- 📝 题目CRUD操作
- ✅ 答题和评分系统
- 📊 学习统计和分析
- 🛡️ 输入验证和错误处理
- 📝 完整的日志记录
- 🗄️ 自动数据库初始化

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **验证**: express-validator
- **日志**: 自定义日志系统

## 快速开始

### 1. 环境要求

- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 环境配置

复制环境变量模板文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=question_management

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### 4. 数据库设置

确保MySQL服务正在运行，然后创建数据库：

```sql
CREATE DATABASE question_management;
```

### 5. 启动服务

#### 开发模式
```bash
npm run dev
```

#### 生产模式
```bash
npm run build
npm start
```

服务将在 `http://localhost:3001` 启动。

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.ts  # 数据库连接配置
│   │   └── env.ts       # 环境配置
│   │   └── logger.ts    # 日志记录
│   ├── controllers/     # 控制器
│   │   ├── authController.ts    # 认证控制器
│   │   ├── questionController.ts # 题目控制器
│   │   └── answerController.ts  # 答案控制器
│   ├── database/        # 数据库相关
│   │   ├── schema.sql   # 数据库结构
│   │   └── init.ts      # 数据库初始化
│   ├── middleware/      # 中间件
│   │   └── auth.ts      # 认证中间件
│   ├── routes/          # 路由
│   │   ├── authRoutes.ts
│   │   ├── questionRoutes.ts
│   │   ├── answerRoutes.ts
│   │   └── index.ts
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   ├── validation.ts # 输入验证
│   │   ├── errorHandler.ts # 错误处理
│   │   └── logger.ts    # 日志记录
│   └── index.ts         # 应用入口
├── logs/                # 日志文件目录
├── dist/                # 编译输出目录
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 题目管理接口
- `GET /api/questions` - 获取题目列表
- `GET /api/questions/:id` - 获取题目详情
- `POST /api/questions` - 创建题目 (仅教师)
- `PUT /api/questions/:id` - 更新题目 (仅教师)
- `DELETE /api/questions/:id` - 删除题目 (仅教师)

### 答题接口
- `POST /api/answers/submit` - 提交答案 (仅学生)
- `GET /api/answers/my-answers` - 获取我的答案
- `GET /api/answers/my-stats` - 获取学习统计
- `GET /api/answers/question-stats/:questionId` - 获取题目统计 (仅教师)

### 系统接口
- `GET /api/health` - 健康检查

详细API文档请参考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 示例用户

系统启动时会自动创建以下示例用户：

### 教师账户
- 用户名: `teacher1`
- 密码: `password123`
- 角色: `teacher`

### 学生账户
- 用户名: `student1`
- 密码: `password123`
- 角色: `student`

- 用户名: `student2`
- 密码: `password123`
- 角色: `student`

## 开发指南

### 添加新的路由

1. 在 `src/controllers/` 中创建控制器
2. 在 `src/routes/` 中创建路由文件
3. 在 `src/routes/index.ts` 中注册路由
4. 添加相应的类型定义到 `src/types/index.ts`

### 添加新的中间件

1. 在 `src/middleware/` 中创建中间件文件
2. 在路由中应用中间件

### 数据库迁移

1. 修改 `src/database/schema.sql`
2. 更新 `src/database/init.ts` 中的初始化逻辑

## 日志系统

系统会自动记录以下日志：

- 请求日志 (HTTP请求/响应)
- 错误日志 (异常和错误)
- 调试日志 (开发环境)
- 信息日志 (重要操作)

日志文件保存在 `logs/` 目录下，按日期分文件。

## 错误处理

系统使用统一的错误处理机制：

- 自动捕获和记录错误
- 返回标准化的错误响应
- 开发环境显示详细错误信息
- 生产环境隐藏敏感信息

## 安全特性

- JWT令牌认证
- 密码bcrypt加密
- 输入验证和清理
- SQL注入防护
- CORS配置
- 角色权限控制

## 性能优化

- 数据库连接池
- 请求日志记录
- 错误处理优化
- 静态文件缓存

## 部署

### 生产环境部署

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库
3. 设置强密码的JWT密钥
4. 使用PM2或类似工具管理进程

```bash
npm run build
NODE_ENV=production npm start
```

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证数据库连接配置
   - 确认数据库用户权限

2. **JWT认证失败**
   - 检查JWT_SECRET配置
   - 确认令牌格式正确
   - 验证令牌是否过期

3. **端口被占用**
   - 修改PORT环境变量
   - 检查其他服务是否占用端口

4. **编译错误**
   - 检查TypeScript语法
   - 确认所有依赖已安装
   - 验证tsconfig.json配置

### 调试模式

设置环境变量启用调试模式：

```bash
NODE_ENV=development DEBUG=* npm run dev
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License 