"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();

  // กำหนดรายการเมนู
  const menuItems = [{ name: "ปฏิทิน", href: "/", icon: CalendarDays }];

  if (isAuthenticated) {
    menuItems.push(
      {
        name: "การจองของฉัน",
        href: "/my-bookings",
        icon: ListTodo,
      },
      {
        name: "ข้อมูลส่วนตัว",
        href: "/my-profile",
        icon: User,
      },
      {
        name: "ภาพรวมระบบ", // Dashboard
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      }
    );

    if (user?.role === "admin") {
      // แยกส่วน Admin Menu ถ้าต้องการ header แยก ให้จัดการใน Loop
      menuItems.push(
        {
          name: "จัดการการจอง",
          href: "/admin/manage-bookings",
          icon: ListTodo,
        }, // New Link
        { name: "จัดการผู้ใช้งาน", href: "/admin/users", icon: Users },
        { name: "จัดการห้องประชุม", href: "/admin/rooms", icon: DoorOpen },
        { name: "จัดการอุปกรณ์", href: "/admin/resources", icon: Box }
      );
    }
  } else {
    menuItems.push(
      { name: "เข้าสู่ระบบ", href: "/login", icon: LogIn },
      { name: "สมัครสมาชิก", href: "/register", icon: UserPlus }
    );
  }

  const displayClass = isMobile
    ? "flex w-full h-full"
    : "hidden md:flex w-64 h-screen";

  return (
    // 1. เปลี่ยนพื้นหลังเป็น bg-slate-900 (สีดำเข้มตามรูป)
    <aside
      className={`${displayClass} bg-slate-900 text-white flex-col shrink-0 shadow-xl transition-all font-sans`}
    >
      {/* Logo Section */}
      <div className="p-6 text-center">
        {/* ชื่อระบบสีชมพู */}
        <h1 className="text-2xl font-bold tracking-wider text-tu-pink">
          TUNorth-BRMS
        </h1>
        <p className="text-xs text-slate-400 mt-1">ระบบจองห้องประชุมออนไลน์</p>
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
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
        © 2026 Triam Udom Suksa
      </div>
    </aside>
  );
}
