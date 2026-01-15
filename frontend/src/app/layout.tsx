"use client"; // เปลี่ยนเป็น Client Component เพื่อใช้ useEffect

import { useEffect } from "react";
import { Prompt } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useAuthStore } from "@/store/authStore"; // import store
import { Toaster } from "@/components/ui/sonner";
import GlobalSettingsLoader from "@/components/GlobalSettingsLoader";
import { useSettings } from "@/hooks/useSettings";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // เรียกใช้ Store
  const initializeAuth = useAuthStore((state) => state.initialize);
  const { get } = useSettings();
  const favicon = get("favicon");

  useEffect(() => {
    initializeAuth(); // ตรวจสอบ Token เมื่อโหลดเว็บครั้งแรก
  }, [initializeAuth]);

  return (
    <html lang="th" className={`${prompt.variable}`}>
      <head>
        <title>{get("site_name", "TUNorth-BRMS")}</title>
        <meta
          name="description"
          content={get("site_description", "ระบบจองห้องประชุมออนไลน์")}
        />
        {favicon && <link rel="icon" href={favicon} />}
      </head>
      {/* เพิ่ม bg-slate-100 ให้ body -> ใช้ Gradient */}
      <body
        className={`${prompt.className} font-sans antialiased min-h-screen`}
        style={{
          background: `linear-gradient(to bottom, var(--bg-start, #f8fafc), var(--bg-end, #f1f5f9))`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex flex-col md:flex-row min-h-screen">
          <GlobalSettingsLoader />
          <MobileNav />
          <Sidebar />
          <main className="flex-1 p-3 md:p-6 overflow-auto w-full">
            {children}
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
