"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
} from "lucide-react"

export default function RewritePage() {
  const [selectedStyle, setSelectedStyle] = useState("professional")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isRewriting, setIsRewriting] = useState(false)
  const [rewriteProgress, setRewriteProgress] = useState(0)

  const rewriteTasks = [
    {
      id: 1,
      title: "AI技术在内容创作中的应用与发展趋势",
      status: "pending",
      priority: "high",
      wordCount: 2800,
      estimatedTime: "3-5分钟",
      createTime: "2024-01-15 14:30",
    },
    {
      id: 2,
      title: "数字化转型：企业如何在新时代保持竞争优势",
      status: "processing",
      priority: "medium",
      wordCount: 3200,
      estimatedTime: "4-6分钟",
      createTime: "2024-01-15 13:45",
      progress: 65,
    },
    {
      id: 3,
      title: "可持续发展理念下的绿色生活方式指南",
      status: "completed",
      priority: "low",
      wordCount: 2100,
      estimatedTime: "2-4分钟",
      createTime: "2024-01-15 12:20",
      completedTime: "2024-01-15 12:25",
      originalityScore: 92,
      qualityScore: 88,
    },
    {
      id: 4,
      title: "远程工作时代的团队协作新模式",
      status: "failed",
      priority: "medium",
      wordCount: 2650,
      estimatedTime: "3-5分钟",
      createTime: "2024-01-15 11:15",
      error: "API调用超时",
    },
  ]

  const rewriteStyles = [
    { value: "professional", label: "专业严谨", description: "适合商务、学术类内容" },
    { value: "casual", label: "轻松活泼", description: "适合生活、娱乐类内容" },
    { value: "emotional", label: "情感丰富", description: "适合故事、感悟类内容" },
    { value: "educational", label: "科普教学", description: "适合知识、教程类内容" },
    { value: "marketing", label: "营销推广", description: "适合产品、服务推广" },
    { value: "news", label: "新闻报道", description: "适合时事、资讯类内容" },
  ]

  const rewriteHistory = [
    {
      id: 1,
      title: "健康饮食与营养搭配的科学指南",
      originalWordCount: 1900,
      rewrittenWordCount: 2100,
      style: "educational",
      originalityScore: 95,
      qualityScore: 91,
      completedTime: "2024-01-15 10:30",
    },
    {
      id: 2,
      title: "投资理财入门：新手必知的基础知识",
      originalWordCount: 3100,
      rewrittenWordCount: 2950,
      style: "professional",
      originalityScore: 89,
      qualityScore: 87,
      completedTime: "2024-01-15 09:45",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待改写"
      case "processing":
        return "改写中"
      case "completed":
        return "已完成"
      case "failed":
        return "失败"
      default:
        return "未知"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const originalText = `AI技术在内容创作中的应用与发展趋势

随着人工智能技术的快速发展，AI在内容创作领域的应用越来越广泛。从自动化写作到智能编辑，AI正在革命性地改变着内容创作的方式和效率。

首先，AI写作工具能够根据给定的主题和要求，快速生成高质量的文章内容。这些工具利用深度学习算法，分析大量的文本数据，学习语言模式和写作风格，从而能够产生连贯、有逻辑的文章。

其次，AI在内容编辑和优化方面也发挥着重要作用。智能编辑工具可以自动检测语法错误、优化句式结构、提升文章可读性，大大提高了编辑效率。

此外，AI还能够根据目标受众的特点，调整内容的风格和语调，使内容更加贴近读者需求。这种个性化的内容创作方式，有助于提高内容的传播效果和用户参与度。

展望未来，AI在内容创作领域的应用将更加深入和广泛。随着技术的不断进步，我们可以期待更加智能、更加人性化的内容创作工具的出现。`

  const rewrittenText = `人工智能重塑内容创作：技术革新与未来展望

在数字化浪潮的推动下，人工智能技术正以前所未有的速度渗透到内容创作的各个环节，为这一传统行业带来了颠覆性的变革。

**智能写作：效率与质量的双重提升**

现代AI写作系统通过深度学习技术，能够在短时间内生成结构清晰、逻辑严密的文章内容。这些系统通过分析海量文本数据，掌握了丰富的语言表达模式和写作技巧，为内容创作者提供了强有力的辅助工具。

**智能编辑：精准优化内容品质**

AI编辑工具的出现，使得内容优化变得更加精准和高效。从语法纠错到句式优化，从可读性提升到风格统一，AI编辑助手能够全方位地改善文章质量，让创作者将更多精力投入到创意构思上。

**个性化创作：精准匹配受众需求**

基于用户画像和行为分析，AI能够智能调整内容的表达方式和情感色彩，实现真正意义上的个性化内容创作。这种精准匹配不仅提高了内容的传播效果，也增强了读者的参与感和认同感。

**未来展望：更智能、更人性化的创作生态**

随着技术的持续演进，我们有理由相信，未来的AI内容创作工具将更加智能化和人性化，为创作者提供更加全面、更加贴心的创作支持，共同构建一个更加繁荣的内容创作生态。`

  return (
    <MainLayout title="AI改写中心" breadcrumbs={[{ name: "首页", href: "/dashboard" }, { name: "AI改写中心" }]}>
      <div className="space-y-6">
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">改写任务</TabsTrigger>
            <TabsTrigger value="editor">单篇改写</TabsTrigger>
            <TabsTrigger value="batch">批量改写</TabsTrigger>
            <TabsTrigger value="history">改写历史</TabsTrigger>
          </TabsList>

          {/* Rewrite Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>改写任务队列</CardTitle>
                    <CardDescription>管理和监控AI改写任务</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      配置
                    </Button>
                    <Button size="sm">
                      <Bot className="mr-2 h-4 w-4" />
                      新建任务
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewriteTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(task.status)} text-white`}>
                              {getStatusText(task.status)}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority === "high"
                                ? "高优先级"
                                : task.priority === "medium"
                                  ? "中优先级"
                                  : "低优先级"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.wordCount}字</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              预计{task.estimatedTime}
                            </span>
                            <span>创建于 {task.createTime}</span>
                            {task.completedTime && <span>完成于 {task.completedTime}</span>}
                          </div>
                          {task.status === "processing" && task.progress && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>改写进度</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                          {task.status === "completed" && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                原创度: {task.originalityScore}%
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                质量分: {task.qualityScore}%
                              </div>
                            </div>
                          )}
                          {task.status === "failed" && (
                            <div className="flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              错误: {task.error}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === "pending" && (
                            <Button size="sm">
                              <Play className="mr-2 h-4 w-4" />
                              开始
                            </Button>
                          )}
                          {task.status === "processing" && (
                            <Button size="sm" variant="outline">
                              <Pause className="mr-2 h-4 w-4" />
                              暂停
                            </Button>
                          )}
                          {task.status === "failed" && (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              重试
                            </Button>
                          )}
                          {task.status === "completed" && (
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              下载
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Single Article Editor */}
          <TabsContent value="editor" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Original Text */}
              <Card>
                <CardHeader>
                  <CardTitle>原文内容</CardTitle>
                  <CardDescription>待改写的原始文章</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-96 p-4 border rounded-lg bg-muted/50 overflow-auto">
                      <pre className="text-sm whitespace-pre-wrap">{originalText}</pre>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>字数: 2,800</span>
                      <span>预计改写时间: 3-5分钟</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewrite Settings and Result */}
              <Card>
                <CardHeader>
                  <CardTitle>改写设置</CardTitle>
                  <CardDescription>选择改写风格和参数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Style Selection */}
                    <div className="space-y-2">
                      <Label>改写风格</Label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rewriteStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div className="space-y-1">
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Prompt */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-prompt">自定义提示词</Label>
                      <Textarea
                        id="custom-prompt"
                        placeholder="输入自定义改写要求..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Rewrite Button */}
                    <Button
                      className="w-full"
                      disabled={isRewriting}
                      onClick={() => {
                        setIsRewriting(true)
                        setRewriteProgress(0)
                        const interval = setInterval(() => {
                          setRewriteProgress((prev) => {
                            if (prev >= 100) {
                              clearInterval(interval)
                              setIsRewriting(false)
                              return 100
                            }
                            return prev + 10
                          })
                        }, 500)
                      }}
                    >
                      {isRewriting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          改写中...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          开始改写
                        </>
                      )}
                    </Button>

                    {isRewriting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>改写进度</span>
                          <span>{rewriteProgress}%</span>
                        </div>
                        <Progress value={rewriteProgress} className="h-2" />
                      </div>
                    )}

                    <Separator />

                    {/* Rewritten Text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>改写结果</Label>
                        <Button size="sm" variant="outline">
                          <Copy className="mr-2 h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      <div className="h-96 p-4 border rounded-lg bg-background overflow-auto">
                        <pre className="text-sm whitespace-pre-wrap">{rewrittenText}</pre>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            原创度: 92%
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            质量分: 88%
                          </span>
                        </div>
                        <span>字数: 2,950</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Batch Rewrite */}
          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>批量改写</CardTitle>
                <CardDescription>同时处理多篇文章的改写任务</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>选择文章</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="从素材库选择文章" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部待改写文章 (23篇)</SelectItem>
                          <SelectItem value="category">按分类选择</SelectItem>
                          <SelectItem value="manual">手动选择</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>改写风格</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择统一风格" />
                        </SelectTrigger>
                        <SelectContent>
                          {rewriteStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>批量提示词</Label>
                    <Textarea placeholder="输入适用于所有文章的改写要求..." rows={3} />
                  </div>
                  <Button className="w-full">
                    <Bot className="mr-2 h-4 w-4" />
                    开始批量改写
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewrite History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>改写历史</CardTitle>
                <CardDescription>查看已完成的改写记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewriteHistory.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium">{record.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>原文: {record.originalWordCount}字</span>
                            <span>改写后: {record.rewrittenWordCount}字</span>
                            <span>风格: {rewriteStyles.find((s) => s.value === record.style)?.label}</span>
                            <span>完成于 {record.completedTime}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              原创度: {record.originalityScore}%
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              质量分: {record.qualityScore}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Copy className="mr-2 h-4 w-4" />
                            复制
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            下载
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
