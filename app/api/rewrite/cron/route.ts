import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rewriteContent } from '@/lib/openai/client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * 定时任务：处理待改写的任务
 * 可以通过 Vercel Cron Jobs 或其他定时任务服务调用
 */
export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（防止被滥用）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取待处理的任务（按优先级排序）
    const { data: pendingTasks, error: fetchError } = await supabase
      .from('rewrite_tasks')
      .select(`*, materials(*)`)
      .eq('task_status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10) // 每次处理最多10个任务

    if (fetchError) {
      console.error('获取待处理任务失败:', fetchError)
      return NextResponse.json(
        { success: false, error: '获取任务失败' },
        { status: 500 }
      )
    }

    if (!pendingTasks || pendingTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: '暂无待处理任务',
        processed: 0
      })
    }

    const results = []
    
    // 逐个处理任务
    for (const task of pendingTasks) {
      try {
        const result = await processSingleTask(task)
        results.push(result)
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`处理任务 ${task.id} 失败:`, error)
        results.push({
          taskId: task.id,
          success: false,
          error: error instanceof Error ? error.message : '处理失败'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })

  } catch (error) {
    console.error('定时任务处理异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 处理单个改写任务
 */
async function processSingleTask(task: any) {
  console.log(`[Cron] 开始处理任务 ${task.id}`)

  // 更新任务状态为处理中
  await supabase
    .from('rewrite_tasks')
    .update({
      task_status: 'processing',
      processing_started_at: new Date().toISOString()
    })
    .eq('id', task.id)

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
      task.materials.title,
      task.materials.original_content || task.materials.summary,
      rewriteOptions
    )

    // 保存改写结果
    const { data: rewriteResult, error: saveError } = await supabase
      .from('rewrite_results')
      .insert({
        material_id: task.material_id,
        user_id: task.user_id,
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
        prompt_tokens: 0,
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
      .eq('id', task.id)

    // 更新素材状态为已改写
    await supabase
      .from('materials')
      .update({ material_status: 'rewritten' })
      .eq('id', task.material_id)

    console.log(`[Cron] 完成任务 ${task.id}`)

    return {
      taskId: task.id,
      success: true,
      result: {
        materialId: task.material_id,
        rewriteId: rewriteResult.id,
        wordCount: result.wordCount,
        qualityScore: result.qualityScore
      }
    }

  } catch (error) {
    console.error(`[Cron] 处理任务 ${task.id} 失败:`, error)

    // 更新任务状态为失败
    await supabase
      .from('rewrite_tasks')
      .update({
        task_status: 'failed',
        error_message: error instanceof Error ? error.message : '改写失败',
        error_count: task.error_count + 1
      })
      .eq('id', task.id)

    // 检查是否需要重试
    if (task.error_count < task.max_retries) {
      await supabase
        .from('rewrite_tasks')
        .update({
          task_status: 'pending',
          current_retry: task.current_retry + 1
        })
        .eq('id', task.id)
    } else {
      // 最终失败，更新素材状态
      await supabase
        .from('materials')
        .update({ material_status: 'collected' })
        .eq('id', task.material_id)
    }

    throw error
  }
}

/**
 * 清理过期任务
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 清理7天前的已完成任务
    const { error: deleteError } = await supabase
      .from('rewrite_tasks')
      .delete()
      .eq('task_status', 'completed')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (deleteError) {
      console.error('清理任务失败:', deleteError)
      return NextResponse.json(
        { success: false, error: '清理失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '清理完成'
    })

  } catch (error) {
    console.error('清理任务异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}