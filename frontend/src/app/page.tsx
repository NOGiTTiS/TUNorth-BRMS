"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import thLocale from "@fullcalendar/core/locales/th";
import { Button } from "@/components/ui/button";
import { Room } from "@/types/room";
import { Booking } from "@/types/booking";
import BookingDetailModal from "@/components/BookingDetailModal";
import { useAuthStore } from "@/store/authStore";
import { UserCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();

  // 1. เรียกใช้ Store เพื่อดูสถานะ Login
  const { isAuthenticated, user } = useAuthStore();

  // 2. State ต่างๆ
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State ป้องกัน Hydration Error
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // ดึงข้อมูลห้องมาแสดงเป็น Legend
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/rooms");
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  // 3. ฟังก์ชันดึงข้อมูลการจอง (ถูกเรียกโดย FullCalendar)
  const fetchEvents = async (
    info: any,
    successCallback: any,
    failureCallback: any
  ) => {
    try {
      // Encode URL เพื่อป้องกันปัญหาเครื่องหมาย + ในวันที่
      const start = encodeURIComponent(info.startStr);
      const end = encodeURIComponent(info.endStr);

      const res = await fetch(
        `http://localhost:8080/api/bookings?start=${start}&end=${end}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch bookings");
      }

      const bookings = await res.json();

      // แปลงข้อมูลให้ FullCalendar เข้าใจ
      const events = bookings.map((booking: any) => ({
        id: booking.id.toString(),
        title: booking.subject,
        start: booking.start_time,
        end: booking.end_time,
        backgroundColor: booking.room?.color || "#94a3b8",
        borderColor: booking.room?.color || "#94a3b8",
        // เก็บข้อมูลเต็มๆ ไว้ส่งให้ Modal
        extendedProps: {
          fullBookingData: booking,
        },
      }));

      successCallback(events);
    } catch (error) {
      console.error("Error loading events:", error);
      failureCallback(error);
    }
  };

  // 4. เมื่อคลิกที่ Event
  const handleEventClick = (info: any) => {
    const bookingData = info.event.extendedProps.fullBookingData;
    setSelectedBooking(bookingData);
    setIsModalOpen(true);
  };

  // 5. ปรับหน้าตาภายในแถบ Event
  const renderEventContent = (eventInfo: any) => {
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

  // ถ้ายังโหลด Client ไม่เสร็จ ห้าม render เพื่อกัน Hydration Error
  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-3 md:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-tu-pink pl-3 w-full md:w-auto">
          ปฏิทินการจองห้องประชุม
        </h2>

        {/* Logic ปุ่มขวาบน */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <UserCircle size={18} />
                <span className="font-medium truncate">{user.username}</span>
                <span className="text-xs text-gray-500 border-l pl-2 ml-1">
                  {user.role}
                </span>
              </div>
            )}

            <Button
              onClick={() => router.push("/booking/create")}
              className="w-full md:w-auto sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              + จองห้องประชุม
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push("/login")}
            className="w-full md:w-auto sm:w-auto bg-tu-pink hover:bg-tu-pink-hover text-white"
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </div>

      {/* Calendar Area */}
      <div className="flex-1 calendar-container text-sm md:text-base font-sans mb-6">
        <style jsx global>{`
          .fc-header-toolbar {
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem !important;
          }
          .fc-col-header-cell-cushion {
            font-weight: 600;
            color: #334155;
            padding: 8px 0 !important;
          }
          .fc-button-primary {
            background-color: #334155 !important;
            border-color: #334155 !important;
          }
          .fc-day-today {
            background-color: #fdf2f8 !important;
          }
          .fc-daygrid-event {
            border: none !important;
            margin-top: 2px !important;
            border-radius: 4px !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .fc-event-main {
            color: white !important;
          }
        `}</style>

        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          locale={thLocale}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            meridiem: false,
          }}
          eventDisplay="block"
          eventContent={renderEventContent}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listMonth",
          }}
          events={fetchEvents}
          eventClick={handleEventClick}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
        />
      </div>

      {/* Legend Area */}
      <div className="border-t pt-4">
        <h3 className="text-base font-bold text-slate-700 mb-3">
          สีประจำห้อง:
        </h3>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูลห้อง...</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: room.color || "#ccc" }}
                ></span>
                <span className="text-sm text-slate-600">{room.room_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Details */}
      <BookingDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
