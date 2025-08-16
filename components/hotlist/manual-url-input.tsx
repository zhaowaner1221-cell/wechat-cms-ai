"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface ManualUrlInputProps {
  onSuccess?: () => void
}

export function ManualUrlInput({ onSuccess }: ManualUrlInputProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast({
        title: "请输入URL",
        description: "请输入有效的文章链接",
        variant: "destructive",
      })
      return
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      toast({
        title: "URL格式无效",
        description: "请输入完整的HTTP(S)链接",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录后才能添加素材",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          userId: user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setUrl("")
        toast({
          title: "添加成功",
          description: "链接已添加到素材库并开始AI改写",
        })
        
        // 触发父组件刷新
        if (onSuccess) {
          onSuccess()
        }

        // 3秒后重置成功状态
        setTimeout(() => setSuccess(false), 3000)
      } else {
        toast({
          title: "添加失败",
          description: result.error || "处理失败，请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("手动添加URL失败:", error)
      toast({
        title: "添加失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          人工添加链接
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="manual-url">文章链接</Label>
            <Input
              id="manual-url"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              支持微信公众号、知乎、头条等各类文章链接
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !url.trim()} 
            className="w-full"
            variant={success ? "success" : "default"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                已添加
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                添加到素材库
              </>
            )}
          </Button>

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              文章已添加到素材库，AI正在改写中...
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}