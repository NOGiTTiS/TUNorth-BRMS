'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Check, X, Eye } from 'lucide-react'; // 1. เพิ่ม icon Eye
import BookingDetailModal from '@/components/BookingDetailModal'; // 2. import Modal เดิมมาใช้

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. State สำหรับ Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/bookings', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Booking, b: Booking) => b.id - a.id);
        setBookings(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }
    fetchBookings();
  }, [isAuthenticated, router, token]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
        const res = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) throw new Error('Update failed');

        toast.success(`อัปเดตสถานะเป็น ${newStatus === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'} แล้ว`);
        fetchBookings();

    } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  // 4. ฟังก์ชันเปิด Modal
  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-800">จัดการคำขอจองห้องประชุม</CardTitle>
          <Button variant="outline" onClick={fetchBookings}>รีเฟรชข้อมูล</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12.5">ID</TableHead>
                <TableHead>หัวข้อ / ผู้จอง</TableHead>
                <TableHead>ห้องประชุม</TableHead>
                <TableHead>เวลาที่จอง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="font-bold">{booking.subject}</div>
                    <div className="text-sm text-slate-500">{booking.user?.full_name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                     <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {booking.room?.room_name}
                     </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>เริ่ม: {formatDate(booking.start_time)}</div>
                    <div>ถึง: {formatDate(booking.end_time)}</div>
                  </TableCell>
                  <TableCell>
                    {booking.status === 'pending' && <Badge className="bg-yellow-500 hover:bg-yellow-600">รออนุมัติ</Badge>}
                    {booking.status === 'approved' && <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>}
                    {booking.status === 'rejected' && <Badge className="bg-red-500 hover:bg-red-600">ไม่อนุมัติ</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {/* 5. ปุ่มดูรายละเอียด (แสดงทุกสถานะ) */}
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 w-8 p-0 border-slate-300"
                            onClick={() => handleViewDetail(booking)}
                            title="ดูรายละเอียด"
                        >
                            <Eye size={16} className="text-slate-600" />
                        </Button>

                        {/* ปุ่มอนุมัติ (แสดงเฉพาะ pending) */}
                        {booking.status === 'pending' && (
                            <>
                                <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                    onClick={() => handleUpdateStatus(booking.id, 'approved')}
                                    title="อนุมัติ"
                                >
                                    <Check size={16} />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                    title="ไม่อนุมัติ"
                                >
                                    <X size={16} />
                                </Button>
                            </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                        ไม่มีรายการจอง
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 6. เรียกใช้ Modal ตรงนี้ */}
      <BookingDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}