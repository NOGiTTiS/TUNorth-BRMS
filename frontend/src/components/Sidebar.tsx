"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSettings } from "@/hooks/useSettings";
import {
  CalendarDays,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  DoorOpen,
  Box,
  Users,
  User,
  ListTodo,
  LayoutDashboard,
  Shield,
  ChevronDown,
  BarChart3,
  FileText,
} from "lucide-react";

import { useState } from "react"; // needed for state

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const { get } = useSettings();
  const siteName = get("site_name", "TUNorth-BRMS");
  const siteDesc = get("site_description", "ระบบจองห้องประชุมออนไลน์");
  const siteLogo = get("site_logo");

  // State for Dropdown
  const [isAdminOpen, setIsAdminOpen] = useState(true); // Default open or closed

  // Helper type
  type MenuItem = {
    name: string;
    href?: string;
    icon: any;
    children?: MenuItem[];
  };

  const menuItems: MenuItem[] = [
    { name: "ปฏิทิน", href: "/", icon: CalendarDays },
  ];

  if (isAuthenticated) {
    menuItems.push(
      {
        name: "จองห้องประชุม",
        href: "/booking/create",
        icon: Box,
      },
      {
        name: "ภาพรวมระบบ", // Dashboard
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "การจองของฉัน",
        href: "/my-bookings",
        icon: ListTodo,
      },
      {
        name: "ข้อมูลส่วนตัว",
        href: "/my-profile",
        icon: User,
      }
    );

    if (user?.role === "admin") {
      // Group Admin Items
      menuItems.push({
        name: "ผู้ดูแลระบบ",
        icon: Shield, // Need import Shield
        children: [
          {
            name: "จัดการการจอง",
            href: "/admin/manage-bookings",
            icon: ListTodo,
          },
          { name: "จัดการผู้ใช้งาน", href: "/admin/users", icon: Users },
          { name: "จัดการห้องประชุม", href: "/admin/rooms", icon: DoorOpen },
          { name: "จัดการอุปกรณ์", href: "/admin/resources", icon: Box },
          { name: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
          { name: "รายงาน", href: "/admin/report", icon: BarChart3 },
          { name: "บันทึกกิจกรรม", href: "/admin/logs", icon: FileText }, // Need import FileText
        ],
      });
    }
  } else {
    menuItems.push(
      { name: "เข้าสู่ระบบ", href: "/login", icon: LogIn },
      { name: "สมัครสมาชิก", href: "/register", icon: UserPlus }
    );
  }

  const displayClass = isMobile
    ? "flex w-full h-full"
    : "hidden md:flex w-64 h-screen sticky top-0";

  return (
    // 1. เปลี่ยนพื้นหลังเป็น bg-slate-900 (สีดำเข้มตามรูป)
    <aside
      className={`${displayClass} bg-slate-900 text-white flex-col shrink-0 shadow-xl transition-all font-sans`}
    >
      {/* Logo Section */}
      <div className="p-6 text-center">
        {siteLogo && (
          <div className="mb-3 flex justify-center">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 p-2">
              <img
                src={siteLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        {/* ชื่อระบบสีชมพู */}
        <h1 className="text-2xl font-bold tracking-wider text-tu-pink break-words">
          {siteName}
        </h1>
        <p className="text-xs text-slate-400 mt-1">{siteDesc}</p>
      </div>

      {/* User Profile (ถ้ามี) */}
      {isAuthenticated && user && (
        <div className="px-6 pb-6">
          <Link href="/my-profile" onClick={onClose}>
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-tu-pink flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-200 group-hover:text-white">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize group-hover:text-slate-400">
                  {user.role}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Menu Label */}
      <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Main Menu
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-10">
        {menuItems.map((item, index) => {
          // Check for Children
          if (item.children) {
            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isAdminOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {isAdminOpen && (
                  <div className="space-y-1 pl-4 relative before:absolute before:left-6 before:top-0 before:h-full before:w-[1px] before:bg-slate-800">
                    {item.children.map((subItem) => {
                      const isActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href || "#"}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 text-sm font-medium ml-2
                                            ${
                                              isActive
                                                ? "bg-tu-pink text-white shadow-md shadow-tu-pink/20"
                                                : "text-slate-500 hover:bg-slate-800 hover:text-white"
                                            }`}
                        >
                          <subItem.icon size={16} />
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href || "#"}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium
                ${
                  isActive
                    ? "bg-tu-pink text-white shadow-md shadow-tu-pink/20" // Active: สีชมพู
                    : "text-slate-400 hover:bg-slate-800 hover:text-white" // Inactive: สีเทา
                }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 text-slate-400 hover:bg-red-900/20 hover:text-red-400 text-left mt-4 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 text-[10px] text-center text-slate-600 border-t border-slate-800">
        {get("copyright_text", "© 2026 TU-North")}
      </div>
    </aside>
  );
}
