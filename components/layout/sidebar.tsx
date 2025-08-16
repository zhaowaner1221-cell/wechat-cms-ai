"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, FileText, Bot, Send, Settings, MessageSquare } from "lucide-react"

const navigation = [
  {
    name: "仪表板",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "热榜管理",
    href: "/hotlist",
    icon: TrendingUp,
  },
  {
    name: "素材库",
    href: "/materials",
    icon: FileText,
  },
  {
    name: "AI改写中心",
    href: "/rewrite",
    icon: Bot,
  },
  {
    name: "发布管理",
    href: "/publish",
    icon: Send,
  },
  {
    name: "系统设置",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo and Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-sidebar-foreground">公众号CMS</h1>
          <p className="text-xs text-muted-foreground">内容管理系统</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
