/**
 * 搜索文本高亮工具
 */

export function highlightText(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) return text
  
  const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0)
  let highlightedText = text
  
  // 创建不区分大小写的正则表达式
  keywords.forEach(keyword => {
    if (keyword) {
      const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    }
  })
  
  return highlightedText
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 计算文本匹配分数
 */
export function calculateMatchScore(text: string, keywords: string[]): number {
  if (!keywords.length) return 0
  
  const lowerText = text.toLowerCase()
  let score = 0
  
  keywords.forEach(keyword => {
    const index = lowerText.indexOf(keyword.toLowerCase())
    if (index !== -1) {
      // 关键词在开头权重更高
      score += keyword.length * (index === 0 ? 2 : 1)
    }
  })
  
  return score
}

/**
 * 分解搜索查询为多关键词
 */
export function parseSearchQuery(query: string): {
  keywords: string[]
  exactPhrases: string[]
  platforms: string[]
} {
  const keywords: string[] = []
  const exactPhrases: string[] = []
  const platforms: string[] = []
  
  // 提取引号内的精确短语
  const phraseRegex = /"([^"]+)"/g
  let match
  while ((match = phraseRegex.exec(query)) !== null) {
    exactPhrases.push(match[1])
  }
  
  // 移除引号内容后分割剩余关键词
  const remainingText = query.replace(phraseRegex, '').trim()
  const allKeywords = remainingText.toLowerCase().split(/\s+/).filter(k => k.length > 0)
  
  // 分离平台关键词
  allKeywords.forEach(keyword => {
    const platformKeywords = ['微信科技', '微信生活', '微信职场', '微信财经', '少数派', '36氪']
    const matchedPlatform = platformKeywords.find(p => keyword.includes(p.toLowerCase()))
    
    if (matchedPlatform) {
      platforms.push(matchedPlatform)
    } else {
      keywords.push(keyword)
    }
  })
  
  return { keywords, exactPhrases, platforms }
}

/**
 * 格式化搜索统计信息
 */
export function formatSearchStats(count: number, query: string): string {
  const keywords = query.trim().split(/\s+/).filter(k => k.length > 0)
  
  if (keywords.length === 0) {
    return `找到 ${count} 条结果`
  }
  
  if (keywords.length === 1) {
    return `找到 ${count} 条包含“${query}”的结果`
  }
  
  return `找到 ${count} 条包含 ${keywords.length} 个关键词的结果`
}

/**
 * 生成搜索建议
 */
export function generateSearchSuggestions(query: string, history: string[]): string[] {
  if (!query.trim()) return []
  
  const suggestions = history
    .filter(item => item.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
  
  return suggestions
}

/**
 * 验证搜索查询格式
 */
export function validateSearchQuery(query: string): {
  valid: boolean
  message?: string
} {
  if (!query.trim()) {
    return { valid: false, message: '请输入搜索关键词' }
  }
  
  if (query.length < 2) {
    return { valid: false, message: '搜索关键词至少2个字符' }
  }
  
  if (query.length > 100) {
    return { valid: false, message: '搜索关键词不能超过100个字符' }
  }
  
  return { valid: true }
}