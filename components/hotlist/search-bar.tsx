"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp, Calendar, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SearchFilters {
  sortBy: "popularity" | "time" | "platform"
  platforms: string[]
  dateRange: "all" | "today" | "week" | "month"
}

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
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  onClear: () => void
  results: SearchResult[]
  isSearching: boolean
  totalItems: number
}

export function SearchBar({ onSearch, onClear, results, isSearching, totalItems }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "popularity",
    platforms: [],
    dateRange: "all"
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 从localStorage加载搜索历史
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("hotlist-search-history")
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to parse search history:', error)
          setSearchHistory([])
        }
      }
    }
  }, [])

  // 保存搜索历史
  const saveSearchHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || typeof window === 'undefined') return
    
    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(updated)
    try {
      localStorage.setItem("hotlist-search-history", JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  // 点击外部关闭历史记录
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 处理搜索
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveSearchHistory(searchQuery)
      onSearch(searchQuery, filters)
      setShowHistory(false)
    } else {
      handleClear()
    }
  }

  // 清除搜索
  const handleClear = () => {
    setQuery("")
    onClear()
    setShowHistory(false)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowHistory(false)
    } else if (e.key === "ArrowDown" && showHistory && searchHistory.length > 0) {
      e.preventDefault()
      setHighlightedIndex(prev => Math.min(prev + 1, searchHistory.length - 1))
    } else if (e.key === "ArrowUp" && showHistory && searchHistory.length > 0) {
      e.preventDefault()
      setHighlightedIndex(prev => Math.max(prev - 1, -1))
    }
  }

  // 选择历史记录
  const selectHistoryItem = (item: string) => {
    setQuery(item)
    handleSearch(item)
  }

  // 清除单个历史记录
  const clearHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = searchHistory.filter(h => h !== item)
    setSearchHistory(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem("hotlist-search-history", JSON.stringify(updated))
    }
  }

  // 清除所有历史记录
  const clearAllHistory = () => {
    setSearchHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem("hotlist-search-history")
    }
    toast({
      title: "搜索历史已清除",
      description: "所有搜索记录已删除"
    })
  }

  // 处理筛选器变化
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    if (query.trim()) {
      onSearch(query, updatedFilters)
    }
  }

  // 多关键词搜索处理
  const handleMultiKeywordSearch = (keywords: string[]) => {
    if (keywords.length > 0) {
      const searchQuery = keywords.join(" ")
      setQuery(searchQuery)
      handleSearch(searchQuery)
    }
  }

  // 高亮显示关键词
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    
    const keywords = searchQuery.toLowerCase().split(/\s+/)
    let highlightedText = text
    
    keywords.forEach(keyword => {
      if (keyword) {
        const regex = new RegExp(`(${keyword})`, 'gi')
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
      }
    })
    
    return highlightedText
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索热榜内容（支持多关键词，用空格分隔）..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.trim()) {
                setShowHistory(true)
              } else {
                setShowHistory(false)
                handleClear()
              }
            }}
            onFocus={() => {
              if (query.trim() || searchHistory.length > 0) {
                setShowHistory(true)
              }
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 h-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "h-10 w-10",
            showFilters && "bg-accent"
          )}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* 搜索历史下拉框 */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">搜索历史</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={clearAllHistory}
              >
                清除全部
              </Button>
            </div>
            {searchHistory.map((item, index) => (
              <div
                key={item}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm",
                  index === highlightedIndex && "bg-accent"
                )}
                onClick={() => selectHistoryItem(item)}
              >
                <span className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {item}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 hover:opacity-100"
                  onClick={(e) => clearHistoryItem(item, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 筛选器面板 */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg z-40 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">排序方式</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="w-full h-8 text-sm border rounded px-2"
              >
                <option value="popularity">按热度</option>
                <option value="time">按时间</option>
                <option value="platform">按平台</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">时间范围</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as any })}
                className="w-full h-8 text-sm border rounded px-2"
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">来源平台</label>
              <select
                multiple
                value={filters.platforms}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange({ platforms: selected })
                }}
                className="w-full h-8 text-sm border rounded px-2"
                size={3}
              >
                <option value="微信科技">微信科技</option>
                <option value="微信生活">微信生活</option>
                <option value="微信职场">微信职场</option>
                <option value="微信财经">微信财经</option>
                <option value="少数派">少数派</option>
                <option value="36氪">36氪</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="button"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              应用筛选
            </Button>
          </div>
        </div>
      )}

      {/* 搜索统计 */}
      {query && (
        <div className="mt-2 text-sm text-muted-foreground">
          {isSearching ? (
            "搜索中..."
          ) : (
            `找到 ${results.length} 条结果（共 ${totalItems} 条数据）`
          )}
        </div>
      )}
    </div>
  )
}