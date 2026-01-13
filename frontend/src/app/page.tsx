'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import thLocale from '@fullcalendar/core/locales/th';
import { Button } from '@/components/ui/button';
import { Room } from '@/types/room';
import { Booking } from '@/types/booking'; // import type Booking
import BookingDetailModal from '@/components/BookingDetailModal'; // import Modal ที่เพิ่งสร้าง

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // --- State สำหรับ Modal ---
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect ดึง rooms (เหมือนเดิม) ...
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/rooms');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const fetchEvents = async (info: any, successCallback: any, failureCallback: any) => {
    try {
      const start = encodeURIComponent(info.startStr);
      const end = encodeURIComponent(info.endStr);
      
      const res = await fetch(`http://localhost:8080/api/bookings?start=${start}&end=${end}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const bookings = await res.json();

      const events = bookings.map((booking: any) => ({
        id: booking.id.toString(),
        title: booking.subject,
        start: booking.start_time,
        end: booking.end_time,
        backgroundColor: booking.room?.color || '#94a3b8',
        borderColor: booking.room?.color || '#94a3b8',
        
        // --- จุดสำคัญ: ยัดข้อมูล Booking ทั้งก้อนใส่ extendedProps ---
        extendedProps: {
          fullBookingData: booking // เก็บ object booking ไว้ตรงนี้เพื่อดึงมาใช้ตอนคลิก
        }
      }));

      successCallback(events);
    } catch (error) {
      console.error('Error loading events:', error);
      failureCallback(error);
    }
  };

  // --- ฟังก์ชันเมื่อกดที่ Event ---
  const handleEventClick = (info: any) => {
    // ดึงข้อมูล booking ที่ซ่อนไว้ใน extendedProps
    const bookingData = info.event.extendedProps.fullBookingData;
    
    setSelectedBooking(bookingData); // set state
    setIsModalOpen(true); // เปิด modal
  };

  const renderEventContent = (eventInfo: any) => {
     // ... (เหมือนเดิม)
     return (
      <div className="flex items-center w-full overflow-hidden px-1 py-0.5 cursor-pointer hover:opacity-90 transition-opacity">
        <span className="font-bold bg-black/20 rounded-[2px] px-1 mr-1 text-[10px] whitespace-nowrap leading-tight">
          {eventInfo.timeText}
        </span>
        <div className="flex flex-col overflow-hidden">
             <span className="text-[11px] font-medium truncate leading-tight">
                {eventInfo.event.title}
             </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-3 md:p-6 h-full flex flex-col">
      
      {/* Header (เหมือนเดิม) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-tu-pink pl-3 w-full md:w-auto">
          ปฏิทินการจองห้องประชุม
        </h2>
        <Button className="w-full md:w-auto bg-tu-pink hover:bg-tu-pink-hover text-white cursor-pointer">
            เข้าสู่ระบบ
        </Button>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 calendar-container text-sm md:text-base font-sans mb-6">
        <style jsx global>{`
          /* CSS Styles (เหมือนเดิม) */
          .fc-header-toolbar { flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem !important; }
          .fc-col-header-cell-cushion { font-weight: 600; color: #334155; padding: 8px 0 !important; }
          .fc-button-primary { background-color: #334155 !important; border-color: #334155 !important; }
          .fc-day-today { background-color: #fdf2f8 !important; }
          .fc-daygrid-event { border: none !important; margin-top: 2px !important; border-radius: 4px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
          .fc-event-main { color: white !important; }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth" 
          locale={thLocale}
          eventTimeFormat={{
            hour: '2-digit', minute: '2-digit', hour12: false, meridiem: false 
          }}
          eventDisplay="block"
          eventContent={renderEventContent}
          headerToolbar={{
            left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' 
          }}
          events={fetchEvents}
          
          // --- เพิ่ม eventClick ---
          eventClick={handleEventClick} 
          
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
        />
      </div>

      {/* Legend (เหมือนเดิม) */}
      <div className="border-t pt-4">
          {/* ... โค้ดส่วนแสดงสีห้อง ... */}
          <h3 className="text-base font-bold text-slate-700 mb-3">สีประจำห้อง:</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
                {rooms.map((room) => (
                    <div key={room.id} className="flex items-center gap-2">
                        <span 
                            className="w-4 h-4 rounded-full shadow-sm shrink-0" 
                            style={{ backgroundColor: room.color || '#ccc' }}
                        ></span>
                        <span className="text-sm text-slate-600">
                            {room.room_name}
                        </span>
                    </div>
                ))}
            </div>
      </div>

      {/* --- ใส่ Modal Component ไว้ตรงนี้ --- */}
      <BookingDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />

    </div>
  );
}