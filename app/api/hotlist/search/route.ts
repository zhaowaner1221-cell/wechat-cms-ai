import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const platforms = searchParams.get('platforms')?.split(',') || []
    const dateRange = searchParams.get('dateRange') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
        query: ''
      })
    }

    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0)
    const offset = (page - 1) * limit

    // 构建基础查询
    let dbQuery = supabase
      .from('hot_list_items')
      .select(`*, hot_lists(name, hashid, category)`, { count: 'exact' })

    // 添加关键词搜索条件
    if (keywords.length > 0) {
      const orConditions = keywords.map(keyword => 
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%`
      ).join(',')
      dbQuery = dbQuery.or(orConditions)
    }

    // 添加平台筛选
    if (platforms.length > 0) {
      dbQuery = dbQuery.in('hot_list_hashid', platforms)
    }

    // 添加时间范围筛选
    switch (dateRange) {
      case 'today':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dbQuery = dbQuery.gte('collected_at', today.toISOString())
        break
      case 'week':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        dbQuery = dbQuery.gte('collected_at', weekAgo.toISOString())
        break
      case 'month':
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        dbQuery = dbQuery.gte('collected_at', monthAgo.toISOString())
        break
    }

    // 添加排序
    let orderColumn = 'collected_at'
    let ascending = false

    switch (sortBy) {
      case 'popularity':
        orderColumn = 'extra'
        ascending = false
        break
      case 'time':
        orderColumn = 'collected_at'
        ascending = false
        break
      case 'platform':
        orderColumn = 'hot_list_hashid'
        ascending = true
        break
    }

    dbQuery = dbQuery.order(orderColumn, { ascending })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await dbQuery

    if (error) {
      console.error('搜索热榜数据失败:', error)
      return NextResponse.json(
        { success: false, error: '搜索失败' },
        { status: 500 }
      )
    }

    // 处理返回数据
    const processedData = (data || []).map(item => ({
      id: `${item.hot_list_hashid}_${item.item_hash}`,
      title: item.title,
      summary: item.description || '',
      url: item.url || '',
      popularityScore: parseInt(item.extra?.replace(/[^\d]/g, '') || '0') || 0,
      readCount: item.extra || '0',
      publishTime: new Date(item.collected_at),
      author: '热榜作者',
      category: item.hot_lists?.category || '未知',
      source: item.hot_lists?.name || '未知来源',
      platform: item.hot_lists?.hashid || ''
    }))

    return NextResponse.json({
      success: true,
      data: processedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      query
    })

  } catch (error) {
    console.error('搜索热榜数据异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}