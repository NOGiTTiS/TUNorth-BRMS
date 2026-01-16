"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Room } from "@/types/room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit, Plus, DoorOpen } from "lucide-react";

import { API_URL } from "@/config";

export default function AdminRoomsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับ Modal (ใช้ร่วมกันทั้ง Add และ Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null); // ถ้า null = โหมดเพิ่ม, ถ้ามีค่า = โหมดแก้ไข

  // Form State
  const [formData, setFormData] = useState({
    room_name: "",
    description: "",
    capacity: "",
    color: "#3b82f6", // ค่า Default สีฟ้า
    status: "active",
  });

  // 1. Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        // เรียงตาม ID
        setRooms(data.sort((a: Room, b: Room) => a.id - b.id));
      }
    } catch (error) {
      console.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/"); // ถ้าไม่ใช่ Admin ดีดออก
      return;
    }
    fetchRooms();
  }, [isAuthenticated, user, router]);

  // 2. Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Open Modal (Add Mode)
  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      room_name: "",
      description: "",
      capacity: "",
      color: "#3b82f6",
      status: "active",
    });
    setIsModalOpen(true);
  };

  // 4. Open Modal (Edit Mode)
  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_name: room.room_name,
      description: room.description || "",
      capacity: room.capacity.toString(),
      color: room.color || "#3b82f6",
      status: room.status,
    });
    setIsModalOpen(true);
  };

  // 5. Submit Form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // แปลงข้อมูลให้ตรงกับ Backend
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      image_path: "", // ตอนนี้ยังไม่มีอัปโหลดรูป
    };

    try {
      let url = `${API_URL}/api/rooms`;
      let method = "POST";

      if (editingRoom) {
        url = `${API_URL}/api/rooms/${editingRoom.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save room");

      toast.success(editingRoom ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มห้องสำเร็จ");
      setIsModalOpen(false);
      fetchRooms(); // โหลดข้อมูลใหม่
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  // 6. Delete Room
  const handleDelete = async (id: number) => {
    if (
      !confirm("คุณแน่ใจหรือไม่ที่จะลบห้องนี้? (ประวัติการจองห้องนี้อาจหายไป)")
    )
      return;

    try {
      const res = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("ลบห้องเรียบร้อย");
      fetchRooms();
    } catch (error) {
      toast.error("ลบไม่สำเร็จ (อาจมีการจองค้างอยู่)");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* 1. Header & Toolbar Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            จัดการข้อมูลห้องประชุม
          </h1>
          <p className="text-slate-500 mt-1">
            บริหารจัดการห้องประชุมและอุปกรณ์ภายใน
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-tu-pink hover:bg-tu-pink-hover text-white rounded-full shadow-lg shadow-tu-pink/30"
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องใหม่
        </Button>
      </div>

      {/* 2. Table Section (Card) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-12.5 text-slate-500 font-medium">
                  ID
                </TableHead>
                <TableHead className="text-slate-500 font-medium">สี</TableHead>
                <TableHead className="text-slate-500 font-medium">
                  ชื่อห้อง
                </TableHead>
                <TableHead className="text-slate-500 font-medium">
                  ความจุ
                </TableHead>
                <TableHead className="text-slate-500 font-medium">
                  สถานะ
                </TableHead>
                <TableHead className="text-right text-slate-500 font-medium">
                  จัดการ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow
                  key={room.id}
                  className="hover:bg-slate-50/50 border-b border-slate-50 last:border-none"
                >
                  <TableCell className="font-medium">{room.id}</TableCell>
                  <TableCell>
                    <div
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: room.color }}
                    ></div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {room.room_name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {room.capacity} คน
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        room.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {room.status === "active" ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-500"
                      onClick={() => openEditModal(room)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-transparent hover:border-red-100 shadow-none"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-slate-500"
                  >
                    ไม่มีข้อมูลห้องประชุม
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-center text-slate-800">
              {editingRoom ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้องประชุมใหม่"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              แบบฟอร์มสำหรับกรอกรายละเอียดเพื่อเพิ่มหรือแก้ไขห้องประชุม
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium">ชื่อห้อง</Label>
              <Input
                name="room_name"
                value={formData.room_name}
                onChange={handleChange}
                required
                placeholder="เช่น ห้องประชุม 1"
                className="rounded-xl border-slate-200 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-medium">
                  ความจุ (คน)
                </Label>
                <Input
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  placeholder="เช่น 50"
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-medium">สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger className="bg-white rounded-xl border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">พร้อมใช้งาน</SelectItem>
                    <SelectItem value="maintenance">ปิดปรับปรุง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium">
                สีประจำห้อง (สำหรับปฏิทิน)
              </Label>
              <div className="flex gap-3 items-center">
                <Input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-14 h-11 p-1 rounded-xl cursor-pointer border-slate-200"
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="uppercase rounded-xl border-slate-200 h-11 flex-1"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-center gap-3 pt-4 sm:justify-center">
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white rounded-md px-8 py-2 h-auto"
              >
                {editingRoom ? "บันทึกการแก้ไข" : "เพิ่มห้องประชุม"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-500 hover:bg-slate-600 text-white rounded-md px-8 py-2 h-auto"
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
