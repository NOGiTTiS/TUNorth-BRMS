'use client'; // บอก Next.js ว่าหน้านี้ทำงานฝั่ง Client (เพื่อให้ใช้ useEffect ได้)

import { useEffect, useState } from 'react';
import { Room } from '@/types/room';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, CalendarDays } from 'lucide-react'; // Icon สวยๆ

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลจาก Go Backend
  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/rooms');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // เรียกใช้เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">ระบบจองห้องประชุม</h1>
        <p className="text-slate-500 mt-2">โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ</p>
      </header>

      {loading ? (
        <p className="text-center text-lg">กำลังโหลดข้อมูลห้องประชุม...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow border-t-4" style={{ borderTopColor: room.color || '#3b82f6' }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{room.room_name}</CardTitle>
                  <Badge variant={room.status === 'active' ? 'default' : 'destructive'}>
                    {room.status === 'active' ? 'พร้อมใช้งาน' : 'ปรับปรุง'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-slate-600">
                  <p className="flex items-center gap-2">
                     <Users size={18} /> รองรับ {room.capacity} ท่าน
                  </p>
                  <p className="flex items-center gap-2">
                     <MapPin size={18} /> {room.description || 'ไม่มีรายละเอียดสถานที่'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                 <button className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 flex items-center justify-center gap-2">
                    <CalendarDays size={18} /> จองห้องนี้
                 </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}