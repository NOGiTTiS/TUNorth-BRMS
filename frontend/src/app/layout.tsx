import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav"; // import มาใหม่

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "TUNorth-BRMS",
  description: "ระบบจองห้องประชุม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased bg-gray-50`}>
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* 1. Mobile Navbar (แสดงเฉพาะจอมือถือ) */}
            <MobileNav />

            {/* 2. Desktop Sidebar (แสดงเฉพาะจอใหญ่ - จัดการในตัว Sidebar เองแล้ว) */}
            <Sidebar />
          
            {/* 3. เนื้อหาหลัก */}
            <main className="flex-1 p-3 md:p-6 overflow-auto w-full">
                {children}
            </main>
        </div>
      </body>
    </html>
  );
}