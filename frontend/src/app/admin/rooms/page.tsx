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
      const res = await fetch("http://localhost:8080/api/rooms");
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
      let url = "http://localhost:8080/api/rooms";
      let method = "POST";

      if (editingRoom) {
        url = `http://localhost:8080/api/rooms/${editingRoom.id}`;
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
      const res = await fetch(`http://localhost:8080/api/rooms/${id}`, {
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
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DoorOpen /> จัดการข้อมูลห้องประชุม
          </CardTitle>
          <Button
            onClick={openAddModal}
            className="bg-tu-pink hover:bg-tu-pink-hover text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องใหม่
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>สี</TableHead>
                <TableHead>ชื่อห้อง</TableHead>
                <TableHead>ความจุ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.id}</TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded-full border shadow-sm"
                      style={{ backgroundColor: room.color }}
                    ></div>
                  </TableCell>
                  <TableCell className="font-bold">{room.room_name}</TableCell>
                  <TableCell>{room.capacity} คน</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
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
                      onClick={() => openEditModal(room)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.25 bg-white">
          <DialogHeader>
                <DialogTitle>{editingRoom ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องประชุมใหม่'}</DialogTitle>
                
                {/* 2. เพิ่มบรรทัดนี้ครับ (ซ่อนไว้ด้วย sr-only) */}
                <DialogDescription className="sr-only">
                    แบบฟอร์มสำหรับกรอกรายละเอียดเพื่อเพิ่มหรือแก้ไขห้องประชุม
                </DialogDescription>

            </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room_name">ชื่อห้อง</Label>
              <Input
                id="room_name"
                name="room_name"
                value={formData.room_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">ความจุ (คน)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">สีประจำห้อง (Hex Code)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={formData.color}
                  onChange={handleChange}
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="uppercase"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">พร้อมใช้งาน</SelectItem>
                  <SelectItem value="maintenance">ปิดปรับปรุง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white"
              >
                บันทึกข้อมูล
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
