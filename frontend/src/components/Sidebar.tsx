"use client";

import Link from "next/link";
import {
  CalendarDays,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ListTodo,
} from "lucide-react"; // เพิ่ม LogOut icon
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore"; // import store

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  // ดึง state จาก store
  const { isAuthenticated, logout, user } = useAuthStore();

  const menuItems = [{ name: "ปฏิทิน", href: "/", icon: CalendarDays }];

  // ถ้ายังไม่ login ให้โชว์เมนูเดิม
  if (!isAuthenticated) {
    menuItems.push(
      { name: "เข้าสู่ระบบ", href: "/login", icon: LogIn },
      { name: "สมัครสมาชิก", href: "/register", icon: UserPlus }
    );
  } else {
    // เพิ่มเมนูนี้สำหรับทุกคนที่ Login
    menuItems.push({
      name: "การจองของฉัน",
      href: "/my-bookings",
      icon: ListTodo,
    });

    // Admin Menu
    if (user?.role === "admin") {
      menuItems.push({
        name: "ผู้ดูแลระบบ",
        href: "/admin/dashboard",
        icon: Settings,
      });
    }
  }
  // (ถ้า login แล้ว เมนู Login/Register จะหายไป เหลือแต่ปฏิทิน และเดี๋ยวเราเพิ่มปุ่ม Logout ด้านล่าง)

  const displayClass = isMobile
    ? "flex w-full h-full"
    : "hidden md:flex w-64 h-screen";

  return (
    <aside
      className={`${displayClass} bg-tu-pink text-white flex-col shrink-0 shadow-xl transition-all`}
    >
      <div className="p-6 text-center border-b border-tu-pink-hover">
        <h1 className="text-2xl font-bold tracking-wider">BRMS</h1>
        <p className="text-sm text-pink-100 opacity-80">Triam Udom Suksa</p>

        {/* แสดงชื่อ User ถ้า Login แล้ว */}
        {isAuthenticated && user && (
          <div className="mt-4 bg-white/10 rounded-lg p-2 text-sm">
            👋 สวัสดี, {user.username}
            <div className="text-xs opacity-75 capitalize">({user.role})</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${
                  isActive
                    ? "bg-white text-tu-pink font-semibold shadow-md"
                    : "text-white hover:bg-tu-pink-hover"
                }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* ปุ่ม Logout (แสดงเฉพาะตอน Login แล้ว) */}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-white hover:bg-tu-pink-hover text-left"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        )}
      </nav>

      <div className="p-4 text-xs text-center text-pink-200 border-t border-tu-pink-hover">
        © 2026 TUNorth BRMS
      </div>
    </aside>
  );
}
