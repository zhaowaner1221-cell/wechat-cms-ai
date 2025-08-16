"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, TrendingUp, Eye, Plus, Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlightText } from "@/lib/search-utils"

interface SearchResult {
  id: string
  title: string
  summary: string
  url: string
  popularityScore: number
  readCount: string
  publishTime: Date
  author: string
  category: string
  source: string
  platform: string
  originalTitle?: string
  originalSummary?: string
}

interface SearchResultsProps {
  results: SearchResult[]
  isSearching: boolean
  query: string
  onAddToLibrary: (item: SearchResult) => void
  onPreview: (url: string) => void
}

export function SearchResults({ results, isSearching, query, onAddToLibrary, onPreview }: SearchResultsProps) {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  const handleAddToLibrary = async (item: SearchResult) => {
    if (addedItems.has(item.id)) return
    
    setAddedItems(prev => new Set(prev).add(item.id))
    await onAddToLibrary(item)
  }

  const formatPopularity = (score: number) => {
    if (score >= 10000) {
      return `${(score / 1000).toFixed(1)}K`
    }
    return score.toLocaleString()
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  if (isSearching) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">没有找到相关结果</h3>
        <p className="text-sm text-muted-foreground mb-4">
          尝试调整关键词或使用不同的筛选条件
        </p>
        <div className="text-xs text-muted-foreground">
          <div className="inline-block bg-muted px-3 py-1 rounded">
            搜索关键词："{query}"
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((item, index) => (
        <Card key={item.id} className="border rounded-lg hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                
                <h3 
                  className="font-medium text-base leading-tight"
                  dangerouslySetInnerHTML={{ __html: highlightText(item.title, query) }}
                />
                
                <p 
                  className="text-sm text-muted-foreground line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: highlightText(item.summary, query) }}
                />
              </div>

              <div className="flex flex-col gap-2 min-w-[120px]">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">{formatPopularity(item.popularityScore)}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onPreview(item.url)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    预览
                  </Button>
                  
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleAddToLibrary(item)}
                    disabled={addedItems.has(item.id)}
                  >
                    {addedItems.has(item.id) ? (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        已添加
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        添加素材
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(item.publishTime)}
              </span>
              <span>作者: {item.author}</span>
              <span>阅读: {item.readCount}</span>
            </div>

            {/* 关键词匹配提示 */}
            {query && (
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">匹配关键词：</span>
                {query.toLowerCase().split(/\s+/).filter(k => k.trim()).map(keyword => (
                  <span key={keyword} className="inline-block bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mr-1">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}