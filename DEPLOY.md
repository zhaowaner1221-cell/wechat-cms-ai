# 🚀 WeChat CMS AI - 部署指南

## Vercel一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zhaowaner1221-cell/wechat-cms-ai)

## 📋 部署前准备

### 必需环境变量
```bash
# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI服务配置
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Supabase设置
1. 创建Supabase项目
2. 运行 `/scripts/init.sql` 初始化数据库
3. 获取项目URL和密钥

## 🛠️ 部署步骤

### 方式1：Vercel一键部署
1. 点击上方"Deploy with Vercel"按钮
2. 配置环境变量
3. 一键部署

### 方式2：手动部署
```bash
# 1. 克隆项目
git clone https://github.com/zhaowaner1221-cell/wechat-cms-ai.git
cd wechat-cms-ai

# 2. 安装依赖
npm install
# 或
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑.env.local填入实际配置

# 4. 构建
npm run build
# 或
pnpm run build

# 5. 部署到Vercel
vercel --prod
```

### 方式3：Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 环境变量配置

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase项目URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase服务密钥 | ✅ |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API密钥 | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 站点URL | ✅ |

## 🚨 常见问题解决

### 构建失败问题
1. **检查环境变量** - 确保所有必需变量已配置
2. **清理缓存** - `rm -rf .next node_modules/.cache`
3. **重新安装依赖** - `npm ci` 或 `pnpm install`

### Vercel特定问题
1. **内存不足** - 使用 `NODE_OPTIONS="--max-old-space-size=4096"`
2. **构建超时** - 检查依赖包大小
3. **环境变量** - 确保在Vercel仪表板正确配置

### 性能优化
1. **减少包大小** - 使用动态导入
2. **优化图片** - 使用Next.js Image组件
3. **启用压缩** - 使用gzip/brotli压缩

## 📊 监控指标

### 构建指标
- ✅ 构建时间: < 2分钟
- ✅ 包大小: < 200KB (首页)
- ✅ 静态页面: 16个页面

### 运行时指标
- ✅ 首次加载: < 3秒
- ✅ 响应时间: < 200ms
- ✅ 可用性: 99.9%

## 🔍 验证部署

访问部署后的URL，检查：
1. ✅ 热榜页面正常显示
2. ✅ API接口响应正常
3. ✅ 数据库连接成功
4. ✅ AI改写功能正常工作

## 📞 支持

遇到问题请：
1. 检查环境变量配置
2. 查看构建日志
3. 提交GitHub Issue
4. 联系技术支持