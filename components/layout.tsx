"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FileText, LogOut, MessageSquare, Menu, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const NavigationContent = () => (
    <>
      <div className="p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Morsl</h1>
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-2">
        <Link href="/feedback" onClick={() => setIsSidebarOpen(false)}>
          <Button
            variant={pathname === "/feedback" ? "default" : "ghost"}
            className={`w-full justify-start text-sm lg:text-base ${
              pathname === "/feedback"
                ? "bg-gray-900 hover:bg-gray-800 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="mr-2 lg:mr-3 h-4 w-4" />
            Feedback
          </Button>
        </Link>
        <Link href="/manage-content" onClick={() => setIsSidebarOpen(false)}>
          <Button
            variant={pathname === "/manage-content" ? "default" : "ghost"}
            className={`w-full justify-start text-sm lg:text-base ${
              pathname === "/manage-content"
                ? "bg-gray-900 hover:bg-gray-800 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="mr-2 lg:mr-3 h-4 w-4" />
            Manage Content
          </Button>
        </Link>
        <Link href="/profile" onClick={() => setIsSidebarOpen(false)}>
          <Button
            variant={pathname === "/profile" ? "default" : "ghost"}
            className={`w-full justify-start text-sm lg:text-base ${
              pathname === "/profile" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="mr-2 lg:mr-3 h-4 w-4" />
            Profile
          </Button>
        </Link>
      </nav>

      <div className="p-3 lg:p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm lg:text-base"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 lg:mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <NavigationContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <div className="flex flex-col h-full">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <div>
                <h2 className="text-lg lg:text-2xl font-semibold text-gray-900">Hi, {user?.name || "Admin"}</h2>
                <p className="text-sm lg:text-base text-gray-600 mt-1">Good Morning!</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-3">
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10 cursor-pointer" onClick={handleProfileClick}>
                {user?.image ? (
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs lg:text-sm">
                    {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs lg:text-sm font-medium text-gray-900">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
