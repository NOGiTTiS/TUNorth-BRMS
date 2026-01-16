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
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSettings } from "@/hooks/useSettings"; // Import
import Link from "next/link";
import { API_URL } from "@/config";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { get } = useSettings();
  const siteName = get("site_name", "TUNorth-BRMS");
  const siteDesc = get("site_description", "ระบบจองห้องประชุมออนไลน์");
  const siteLogo = get("site_logo");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      // 1. เรียก login เพื่ออัปเดต Store
      login(data.token);

      // 2. ใช้ setTimeout เล็กน้อยเพื่อให้ State Propagation ทำงานทัน
      setTimeout(() => {
        router.push("/");
        router.refresh(); // บังคับ Refresh ข้อมูลในหน้านั้นใหม่ (สำคัญสำหรับ Next.js App Router)
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-slate-50 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden ">
        <div className="bg-slate-900 p-6 text-center rounded-t-3xl">
          {siteLogo && (
            <div className="mb-4 flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 p-2">
                <img
                  src={siteLogo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-tu-pink tracking-wider">
            {siteName}
          </h1>
          <p className="text-slate-400 text-sm mt-2">{siteDesc}</p>
        </div>

        <CardHeader className="text-center pb-2 pt-2">
          <CardTitle className="text-xl font-bold text-slate-800">
            เข้าสู่ระบบ
          </CardTitle>
          <CardDescription>
            กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านเพื่อดำเนินการต่อ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-4">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-slate-700 font-medium ml-1"
              >
                ชื่อผู้ใช้งาน หรือ อีเมล
              </Label>
              <Input
                id="username"
                placeholder="กรอกชื่อผู้ใช้งาน หรือ อีเมลของคุณ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-full h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-700 font-medium ml-1"
              >
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-full h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-tu-pink hover:bg-tu-pink-hover text-white rounded-full h-12 text-base font-semibold shadow-lg shadow-tu-pink/20 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> เข้าสู่ระบบ
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center p-2 bg-slate-50/50 mt-2">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชีผู้ใช้?
            <Link
              href="/register"
              className="text-tu-pink hover:text-tu-pink-hover hover:underline ml-1 font-bold"
            >
              ลงทะเบียนใหม่
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Background Decor */}
      {/* <div className="fixed top-0 left-0 w-full h-1/2 bg-slate-900 -z-10 rounded-b-[3rem] shadow-2xl"></div> */}
    </div>
  );
}
