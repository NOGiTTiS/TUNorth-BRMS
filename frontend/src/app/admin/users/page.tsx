"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user"; // ตรวจสอบว่ามีไฟล์นี้แล้ว หรือสร้างใหม่ตาม Step ก่อนหน้า
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
import {
  Trash2,
  Edit,
  Users,
  FileUp,
  Download,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, token, isAuthenticated } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับ Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // State สำหรับ Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // เรียงลำดับ ID ล่าสุดขึ้นก่อน
        setUsers(data.sort((a: User, b: User) => b.id - a.id));
      }
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentUser, router, token]);

  // 2. Edit Logic
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      department: user.department,
      tel: user.tel,
      email: user.email,
      role: user.role,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to update");

      toast.success("แก้ไขข้อมูลผู้ใช้สำเร็จ");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };

  // 3. Delete Logic
  const handleDelete = async (id: number) => {
    if (id === currentUser?.user_id) {
      toast.error("คุณไม่สามารถลบบัญชีตัวเองได้");
      return;
    }
    if (!confirm("ยืนยันการลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"))
      return;

    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("ลบผู้ใช้งานเรียบร้อย");
      fetchUsers();
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // 4. Import CSV Logic
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", importFile);

    try {
      const res = await fetch("http://localhost:8080/api/users/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`นำเข้าสำเร็จ: ${data.success} คน`, {
          description:
            data.failed > 0
              ? `ล้มเหลว ${data.failed} รายการ (อาจซ้ำ)`
              : undefined,
        });

        if (data.failed > 0) {
          console.warn("Import Errors:", data.errors);
        }

        setIsImportModalOpen(false);
        setImportFile(null);
        fetchUsers();
      } else {
        toast.error("นำเข้าล้มเหลว", { description: data.error });
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  // ฟังก์ชันสร้างลิงก์ดาวน์โหลด Template CSV
  const getTemplateLink = () => {
    // Header และ ข้อมูลตัวอย่าง
    // \uFEFF คือ BOM (Byte Order Mark) เพื่อให้ Excel เปิดภาษาไทยได้ถูกต้อง
    const csvContent =
      "\uFEFFusername,password,full_name,department,tel,email,role\nteacher99,pass1234,ครูตัวอย่าง ทดสอบ,หมวดวิทย์,0811112222,example@tu.ac.th,user";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users /> จัดการผู้ใช้งาน
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileUp className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead>ฝ่ายงาน</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-mono text-slate-600">
                    {u.username}
                  </TableCell>
                  <TableCell className="font-bold">{u.full_name}</TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>{u.tel}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(u)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === currentUser?.user_id}
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

      {/* --- Edit Modal --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>
              แก้ไขข้อมูลผู้ใช้งาน: {editingUser?.username}
            </DialogTitle>
            <DialogDescription className="sr-only">
              แบบฟอร์มแก้ไข
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 py-4">
            {/* Form Inputs (เหมือนเดิม) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ-สกุล</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ฝ่ายงาน</Label>
                <Input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เบอร์โทร</Label>
                <Input
                  value={formData.tel}
                  onChange={(e) =>
                    setFormData({ ...formData, tel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>อีเมล</Label>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>สิทธิ์การใช้งาน (Role)</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="user">ผู้ใช้ทั่วไป (User)</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2 border-t mt-2">
              <Label className="text-red-500">
                เปลี่ยนรหัสผ่าน (เว้นว่างไว้ถ้าไม่เปลี่ยน)
              </Label>
              <Input
                type="password"
                placeholder="ตั้งรหัสผ่านใหม่..."
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white"
              >
                บันทึกการแก้ไข
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Import CSV Modal --- */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>นำเข้าข้อมูลผู้ใช้งาน (CSV)</DialogTitle>
            <DialogDescription>
              อัปโหลดไฟล์ CSV เพื่อเพิ่มผู้ใช้งานทีละหลายคน
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImport} className="grid gap-6 py-4">
            {/* ส่วนดาวน์โหลด Template */}
            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="text-green-600" size={24} />
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    เตรียมไฟล์ข้อมูล
                  </p>
                  <p className="text-xs text-slate-500">
                    ดาวน์โหลดไฟล์ตัวอย่างแล้วกรอกข้อมูลตามคอลัมน์
                  </p>
                </div>
              </div>
              <a
                href={getTemplateLink()}
                download="template_users.csv"
                className="text-xs flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <Download size={14} /> ดาวน์โหลดไฟล์ตัวอย่าง (.csv)
              </a>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="csvFile">เลือกไฟล์ .csv ที่เตรียมไว้</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                className="cursor-pointer"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={!importFile}
                className="bg-tu-pink hover:bg-tu-pink-hover text-white w-full"
              >
                อัปโหลดและนำเข้าข้อมูล
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
