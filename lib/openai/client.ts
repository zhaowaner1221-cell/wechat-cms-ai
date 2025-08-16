import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'WeChat CMS - AI Content Rewriter',
  },
})

export interface RewriteOptions {
  type: 'standard' | 'creative' | 'concise' | 'expand' | 'seo'
  tone: 'neutral' | 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative'
  targetAudience?: string
  keywords?: string[]
  maxLength?: number
  language?: 'zh-CN' | 'zh-TW' | 'en'
}

export interface RewriteResult {
  title: string
  content: string
  summary: string
  wordCount: number
  keywords: string[]
  qualityScore: number
}

/**
 * 使用AI进行内容改写
 */
export async function rewriteContent(
  originalTitle: string,
  originalContent: string,
  options: RewriteOptions = {
    type: 'standard',
    tone: 'neutral',
    language: 'zh-CN'
  }
): Promise<RewriteResult> {
  try {
    const systemPrompt = generateSystemPrompt(options)
    const userPrompt = generateUserPrompt(originalTitle, originalContent, options)

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-sonnet-20240229',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const result = JSON.parse(content)
    return {
      title: result.title || originalTitle,
      content: result.content || originalContent,
      summary: result.summary || '',
      wordCount: result.content?.length || 0,
      keywords: result.keywords || [],
      qualityScore: result.quality_score || 0.8
    }
  } catch (error) {
    console.error('AI rewrite error:', error)
    throw new Error(`AI改写失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 生成系统提示词
 */
function generateSystemPrompt(options: RewriteOptions): string {
  const basePrompt = `你是一个专业的内容改写专家，擅长将现有内容改写成高质量、原创性强的文章。

要求：
1. 保持原意但用全新的表达方式
2. 提高内容质量和可读性
3. 确保原创性，避免抄袭
4. 根据指定的类型和语调进行调整
5. 输出JSON格式：{"title": "新标题", "content": "改写后的内容", "summary": "摘要", "keywords": ["关键词1", "关键词2"], "quality_score": 0.9}

语言：${options.language === 'zh-CN' ? '简体中文' : options.language === 'zh-TW' ? '繁体中文' : 'English'}`

  const tonePrompt = getTonePrompt(options.tone)
  const typePrompt = getTypePrompt(options.type)
  const audiencePrompt = options.targetAudience ? `目标受众：${options.targetAudience}` : ''

  return `${basePrompt}\n${tonePrompt}\n${typePrompt}\n${audiencePrompt}`
}

/**
 * 生成用户提示词
 */
function generateUserPrompt(
  title: string,
  content: string,
  options: RewriteOptions
): string {
  let prompt = `请改写以下内容：\n\n标题：${title}\n\n内容：${content}`

  if (options.keywords && options.keywords.length > 0) {
    prompt += `\n\n关键词要求：${options.keywords.join(', ')}`
  }

  if (options.maxLength) {
    prompt += `\n\n字数要求：${options.maxLength}字以内`
  }

  return prompt
}

/**
 * 获取语调提示
 */
function getTonePrompt(tone: string): string {
  const toneMap = {
    'neutral': '语调：客观中性，事实陈述',
    'formal': '语调：正式专业，适合商务场景',
    'casual': '语调：轻松随意，口语化表达',
    'professional': '语调：专业权威，有说服力',
    'friendly': '语调：友善亲切，易于理解',
    'authoritative': '语调：权威可信，专家视角'
  }
  return toneMap[tone] || toneMap.neutral
}

/**
 * 获取改写类型提示
 */
function getTypePrompt(type: string): string {
  const typeMap = {
    'standard': '改写类型：标准改写，保持原意但重新组织语言',
    'creative': '改写类型：创意改写，增加新的角度和观点',
    'concise': '改写类型：简洁版本，去除冗余信息',
    'expand': '改写类型：扩展版本，增加深度和细节',
    'seo': '改写类型：SEO优化，融入关键词，提高搜索排名'
  }
  return typeMap[type] || typeMap.standard
}

/**
 * 批量改写内容（用于队列处理）
 */
export async function batchRewriteContents(
  contents: Array<{
    materialId: number
    title: string
    content: string
    options?: RewriteOptions
  }>
): Promise<Array<{
  materialId: number
  result: RewriteResult
  error?: string
}>> {
  const results = await Promise.allSettled(
    contents.map(async ({ materialId, title, content, options }) => {
      try {
        const result = await rewriteContent(title, content, options)
        return { materialId, result }
      } catch (error) {
        return {
          materialId,
          result: {
            title: '',
            content: '',
            summary: '',
            wordCount: 0,
            keywords: [],
            qualityScore: 0
          },
          error: error instanceof Error ? error.message : '改写失败'
        }
      }
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        materialId: contents[index].materialId,
        result: {
          title: '',
          content: '',
          summary: '',
          wordCount: 0,
          keywords: [],
          qualityScore: 0
        },
        error: result.reason
      }
    }
  })
}

/**
 * 获取改写进度（模拟，实际可结合队列系统）
 */
export async function getRewriteProgress(taskId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: RewriteResult
  error?: string
}> {
  // 这里可以集成实际的队列系统，如 Bull、RabbitMQ 等
  return {
    status: 'completed',
    progress: 100,
    result: {
      title: '示例改写标题',
      content: '示例改写内容...',
      summary: '示例摘要',
      wordCount: 1000,
      keywords: ['AI', '内容创作'],
      qualityScore: 0.9
    }
  }
}

export default openai