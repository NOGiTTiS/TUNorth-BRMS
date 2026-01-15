"use client";

// 1. เพิ่ม SheetDescription ที่ import
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
        <div className="font-bold text-lg tracking-wider text-tu-pink">
          TUNorth BRMS
        </div>
        <Button variant="ghost" size="icon" className="text-white">
          <Menu size={24} />
        </Button>
      </div>
    );
  }

  return (
    // เปลี่ยน bg-tu-pink เป็น bg-slate-900
    <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
      <div className="font-bold text-lg tracking-wider text-tu-pink">
        TUNorth BRMS
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-slate-800 hover:text-white"
          >
            <Menu size={24} />
          </Button>
        </SheetTrigger>

        {/* เปลี่ยน bg ของ SheetContent เป็น bg-slate-900 ด้วยเพื่อให้กลืนกัน */}
        <SheetContent
          side="left"
          className="p-0 border-r-0 w-64 bg-slate-900 text-white border-none"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Main Menu</SheetDescription>
          <div className="h-full">
            <Sidebar isMobile={true} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
