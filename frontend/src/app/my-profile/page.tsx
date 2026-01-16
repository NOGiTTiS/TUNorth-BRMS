"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Building, Save } from "lucide-react";
import { API_URL } from "@/config";

export default function MyProfilePage() {
  const router = useRouter();
  const { token, isAuthenticated, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    tel: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated, isInitialized, router, token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          username: data.username,
          full_name: data.full_name,
          email: data.email,
          tel: data.tel,
          department: data.department,
        }));
      } else {
        toast.error("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        tel: formData.tel,
        department: formData.department,
        password: formData.password || undefined, // Send only if set
      };

      const res = await fetch(`${API_URL}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
        // Clear password fields
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        const err = await res.json();
        toast.error(err.error || "บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span className="bg-tu-pink/10 p-2 rounded-xl text-tu-pink">
            <User size={32} />
          </span>
          ข้อมูลส่วนตัว
        </h1>
        <p className="text-slate-500 mt-1 ml-14">
          จัดการข้อมูลผู้ใช้งานและรหัสผ่าน
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read Only Username */}
          <div className="space-y-2">
            <Label className="text-slate-600">ชื่อผู้ใช้งาน (Username)</Label>
            <Input
              value={formData.username}
              disabled
              className="bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-slate-600">ชื่อ-นามสกุล</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div className="space-y-2">
              <Label className="text-slate-600">แผนก / หน่วยงาน</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                  placeholder="ระบุแผนก"
                />
              </div>
            </div>

            {/* Tel */}
            <div className="space-y-2">
              <Label className="text-slate-600">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                  placeholder="08X-XXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-slate-600">อีเมล</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              เปลี่ยนรหัสผ่าน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-600">รหัสผ่านใหม่ (ถ้ามี)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">ยืนยันรหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-tu-pink focus-visible:border-tu-pink focus-visible:ring-offset-0 shadow-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="bg-tu-pink hover:bg-tu-pink/90 text-white rounded-full px-8 shadow-md shadow-tu-pink/20"
              disabled={saving}
            >
              {saving ? (
                "กำลังบันทึก..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> บันทึกการเปลี่ยนแปลง
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
