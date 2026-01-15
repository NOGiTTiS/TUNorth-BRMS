"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Room } from "@/types/room";
import { Resource } from "@/types/resource";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateBookingPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [resourceOptions, setResourceOptions] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    subject: "",
    room_id: "",

    start_date: "",
    start_time: "",

    end_date: "",
    end_time: "",

    department: "",
    phone: "",
    attendees: "",
    note: "",

    resources: [] as string[], // เก็บ ID ของ resource

    // เก็บไฟล์รูปภาพ
    layout_image: null as File | null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Rooms
        const roomsRes = await fetch("http://localhost:8080/api/rooms");
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }

        // Fetch Resources
        const resRes = await fetch("http://localhost:8080/api/resources");
        if (resRes.ok) {
          const resData = await resRes.json();
          setResourceOptions(resData);
        }
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (value: string) => {
    setFormData((prev) => ({ ...prev, room_id: value }));
  };

  const handleResourceChange = (checked: boolean, value: string) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        resources: [...prev.resources, value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r !== value),
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, layout_image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. ตรวจสอบข้อมูลวันที่
    if (
      !formData.start_date ||
      !formData.start_time ||
      !formData.end_date ||
      !formData.end_time
    ) {
      toast.warning("ข้อมูลไม่ครบ", {
        description: "กรุณาระบุวันและเวลาให้ครบถ้วน",
      });
      setLoading(false);
      return;
    }

    const startDateTime = new Date(
      `${formData.start_date}T${formData.start_time}`
    );
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    if (startDateTime >= endDateTime) {
      toast.warning("เวลาไม่ถูกต้อง", {
        description: "เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด",
      });
      setLoading(false);
      return;
    }

    try {
      // 2. ใช้ FormData
      const formDataToSend = new FormData();

      formDataToSend.append("user_id", user?.user_id.toString() || "");
      formDataToSend.append("room_id", formData.room_id);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("attendees", formData.attendees || "0");
      formDataToSend.append("start_time", startDateTime.toISOString());
      formDataToSend.append("end_time", endDateTime.toISOString());
      formDataToSend.append("status", "pending");

      // --- จุดที่แก้ไข: แยก Resource Text กับ Note ---

      // 1. จัดการรายชื่ออุปกรณ์ (Resource Text)
      if (formData.resources.length > 0) {
        const selectedResourceLabels = formData.resources
          .map((r) => {
            const found = resourceOptions.find((o) => o.id.toString() === r);
            return found ? found.resource_name : null;
          })
          .filter(Boolean)
          .join(", ");

        formDataToSend.append("resource_text", selectedResourceLabels);
      } else {
        formDataToSend.append("resource_text", "-");
      }

      // 2. จัดการหมายเหตุ (Note) ส่งไปเพียวๆ ไม่ต้องเอาอุปกรณ์มาต่อท้ายแล้ว
      formDataToSend.append("note", formData.note);

      // แนบไฟล์รูปภาพ (ถ้ามี)
      if (formData.layout_image) {
        formDataToSend.append("layout_image", formData.layout_image);
      }

      // 3. ส่งไปยัง Backend
      const res = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "จองห้องไม่สำเร็จ");

      toast.success("ส่งคำขอจองสำเร็จ!", {
        description: "รายการของคุณถูกบันทึกแล้ว รอการอนุมัติ",
      });

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl font-sans">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-slate-500 hover:text-tu-pink pl-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าปฏิทิน
      </Button>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl font-bold text-black">
            จองห้องประชุม
          </CardTitle>
          <CardDescription>
            กรอกข้อมูลและอัปโหลดผังการจัดห้อง (ถ้ามี)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* แถว 1: ห้องประชุม - หัวข้อ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="room" className="font-bold">
                  ห้องประชุม <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={handleRoomChange} required>
                  <SelectTrigger
                    id="room"
                    className="w-full h-11 bg-white border-slate-300 focus:ring-tu-pink"
                  >
                    <SelectValue placeholder="-- กรุณาเลือกห้อง --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-9999">
                    {rooms.map((room) => (
                      <SelectItem
                        key={room.id}
                        value={room.id.toString()}
                        className="cursor-pointer hover:bg-slate-100"
                      >
                        {room.room_name} (รองรับ {room.capacity} คน)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-bold">
                  หัวข้อการประชุม <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* แถว 2: วันเวลาเริ่ม - วันเวลาสิ้นสุด */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">วัน-เวลา เริ่ม</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    name="start_date"
                    className="flex-1"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                  <Input
                    type="time"
                    name="start_time"
                    className="w-1/3"
                    required
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">วัน-เวลา สิ้นสุด</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    name="end_date"
                    className="flex-1"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                  <Input
                    type="time"
                    name="end_time"
                    className="w-1/3"
                    required
                    value={formData.end_time}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* แถว 3: ฝ่าย - เบอร์โทร - จำนวนคน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="font-bold">
                  ฝ่าย/หน่วยงาน
                </Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold">
                  เบอร์โทรติดต่อ
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendees" className="font-bold">
                  จำนวนผู้เข้าร่วม
                </Label>
                <Input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min="1"
                  value={formData.attendees}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* แถว 4: อุปกรณ์ที่ต้องการ (Dynamic from DB) */}
            <div className="space-y-3">
              <Label className="font-bold">อุปกรณ์ที่ต้องการ</Label>
              {resourceOptions.length === 0 ? (
                <p className="text-sm text-slate-400">- ไม่มีข้อมูลอุปกรณ์ -</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {resourceOptions.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id.toString()}
                        onCheckedChange={(checked) =>
                          handleResourceChange(
                            checked as boolean,
                            item.id.toString()
                          )
                        }
                      />
                      <label
                        htmlFor={item.id.toString()}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
                      >
                        {item.resource_name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* แถว 5: รูปแบบการจัดห้อง */}
            <div className="space-y-2">
              <Label className="font-bold">รูปแบบการจัดห้อง (ถ้ามี)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="layout_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFileChange(e);
                    const file = e.target.files?.[0];
                    const span = document.getElementById("file-name-display");
                    if (span)
                      span.innerText = file ? file.name : "ไม่ได้เลือกไฟล์ใด";
                  }}
                />
                <Label
                  htmlFor="layout_image"
                  className="bg-tu-pink/10 text-tu-pink hover:bg-tu-pink hover:text-white border border-tu-pink transition-colors px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
                >
                  เลือกไฟล์
                </Label>
                <span id="file-name-display" className="text-sm text-slate-500">
                  ไม่ได้เลือกไฟล์ใด
                </span>
              </div>
            </div>

            {/* แถว 6: หมายเหตุ */}
            <div className="space-y-2">
              <Label htmlFor="note" className="font-bold">
                หมายเหตุ
              </Label>
              <Textarea
                id="note"
                name="note"
                className="min-h-25"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            {/* ปุ่ม */}
            <div className="pt-4 space-y-4">
              <p className="text-red-600 font-bold text-sm text-center md:text-left">
                ** หากเป็นการจองในช่วงวันหยุด กรุณาประสานเจ้าหน้าที่
                ที่สามารถมาปฏิบัติงานได้ ด้วยตนเอง **
              </p>
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white text-base px-8 py-2 h-auto"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "ส่งคำขอจอง"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
