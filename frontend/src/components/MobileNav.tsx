'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar'; // เราจะ Reuse Sidebar เดิมมาใส่ในนี้
import { useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

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
        
        {/* เนื้อหาที่จะเลื่อนออกมา (Sidebar เดิม) */}
        <SheetContent side="left" className="p-0 border-r-0 w-64 bg-tu-pink text-white border-none">
           {/* เพิ่ม SheetTitle เพื่อแก้ warning ของ Radix UI (Accessibility) */}
          <SheetTitle className="sr-only">Menu</SheetTitle>
          
          {/* เราต้องแก้ Sidebar เล็กน้อยเพื่อให้มันยืดเต็ม Sheet ได้ หรือจะเขียนเมนูใหม่ในนี้ก็ได้ 
              แต่วิธีที่ง่ายที่สุดคือ Reuse Sidebar Component */}
          <div className="h-full">
             <Sidebar isMobile={true} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}