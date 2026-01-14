"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Booking } from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarClock } from "lucide-react";

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const fetchMyBookings = async () => {
      try {
        // ส่ง query param ?user_id=... ไปด้วย
        const res = await fetch(
          `http://localhost:8080/api/bookings?user_id=${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          // เรียงวันที่ล่าสุดขึ้นก่อน
          // ถ้า data เป็น null ให้ใช้ [] แทน
          const safeData = Array.isArray(data) ? data : [];
          const sorted = safeData.sort((a: Booking, b: Booking) => b.id - a.id);
          setBookings(sorted);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [isAuthenticated, router, user, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-slate-500 hover:text-tu-pink pl-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
      </Button>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-tu-pink flex items-center gap-2">
            <CalendarClock /> ประวัติการจองของฉัน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>หัวข้อการประชุม</TableHead>
                <TableHead>ห้อง</TableHead>
                <TableHead>เวลาที่จอง</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.subject}
                    {/* แสดงเหตุผลถ้าถูกปฏิเสธ (ถ้ามี field reject_reason ในอนาคต) */}
                  </TableCell>
                  <TableCell>{booking.room?.room_name}</TableCell>
                  <TableCell className="text-sm">
                    <div className="text-slate-600">
                      {formatDate(booking.start_time)}
                    </div>
                    <div className="text-slate-400 text-xs">
                      ถึง {formatDate(booking.end_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
                        รออนุมัติ
                      </Badge>
                    )}
                    {booking.status === "approved" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        อนุมัติแล้ว
                      </Badge>
                    )}
                    {booking.status === "rejected" && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                        ไม่อนุมัติ
                      </Badge>
                    )}
                    {booking.status === "cancelled" && (
                      <Badge variant="outline">ยกเลิก</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {bookings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-32 text-slate-500"
                  >
                    คุณยังไม่มีรายการจองห้องประชุม
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
