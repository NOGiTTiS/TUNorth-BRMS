"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LogOut,
  Plus,
  Users,
  DoorOpen,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import { API_URL } from "@/config";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isInitialized } = useAuthStore();
  const { fetchSettings, get } = useSettings();
  const [stats, setStats] = useState({
    totalBookings: 0,
    approvedBookings: 0,
    totalRooms: 0,
    totalUsers: 0,
  });
  const [monthlyData, setMonthlyData] = useState<number[]>(
    new Array(12).fill(0)
  );
  const [loading, setLoading] = useState(true);

  // Helper to fetch count
  const fetchCount = async (url: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  useEffect(() => {
    if (!isInitialized) return; // Wait for init
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    fetchSettings(); // Fetch settings

    const loadStats = async () => {
      // Parallel Fetch
      const [bookings, rooms, users] = await Promise.all([
        fetchCount(`${API_URL}/api/bookings`),
        fetchCount(`${API_URL}/api/rooms`),
        fetchCount(`${API_URL}/api/users`),
      ]);

      // Calculate Stats
      const approved = bookings.filter(
        (b: any) => b.status === "approved"
      ).length;

      // Calculate Monthly Data (Current Year)
      const currentYear = new Date().getFullYear();
      const months = new Array(12).fill(0);

      console.log("Current Year:", currentYear);
      console.log("Bookings:", bookings);

      bookings.forEach((b: any) => {
        const dateStr = b.start_time || b.StartTime;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
            months[d.getMonth()]++;
          }
        }
      });

      setStats({
        totalBookings: bookings.length,
        approvedBookings: approved,
        totalRooms: rooms.length,
        totalUsers: users.length,
      });
      setMonthlyData(months);
      setLoading(false);
    };

    loadStats();
  }, [isAuthenticated, user, router]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* Simple Bar Chart Component */
  const BarChart = ({ data }: { data: number[] }) => {
    const maxVal = Math.max(...data, 10); // Minimum scale of 10

    return (
      <div className="w-full h-80 flex items-end gap-2 md:gap-4 pt-8 pb-6 px-4 bg-slate-50">
        {data.slice(0, 12).map((val, idx) => {
          const heightPercent = (val / maxVal) * 100;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group relative h-full justify-end"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-black px-2 py-1 rounded pointer-events-none mb-2 z-10 w-max">
                {val} รายการ
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out opacity-80 hover:opacity-100"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: get("theme_color", "#D81B60"), // Use dynamic color
                }}
              ></div>

              {/* Label */}
              <span className="text-[10px] md:text-xs text-slate-400 mt-2 truncate max-w-full text-center h-4">
                {monthNames[idx]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading || !isInitialized)
    return (
      <div className="p-10 text-center text-slate-500">
        กำลังประมวลผลข้อมูล...
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4 font-sans space-y-8">
      {/* 2. Header Area: ภาพรวมระบบ + Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ</h1>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/booking/create")}
            className="w-full md:w-auto bg-tu-pink hover:bg-tu-pink-hover text-white rounded-full shadow-lg shadow-tu-pink/20 px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> จองห้องประชุม
          </Button>

          <div className="hidden md:flex items-center px-4 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 shadow-sm">
            สวัสดี,{" "}
            <span className="font-bold ml-1">
              {user?.username || "ผู้ดูแล"}
            </span>
          </div>

          <Button
            onClick={logout}
            variant="destructive"
            className="rounded-md shadow-sm bg-tu-pink hover:bg-tu-pink-hover"
          >
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* 3. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Bookings */}
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm shadow-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              การจองทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-tu-pink">
                {stats.totalBookings}
              </span>
              <span className="text-sm text-slate-400">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Approved */}
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm shadow-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              การจองที่อนุมัติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-yellow-500">
                {stats.approvedBookings}
              </span>{" "}
              {/* Yellow matching example approximately, or use brand color */}
              <span className="text-sm text-slate-400">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Rooms */}
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm shadow-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              ห้องทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-500">
                {stats.totalRooms}
              </span>
              <span className="text-sm text-slate-400">ห้อง</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Users */}
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm shadow-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              ผู้ใช้ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-500">
                {stats.totalUsers}
              </span>
              <span className="text-sm text-slate-400">คน</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Chart Section */}
      <Card className="rounded-3xl border border-slate-100 bg-slate-50 shadow-sm overflow-hidden">
        <CardHeader className="pb-0 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-slate-800">
            ยอดการจองรายเดือน (ปีปัจจุบัน)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Chart Wrapper with Grid Lines Background (Optional simple CSS grid) */}
          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <BarChart data={monthlyData} />
            </div>
            {/* Debug Info (Hidden in prod) */}
            <div className="text-[10px] text-slate-300 text-center mt-2">
              Data Year: {new Date().getFullYear()} | Total in Chart:{" "}
              {monthlyData.reduce((a, b) => a + b, 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
