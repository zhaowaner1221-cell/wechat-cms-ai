import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Bot, Send, TrendingUp, Plus, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "今日采集数",
      value: "156",
      description: "比昨日增长 12%",
      icon: TrendingUp,
      color: "text-chart-1",
    },
    {
      title: "待改写文章",
      value: "23",
      description: "需要处理",
      icon: Bot,
      color: "text-chart-2",
    },
    {
      title: "已发布文章",
      value: "89",
      description: "本月累计",
      icon: Send,
      color: "text-chart-3",
    },
    {
      title: "活跃账号",
      value: "5",
      description: "正常运行",
      icon: FileText,
      color: "text-chart-4",
    },
  ]

  const recentActivities = [
    { action: "采集热文", content: "《AI技术发展趋势》", time: "2分钟前" },
    { action: "完成改写", content: "《数字化转型指南》", time: "15分钟前" },
    { action: "发布文章", content: "《创新思维培养》", time: "1小时前" },
    { action: "添加素材", content: "《市场分析报告》", time: "2小时前" },
  ]

  return (
    <MainLayout title="仪表板" breadcrumbs={[{ name: "首页" }, { name: "仪表板" }]}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>常用功能快速入口</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                一键采集热文
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Bot className="mr-2 h-4 w-4" />
                批量AI改写
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Send className="mr-2 h-4 w-4" />
                定时发布管理
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                同步账号状态
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>最近操作</CardTitle>
              <CardDescription>系统最新活动记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态监控</CardTitle>
            <CardDescription>实时监控系统运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">采集服务正常</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">AI服务正常</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">发布服务维护中</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
