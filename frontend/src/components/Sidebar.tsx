'use client';

import Link from 'next/link';
import { CalendarDays, LogIn, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';

// รับ Props เพิ่มเติม
interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'ปฏิทิน', href: '/', icon: CalendarDays },
    { name: 'เข้าสู่ระบบ', href: '/login', icon: LogIn },
    { name: 'สมัครสมาชิก', href: '/register', icon: UserPlus },
  ];

  // ถ้าเป็น Mobile ให้แสดงตลอด (block) ถ้าไม่ใช่ให้แสดงเฉพาะจอใหญ่ (hidden md:flex)
  const displayClass = isMobile ? 'flex w-full h-full' : 'hidden md:flex w-64 h-screen';

  return (
    <aside className={`${displayClass} bg-tu-pink text-white flex-col shrink-0 shadow-xl transition-all`}>
      <div className="p-6 text-center border-b border-tu-pink-hover">
        <h1 className="text-2xl font-bold tracking-wider">BRMS</h1>
        <p className="text-sm text-pink-100 opacity-80">Triam Udom Suksa</p>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // ถ้าเป็นมือถือ กดแล้วให้ปิดเมนู
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-white text-tu-pink font-semibold shadow-md' 
                  : 'text-white hover:bg-tu-pink-hover'
                }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 text-xs text-center text-pink-200 border-t border-tu-pink-hover">
        © 2026 TUNorth BRMS
      </div>
    </aside>
  );
}