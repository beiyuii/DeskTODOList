# 📋 Issue 模板指南

> 为 DeskTODOList 项目提供标准化的 Issue 报告模板

本文档包含了在 GitHub 项目中使用的各种 Issue 模板，帮助贡献者提供高质量的问题报告和功能请求。

## 📁 模板文件结构

在 GitHub 项目中，这些模板应该放置在 `.github/ISSUE_TEMPLATE/` 目录下：

```
.github/
└── ISSUE_TEMPLATE/
    ├── bug_report.yml
    ├── feature_request.yml
    ├── performance_issue.yml
    ├── documentation.yml
    └── question.yml
```

---

## 🐛 Bug 报告模板

**文件名**: `bug_report.yml`

```yaml
name: 🐛 Bug 报告
description: 报告一个 bug 来帮助我们改进
title: "[Bug]: "
labels: ["bug", "needs-triage"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        感谢您花时间填写这个 bug 报告！请提供尽可能详细的信息，这将帮助我们更快地定位和修复问题。

  - type: textarea
    id: bug-description
    attributes:
      label: 🐛 Bug 描述
      description: 清晰简洁地描述这个 bug
      placeholder: 描述您遇到的问题...
    validations:
      required: true

  - type: textarea
    id: reproduction-steps
    attributes:
      label: 🔄 重现步骤
      description: 详细描述如何重现这个问题
      placeholder: |
        1. 打开应用
        2. 点击 '...'
        3. 滚动到 '...'
        4. 看到错误
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: ✅ 预期行为
      description: 描述您期望发生什么
      placeholder: 应该发生什么...
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: ❌ 实际行为
      description: 描述实际发生了什么
      placeholder: 实际发生了什么...
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: 📸 截图
      description: 如果适用，请添加截图来帮助解释您的问题
      placeholder: 拖拽图片到这里或点击上传...
    validations:
      required: false

  - type: dropdown
    id: operating-system
    attributes:
      label: 💻 操作系统
      description: 您使用的操作系统
      options:
        - Windows 11
        - Windows 10
        - macOS Ventura (13.x)
        - macOS Monterey (12.x)
        - macOS Big Sur (11.x)
        - Ubuntu 22.04
        - Ubuntu 20.04
        - Other Linux
        - Other
    validations:
      required: true

  - type: input
    id: app-version
    attributes:
      label: 📱 应用版本
      description: 您使用的 DeskTODOList 版本
      placeholder: 例如：v1.0.0
    validations:
      required: true

  - type: textarea
    id: system-info
    attributes:
      label: 🖥️ 系统信息
      description: 其他相关的系统信息
      placeholder: |
        - 内存：8GB
        - 处理器：Intel i5
        - 显卡：集成显卡
        - 其他相关软件版本
    validations:
      required: false

  - type: textarea
    id: logs
    attributes:
      label: 📋 日志信息
      description: 如果有相关的错误日志，请粘贴在这里
      placeholder: 粘贴错误日志...
      render: shell
    validations:
      required: false

  - type: dropdown
    id: severity
    attributes:
      label: 🚨 严重程度
      description: 这个 bug 对您的使用影响有多大？
      options:
        - 低 - 轻微的不便，有替代方案
        - 中 - 影响部分功能，但可以继续使用
        - 高 - 严重影响使用体验
        - 紧急 - 应用无法使用或数据丢失
    validations:
      required: true

  - type: checkboxes
    id: checklist
    attributes:
      label: ✅ 检查清单
      description: 请确认您已经完成以下检查
      options:
        - label: 我已经搜索了现有的 issues，确认这不是重复报告
          required: true
        - label: 我已经尝试重启应用来解决问题
          required: true
        - label: 我使用的是最新版本的应用
          required: false
        - label: 我愿意协助测试修复方案
          required: false
```

---

## 💡 功能请求模板

**文件名**: `feature_request.yml`

```yaml
name: 💡 功能请求
description: 建议一个新功能或改进
title: "[Feature]: "
labels: ["enhancement", "needs-discussion"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        感谢您的功能建议！请详细描述您的想法，这将帮助我们更好地理解和评估这个功能。

  - type: textarea
    id: feature-description
    attributes:
      label: 💡 功能描述
      description: 清晰简洁地描述您想要的功能
      placeholder: 我希望能够...
    validations:
      required: true

  - type: textarea
    id: problem-statement
    attributes:
      label: 🎯 问题陈述
      description: 这个功能要解决什么问题？
      placeholder: 目前我遇到的问题是...
    validations:
      required: true

  - type: textarea
    id: proposed-solution
    attributes:
      label: 🛠️ 建议的解决方案
      description: 您希望这个功能如何工作？
      placeholder: 我建议...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: 🔄 替代方案
      description: 您考虑过其他解决方案吗？
      placeholder: 我也考虑过...
    validations:
      required: false

  - type: textarea
    id: use-cases
    attributes:
      label: 📋 使用场景
      description: 详细描述这个功能的使用场景
      placeholder: |
        场景1：当我...
        场景2：如果我需要...
        场景3：在...情况下
    validations:
      required: true

  - type: textarea
    id: mockups
    attributes:
      label: 🎨 界面设计/原型
      description: 如果有界面相关的建议，请提供设计图或描述
      placeholder: 拖拽图片到这里或描述界面设计...
    validations:
      required: false

  - type: dropdown
    id: priority
    attributes:
      label: 📈 优先级
      description: 您认为这个功能的优先级如何？
      options:
        - 低 - 有了更好，没有也可以
        - 中 - 会显著改善使用体验
        - 高 - 对我的工作流程很重要
        - 紧急 - 没有这个功能无法正常使用
    validations:
      required: true

  - type: dropdown
    id: complexity
    attributes:
      label: 🔧 预估复杂度
      description: 您认为实现这个功能的复杂度如何？
      options:
        - 简单 - 可能只需要界面调整
        - 中等 - 需要一些逻辑开发
        - 复杂 - 需要重大架构改动
        - 不确定 - 我不了解技术实现
    validations:
      required: false

  - type: checkboxes
    id: feature-checklist
    attributes:
      label: ✅ 检查清单
      description: 请确认以下事项
      options:
        - label: 我已经搜索了现有的 issues 和 discussions，确认这不是重复建议
          required: true
        - label: 我已经查看了项目路线图，确认这个功能不在计划中
          required: true
        - label: 这个功能符合项目的整体目标和定位
          required: true
        - label: 我愿意参与功能的设计讨论
          required: false
        - label: 如果可能，我愿意协助开发这个功能
          required: false
```

---

## ⚡ 性能问题模板

**文件名**: `performance_issue.yml`

```yaml
name: ⚡ 性能问题
description: 报告应用性能相关的问题
title: "[Performance]: "
labels: ["performance", "needs-investigation"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        感谢您报告性能问题！详细的性能数据将帮助我们更好地优化应用。

  - type: textarea
    id: performance-issue
    attributes:
      label: ⚡ 性能问题描述
      description: 描述您遇到的性能问题
      placeholder: 应用在...时变得很慢
    validations:
      required: true

  - type: dropdown
    id: performance-type
    attributes:
      label: 📊 性能问题类型
      description: 选择最符合的性能问题类型
      options:
        - 启动缓慢
        - 界面卡顿
        - 内存占用过高
        - CPU 使用率过高
        - 响应延迟
        - 数据加载慢
        - 其他
    validations:
      required: true

  - type: textarea
    id: reproduction-scenario
    attributes:
      label: 🔄 重现场景
      description: 详细描述在什么情况下出现性能问题
      placeholder: |
        1. 打开应用
        2. 加载大量任务（约多少个）
        3. 执行什么操作
        4. 观察到性能问题
    validations:
      required: true

  - type: input
    id: data-scale
    attributes:
      label: 📈 数据规模
      description: 您的数据规模（任务数量、标签数量等）
      placeholder: 例如：500个任务，20个标签
    validations:
      required: false

  - type: textarea
    id: performance-metrics
    attributes:
      label: 📊 性能指标
      description: 如果有具体的性能数据，请提供
      placeholder: |
        - 启动时间：10秒
        - 内存占用：500MB
        - CPU 使用率：80%
        - 响应时间：3秒
    validations:
      required: false

  - type: textarea
    id: system-specs
    attributes:
      label: 💻 系统配置
      description: 详细的系统配置信息
      placeholder: |
        - 操作系统：Windows 11
        - 处理器：Intel i5-8400
        - 内存：8GB DDR4
        - 存储：SSD 256GB
        - 显卡：集成显卡
    validations:
      required: true

  - type: dropdown
    id: impact-level
    attributes:
      label: 🚨 影响程度
      description: 这个性能问题对您的使用影响有多大？
      options:
        - 轻微 - 偶尔注意到，不影响使用
        - 中等 - 明显感觉到，但可以忍受
        - 严重 - 显著影响使用体验
        - 极严重 - 几乎无法正常使用
    validations:
      required: true

  - type: checkboxes
    id: performance-checklist
    attributes:
      label: ✅ 检查清单
      description: 请确认您已经尝试以下操作
      options:
        - label: 我已经重启了应用
          required: true
        - label: 我已经检查了系统资源使用情况
          required: true
        - label: 我已经尝试清理了应用数据/缓存
          required: false
        - label: 我使用的是最新版本的应用
          required: false
```

---

## 📚 文档问题模板

**文件名**: `documentation.yml`

```yaml
name: 📚 文档问题
description: 报告文档相关的问题或建议改进
title: "[Docs]: "
labels: ["documentation", "good first issue"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        感谢您帮助改进我们的文档！清晰的文档对项目非常重要。

  - type: dropdown
    id: doc-type
    attributes:
      label: 📋 文档类型
      description: 这个问题涉及哪种类型的文档？
      options:
        - README.md
        - 用户指南 (USER_GUIDE.md)
        - 贡献指南 (CONTRIBUTING.md)
        - API 文档
        - 技术架构文档
        - FAQ
        - 其他
    validations:
      required: true

  - type: dropdown
    id: issue-type
    attributes:
      label: 🔍 问题类型
      description: 选择最符合的问题类型
      options:
        - 内容错误
        - 信息过时
        - 缺少信息
        - 表达不清
        - 格式问题
        - 翻译问题
        - 新增内容建议
    validations:
      required: true

  - type: textarea
    id: doc-issue
    attributes:
      label: 📝 问题描述
      description: 详细描述文档中的问题
      placeholder: 在文档的...部分，我发现...
    validations:
      required: true

  - type: input
    id: doc-location
    attributes:
      label: 📍 文档位置
      description: 问题所在的具体位置（文件名、章节、行号等）
      placeholder: 例如：README.md 第3章节，USER_GUIDE.md 第45行
    validations:
      required: false

  - type: textarea
    id: current-content
    attributes:
      label: 📄 当前内容
      description: 如果适用，请粘贴当前有问题的内容
      placeholder: 当前的文档内容...
    validations:
      required: false

  - type: textarea
    id: suggested-content
    attributes:
      label: ✏️ 建议的内容
      description: 您建议如何修改或添加内容？
      placeholder: 建议修改为...
    validations:
      required: false

  - type: checkboxes
    id: doc-checklist
    attributes:
      label: ✅ 检查清单
      description: 请确认以下事项
      options:
        - label: 我已经搜索了现有的文档相关 issues
          required: true
        - label: 我已经查看了最新版本的文档
          required: true
        - label: 如果可能，我愿意协助修改文档
          required: false
```

---

## ❓ 问题咨询模板

**文件名**: `question.yml`

```yaml
name: ❓ 问题咨询
description: 询问使用方法或寻求帮助
title: "[Question]: "
labels: ["question", "help wanted"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        欢迎提问！请先查看 FAQ 和用户指南，如果没有找到答案，我们很乐意帮助您。

  - type: textarea
    id: question
    attributes:
      label: ❓ 您的问题
      description: 清楚地描述您的问题或需要帮助的地方
      placeholder: 我想知道如何...
    validations:
      required: true

  - type: dropdown
    id: question-category
    attributes:
      label: 📂 问题分类
      description: 选择最符合的问题类别
      options:
        - 基础使用
        - 功能操作
        - 数据管理
        - 设置配置
        - 故障排除
        - 开发相关
        - 其他
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: 🔍 背景信息
      description: 提供相关的背景信息或您尝试做什么
      placeholder: 我正在尝试...
    validations:
      required: false

  - type: textarea
    id: attempted-solutions
    attributes:
      label: 🔧 已尝试的解决方案
      description: 您已经尝试了哪些方法？
      placeholder: 我已经尝试了...
    validations:
      required: false

  - type: checkboxes
    id: question-checklist
    attributes:
      label: ✅ 检查清单
      description: 请确认您已经检查了以下资源
      options:
        - label: 我已经查看了 FAQ 文档
          required: true
        - label: 我已经查看了用户指南
          required: true
        - label: 我已经搜索了现有的 issues 和 discussions
          required: true
```

---

## 🏷️ 标签系统

### 问题类型标签
- `bug` - Bug 报告
- `enhancement` - 功能请求
- `performance` - 性能问题
- `documentation` - 文档相关
- `question` - 问题咨询

### 优先级标签
- `priority: low` - 低优先级
- `priority: medium` - 中优先级
- `priority: high` - 高优先级
- `priority: critical` - 紧急

### 状态标签
- `needs-triage` - 需要分类
- `needs-investigation` - 需要调查
- `needs-discussion` - 需要讨论
- `in-progress` - 进行中
- `help wanted` - 寻求帮助
- `good first issue` - 适合新手

### 组件标签
- `ui/ux` - 用户界面
- `core` - 核心功能
- `data` - 数据相关
- `performance` - 性能
- `security` - 安全
- `accessibility` - 可访问性

---

## 📋 Issue 管理流程

### 1. 自动分类
- 新 Issue 自动添加 `needs-triage` 标签
- 根据模板类型自动添加对应标签

### 2. 人工审核
- 维护者审核 Issue 内容
- 添加适当的优先级和组件标签
- 移除 `needs-triage` 标签

### 3. 处理流程
- **Bug**: 确认 → 调查 → 修复 → 测试 → 关闭
- **功能请求**: 讨论 → 设计 → 开发 → 测试 → 发布
- **文档**: 确认 → 修改 → 审核 → 合并
- **问题**: 回答 → 确认解决 → 关闭

### 4. 自动化
- 使用 GitHub Actions 自动化标签管理
- 自动关闭过期的 Issue
- 自动提醒长时间无响应的 Issue

---

📅 **最后更新**：2024年1月15日  
📖 **文档版本**：v1.0  
👥 **维护团队**：DeskTODOList 社区管理团队