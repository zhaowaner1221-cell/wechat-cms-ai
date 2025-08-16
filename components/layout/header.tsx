"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  breadcrumbs?: { name: string; href?: string }[]
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Title and Breadcrumbs */}
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {breadcrumbs && (
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-1">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground">
                    {crumb.name}
                  </a>
                ) : (
                  <span>{crumb.name}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索内容..." className="w-64 pl-10" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent text-xs"></span>
        </Button>
      </div>
    </header>
  )
}
