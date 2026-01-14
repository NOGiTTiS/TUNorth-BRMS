"use client";

import { useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const res = await fetch("http://localhost:8080/api/register", {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-tu-pink">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-tu-pink">
            ลงทะเบียนสมาชิกใหม่
          </CardTitle>
          <CardDescription>
            กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานระบบจองห้องประชุม
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* ส่วนข้อมูลเข้าระบบ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  ชื่อผู้ใช้งาน (Username){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="ตั้งชื่อผู้ใช้ภาษาอังกฤษ"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr className="border-gray-100 my-2" />

            {/* ส่วนข้อมูลส่วนตัว */}
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">ฝ่าย/กลุ่มสาระฯ</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="เช่น หมวดวิทย์"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel">เบอร์โทรศัพท์</Label>
                <Input
                  id="tel"
                  name="tel"
                  placeholder="08x-xxx-xxxx"
                  value={formData.tel}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-tu-pink hover:bg-tu-pink-hover text-white mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  กำลังบันทึก...
                </>
              ) : (
                "ลงทะเบียน"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-slate-500">
          มีบัญชีผู้ใช้แล้ว?
          <Link
            href="/login"
            className="text-tu-pink hover:underline ml-1 font-medium"
          >
            เข้าสู่ระบบ
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
