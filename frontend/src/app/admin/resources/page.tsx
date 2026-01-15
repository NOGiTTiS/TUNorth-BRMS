"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Resource } from "@/types/resource";
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
import { Trash2, Edit, Plus, Box } from "lucide-react";

export default function AdminResourcesPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    resource_name: "",
    type: "equipment",
  });

  const fetchResources = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data.sort((a: Resource, b: Resource) => a.id - b.id));
      }
    } catch (error) {
      console.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchResources();
  }, [isAuthenticated, user, router]);

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ resource_name: "", type: "equipment" });
    setIsModalOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      resource_name: resource.resource_name,
      type: resource.type,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = "http://localhost:8080/api/resources";
      let method = "POST";

      if (editingResource) {
        url = `http://localhost:8080/api/resources/${editingResource.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(editingResource ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ");
      setIsModalOpen(false);
      fetchResources();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("ลบเรียบร้อย");
      fetchResources();
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Box /> จัดการอุปกรณ์ (Resources)
          </CardTitle>
          <Button
            onClick={openAddModal}
            className="bg-tu-pink hover:bg-tu-pink-hover text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มอุปกรณ์
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>ชื่ออุปกรณ์</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.id}</TableCell>
                  <TableCell className="font-bold">
                    {resource.resource_name}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {resource.type === "equipment"
                        ? "อุปกรณ์"
                        : resource.type === "catering"
                        ? "อาหาร/เครื่องดื่ม"
                        : resource.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(resource)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              แบบฟอร์มจัดการอุปกรณ์
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resource_name">ชื่ออุปกรณ์</Label>
              <Input
                id="resource_name"
                value={formData.resource_name}
                onChange={(e) =>
                  setFormData({ ...formData, resource_name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">ประเภท</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="equipment">อุปกรณ์ (Equipment)</SelectItem>
                  <SelectItem value="catering">
                    อาหาร/เครื่องดื่ม (Catering)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white"
              >
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
