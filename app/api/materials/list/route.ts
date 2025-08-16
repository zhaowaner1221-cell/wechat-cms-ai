import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const source = searchParams.get('source')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('materials')
      .select(`
        *,
        rewrite_results!material_id(
          id,
          rewritten_title,
          summary,
          quality_score,
          word_count,
          rewrite_status,
          created_at
        )
      `, { count: 'exact' })
      .eq('user_id', userId)

    // 添加筛选条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    if (category && category !== '全部') {
      query = query.eq('category', category)
    }

    if (status && status !== '全部') {
      query = query.eq('material_status', status.toLowerCase())
    }

    if (source && source !== '全部') {
      query = query.eq('source', source)
    }

    // 执行分页查询
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('查询素材列表失败:', error)
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      )
    }

    // 获取统计数据
    const { data: stats } = await supabase
      .from('materials')
      .select('material_status', { count: 'exact' })
      .eq('user_id', userId)

    const statusCounts = {
      total: count || 0,
      collected: 0,
      rewriting: 0,
      rewritten: 0,
      published: 0
    }

    stats?.forEach(item => {
      if (item.material_status in statusCounts) {
        statusCounts[item.material_status as keyof typeof statusCounts]++
      }
    })

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      stats: statusCounts
    })

  } catch (error) {
    console.error('获取素材列表异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}