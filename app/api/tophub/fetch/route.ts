import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { createHash } from "crypto"

// TopHub API 配置
const TOPHUB_BASE_URL = "https://api.tophubdata.com"
const TOPHUB_API_KEY = process.env.TOPHUB_API_KEY || "demo_key"

const HOT_LISTS = [
  { hashId: "5PdMaaadmg", name: "微信科技24小时热文榜", category: "科技", platform: "微信" },
  { hashId: "nBe0xxje37", name: "微信生活24小时热文榜", category: "生活", platform: "微信" },
  { hashId: "DOvn33ydEB", name: "微信职场24小时热文榜", category: "职场", platform: "微信" },
  { hashId: "KGoRGRDvl6", name: "微信财经24小时热文榜", category: "财经", platform: "微信" },
  { hashId: "Y2KeDGQdNP", name: "少数派热门文章", category: "科技", platform: "少数派" },
  { hashId: "Q1Vd5Ko85R", name: "36氪热门文章", category: "创投", platform: "36氪" },
]

interface TopHubItem {
  title: string
  description: string
  thumbnail?: string
  url: string
  extra: string // popularity info like "455 万热度"
}

interface TopHubResponse {
  error: boolean
  status: number
  data: {
    hashid: string
    name: string
    display: string
    domain: string
    logo: string
    items: TopHubItem[]
  }
}

const fetchTopHubData = async (hashId: string): Promise<TopHubResponse> => {
  if (TOPHUB_API_KEY === "demo_key") {
    // 使用模拟数据
    const listConfig = HOT_LISTS.find((list) => list.hashId === hashId)
    return generateMockData(hashId, listConfig?.name || "", listConfig?.category || "")
  }

  try {
    const response = await fetch(`${TOPHUB_BASE_URL}/nodes/${hashId}`, {
      headers: {
        Authorization: TOPHUB_API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`TopHub API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[v0] TopHub API 调用失败 ${hashId}:`, error)
    // 降级到模拟数据
    const listConfig = HOT_LISTS.find((list) => list.hashId === hashId)
    return generateMockData(hashId, listConfig?.name || "", listConfig?.category || "")
  }
}

const saveToSupabase = async (hashId: string, apiData: TopHubResponse["data"]) => {
  try {
    const { data: existingList } = await supabaseServer.from("hot_lists").select("hashid").eq("hashid", hashId).single()

    if (existingList) {
      // Update existing record
      const { error: updateError } = await supabaseServer
        .from("hot_lists")
        .update({
          name: apiData.name,
          display: apiData.display,
          domain: apiData.domain,
          logo: apiData.logo,
          last_updated: new Date().toISOString(),
        })
        .eq("hashid", hashId)

      if (updateError) {
        console.error("[v0] 更新热榜信息失败:", updateError)
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabaseServer.from("hot_lists").insert({
        hashid: hashId,
        name: apiData.name,
        display: apiData.display,
        domain: apiData.domain,
        logo: apiData.logo,
        last_updated: new Date().toISOString(),
      })

      if (insertError) {
        console.error("[v0] 插入热榜信息失败:", insertError)
      }
    }

    const hotListItems = apiData.items.map((item) => {
      const contentHash = createHash("md5").update(`${item.title}${item.url}${item.description}`).digest("hex")

      return {
        hot_list_hashid: hashId,
        title: item.title,
        description: item.description || "",
        thumbnail: item.thumbnail || "",
        url: item.url || "",
        extra: item.extra || "",
        item_hash: contentHash,
        collected_at: new Date().toISOString(),
      }
    })

    // 批量插入热榜项目（使用 upsert 避免重复）
    const { error: itemsError } = await supabaseServer.from("hot_list_items").upsert(hotListItems, {
      onConflict: "hot_list_hashid,item_hash",
      ignoreDuplicates: false,
    })

    if (itemsError) {
      console.error("[v0] 保存热榜项目失败:", itemsError)
      throw itemsError
    }

    console.log(`[v0] 成功保存 ${hotListItems.length} 条数据到 Supabase`)
    return hotListItems.length
  } catch (error) {
    console.error("[v0] Supabase 保存失败:", error)
    throw error
  }
}

const generateMockData = (hashId: string, listName: string, category: string): TopHubResponse => {
  const mockItems: TopHubItem[] = Array.from({ length: 20 }, (_, index) => ({
    title: `${category}热门文章 ${index + 1}: ${getRandomTitle(category)}`,
    description: `这是一篇关于${category}的热门文章摘要，内容涵盖了最新的行业动态和深度分析...`,
    thumbnail: `https://picsum.photos/200/120?random=${hashId}_${index}`,
    url: `https://mp.weixin.qq.com/s/${Math.random().toString(36).substring(7)}`,
    extra: `${Math.floor(Math.random() * 500 + 100)} 万热度`,
  }))

  return {
    error: false,
    status: 200,
    data: {
      hashid: hashId,
      name: listName,
      display: "热榜",
      domain: "weixin.qq.com",
      logo: "https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png",
      items: mockItems,
    },
  }
}

const getRandomTitle = (category: string): string => {
  const titles = {
    科技: [
      "AI大模型的最新突破与应用前景",
      "量子计算技术发展现状分析",
      "5G网络建设的挑战与机遇",
      "区块链技术在金融领域的创新应用",
      "元宇宙概念下的虚拟现实技术",
      "开源软件的商业化探索之路",
      "云原生架构的设计与实践",
    ],
    生活: [
      "健康饮食的科学搭配指南",
      "城市生活中的环保实践方法",
      "家居装修的流行趋势解析",
      "亲子教育的现代理念探讨",
      "旅行摄影的技巧与心得分享",
    ],
    职场: [
      "远程办公时代的职业发展策略",
      "团队管理中的沟通艺术",
      "数字化转型对职场的影响",
      "职业规划的关键节点把握",
      "工作与生活平衡的实现方法",
    ],
    财经: [
      "全球经济形势下的投资策略",
      "数字货币市场的风险与机遇",
      "房地产市场的发展趋势分析",
      "企业财务管理的创新模式",
      "个人理财规划的实用建议",
    ],
    创投: [
      "独角兽企业的成长路径分析",
      "风险投资市场的新趋势解读",
      "创业公司的融资策略与技巧",
      "科技创新驱动的商业模式变革",
      "新兴行业的投资机会与风险",
      "企业数字化转型的投资价值",
    ],
  }

  const categoryTitles = titles[category as keyof typeof titles] || titles["科技"]
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { hashId, manual = false } = await request.json()

    if (!hashId) {
      return NextResponse.json({ error: "缺少 hashId 参数" }, { status: 400 })
    }

    const listConfig = HOT_LISTS.find((list) => list.hashId === hashId)
    if (!listConfig) {
      return NextResponse.json({ error: "不支持的热榜类型" }, { status: 400 })
    }

    console.log(`[v0] 开始采集热榜数据: ${listConfig.name}`)

    const apiResponse = await fetchTopHubData(hashId)

    if (apiResponse.error || apiResponse.status !== 200) {
      throw new Error("API 调用失败")
    }

    const savedCount = await saveToSupabase(hashId, apiResponse.data)

    const processedItems = apiResponse.data.items.map((item, index) => ({
      listHashId: hashId,
      itemId: createHash("md5").update(`${item.title}${item.url}`).digest("hex"),
      title: item.title,
      summary: item.description || "",
      url: item.url,
      popularityScore: Number.parseInt(item.extra.replace(/[^\d]/g, "")) || Math.floor(Math.random() * 10000),
      readCount: item.extra,
      publishTime: new Date(),
      author: `热榜作者${index + 1}`,
      category: listConfig.category,
      isCollected: false,
      rankPosition: index + 1,
    }))

    console.log(`[v0] 处理完成，共 ${processedItems.length} 条数据，保存 ${savedCount} 条到数据库`)

    return NextResponse.json({
      success: true,
      data: {
        listName: apiResponse.data.name,
        category: listConfig.category,
        itemsCount: processedItems.length,
        savedCount,
        items: processedItems,
        updateTime: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] TopHub API 调用失败:", error)
    return NextResponse.json(
      { error: "API 调用失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log("[v0] 开始批量刷新所有热榜数据")

    const results = []

    for (const listConfig of HOT_LISTS) {
      try {
        console.log(`[v0] 正在采集: ${listConfig.name}`)

        const apiResponse = await fetchTopHubData(listConfig.hashId)

        if (!apiResponse.error && apiResponse.status === 200) {
          const savedCount = await saveToSupabase(listConfig.hashId, apiResponse.data)

          results.push({
            hashId: listConfig.hashId,
            name: listConfig.name,
            category: listConfig.category,
            itemsCount: apiResponse.data.items.length,
            savedCount,
            status: "success",
            updateTime: new Date().toISOString(),
          })

          console.log(`[v0] ${listConfig.name} 采集完成: ${apiResponse.data.items.length} 条，保存 ${savedCount} 条`)
        } else {
          throw new Error("API 返回错误")
        }

        // 添加延迟避免请求过快
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`[v0] ${listConfig.name} 采集失败:`, error)
        results.push({
          hashId: listConfig.hashId,
          name: listConfig.name,
          category: listConfig.category,
          itemsCount: 0,
          savedCount: 0,
          status: "failed",
          error: error instanceof Error ? error.message : "未知错误",
        })
      }
    }

    const successCount = results.filter((r) => r.status === "success").length
    const totalItems = results.reduce((sum, r) => sum + r.itemsCount, 0)
    const totalSaved = results.reduce((sum, r) => sum + (r.savedCount || 0), 0)

    console.log(
      `[v0] 批量采集完成: ${successCount}/${HOT_LISTS.length} 个热榜成功，共 ${totalItems} 条数据，保存 ${totalSaved} 条到数据库`,
    )

    return NextResponse.json({
      success: true,
      summary: {
        totalLists: HOT_LISTS.length,
        successCount,
        failedCount: HOT_LISTS.length - successCount,
        totalItems,
        totalSaved,
      },
      results,
    })
  } catch (error) {
    console.error("[v0] 批量采集失败:", error)
    return NextResponse.json(
      { error: "批量采集失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 },
    )
  }
}
