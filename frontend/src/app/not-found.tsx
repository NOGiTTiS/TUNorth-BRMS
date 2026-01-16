"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon Container */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative bg-white p-6 rounded-full shadow-lg border-4 border-red-50 flex items-center justify-center h-full w-full">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            404
          </h1>
          <h2 className="text-xl font-semibold text-slate-700">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกลบ ย้าย หรือไม่มีอยู่ระบบ
            กรุณาตรวจสอบ URL อีกครั้ง
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            asChild
            variant="outline"
            className="rounded-full h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft size={16} /> ย้อนกลับ
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-full h-11 px-6 bg-tu-pink hover:bg-tu-pink-hover text-white shadow-lg shadow-tu-pink/20"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home size={16} /> กลับหน้าหลัก
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-xs text-slate-400">
          TU North Booking Resource Management System
        </div>
      </div>
    </div>
  );
}
