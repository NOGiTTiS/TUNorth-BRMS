"use client"; // เปลี่ยนเป็น Client Component เพื่อใช้ useEffect

import { useEffect } from "react";
import { Prompt } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useAuthStore } from "@/store/authStore"; // import store
import { Toaster } from "@/components/ui/sonner";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // เรียกใช้ Store
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth(); // ตรวจสอบ Token เมื่อโหลดเว็บครั้งแรก
  }, [initializeAuth]);

  return (
    <html lang="th">
      <body className="...">
        <div className="flex flex-col md:flex-row min-h-screen">
          <MobileNav />
          <Sidebar />
          <main className="flex-1 p-3 md:p-6 overflow-auto w-full">
            {children}
          </main>
        </div>

        {/* เปลี่ยนจาก <Toaster /> ธรรมดา เป็นของ Sonner */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
