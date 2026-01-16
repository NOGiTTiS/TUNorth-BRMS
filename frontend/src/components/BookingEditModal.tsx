"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/config";
import { Booking } from "@/types/booking";
import { Room } from "@/types/room";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BookingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export default function BookingEditModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: BookingEditModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    room_id: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    note: "",
  });

  // Fetch Rooms for Dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchRooms = async () => {
        try {
          const res = await fetch(`${API_URL}/api/rooms`);
          if (res.ok) {
            setRooms(await res.json());
          }
        } catch (e) {
          console.error("Failed to load rooms", e);
        }
      };
      fetchRooms();
    }
  }, [isOpen]);

  // Initialize Form with Booking Data
  useEffect(() => {
    if (booking) {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);

      setFormData({
        subject: booking.subject,
        room_id: booking.room_id.toString(),
        start_date: start.toISOString().split("T")[0],
        start_time: start.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        end_date: end.toISOString().split("T")[0],
        end_time: end.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        note: booking.note || "",
      });
    }
  }, [booking]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setLoading(true);

    try {
      const startDateTime = new Date(
        `${formData.start_date}T${formData.start_time}`
      );
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

      const payload = {
        subject: formData.subject,
        room_id: parseInt(formData.room_id, 10), // Convert to number
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        note: formData.note,
      };

      const res = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Correction failed");

      toast.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-white p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            แก้ไขข้อมูลการจอง
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            แก้ไขรายละเอียดการจองห้องประชุม
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>หัวข้อการประชุม</Label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>ห้องประชุม</Label>
            <Select
              value={formData.room_id}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, room_id: val }))
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="เลือกห้อง" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] bg-white"
              >
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.room_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>เริ่ม</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="rounded-xl flex-1"
                  required
                />
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="rounded-xl w-24"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>สิ้นสุด</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="rounded-xl flex-1"
                  required
                />
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="rounded-xl w-24"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg border-slate-200"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="bg-tu-pink hover:bg-tu-pink-hover text-white rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "บันทึกการแก้ไข"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
