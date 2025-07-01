# 题目管理系统 API 文档

## 基础信息

- **基础URL**: `http://localhost:3001/api`
- **认证方式**: JWT Token (Bearer Token)
- **内容类型**: `application/json`

## 认证相关

### 用户注册
- **POST** `/auth/register`
- **描述**: 注册新用户
- **请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "teacher" | "student"
}
```
- **响应**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "teacher" | "student"
  }
}
```

### 用户登录
- **POST** `/auth/login`
- **描述**: 用户登录
- **请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "teacher" | "student"
  }
}
```

### 获取用户信息
- **GET** `/auth/profile`
- **描述**: 获取当前用户信息
- **认证**: 需要 JWT Token
- **响应**:
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "teacher" | "student",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 题目管理

### 获取题目列表
- **GET** `/questions`
- **描述**: 获取题目列表
- **认证**: 需要 JWT Token
- **查询参数**:
  - `category`: 题目分类
  - `difficulty`: 难度级别 (easy/medium/hard)
  - `type`: 题目类型 (multiple_choice/true_false/short_answer/essay)
- **响应**:
```json
{
  "questions": [
    {
      "id": 1,
      "title": "string",
      "content": "string",
      "question_type": "multiple_choice",
      "options": ["option1", "option2"],
      "points": 1,
      "difficulty": "easy",
      "category": "Mathematics",
      "created_by_name": "teacher1",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 获取题目详情
- **GET** `/questions/:id`
- **描述**: 获取单个题目详情
- **认证**: 需要 JWT Token
- **响应**:
```json
{
  "question": {
    "id": 1,
    "title": "string",
    "content": "string",
    "question_type": "multiple_choice",
    "options": ["option1", "option2"],
    "correct_answer": "option1", // 仅教师可见
    "points": 1,
    "difficulty": "easy",
    "category": "Mathematics",
    "created_by_name": "teacher1",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建题目 (仅教师)
- **POST** `/questions`
- **描述**: 创建新题目
- **认证**: 需要 JWT Token (教师角色)
- **请求体**:
```json
{
  "title": "string",
  "content": "string",
  "question_type": "multiple_choice" | "true_false" | "short_answer" | "essay",
  "options": ["option1", "option2"], // 可选，用于选择题
  "correct_answer": "string", // 可选
  "points": 1,
  "difficulty": "easy" | "medium" | "hard",
  "category": "string"
}
```
- **响应**:
```json
{
  "message": "Question created successfully",
  "questionId": 1
}
```

### 更新题目 (仅教师)
- **PUT** `/questions/:id`
- **描述**: 更新题目信息
- **认证**: 需要 JWT Token (教师角色，且为题目创建者)
- **请求体**: 同创建题目 (所有字段可选)
- **响应**:
```json
{
  "message": "Question updated successfully"
}
```

### 删除题目 (仅教师)
- **DELETE** `/questions/:id`
- **描述**: 删除题目 (软删除)
- **认证**: 需要 JWT Token (教师角色，且为题目创建者)
- **响应**:
```json
{
  "message": "Question deleted successfully"
}
```

## 答题相关

### 提交答案 (仅学生)
- **POST** `/answers/submit`
- **描述**: 学生提交答案
- **认证**: 需要 JWT Token (学生角色)
- **请求体**:
```json
{
  "question_id": 1,
  "answer": "string"
}
```
- **响应**:
```json
{
  "message": "Answer submitted successfully",
  "isCorrect": true,
  "score": 1,
  "totalPoints": 1
}
```

### 获取我的答案
- **GET** `/answers/my-answers`
- **描述**: 获取当前用户的答题记录
- **认证**: 需要 JWT Token
- **响应**:
```json
{
  "answers": [
    {
      "id": 1,
      "student_id": 1,
      "question_id": 1,
      "answer": "string",
      "is_correct": true,
      "score": 1,
      "submitted_at": "2024-01-01T00:00:00.000Z",
      "title": "题目标题",
      "content": "题目内容",
      "question_type": "multiple_choice",
      "points": 1,
      "student_name": "student1"
    }
  ]
}
```

### 获取学习统计
- **GET** `/answers/my-stats`
- **描述**: 获取当前用户的学习统计
- **认证**: 需要 JWT Token
- **响应**:
```json
{
  "stats": {
    "totalAnswered": 10,
    "correctAnswers": 8,
    "totalScore": 15,
    "totalPossible": 20,
    "accuracy": 80,
    "percentage": 75
  }
}
```

### 获取题目统计 (仅教师)
- **GET** `/answers/question-stats/:questionId`
- **描述**: 获取特定题目的答题统计
- **认证**: 需要 JWT Token (教师角色)
- **响应**:
```json
{
  "question": {
    "id": 1,
    "title": "string",
    "content": "string"
  },
  "stats": {
    "totalAnswers": 10,
    "correctAnswers": 8,
    "averageScore": 0.8,
    "minScore": 0,
    "maxScore": 1,
    "accuracy": 80
  }
}
```

## 系统状态

### 健康检查
- **GET** `/health`
- **描述**: 检查API服务状态
- **响应**:
```json
{
  "status": "OK",
  "message": "Question Management API is running"
}
```

## 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "message": "错误描述",
  "errors": [
    {
      "field": "字段名",
      "message": "具体错误信息"
    }
  ]
}
```

## 常见HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 认证头格式

在需要认证的请求中，需要在请求头中添加：

```
Authorization: Bearer <your_jwt_token>
```

## 示例用户

系统预置了以下示例用户：

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