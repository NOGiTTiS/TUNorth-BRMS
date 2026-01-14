'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react'; // 1. import useEffect

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 2. สร้าง state เช็คการโหลด

  // 3. ใช้ useEffect เพื่อระบุว่า Client โหลดเสร็จแล้ว
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 4. ถ้ายังโหลดไม่เสร็จ (เป็นฝั่ง Server) ให้แสดงโครงสร้างนิ่งๆ 
  // โดยไม่มี SheetTrigger เพื่อเลี่ยงปัญหา ID ไม่ตรงกัน
  if (!isMounted) {
    return (
      <div className="md:hidden flex items-center justify-between p-4 bg-tu-pink text-white shadow-md">
        <div className="font-bold text-lg tracking-wider">
          TUNorth BRMS
        </div>
        <Button variant="ghost" size="icon" className="text-white">
           <Menu size={24} />
        </Button>
      </div>
    );
  }

  // 5. ถ้าโหลดเสร็จแล้ว ให้แสดงของจริงที่มี Sheet
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-tu-pink text-white shadow-md">
      {/* โลโก้ซ้ายมือ */}
      <div className="font-bold text-lg tracking-wider">
        TUNorth BRMS
      </div>

      {/* ปุ่มเมนูขวามือ */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-tu-pink-hover hover:text-white">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        
        {/* เนื้อหาที่จะเลื่อนออกมา */}
        <SheetContent side="left" className="p-0 border-r-0 w-64 bg-tu-pink text-white border-none">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="h-full">
             <Sidebar isMobile={true} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}