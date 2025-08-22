# 🤝 贡献指南

感谢您对 DeskTODOList 项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、设计还是反馈建议。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [分支策略](#分支策略)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [Issue 指南](#issue-指南)
- [代码审查](#代码审查)
- [发布流程](#发布流程)

## 🛠️ 开发环境设置

### 前置要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git >= 2.20.0

### 环境配置

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/your-username/DeskTODOList.git
cd DeskTODOList

# 2. 添加上游仓库
git remote add upstream https://github.com/original-owner/DeskTODOList.git

# 3. 安装依赖
npm install

# 4. 安装开发工具
npm run prepare  # 安装 husky hooks

# 5. 启动开发服务器
npm run dev
```

### 开发工具配置

推荐使用 VS Code 并安装以下扩展：
- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense
- GitLens

## 📏 代码规范

### TypeScript/JavaScript 规范

我们使用 ESLint + Prettier 来保证代码质量和一致性。

```bash
# 检查代码规范
npm run lint

# 自动修复代码格式
npm run lint:fix

# 格式化代码
npm run format
```

### 命名规范

#### 文件命名
- 组件文件：`PascalCase.tsx` (如 `TaskItem.tsx`)
- 工具函数：`camelCase.ts` (如 `dateUtils.ts`)
- 常量文件：`UPPER_SNAKE_CASE.ts` (如 `API_CONSTANTS.ts`)
- 样式文件：`kebab-case.css` (如 `task-item.css`)

#### 变量命名
```typescript
// ✅ 正确
const userName = 'john';
const isTaskCompleted = true;
const MAX_RETRY_COUNT = 3;

// ❌ 错误
const user_name = 'john';
const flag = true;
const maxretrycount = 3;
```

#### 函数命名
```typescript
// ✅ 正确 - 动词开头，描述功能
function createTask(title: string): Task { }
function validateEmail(email: string): boolean { }
function handleTaskClick(): void { }

// ❌ 错误
function task(title: string): Task { }
function email(email: string): boolean { }
function click(): void { }
```

#### 组件命名
```typescript
// ✅ 正确 - PascalCase，描述性
const TaskList = () => { };
const TaskEditModal = () => { };
const UserProfileCard = () => { };

// ❌ 错误
const taskList = () => { };
const Modal = () => { };
const Card = () => { };
```

### 代码结构规范

#### 组件结构
```typescript
// TaskItem.tsx
import React from 'react';
import { Task } from '../types';
import { formatDate } from '../utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * 任务项组件
 * 用于显示单个任务的信息和操作按钮
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete
}) => {
  // 事件处理函数
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  // 渲染逻辑
  return (
    <div className="task-item">
      {/* 组件内容 */}
    </div>
  );
};
```

#### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   └── features/       # 功能组件
├── hooks/              # 自定义Hooks
├── stores/             # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── constants/          # 常量定义
└── styles/             # 样式文件
```

### 注释规范

#### 组件注释
```typescript
/**
 * 任务列表组件
 * 
 * @description 显示用户的所有任务，支持筛选、排序和批量操作
 * @author 张三
 * @since 1.0.0
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, filters }) => {
  // 组件实现
};
```

#### 函数注释
```typescript
/**
 * 验证邮箱格式
 * 
 * @param email - 待验证的邮箱地址
 * @returns 验证结果，true表示格式正确
 * @example
 * ```typescript
 * const isValid = validateEmail('user@example.com'); // true
 * ```
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

#### 复杂逻辑注释
```typescript
// 根据任务优先级和截止日期计算排序权重
// 优先级权重：紧急(4) > 重要(3) > 普通(2) > 低(1)
// 截止日期权重：今天(100) > 明天(50) > 本周(25) > 其他(10)
const calculateTaskWeight = (task: Task): number => {
  const priorityWeight = PRIORITY_WEIGHTS[task.priority];
  const dueDateWeight = calculateDueDateWeight(task.dueDate);
  return priorityWeight * dueDateWeight;
};
```

## 🌿 分支策略

我们采用 Git Flow 分支模型：

### 主要分支
- `main`: 生产环境分支，只包含稳定的发布版本
- `develop`: 开发分支，包含最新的开发功能

### 辅助分支
- `feature/*`: 功能开发分支
- `bugfix/*`: Bug修复分支
- `hotfix/*`: 紧急修复分支
- `release/*`: 发布准备分支

### 分支命名规范
```bash
# 功能开发
feature/task-management
feature/user-authentication

# Bug修复
bugfix/task-deletion-error
bugfix/ui-layout-issue

# 紧急修复
hotfix/security-vulnerability
hotfix/data-loss-bug
```

### 分支操作流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name

# 2. 开发完成后推送分支
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 3. 创建 Pull Request 到 develop 分支
```

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具、依赖更新等

### 提交示例
```bash
# 新功能
git commit -m "feat(task): add task priority setting"

# Bug修复
git commit -m "fix(ui): resolve task list scrolling issue"

# 文档更新
git commit -m "docs: update API documentation"

# 重构
git commit -m "refactor(store): simplify task state management"
```

### 提交检查
我们使用 husky 和 commitlint 来检查提交格式：

```bash
# 提交前会自动运行
- ESLint 检查
- Prettier 格式化
- TypeScript 类型检查
- 提交信息格式检查
```

## 🔄 Pull Request 流程

### PR 创建前检查清单
- [ ] 代码已通过所有测试
- [ ] 代码符合项目规范
- [ ] 已添加必要的测试用例
- [ ] 文档已更新（如需要）
- [ ] 提交信息符合规范
- [ ] 分支已与最新的 develop 同步

### PR 模板
创建 PR 时请使用以下模板：

```markdown
## 📋 变更描述
简要描述本次PR的主要变更内容

## 🎯 变更类型
- [ ] 新功能 (feature)
- [ ] Bug修复 (bugfix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试相关 (test)
- [ ] 其他 (chore)

## 🧪 测试
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已完成

## 📸 截图/演示
（如果是UI相关变更，请提供截图或GIF）

## 📝 其他说明
（任何需要特别说明的内容）
```

### 代码审查要求
- 所有PR必须经过至少1名维护者审查
- 重要功能需要2名维护者审查
- 审查通过后才能合并到目标分支

## 🐛 Issue 指南

### Issue 类型
我们使用标签来分类 Issue：

- `bug`: 程序错误
- `enhancement`: 功能增强
- `feature`: 新功能请求
- `documentation`: 文档相关
- `question`: 使用问题
- `help wanted`: 需要帮助
- `good first issue`: 适合新手

### Bug 报告模板
```markdown
## 🐛 Bug 描述
简要描述遇到的问题

## 🔄 复现步骤
1. 打开应用
2. 点击...
3. 输入...
4. 看到错误

## 🎯 期望行为
描述期望的正确行为

## 📱 环境信息
- 操作系统: [如 Windows 11]
- 浏览器: [如 Chrome 120]
- 应用版本: [如 v1.0.0]

## 📸 截图
（如果适用，请提供截图）

## 📝 其他信息
（任何可能有助于解决问题的额外信息）
```

### 功能请求模板
```markdown
## 🚀 功能描述
简要描述建议的新功能

## 🎯 使用场景
描述什么情况下会用到这个功能

## 💡 解决方案
描述你期望的解决方案

## 🔄 替代方案
描述你考虑过的其他解决方案

## 📝 其他信息
（任何其他相关信息）
```

## 👀 代码审查

### 审查重点
1. **功能正确性**: 代码是否实现了预期功能
2. **代码质量**: 是否遵循项目规范和最佳实践
3. **性能影响**: 是否存在性能问题
4. **安全性**: 是否存在安全漏洞
5. **可维护性**: 代码是否易于理解和维护
6. **测试覆盖**: 是否有足够的测试用例

### 审查清单
- [ ] 代码逻辑正确
- [ ] 命名规范清晰
- [ ] 注释充分合理
- [ ] 错误处理完善
- [ ] 性能考虑周全
- [ ] 安全性检查
- [ ] 测试用例充分
- [ ] 文档更新及时

## 🚀 发布流程

### 版本号规范
我们遵循 [Semantic Versioning](https://semver.org/) 规范：
- `MAJOR.MINOR.PATCH` (如 1.2.3)
- MAJOR: 不兼容的API变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修正

### 发布步骤
1. 从 `develop` 创建 `release/x.x.x` 分支
2. 更新版本号和 CHANGELOG
3. 进行发布测试
4. 合并到 `main` 并打标签
5. 合并回 `develop`
6. 发布到各平台

## 🙋‍♀️ 获取帮助

如果您在贡献过程中遇到任何问题，可以通过以下方式获取帮助：

- 📧 发送邮件到: contribute@desktodolist.com
- 💬 在 [GitHub Discussions](https://github.com/your-username/DeskTODOList/discussions) 提问
- 🐛 创建 [Issue](https://github.com/your-username/DeskTODOList/issues) 寻求帮助

## 🎉 致谢

感谢所有为 DeskTODOList 项目做出贡献的开发者！您的每一份贡献都让这个项目变得更好。

---

再次感谢您的贡献！🙏