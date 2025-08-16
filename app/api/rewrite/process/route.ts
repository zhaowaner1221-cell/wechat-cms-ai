import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rewriteContent } from '@/lib/openai/client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { taskId, userId } = await request.json()

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      )
    }

    // 获取改写任务
    const { data: task, error: taskError } = await supabase
      .from('rewrite_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      )
    }

    // 获取对应的素材
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', task.material_id)
      .single()

    if (materialError || !material) {
      return NextResponse.json(
        { success: false, error: '素材不存在' },
        { status: 404 }
      )
    }

    // 更新任务状态为处理中
    await supabase
      .from('rewrite_tasks')
      .update({
        task_status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', taskId)

    // 更新素材状态为改写中
    await supabase
      .from('materials')
      .update({ material_status: 'rewriting' })
      .eq('id', task.material_id)

    try {
      // 执行AI改写
      const rewriteOptions = {
        type: task.rewrite_type || 'standard',
        tone: task.tone || 'neutral',
        targetAudience: task.target_audience,
        keywords: task.keywords || [],
        language: 'zh-CN'
      }

      const result = await rewriteContent(
        material.title,
        material.original_content || material.summary,
        rewriteOptions
      )

      // 保存改写结果
      const { data: rewriteResult, error: saveError } = await supabase
        .from('rewrite_results')
        .insert({
          material_id: task.material_id,
          user_id: userId || task.user_id,
          rewrite_type: task.rewrite_type || 'standard',
          tone: task.tone || 'neutral',
          target_audience: task.target_audience,
          keywords: task.keywords || [],
          rewritten_title: result.title,
          rewritten_content: result.content,
          summary: result.summary,
          quality_score: result.qualityScore,
          word_count: result.wordCount,
          model_name: 'claude-3-sonnet-20240229',
          rewrite_status: 'completed',
          prompt_tokens: 0, // 实际使用时可以计算
          completion_tokens: 0,
          total_tokens: 0
        })
        .select()
        .single()

      if (saveError) {
        throw saveError
      }

      // 更新任务状态为完成
      await supabase
        .from('rewrite_tasks')
        .update({
          task_status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      // 更新素材状态为已改写
      await supabase
        .from('materials')
        .update({ material_status: 'rewritten' })
        .eq('id', task.material_id)

      return NextResponse.json({
        success: true,
        result: {
          ...result,
          rewriteId: rewriteResult.id
        }
      })

    } catch (error) {
      console.error('AI改写失败:', error)

      // 更新任务状态为失败
      await supabase
        .from('rewrite_tasks')
        .update({
          task_status: 'failed',
          error_message: error instanceof Error ? error.message : '改写失败',
          error_count: task.error_count + 1,
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      // 检查是否需要重试
      if (task.error_count < task.max_retries) {
        await supabase
          .from('rewrite_tasks')
          .update({
            task_status: 'pending',
            current_retry: task.current_retry + 1
          })
          .eq('id', taskId)
      } else {
        // 最终失败，更新素材状态
        await supabase
          .from('materials')
          .update({ material_status: 'collected' })
          .eq('id', task.material_id)
      }

      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : '改写失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('处理改写任务异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 获取改写任务状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const materialId = searchParams.get('materialId')

    if (!taskId && !materialId) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID或素材ID' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('rewrite_tasks')
      .select(`*, rewrite_results(*)`)

    if (taskId) {
      query = query.eq('id', taskId)
    } else if (materialId) {
      query = query.eq('material_id', materialId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tasks: data
    })

  } catch (error) {
    console.error('查询改写任务异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}