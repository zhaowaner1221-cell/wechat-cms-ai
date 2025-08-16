"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Eye, RefreshCw, Clock, Loader2, AlertCircle, Database } from "lucide-react"
import { SearchBar } from "@/components/hotlist/search-bar"
import { SearchResults } from "@/components/hotlist/search-results"
import { ManualUrlInput } from "@/components/hotlist/manual-url-input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface HotListItem {
  listHashId: string
  itemId: string
  title: string
  summary: string
  url: string
  popularityScore: number
  readCount: string
  publishTime: Date
  author: string
  category: string
  isCollected: boolean
}

interface DataSource {
  hashId: string
  name: string
  category: string
  status: "active" | "inactive" | "loading"
  count: number
  lastUpdate: string
  error?: string
}

interface CollectionLog {
  id: string
  time: string
  source: string
  count: number
  status: "success" | "failed"
  error?: string
}

export default function HotListPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      hashId: "5PdMaaadmg",
      name: "微信科技24小时热文榜",
      category: "科技",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
    {
      hashId: "nBe0xxje37",
      name: "微信生活24小时热文榜",
      category: "生活",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
    {
      hashId: "DOvn33ydEB",
      name: "微信职场24小时热文榜",
      category: "职场",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
    {
      hashId: "KGoRGRDvl6",
      name: "微信财经24小时热文榜",
      category: "财经",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
    {
      hashId: "Y2KeDGQdNP",
      name: "少数派热门文章",
      category: "科技",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
    {
      hashId: "Q1Vd5Ko85R",
      name: "36氪热门文章",
      category: "创投",
      status: "inactive",
      count: 0,
      lastUpdate: "未更新",
    },
  ])

  const [hotListItems, setHotListItems] = useState<HotListItem[]>([])
  const [collectionLogs, setCollectionLogs] = useState<CollectionLog[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // 搜索功能状态
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [searchFilters, setSearchFilters] = useState({
    sortBy: "popularity",
    platforms: [] as string[],
    dateRange: "all"
  })
  const [showSearchResults, setShowSearchResults] = useState(false)

  const { toast } = useToast()

  const loadDataFromSupabase = async () => {
    try {
      console.log("[v0] 从 Supabase 加载热榜数据")

      const { data: hotLists, error: listsError } = await supabase
        .from("hot_lists")
        .select("*")
        .order("last_updated", { ascending: false })

      if (listsError) {
        console.error("[v0] 加载热榜列表失败:", listsError)
      } else if (hotLists) {
        // 更新数据源状态
        setDataSources((prev) =>
          prev.map((source) => {
            const dbList = hotLists.find((list) => list.hashid === source.hashId)
            if (dbList) {
              return {
                ...source,
                status: "active" as const,
                lastUpdate: new Date(dbList.last_updated).toLocaleString("zh-CN"),
              }
            }
            return source
          }),
        )
      }

      const { data: items, error: itemsError } = await supabase
        .from("hot_list_items")
        .select("*")
        .order("collected_at", { ascending: false })
        .limit(200) // 限制加载数量

      if (itemsError) {
        console.error("[v0] 加载热榜项目失败:", itemsError)
      } else if (items) {
        const processedItems: HotListItem[] = items.map((item) => ({
          listHashId: item.hot_list_hashid,
          itemId: item.item_hash,
          title: item.title,
          summary: item.description || "",
          url: item.url || "",
          popularityScore:
            Number.parseInt(item.extra?.replace(/[^\d]/g, "") || "0") || Math.floor(Math.random() * 10000),
          readCount: item.extra || "0万",
          publishTime: new Date(item.collected_at),
          author: `热榜作者`,
          category: dataSources.find((s) => s.hashId === item.hot_list_hashid)?.category || "未知",
          isCollected: false,
        }))

        setHotListItems(processedItems)

        // 更新数据源计数
        const countByHashId = items.reduce(
          (acc, item) => {
            acc[item.hot_list_hashid] = (acc[item.hot_list_hashid] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        setDataSources((prev) =>
          prev.map((source) => ({
            ...source,
            count: countByHashId[source.hashId] || 0,
          })),
        )

        console.log(`[v0] 从数据库加载了 ${items.length} 条热榜数据`)
      }
    } catch (error) {
      console.error("[v0] 加载数据失败:", error)
      toast({
        title: "数据加载失败",
        description: "无法从数据库加载历史数据",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadDataFromSupabase()
  }, [])

  const fetchSingleHotList = async (hashId: string) => {
    try {
      setDataSources((prev) =>
        prev.map((source) => (source.hashId === hashId ? { ...source, status: "loading" } : source)),
      )

      const response = await fetch("/api/tophub/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashId, manual: true }),
      })

      const result = await response.json()

      if (result.success) {
        const { data } = result

        // 更新数据源状态
        setDataSources((prev) =>
          prev.map((source) =>
            source.hashId === hashId
              ? {
                  ...source,
                  status: "active",
                  count: data.itemsCount,
                  lastUpdate: new Date().toLocaleString("zh-CN"),
                }
              : source,
          ),
        )

        // 更新热榜内容
        setHotListItems((prev) => {
          const filtered = prev.filter((item) => item.listHashId !== hashId)
          return [...filtered, ...data.items]
        })

        // 添加采集日志
        const newLog: CollectionLog = {
          id: Date.now().toString(),
          time: new Date().toLocaleString("zh-CN"),
          source: data.listName,
          count: data.itemsCount,
          status: "success",
        }
        setCollectionLogs((prev) => [newLog, ...prev.slice(0, 19)])

        toast({
          title: "采集成功",
          description: `${data.listName} 采集了 ${data.itemsCount} 条数据${data.savedCount ? `，保存 ${data.savedCount} 条到数据库` : ""}`,
        })
      } else {
        throw new Error(result.error || "采集失败")
      }
    } catch (error) {
      console.error(`[v0] 采集失败 ${hashId}:`, error)

      setDataSources((prev) =>
        prev.map((source) =>
          source.hashId === hashId
            ? {
                ...source,
                status: "inactive",
                error: error instanceof Error ? error.message : "采集失败",
              }
            : source,
        ),
      )

      const failedSource = dataSources.find((s) => s.hashId === hashId)
      if (failedSource) {
        const errorLog: CollectionLog = {
          id: Date.now().toString(),
          time: new Date().toLocaleString("zh-CN"),
          source: failedSource.name,
          count: 0,
          status: "failed",
          error: error instanceof Error ? error.message : "采集失败",
        }
        setCollectionLogs((prev) => [errorLog, ...prev.slice(0, 19)])
      }

      toast({
        title: "采集失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    }
  }

  const handleManualFetch = (source: DataSource) => {
    fetchSingleHotList(source.hashId)
  }

  const handleBatchRefresh = async () => {
    setIsRefreshing(true)
    console.log("[v0] 开始批量刷新所有热榜数据")

    try {
      for (const source of dataSources) {
        await fetchSingleHotList(source.hashId)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      toast({
        title: "批量刷新完成",
        description: "所有热榜数据已更新",
      })
    } catch (error) {
      console.error("[v0] 批量刷新失败:", error)
      toast({
        title: "批量刷新失败",
        description: "部分数据可能未能更新",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredItems = hotListItems
    .filter((item) => {
      if (selectedCategory === "all") return true
      return item.category === selectedCategory
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)

  // 搜索功能
  const handleSearch = async (query: string, filters: any) => {
    if (!query.trim()) {
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)

    try {
      const params = new URLSearchParams({
        q: query,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        page: searchPagination.page.toString(),
        limit: searchPagination.limit.toString()
      })

      if (filters.platforms.length > 0) {
        params.set('platforms', filters.platforms.join(','))
      }

      const response = await fetch(`/api/hotlist/search?${params}`)
      const result = await response.json()

      if (result.success) {
        setSearchResults(result.data)
        setSearchPagination(result.pagination)
      } else {
        toast({
          title: "搜索失败",
          description: result.error || "无法搜索内容",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('搜索失败:', error)
      toast({
        title: "搜索失败",
        description: "请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    setSearchResults([])
  }

  const handleSearchFiltersChange = (newFilters: any) => {
    setSearchFilters(newFilters)
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newFilters)
    }
  }

  const handleAddToLibrary = async (item: HotListItem) => {
    try {
      console.log("[v0] 添加到素材库:", item.title)

      // 获取当前用户ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录后才能添加素材",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/materials/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotListItem: item,
          userId: user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "添加成功",
          description: `"${item.title}" 已添加到素材库并开始AI改写`,
        })
        
        // 更新本地状态，标记为已收藏
        setHotListItems(prev => 
          prev.map(i => 
            i.itemId === item.itemId ? { ...i, isCollected: true } : i
          )
        )
      } else {
        if (result.error === '该内容已存在于素材库中') {
          toast({
            title: "已存在",
            description: `"${item.title}" 已在您的素材库中`,
            variant: "default",
          })
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error("[v0] 添加素材失败:", error)
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleManualUrlAdded = () => {
    // 手动添加URL成功后重新加载数据
    loadDataFromSupabase()
  }

  return (
    <MainLayout
      title="热榜管理"
      breadcrumbs={[{ name: "首页", href: "/dashboard" }, { name: "热榜管理" }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">
              数据库已连接 - 实时保存采集数据并自动去重
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={loadDataFromSupabase}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重新加载数据
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dataSources.map((source) => (
            <Card key={source.hashId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {source.status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {source.error && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <Badge
                    variant={source.status === "active" ? "default" : "secondary"}
                    className={source.status === "active" ? "bg-green-500" : ""}
                  >
                    {source.status === "active" ? "运行中" : source.status === "loading" ? "采集中" : "已停止"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{source.count}</div>
                <p className="text-xs text-muted-foreground">最后更新: {source.lastUpdate}</p>
                {source.error && <p className="text-xs text-red-500 mt-1">{source.error}</p>}
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleManualFetch(source)}
                  disabled={source.status === "loading"}
                >
                  {source.status === "loading" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {source.status === "loading" ? "采集中..." : "手动刷新"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            results={searchResults}
            isSearching={isSearching}
            totalItems={hotListItems.length}
          />

          {/* 搜索结果区域 */}
          {showSearchResults && (
            <div className="mb-6">
              <SearchResults
                results={searchResults}
                isSearching={isSearching}
                query={searchQuery}
                onAddToLibrary={handleAddToLibrary}
                onPreview={(url) => window.open(url, "_blank")}
              />
            </div>
          )}
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">{showSearchResults ? '搜索结果' : '热榜内容'}</TabsTrigger>
            <TabsTrigger value="manual">人工添加</TabsTrigger>
            <TabsTrigger value="settings">采集设置</TabsTrigger>
            <TabsTrigger value="history">采集历史</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {showSearchResults ? (
              <div className="space-y-4">
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">无搜索结果</h3>
                    <p className="text-muted-foreground">尝试其他关键词或调整筛选条件</p>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>热榜内容</CardTitle>
                  <CardDescription>
                    来自各大平台的热门内容，支持实时更新和智能去重
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部分类</SelectItem>
                          <SelectItem value="科技">科技</SelectItem>
                          <SelectItem value="生活">生活</SelectItem>
                          <SelectItem value="职场">职场</SelectItem>
                          <SelectItem value="财经">财经</SelectItem>
                          <SelectItem value="创投">创投</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleBatchRefresh} disabled={isRefreshing}>
                        {isRefreshing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        批量刷新
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      共 {filteredItems.length} 条内容
                    </Badge>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">暂无热榜数据</h3>
                      <p className="text-muted-foreground">点击上方的"批量刷新"获取最新数据</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems.map((item) => (
                        <Card key={`${item.listHashId}_${item.itemId}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-lg">{item.title}</h3>
                                  <Badge variant="outline">{item.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    热度: {item.popularityScore.toLocaleString()}
                                  </span>
                                  <span>作者: {item.author}</span>
                                  <span>阅读: {item.readCount}</span>
                                  <span>{new Date(item.publishTime).toLocaleString("zh-CN")}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Button size="sm" variant="outline" onClick={() => window.open(item.url, "_blank")}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  预览
                                </Button>
                                <Button size="sm" onClick={() => handleAddToLibrary(item)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  添加到素材库
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>人工添加链接</CardTitle>
                <CardDescription>
                  手动输入文章链接，系统将自动解析内容并添加到素材库
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <ManualUrlInput onSuccess={handleManualUrlAdded} />
                  
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4">支持的链接类型</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-medium mb-2">微信公众号</h4>
                        <ul className="space-y-1">
                          <li>• 公众号文章</li>
                          <li>• 视频号内容</li>
                          <li>• 小程序文章</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">其他平台</h4>
                        <ul className="space-y-1">
                          <li>• 知乎文章</li>
                          <li>• 头条号文章</li>
                          <li>• 简书文章</li>
                          <li>• 其他HTTP(S)链接</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>采集设置</CardTitle>
                <CardDescription>配置热榜内容的采集参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">关键词过滤</Label>
                  <Input id="keywords" placeholder="输入过滤关键词，用逗号分隔" />
                  <p className="text-xs text-muted-foreground">包含这些关键词的内容将被过滤</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-collect" />
                  <Label htmlFor="auto-collect">启用定时采集</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">TopHub API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="输入TopHub API密钥"
                  />
                  <p className="text-xs text-muted-foreground">用于访问热榜数据源</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>采集历史</CardTitle>
                <CardDescription>查看历史采集记录和状态</CardDescription>
              </CardHeader>
              <CardContent>
                {collectionLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">暂无采集记录</p>
                ) : (
                  <div className="space-y-2">
                    {collectionLogs.map((record) => (
                      <div key={record.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{record.source}</p>
                            <p className="text-xs text-muted-foreground">{record.time}</p>
                            {record.error && <p className="text-xs text-red-500">{record.error}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">采集数量: {record.count}</span>
                          <Badge
                            variant={record.status === "success" ? "default" : "destructive"}
                            className={record.status === "success" ? "bg-green-500" : ""}
                          >
                            {record.status === "success" ? "成功" : "失败"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}