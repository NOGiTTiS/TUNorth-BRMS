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
import { API_URL } from "@/config";

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
      const res = await fetch(`${API_URL}/api/resources`);
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
      let url = `${API_URL}/api/resources`;
      let method = "POST";

      if (editingResource) {
        url = `${API_URL}/api/resources/${editingResource.id}`;
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
      const res = await fetch(`${API_URL}/api/resources/${id}`, {
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
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* 1. Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            จัดการอุปกรณ์ (Resources)
          </h1>
          <p className="text-slate-500 mt-1">
            จัดการรายการอุปกรณ์และสิ่งอำนวยความสะดวก
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-tu-pink hover:bg-tu-pink-hover text-white rounded-full shadow-lg shadow-tu-pink/30"
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มอุปกรณ์
        </Button>
      </div>

      {/* 2. Table Section (Card) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-12.5 text-slate-500 font-medium">
                  ID
                </TableHead>
                <TableHead className="text-slate-500 font-medium">
                  ชื่ออุปกรณ์
                </TableHead>
                <TableHead className="text-slate-500 font-medium">
                  ประเภท
                </TableHead>
                <TableHead className="text-right text-slate-500 font-medium">
                  จัดการ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow
                  key={resource.id}
                  className="hover:bg-slate-50/50 border-b border-slate-50 last:border-none"
                >
                  <TableCell className="font-medium">{resource.id}</TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {resource.resource_name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {resource.type === "equipment"
                        ? "อุปกรณ์"
                        : resource.type === "catering"
                        ? "บริการ"
                        : resource.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-500"
                      onClick={() => openEditModal(resource)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-transparent hover:border-red-100 shadow-none"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {resources.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-slate-500"
                  >
                    ไม่มีข้อมูลอุปกรณ์
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-center text-slate-800">
              {editingResource ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              แบบฟอร์มจัดการอุปกรณ์
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium">ชื่ออุปกรณ์</Label>
              <Input
                id="resource_name"
                value={formData.resource_name}
                onChange={(e) =>
                  setFormData({ ...formData, resource_name: e.target.value })
                }
                required
                placeholder="ระบุชื่ออุปกรณ์..."
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium">ประเภท</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="bg-white rounded-xl border-slate-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="equipment">อุปกรณ์ (Equipment)</SelectItem>
                  <SelectItem value="catering">บริการ (Service)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex justify-center gap-3 pt-4 sm:justify-center">
              <Button
                type="submit"
                className="bg-tu-pink hover:bg-tu-pink-hover text-white rounded-md px-8 py-2 h-auto"
              >
                {editingResource ? "บันทึกการแก้ไข" : "เพิ่มอุปกรณ์"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-500 hover:bg-slate-600 text-white rounded-md px-8 py-2 h-auto"
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
