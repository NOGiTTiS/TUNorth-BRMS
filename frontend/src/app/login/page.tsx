'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login); 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // 1. เรียก login เพื่ออัปเดต Store
      login(data.token);
      
      // 2. ใช้ setTimeout เล็กน้อยเพื่อให้ State Propagation ทำงานทัน
      // หรือใช้ useEffect check state ก็ได้ แต่วิธีนี้ง่ายและได้ผลดี
      setTimeout(() => {
          router.push('/');
          router.refresh(); // บังคับ Refresh ข้อมูลในหน้านั้นใหม่ (สำคัญสำหรับ Next.js App Router)
      }, 100);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-tu-pink">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-tu-pink">TUNorth BRMS</CardTitle>
          <CardDescription>
            เข้าสู่ระบบจองห้องประชุม โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้งาน</Label>
              <Input 
                id="username" 
                placeholder="กรอกชื่อผู้ใช้งาน" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="กรอกรหัสผ่าน" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
                type="submit" 
                className="w-full bg-tu-pink hover:bg-tu-pink-hover text-white" 
                disabled={loading}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังตรวจสอบ...</> : 'เข้าสู่ระบบ'}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-slate-500">
          ยังไม่มีบัญชีผู้ใช้? 
          <Link href="/register" className="text-tu-pink hover:underline ml-1 font-medium">
            ลงทะเบียน
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}