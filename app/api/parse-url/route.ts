import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json()

    if (!url || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: '无效的URL格式' },
        { status: 400 }
      )
    }

    // 使用爬虫API获取页面元数据
    const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'WeChat CMS'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-sonnet-20240229',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容分析助手。请分析网页内容并提取标题、摘要、作者、发布时间等关键信息。返回JSON格式数据。'
          },
          {
            role: 'user',
            content: `请分析这个URL的内容并提取以下信息：
URL: ${url}

请返回JSON格式：
{
  "title": "文章标题",
  "summary": "文章摘要（100字以内）",
  "author": "作者名称",
  "publishTime": "发布时间（ISO格式）",
  "category": "文章分类",
  "readCount": "阅读数（如果有）",
  "popularityScore": 0,
  "source": "来源平台",
  "success": true
}`
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    })

    const result = await response.json()
    
    if (!result.choices?.[0]?.message?.content) {
      throw new Error('无法解析URL内容')
    }

    let parsedData
    try {
      const content = result.choices[0].message.content
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法提取有效JSON')
      }
      parsedData = JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('解析AI响应失败:', error)
      // 返回基础数据
      parsedData = {
        title: '未知标题',
        summary: '无法获取摘要',
        author: '未知作者',
        publishTime: new Date().toISOString(),
        category: '其他',
        readCount: '0',
        popularityScore: 0,
        source: '人工添加',
        success: true
      }
    }

    // 添加到素材库
    const { data: material, error: insertError } = await supabase
      .from('materials')
      .insert({
        title: parsedData.title || '未知标题',
        summary: parsedData.summary || '无法获取摘要',
        original_content: parsedData.summary || '内容待获取',
        url: url,
        source: parsedData.source || '人工添加',
        source_id: `manual_${Date.now()}`,
        category: parsedData.category || '其他',
        tags: [parsedData.category || '其他'],
        author: parsedData.author || '未知作者',
        publish_time: parsedData.publishTime || new Date().toISOString(),
        read_count: parsedData.readCount || '0',
        popularity_score: parsedData.popularityScore || 0,
        material_status: 'collected',
        user_id: userId
      })
      .select()
      .single()

    if (insertError) {
      console.error('添加素材失败:', insertError)
      return NextResponse.json(
        { success: false, error: '添加素材失败' },
        { status: 500 }
      )
    }

    // 创建改写任务
    const { error: taskError } = await supabase
      .from('rewrite_tasks')
      .insert({
        material_id: material.id,
        user_id: userId,
        rewrite_type: 'standard',
        tone: 'neutral',
        priority: 5
      })

    if (taskError) {
      console.error('创建改写任务失败:', taskError)
    }

    return NextResponse.json({
      success: true,
      material: material,
      message: '链接已添加到素材库并开始AI改写'
    })

  } catch (error) {
    console.error('处理URL失败:', error)
    return NextResponse.json(
      { success: false, error: '处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}