"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, CloudOff } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon Container */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-slate-200 rounded-full opacity-50"></div>
          <div className="relative bg-white p-6 rounded-full shadow-lg border-4 border-slate-100 flex items-center justify-center h-full w-full">
            <CloudOff className="w-12 h-12 text-slate-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">
            ระบบเกิดข้อผิดพลาด
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิดในการประมวลผลคำขอของคุณ
            กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs text-left overflow-auto max-h-32 mt-4 font-mono">
              {error.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            variant="outline"
            className="rounded-full h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCcw size={16} className="mr-2" /> ลองอีกครั้ง
          </Button>

          <Button
            asChild
            className="rounded-full h-11 px-6 bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home size={16} /> กลับหน้าหลัก
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
