import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { hotListItem, userId } = await request.json()

    if (!hotListItem || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否已存在
    const { data: existing, error: checkError } = await supabase
      .from('materials')
      .select('id')
      .eq('user_id', userId)
      .eq('source', getSourceName(hotListItem.listHashId))
      .eq('source_id', hotListItem.itemId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查重复失败:', checkError)
      return NextResponse.json(
        { success: false, error: '检查失败' },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json({
        success: false,
        error: '该内容已存在于素材库中',
        materialId: existing.id
      })
    }

    // 添加到素材库
    const { data: material, error: insertError } = await supabase
      .from('materials')
      .insert({
        title: hotListItem.title,
        summary: hotListItem.summary,
        original_content: hotListItem.summary, // 暂时使用摘要作为内容
        url: hotListItem.url,
        source: getSourceName(hotListItem.listHashId),
        source_id: hotListItem.itemId,
        category: hotListItem.category || '其他',
        tags: [hotListItem.category || '其他'],
        author: hotListItem.author || '未知作者',
        publish_time: hotListItem.publishTime,
        read_count: hotListItem.readCount,
        popularity_score: hotListItem.popularityScore,
        material_status: 'collected',
        user_id: userId
      })
      .select()
      .single()

    if (insertError) {
      console.error('添加素材失败:', insertError)
      return NextResponse.json(
        { success: false, error: '添加失败' },
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
      // 不返回错误，素材已添加成功
    }

    return NextResponse.json({
      success: true,
      materialId: material.id,
      message: '已添加到素材库并开始AI改写'
    })

  } catch (error) {
    console.error('添加素材异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

function getSourceName(hashId: string): string {
  const sourceMap: Record<string, string> = {
    '5PdMaaadmg': '微信科技24小时热文榜',
    'nBe0xxje37': '微信生活24小时热文榜',
    'DOvn33ydEB': '微信职场24小时热文榜',
    'KGoRGRDvl6': '微信财经24小时热文榜',
    'Y2KeDGQdNP': '少数派热门文章',
    'Q1Vd5Ko85R': '36氪热门文章'
  }
  return sourceMap[hashId] || '热榜内容'
}