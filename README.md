# 🚀 WeChat CMS AI - 微信公众号内容管理系统

基于AI的智能内容改写与热榜采集系统，专为微信公众号运营者打造。

## ✨ 核心功能

### 📊 热榜内容采集
- **多平台实时采集**：微信科技、微信生活、微信职场、微信财经、少数派、36氪
- **智能去重**：自动识别并去重相似内容
- **实时更新**：支持定时任务和手动刷新
- **数据持久化**：PostgreSQL数据库存储

### 🤖 AI智能改写
- **Claude-3-Sonnet驱动**：基于OpenRouter API的高质量改写
- **多种改写模式**：标准、创意、简洁、扩展、SEO优化
- **语调调整**：正式、轻松、专业、友善、权威等
- **目标受众定制**：根据目标读者群体优化内容

### 🔍 智能搜索
- **实时关键词搜索**：支持模糊匹配和多关键词组合
- **高级筛选**：按热度、时间、平台筛选
- **搜索历史**：自动保存搜索记录
- **关键词高亮**：搜索结果中关键词黄色高亮显示

### 📱 一键发布
- **内容管理**：素材库统一管理
- **发布状态**：草稿、待发布、已发布状态跟踪
- **操作日志**：完整的操作记录

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Shadcn UI** - 组件库
- **Lucide React** - 图标库

### 后端
- **Next.js API Routes** - 无服务器API
- **Supabase** - 数据库和认证
- **PostgreSQL** - 关系型数据库
- **OpenRouter API** - AI改写服务

### 数据库
- **PostgreSQL** - 主数据库
- **全文搜索** - PostgreSQL内置搜索功能
- **定时任务** - 自动化内容采集

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL数据库
- OpenRouter API密钥

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/zhaolijuan/wechat-cms-ai.git
cd wechat-cms-ai
```

2. **安装依赖**
```bash
npm install --legacy-peer-deps
```

3. **环境配置**
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_TOPHUB_API_KEY=your_tophub_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **数据库初始化**
运行SQL脚本创建必要的表：
```sql
-- 执行 scripts/ 目录下的SQL文件
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
wechat-cms-ai/
├── app/                    # Next.js 应用路由
│   ├── api/               # API路由
│   ├── hotlist/           # 热榜管理页面
│   ├── materials/         # 素材库管理
│   ├── rewrite/           # AI改写页面
│   └── publish/           # 内容发布页面
├── components/            # 可复用组件
│   ├── hotlist/          # 热榜相关组件
│   ├── layout/           # 布局组件
│   └── ui/               # UI组件库
├── lib/                   # 工具函数和配置
│   ├── openai/           # AI改写相关
│   ├── search-utils.ts   # 搜索工具函数
│   └── supabase/         # 数据库客户端
├── scripts/              # 数据库初始化脚本
└── public/               # 静态资源
```

## 🔧 API 接口

### 热榜相关
- `GET /api/tophub/fetch` - 采集热榜数据
- `GET /api/hotlist/search` - 搜索热榜内容

### 素材管理
- `POST /api/materials/add` - 添加素材到库
- `GET /api/materials/list` - 获取素材列表

### AI改写
- `POST /api/rewrite/process` - 处理改写任务
- `GET /api/rewrite/cron` - 定时任务处理

## 🎯 使用指南

### 1. 采集热榜内容
- 访问 `/hotlist` 页面
- 点击数据源卡片上的"手动刷新"
- 或使用"批量刷新"更新所有数据源

### 2. 搜索内容
- 在热榜页面顶部搜索框输入关键词
- 支持多关键词组合（空格分隔）
- 使用筛选器按平台、时间、热度排序

### 3. AI改写
- 选择要改写的素材
- 选择改写类型和语调
- 等待AI处理完成

### 4. 发布内容
- 在素材库选择已改写的内容
- 一键发布到公众号

## 🛡️ 安全特性

- **数据加密**：敏感数据加密存储
- **访问控制**：基于角色的权限管理
- **API安全**：请求验证和限流
- **内容审核**：自动内容合规检查

## 📊 性能优化

- **数据库索引**：关键字段建立索引
- **缓存策略**：本地存储缓存搜索结果
- **分页加载**：大数据集分页展示
- **异步处理**：AI改写异步进行

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

🎉 **开始您的AI内容创作之旅吧！**