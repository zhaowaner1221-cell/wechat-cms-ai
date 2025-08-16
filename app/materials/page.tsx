"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Bot,
  Tag,
  Calendar,
  MoreHorizontal,
  Plus,
  Loader2,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Material {
  id: number
  title: string
  summary: string
  original_content: string
  url: string
  source: string
  category: string
  author: string
  publish_time: string
  read_count: string
  popularity_score: number
  material_status: 'collected' | 'rewriting' | 'rewritten' | 'published'
  created_at: string
  updated_at: string
  rewrite_results: RewriteResult[]
}

interface RewriteResult {
  id: number
  rewritten_title: string
  rewritten_content: string
  summary: string
  quality_score: number
  word_count: number
  rewrite_status: string
  created_at: string
}

interface Stats {
  total: number
  collected: number
  rewriting: number
  rewritten: number
  published: number
}

export default function MaterialsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    collected: 0,
    rewriting: 0,
    rewritten: 0,
    published: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [filters, setFilters] = useState({
    category: "全部",
    status: "全部",
    source: "全部"
  })

  const { toast } = useToast()

  const categories = ["全部", "科技", "商业", "生活", "职场", "健康", "财经", "教育", "娱乐"]
  const statuses = ["全部", "collected", "rewriting", "rewritten", "published"]
  const sources = ["全部", "微信科技24小时热文榜", "微信生活24小时热文榜", "微信职场24小时热文榜", "微信财经24小时热文榜", "少数派热门文章", "36氪热门文章"]

  const getStatusDisplay = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: any }> = {
      collected: { label: "已收集", color: "bg-blue-500", icon: CheckCircle },
      rewriting: { label: "改写中", color: "bg-yellow-500", icon: Loader2 },
      rewritten: { label: "已改写", color: "bg-green-500", icon: CheckCircle },
      published: { label: "已发布", color: "bg-purple-500", icon: ExternalLink }
    }
    return map[status] || { label: status, color: "bg-gray-500", icon: AlertCircle }
  }

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录后才能查看素材",
          variant: "destructive",
        })
        return
      }

      const params = new URLSearchParams({
        userId: user.id,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category !== "全部" && { category: filters.category }),
        ...(filters.status !== "全部" && { status: filters.status }),
        ...(filters.source !== "全部" && { source: filters.source }),
      })

      const response = await fetch(`/api/materials/list?${params}`)
      const result = await response.json()

      if (result.success) {
        setMaterials(result.data || [])
        setStats(result.stats || { total: 0, collected: 0, rewriting: 0, rewritten: 0, published: 0 })
        setPagination(result.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
      } else {
        toast({
          title: "加载失败",
          description: result.error || "无法加载素材",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("加载素材失败:", error)
      toast({
        title: "加载失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === materials.length 
        ? [] 
        : materials.map(item => item.id)
    )
  }

  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadMaterials()
  }

  const handleRewrite = async (materialId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "请先登录", variant: "destructive" })
        return
      }

      const response = await fetch("/api/rewrite/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: materialId,
          userId: user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "改写完成",
          description: "AI改写已完成",
        })
        loadMaterials()
      } else {
        toast({
          title: "改写失败",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "改写失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (materialId: number) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) throw error

      toast({
        title: "删除成功",
        description: "素材已删除",
      })
      loadMaterials()
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleBatchRewrite = async () => {
    if (selectedItems.length === 0) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "请先登录", variant: "destructive" })
        return
      }

      // 为每个选中的素材创建改写任务
      const promises = selectedItems.map(id => 
        supabase.from('rewrite_tasks').insert({
          material_id: id,
          user_id: user.id,
          rewrite_type: 'standard',
          tone: 'neutral',
          priority: 5
        })
      )

      await Promise.all(promises)

      toast({
        title: "批量改写已启动",
        description: `已为 ${selectedItems.length} 个素材启动改写`,
      })
      setSelectedItems([])
    } catch (error) {
      toast({
        title: "启动失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [pagination.page, filters])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPagination(prev => ({ ...prev, page: 1 }))
        loadMaterials()
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  return (
    <MainLayout title="素材库" breadcrumbs={[{ name: "首页", href: "/dashboard" }, { name: "素材库" }]}>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">总素材</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">已收集</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">改写中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rewriting}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">已改写</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rewritten}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>内容管理</CardTitle>
                <CardDescription>管理和组织您的内容素材</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索标题或内容..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">分类:</Label>
                  <Select value={filters.category} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">状态:</Label>
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === 'collected' ? '已收集' : 
                           status === 'rewriting' ? '改写中' :
                           status === 'rewritten' ? '已改写' :
                           status === 'published' ? '已发布' : status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">来源:</Label>
                  <Select value={filters.source} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, source: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Operations */}
        {selectedItems.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已选择 {selectedItems.length} 个项目</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleBatchRewrite}>
                    <Bot className="mr-2 h-4 w-4" />
                    批量改写
                  </Button>
                  <Button size="sm" variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    批量分类
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    批量删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials List/Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={selectedItems.length === materials.length && materials.length > 0}
                  onCheckedChange={handleSelectAll} 
                />
                <span className="text-sm font-medium">全选</span>
              </div>
              <Button size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                <Plus className="mr-2 h-4 w-4" />
                添加素材
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>暂无素材</p>
                <p className="text-sm">前往热榜页面添加素材或等待热榜数据同步</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((material) => {
                  const status = getStatusDisplay(material.material_status)
                  const StatusIcon = status.icon
                  
                  return (
                    <Card key={material.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Checkbox
                            checked={selectedItems.includes(material.id)}
                            onCheckedChange={() => handleSelectItem(material.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(material.url, "_blank")}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                查看原文
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              {material.material_status === 'collected' && (
                                <DropdownMenuItem onClick={() => handleRewrite(material.id)}>
                                  <Bot className="mr-2 h-4 w-4" />
                                  AI改写
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(material.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2">
                            {material.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              className={`${status.color} text-white`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            <Badge variant="outline">{material.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                          {material.summary}
                        </p>
                        
                        {material.rewrite_results?.[0] && (
                          <div className="mb-3">
                            <Badge variant="outline" className="text-xs">
                              质量分: {material.rewrite_results[0].quality_score.toFixed(1)}
                            </Badge>
                            <Badge variant="outline" className="text-xs ml-1">
                              {material.rewrite_results[0].word_count}字
                            </Badge>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{material.read_count}</span>
                          <span>{material.popularity_score}热度</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(material.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => {
                  const status = getStatusDisplay(material.material_status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={material.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedItems.includes(material.id)}
                        onCheckedChange={() => handleSelectItem(material.id)}
                      />
                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <h3 className="font-medium text-sm line-clamp-1">{material.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{material.summary}</p>
                        </div>
                        <div className="col-span-2">
                          <Badge 
                            variant="secondary" 
                            className={`${status.color} text-white`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          <Badge variant="outline">{material.category}</Badge>
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground">{material.source}</div>
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {new Date(material.created_at).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="col-span-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(material.url, "_blank")}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                查看原文
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              {material.material_status === 'collected' && (
                                <DropdownMenuItem onClick={() => handleRewrite(material.id)}>
                                  <Bot className="mr-2 h-4 w-4" />
                                  AI改写
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(material.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  第 {pagination.page} 页，共 {pagination.pages} 页 ({pagination.total} 条记录)
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}