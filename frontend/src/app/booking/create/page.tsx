"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Room } from "@/types/room";
import { Resource } from "@/types/resource";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, ArrowLeft, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date"); // Get date from URL

  const { user, token, isAuthenticated, isInitialized } = useAuthStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [resourceOptions, setResourceOptions] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    subject: "",
    room_id: "",

    start_date: dateParam || "", // Prefill if param exists
    start_time: "",

    end_date: dateParam || "", // Prefill if param exists
    end_time: "",

    department: "",
    // ...
    phone: "",
    attendees: "",
    note: "",

    resources: [] as string[], // เก็บ ID ของ resource

    // เก็บไฟล์รูปภาพ
    layout_image: null as File | null,
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        // Fetch Rooms (Only active ones)
        const roomsRes = await fetch(`${API_URL}/api/rooms?status=active`);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }

        // Fetch Resources
        const resRes = await fetch(`${API_URL}/api/resources`);
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
  }, [isAuthenticated, router, isInitialized]);

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
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "จองห้องไม่สำเร็จ");

      toast.success("ส่งคำขอจองสำเร็จ!", {
        description: "รายการของคุณถูกบันทึกแล้ว",
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

  if (pageLoading || !isInitialized)
    return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-tu-pink/10 p-2 rounded-xl text-tu-pink">
              <CalendarPlus size={32} />
            </span>
            จองห้องประชุม
          </h1>
          <p className="text-slate-500 mt-1 ml-14">
            กรอกรายละเอียดเพื่อขอใช้ห้องประชุมและอุปกรณ์
          </p>
        </div>
      </div>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: ข้อมูลห้องและหัวข้อ */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                ข้อมูลการจอง
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="room" className="font-medium text-slate-700">
                    ห้องประชุม <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={handleRoomChange} required>
                    <SelectTrigger
                      id="room"
                      className="w-full h-12 bg-slate-50 border-slate-200 focus:ring-tu-pink rounded-xl"
                    >
                      <SelectValue placeholder="-- กรุณาเลือกห้อง --" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="bg-white rounded-xl shadow-lg border-slate-100 w-[var(--radix-select-trigger-width)]"
                    >
                      {rooms.map((room) => (
                        <SelectItem
                          key={room.id}
                          value={room.id.toString()}
                          className="cursor-pointer focus:bg-tu-pink focus:text-white py-3 pl-4 rounded-lg my-1"
                        >
                          {room.room_name} (รองรับ {room.capacity} คน)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="font-medium text-slate-700"
                  >
                    หัวข้อการประชุม <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                    placeholder="เช่น ประชุมวางแผนประจำเดือน"
                  />
                </div>
              </div>

              {/* วันเวลา */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700">
                    วัน-เวลา เริ่มต้น <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      name="start_date"
                      className="flex-1 h-12 bg-slate-50 border-slate-200 rounded-xl"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    <Input
                      type="time"
                      name="start_time"
                      className="w-1/3 h-12 bg-slate-50 border-slate-200 rounded-xl"
                      required
                      value={formData.start_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700">
                    วัน-เวลา สิ้นสุด <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      name="end_date"
                      className="flex-1 h-12 bg-slate-50 border-slate-200 rounded-xl"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                    <Input
                      type="time"
                      name="end_time"
                      className="w-1/3 h-12 bg-slate-50 border-slate-200 rounded-xl"
                      required
                      value={formData.end_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: ข้อมูลผู้ติดต่อ */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                ข้อมูลผู้ติดต่อ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="font-medium text-slate-700"
                  >
                    ฝ่าย/หน่วยงาน
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium text-slate-700">
                    เบอร์โทรติดต่อ
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="attendees"
                    className="font-medium text-slate-700"
                  >
                    จำนวนผู้เข้าร่วม (คน)
                  </Label>
                  <Input
                    id="attendees"
                    name="attendees"
                    type="number"
                    min="1"
                    value={formData.attendees}
                    onChange={handleChange}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: สิ่งอำนวยความสะดวก */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                สิ่งอำนวยความสะดวก
              </h3>
              <div className="space-y-3">
                <Label className="font-medium text-slate-700">
                  อุปกรณ์ที่ต้องการ
                </Label>
                {resourceOptions.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    - ไม่มีข้อมูลอุปกรณ์ -
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {resourceOptions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={item.id.toString()}
                          onCheckedChange={(checked) =>
                            handleResourceChange(
                              checked as boolean,
                              item.id.toString()
                            )
                          }
                          className="rounded-md border-slate-300 data-[state=checked]:bg-tu-pink data-[state=checked]:border-tu-pink"
                        />
                        <label
                          htmlFor={item.id.toString()}
                          className="text-sm font-medium leading-none text-slate-600 cursor-pointer"
                        >
                          {item.resource_name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-slate-700">
                  รูปแบบการจัดห้อง (ถ้ามี)
                </Label>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                    className="bg-white text-slate-700 hover:text-tu-pink border border-slate-200 hover:border-tu-pink shadow-sm transition-all px-4 py-2 rounded-lg cursor-pointer text-sm font-medium"
                  >
                    เลือกไฟล์รูปภาพ
                  </Label>
                  <span
                    id="file-name-display"
                    className="text-sm text-slate-400 italic"
                  >
                    ไม่ได้เลือกไฟล์ใด
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="font-medium text-slate-700">
                  หมายเหตุเพิ่มเติม
                </Label>
                <Textarea
                  id="note"
                  name="note"
                  className="min-h-25 bg-slate-50 border-slate-200 rounded-xl"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>

            {/* ปุ่มส่งข้อมูล */}
            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-red-500 font-medium text-sm text-center md:text-left bg-red-50 px-4 py-2 rounded-lg">
                ** หากเป็นการจองในช่วงวันหยุด กรุณาประสานเจ้าหน้าที่
                ที่สามารถมาปฏิบัติงานได้ ด้วยตนเอง **
              </p>
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white text-base px-10 py-4 rounded-full shadow-lg shadow-tu-pink/20 h-auto w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "ยินยันการจอง"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
