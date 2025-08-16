"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Send,
  Plus,
  Edit,
  Clock,
  AlertCircle,
  RefreshCw,
  CalendarIcon,
  Eye,
  Settings,
  Users,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function PublishPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

  const accounts = [
    {
      id: "1",
      name: "科技前沿观察",
      avatar: "/interconnected-tech.png",
      status: "active",
      followers: "12.5万",
      lastPublish: "2024-01-15 14:30",
      todayViews: "8.2万",
      weeklyPosts: 5,
    },
    {
      id: "2",
      name: "商业洞察",
      avatar: "/business-meeting-diversity.png",
      status: "active",
      followers: "8.7万",
      lastPublish: "2024-01-15 12:15",
      todayViews: "5.1万",
      weeklyPosts: 3,
    },
    {
      id: "3",
      name: "生活美学",
      avatar: "/diverse-group-relaxing.png",
      status: "maintenance",
      followers: "15.2万",
      lastPublish: "2024-01-14 18:20",
      todayViews: "12.3万",
      weeklyPosts: 7,
    },
    {
      id: "4",
      name: "健康生活指南",
      avatar: "/abstract-health.png",
      status: "inactive",
      followers: "6.8万",
      lastPublish: "2024-01-13 16:45",
      todayViews: "2.1万",
      weeklyPosts: 2,
    },
  ]

  const publishQueue = [
    {
      id: 1,
      title: "AI技术在内容创作中的应用与发展趋势",
      account: "科技前沿观察",
      status: "scheduled",
      scheduledTime: "2024-01-16 09:00",
      estimatedReach: "8-12万",
      priority: "high",
    },
    {
      id: 2,
      title: "数字化转型：企业如何在新时代保持竞争优势",
      account: "商业洞察",
      status: "pending",
      scheduledTime: "2024-01-16 14:00",
      estimatedReach: "5-8万",
      priority: "medium",
    },
    {
      id: 3,
      title: "可持续发展理念下的绿色生活方式指南",
      account: "生活美学",
      status: "publishing",
      scheduledTime: "2024-01-15 16:00",
      estimatedReach: "10-15万",
      priority: "medium",
      progress: 75,
    },
    {
      id: 4,
      title: "健康饮食与营养搭配的科学指南",
      account: "健康生活指南",
      status: "failed",
      scheduledTime: "2024-01-15 12:00",
      estimatedReach: "3-6万",
      priority: "low",
      error: "账号授权过期",
    },
  ]

  const publishHistory = [
    {
      id: 1,
      title: "远程工作时代的团队协作新模式",
      account: "商业洞察",
      publishTime: "2024-01-15 10:30",
      views: "12.5万",
      likes: "2.1万",
      shares: "3.2千",
      comments: "856",
      status: "published",
    },
    {
      id: 2,
      title: "投资理财入门：新手必知的基础知识",
      account: "商业洞察",
      publishTime: "2024-01-14 15:20",
      views: "18.7万",
      likes: "3.5万",
      shares: "5.1千",
      comments: "1.2千",
      status: "published",
    },
    {
      id: 3,
      title: "现代都市人的压力管理与心理健康",
      account: "健康生活指南",
      publishTime: "2024-01-14 09:15",
      views: "9.8万",
      likes: "1.8万",
      shares: "2.3千",
      comments: "567",
      status: "published",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      case "inactive":
        return "bg-red-500"
      case "scheduled":
        return "bg-blue-500"
      case "pending":
        return "bg-gray-500"
      case "publishing":
        return "bg-orange-500"
      case "published":
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
      case "maintenance":
        return "维护中"
      case "inactive":
        return "已停用"
      case "scheduled":
        return "已定时"
      case "pending":
        return "待发布"
      case "publishing":
        return "发布中"
      case "published":
        return "已发布"
      case "failed":
        return "失败"
      default:
        return "未知"
    }
  }

  return (
    <MainLayout title="发布管理" breadcrumbs={[{ name: "首页", href: "/dashboard" }, { name: "发布管理" }]}>
      <div className="space-y-6">
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts">账号管理</TabsTrigger>
            <TabsTrigger value="queue">发布队列</TabsTrigger>
            <TabsTrigger value="schedule">定时发布</TabsTrigger>
            <TabsTrigger value="history">发布历史</TabsTrigger>
          </TabsList>

          {/* Account Management */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>公众号账号</CardTitle>
                    <CardDescription>管理您的微信公众号账号</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        添加账号
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加公众号账号</DialogTitle>
                        <DialogDescription>请填写公众号的基本信息</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-name">账号名称</Label>
                          <Input id="account-name" placeholder="输入公众号名称" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="app-id">AppID</Label>
                          <Input id="app-id" placeholder="输入微信公众号AppID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="app-secret">AppSecret</Label>
                          <Input id="app-secret" type="password" placeholder="输入微信公众号AppSecret" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">取消</Button>
                        <Button>添加账号</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {accounts.map((account) => (
                    <Card key={account.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={account.avatar || "/placeholder.svg"}
                              alt={account.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div className="space-y-1">
                              <h3 className="font-medium">{account.name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`${getStatusColor(account.status)} text-white`}>
                                  {getStatusText(account.status)}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {account.followers}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold">{account.todayViews}</div>
                            <div className="text-xs text-muted-foreground">今日阅读</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{account.weeklyPosts}</div>
                            <div className="text-xs text-muted-foreground">本周发布</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">最后发布</div>
                            <div className="text-sm">{account.lastPublish}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publishing Queue */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>发布队列</CardTitle>
                    <CardDescription>管理待发布和正在发布的文章</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      刷新状态
                    </Button>
                    <Button size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      批量发布
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publishQueue.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox />
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(item.status)} text-white`}>
                              {getStatusText(item.status)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                item.priority === "high"
                                  ? "text-red-600"
                                  : item.priority === "medium"
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }
                            >
                              {item.priority === "high"
                                ? "高优先级"
                                : item.priority === "medium"
                                  ? "中优先级"
                                  : "低优先级"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>账号: {item.account}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.scheduledTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              预计触达: {item.estimatedReach}
                            </span>
                          </div>
                          {item.status === "publishing" && item.progress && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>发布进度</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {item.status === "failed" && (
                            <div className="flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              错误: {item.error}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === "pending" && (
                            <Button size="sm">
                              <Send className="mr-2 h-4 w-4" />
                              立即发布
                            </Button>
                          )}
                          {item.status === "scheduled" && (
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </Button>
                          )}
                          {item.status === "failed" && (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              重试
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            预览
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Publishing */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>定时发布</CardTitle>
                <CardDescription>设置文章的定时发布计划</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>选择文章</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="从素材库选择文章" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article1">AI技术在内容创作中的应用</SelectItem>
                          <SelectItem value="article2">数字化转型企业指南</SelectItem>
                          <SelectItem value="article3">绿色生活方式指南</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>选择账号</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择发布账号" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter((account) => account.status === "active")
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>发布日期</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: zhCN }) : "选择日期"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>发布时间</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="12:00">12:00</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                          <SelectItem value="21:00">21:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>多账号发布</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {accounts
                        .filter((account) => account.status === "active")
                        .map((account) => (
                          <div key={account.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={account.id}
                              checked={selectedAccounts.includes(account.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAccounts([...selectedAccounts, account.id])
                                } else {
                                  setSelectedAccounts(selectedAccounts.filter((id) => id !== account.id))
                                }
                              }}
                            />
                            <Label htmlFor={account.id} className="text-sm font-normal">
                              {account.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    设置定时发布
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publishing History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>发布历史</CardTitle>
                <CardDescription>查看已发布文章的数据统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publishHistory.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{record.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(record.status)} text-white`}>
                              {getStatusText(record.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>账号: {record.account}</span>
                            <span>发布时间: {record.publishTime}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-primary">{record.views}</div>
                              <div className="text-muted-foreground">阅读量</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-red-500">{record.likes}</div>
                              <div className="text-muted-foreground">点赞数</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-500">{record.shares}</div>
                              <div className="text-muted-foreground">分享数</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-500">{record.comments}</div>
                              <div className="text-muted-foreground">评论数</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            详细数据
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            查看文章
                          </Button>
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
