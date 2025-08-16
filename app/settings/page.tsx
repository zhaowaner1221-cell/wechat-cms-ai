"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bot, Users, Download, Upload, Eye, EyeOff, Plus, Edit, Trash2, Save, RefreshCw, Activity } from "lucide-react"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2000])

  const aiModels = [
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI", status: "active", cost: "$0.03/1K tokens" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", status: "active", cost: "$0.002/1K tokens" },
    { id: "claude-3", name: "Claude-3", provider: "Anthropic", status: "inactive", cost: "$0.025/1K tokens" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "Google", status: "active", cost: "$0.001/1K tokens" },
  ]

  const users = [
    {
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15 14:30",
      permissions: ["all"],
    },
    {
      id: 2,
      name: "李四",
      email: "lisi@example.com",
      role: "editor",
      status: "active",
      lastLogin: "2024-01-15 12:15",
      permissions: ["materials", "rewrite", "publish"],
    },
    {
      id: 3,
      name: "王五",
      email: "wangwu@example.com",
      role: "viewer",
      status: "inactive",
      lastLogin: "2024-01-14 16:45",
      permissions: ["materials"],
    },
  ]

  const operationLogs = [
    {
      id: 1,
      user: "张三",
      action: "创建文章",
      target: "AI技术发展趋势",
      time: "2024-01-15 14:30",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: 2,
      user: "李四",
      action: "AI改写",
      target: "数字化转型指南",
      time: "2024-01-15 13:45",
      ip: "192.168.1.101",
      status: "success",
    },
    {
      id: 3,
      user: "王五",
      action: "登录系统",
      target: "-",
      time: "2024-01-15 12:20",
      ip: "192.168.1.102",
      status: "failed",
    },
    {
      id: 4,
      user: "张三",
      action: "发布文章",
      target: "绿色生活指南",
      time: "2024-01-15 11:15",
      ip: "192.168.1.100",
      status: "success",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "editor":
        return "bg-blue-500"
      case "viewer":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "管理员"
      case "editor":
        return "编辑者"
      case "viewer":
        return "查看者"
      default:
        return "未知"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "success":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "正常"
      case "inactive":
        return "停用"
      case "success":
        return "成功"
      case "failed":
        return "失败"
      default:
        return "未知"
    }
  }

  return (
    <MainLayout title="系统设置" breadcrumbs={[{ name: "首页", href: "/dashboard" }, { name: "系统设置" }]}>
      <div className="space-y-6">
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ai">AI配置</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="system">系统参数</TabsTrigger>
            <TabsTrigger value="backup">数据备份</TabsTrigger>
            <TabsTrigger value="logs">操作日志</TabsTrigger>
          </TabsList>

          {/* AI Configuration */}
          <TabsContent value="ai" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI模型配置</CardTitle>
                  <CardDescription>管理可用的AI模型和提供商</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiModels.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bot className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {model.provider} • {model.cost}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${getStatusColor(model.status)} text-white`}>
                            {getStatusText(model.status)}
                          </Badge>
                          <Switch defaultChecked={model.status === "active"} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API密钥管理</CardTitle>
                  <CardDescription>配置各AI服务商的API密钥</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="openai-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="sk-..."
                          defaultValue="sk-1234567890abcdef"
                        />
                        <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <div className="flex gap-2">
                        <Input id="anthropic-key" type={showApiKey ? "text" : "password"} placeholder="sk-ant-..." />
                        <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="google-key">Google API Key</Label>
                      <div className="flex gap-2">
                        <Input id="google-key" type={showApiKey ? "text" : "password"} placeholder="AIza..." />
                        <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      保存配置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>调用参数设置</CardTitle>
                <CardDescription>配置AI模型的默认参数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Temperature (创造性): {temperature[0]}</Label>
                      <Slider
                        value={temperature}
                        onValueChange={setTemperature}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">值越高，输出越有创造性；值越低，输出越确定性</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Tokens (最大长度): {maxTokens[0]}</Label>
                      <Slider
                        value={maxTokens}
                        onValueChange={setMaxTokens}
                        max={4000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">控制AI生成内容的最大长度</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="system-prompt">系统提示词</Label>
                      <Textarea
                        id="system-prompt"
                        placeholder="输入系统级提示词..."
                        rows={6}
                        defaultValue="你是一个专业的内容创作助手，擅长改写和优化文章内容。请保持内容的准确性和可读性。"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="auto-retry" defaultChecked />
                      <Label htmlFor="auto-retry">API调用失败时自动重试</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>管理系统用户和权限</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        添加用户
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加新用户</DialogTitle>
                        <DialogDescription>创建新的系统用户账号</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-name">用户名</Label>
                          <Input id="user-name" placeholder="输入用户名" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-email">邮箱</Label>
                          <Input id="user-email" type="email" placeholder="输入邮箱地址" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-role">角色</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择用户角色" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">管理员</SelectItem>
                              <SelectItem value="editor">编辑者</SelectItem>
                              <SelectItem value="viewer">查看者</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-password">初始密码</Label>
                          <Input id="user-password" type="password" placeholder="输入初始密码" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">取消</Button>
                        <Button>创建用户</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            <Badge variant="secondary" className={`${getRoleColor(user.role)} text-white`}>
                              {getRoleText(user.role)}
                            </Badge>
                            <Badge variant="secondary" className={`${getStatusColor(user.status)} text-white`}>
                              {getStatusText(user.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email} • 最后登录: {user.lastLogin}
                          </div>
                          <div className="text-xs text-muted-foreground">权限: {user.permissions.join(", ")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除用户</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作将永久删除用户 "{user.name}" 及其所有数据，无法恢复。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction>删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Parameters */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>系统配置</CardTitle>
                  <CardDescription>基础系统参数设置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">站点名称</Label>
                    <Input id="site-name" defaultValue="公众号内容管理系统" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-url">站点URL</Label>
                    <Input id="site-url" defaultValue="https://cms.example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">管理员邮箱</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@example.com" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" />
                    <Label htmlFor="maintenance-mode">维护模式</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="debug-mode" />
                    <Label htmlFor="debug-mode">调试模式</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>性能设置</CardTitle>
                  <CardDescription>系统性能相关配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cache-ttl">缓存过期时间 (分钟)</Label>
                    <Input id="cache-ttl" type="number" defaultValue="60" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-upload">最大上传文件大小 (MB)</Label>
                    <Input id="max-upload" type="number" defaultValue="10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">会话超时时间 (小时)</Label>
                    <Input id="session-timeout" type="number" defaultValue="24" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-backup" defaultChecked />
                    <Label htmlFor="auto-backup">自动备份</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="compress-images" defaultChecked />
                    <Label htmlFor="compress-images">图片压缩</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>系统通知和警报配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="email-notifications" defaultChecked />
                      <Label htmlFor="email-notifications">邮件通知</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="system-alerts" defaultChecked />
                      <Label htmlFor="system-alerts">系统警报</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="publish-notifications" defaultChecked />
                      <Label htmlFor="publish-notifications">发布通知</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-server">SMTP服务器</Label>
                      <Input id="smtp-server" placeholder="smtp.example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP端口</Label>
                      <Input id="smtp-port" type="number" placeholder="587" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Backup */}
          <TabsContent value="backup" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>数据备份</CardTitle>
                  <CardDescription>创建和管理数据备份</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>备份内容</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="backup-articles" defaultChecked />
                        <Label htmlFor="backup-articles">文章内容</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="backup-users" defaultChecked />
                        <Label htmlFor="backup-users">用户数据</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="backup-settings" defaultChecked />
                        <Label htmlFor="backup-settings">系统设置</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="backup-logs" />
                        <Label htmlFor="backup-logs">操作日志</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-schedule">自动备份频率</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择备份频率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                        <SelectItem value="manual">手动</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    立即备份
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>数据恢复</CardTitle>
                  <CardDescription>从备份文件恢复数据</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>备份历史</Label>
                    <div className="space-y-2">
                      {[
                        { date: "2024-01-15 02:00", size: "125 MB", type: "自动备份" },
                        { date: "2024-01-14 02:00", size: "123 MB", type: "自动备份" },
                        { date: "2024-01-13 14:30", size: "120 MB", type: "手动备份" },
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm">
                            <div className="font-medium">{backup.date}</div>
                            <div className="text-muted-foreground">
                              {backup.size} • {backup.type}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认恢复数据</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    此操作将覆盖当前数据，无法撤销。请确认要恢复到 {backup.date} 的备份。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction>确认恢复</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-file">上传备份文件</Label>
                    <div className="flex gap-2">
                      <Input id="backup-file" type="file" accept=".zip,.sql" />
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        恢复
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operation Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>操作日志</CardTitle>
                    <CardDescription>查看系统操作记录和审计日志</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="筛选用户" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                        <SelectItem value="editor">编辑者</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      刷新
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {operationLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.user}</span>
                            <span className="text-sm text-muted-foreground">{log.action}</span>
                            {log.target !== "-" && (
                              <span className="text-sm text-muted-foreground">"{log.target}"</span>
                            )}
                            <Badge variant="secondary" className={`${getStatusColor(log.status)} text-white`}>
                              {getStatusText(log.status)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.time} • IP: {log.ip}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
