"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings"; // Import useSettings
import { toast } from "sonner";
import { API_URL } from "@/config";

export default function RegisterPage() {
  const router = useRouter();
  const { get, fetchSettings } = useSettings(); // Use Hook

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check Setting on Mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    department: "",
    tel: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate Password
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (formData.password.length < 4) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // เตรียมข้อมูลส่ง Backend (ตัด confirmPassword ออก)
      const payload = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        department: formData.department,
        tel: formData.tel,
        email: formData.email,
        role: "user", // สมัครเองให้เป็น user เสมอ
      };

      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "การลงทะเบียนล้มเหลว");
      }

      // สำเร็จ
      toast.success("สมัครสมาชิกสำเร็จ!", {
        description: "กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณ",
      });

      // ส่งไปหน้า Login
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render "Closed" Page if setting is false
  if (get("enable_register") === "false") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden z-10 text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-6 rounded-full">
              <UserPlus size={48} className="text-slate-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            ปิดรับสมัครสมาชิก
          </h1>
          <p className="text-slate-500 mb-8">
            ขออภัย ระบบปิดรับการลงทะเบียนสมัครสมาชิกใหม่ชั่วคราว
            <br />
            กรุณาติดต่อผู้ดูแลระบบหากต้องการบัญชีผู้ใช้งาน
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-full h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative">
      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-3xl overflow-hidden z-10">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden rounded-t-3xl">
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-tu-pink rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>

          <h1 className="text-2xl font-bold text-white tracking-wide">
            สร้างบัญชีผู้ใช้งานใหม่
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบจองห้องประชุม
          </p>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Account Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  ข้อมูลบัญชี
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="ภาษาอังกฤษเท่านั้น"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                  />
                </div>
              </div>

              {/* Right Column: Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  ข้อมูลส่วนตัว
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="เช่น นายสมชาย ใจดี"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    อีเมล <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@school.ac.th"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="department">
                      ฝ่าย/กลุ่มสาระ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                    />
                  </div>
                  <div className="space-y-2 w-1/3">
                    <Label htmlFor="tel">
                      เบอร์โทร <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tel"
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-tu-pink hover:bg-tu-pink-hover text-white rounded-full h-12 text-base font-bold shadow-lg shadow-tu-pink/20 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" /> ยืนยันการลงทะเบียน
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center bg-slate-50/50">
          <p className="text-sm text-slate-500">
            มีบัญชีผู้ใช้แล้ว?
            <Link
              href="/login"
              className="text-tu-pink hover:text-tu-pink-hover hover:underline ml-1 font-bold"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Background Decor */}
      {/* <div className="fixed top-0 left-0 w-full h-1/3 bg-slate-900 -z-10 shadow-2xl"></div> */}
    </div>
  );
}
