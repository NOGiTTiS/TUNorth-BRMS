"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Image as ImageIcon,
  Palette,
  Bell,
  Monitor,
  CalendarClock,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

// Types
interface SettingItem {
  setting_name: string;
  setting_value: string;
  group: string;
  type: string; // text, number, boolean, image, color, select, password
  label: string;
  description: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SettingItem[]>([]);

  // Derived state to group settings
  const getGroupSettings = (group: string) =>
    settings.filter((s) => s.group === group);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      // Add admin check here if needed
      router.push("/login");
      return;
    }
    fetchSettings();
  }, [isAuthenticated, isInitialized, token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        toast.error("ไม่สามารถดึงข้อมูลการตั้งค่าได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (name: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.setting_name === name ? { ...s, setting_value: value } : s
      )
    );
  };

  const handleImageUpload = async (name: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading("กำลังอัปโหลดรูปภาพ...");
      const res = await fetch("http://localhost:8080/api/settings/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleValueChange(name, data.url);
        toast.dismiss();
        toast.success("อัปโหลดเรียบร้อย");
      } else {
        toast.dismiss();
        toast.error("อัปโหลดล้มเหลว");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Error uploading image");
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Send all settings back (or just changed ones)
      // The backend expects key-value updates
      const payload = settings.map((s) => ({
        setting_name: s.setting_name,
        setting_value: s.setting_value,
      }));

      const res = await fetch("http://localhost:8080/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
        // Reload page to reflect changes globally? Or useSettings hook might need refresh trigger
        window.location.reload();
      } else {
        toast.error("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading Settings...</div>;

  // Render Component Helpers
  const renderInput = (setting: SettingItem) => {
    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleValueChange(
                  setting.setting_name,
                  setting.setting_value === "true" ? "false" : "true"
                )
              }
              className={`w-14 h-7 rounded-full transition-colors relative ${
                setting.setting_value === "true" ? "bg-tu-pink" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
                  setting.setting_value === "true" ? "left-8" : "left-1"
                }`}
              />
            </button>
            <span className="text-sm text-slate-500">
              {setting.setting_value === "true"
                ? "เปิดใช้งาน (ON)"
                : "ปิดใช้งาน (OFF)"}
            </span>
          </div>
        );
      case "color":
        return (
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={setting.setting_value}
              onChange={(e) =>
                handleValueChange(setting.setting_name, e.target.value)
              }
              className="h-10 w-20 rounded cursor-pointer border-0"
            />
            <Input
              value={setting.setting_value}
              onChange={(e) =>
                handleValueChange(setting.setting_name, e.target.value)
              }
              className="w-32 rounded-xl"
            />
          </div>
        );
      case "image":
        return (
          <div className="space-y-3">
            {setting.setting_value && (
              <div className="relative w-32 h-32 border rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={setting.setting_value}
                  alt={setting.label}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(setting.setting_name, e.target.files[0]);
                }
              }}
              className="rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-tu-pink/10 file:text-tu-pink hover:file:bg-tu-pink/20"
            />
            <Input
              value={setting.setting_value}
              onChange={(e) =>
                handleValueChange(setting.setting_name, e.target.value)
              }
              placeholder="Image URL"
              className="rounded-xl text-xs text-slate-400"
            />
          </div>
        );
      case "select":
        return (
          <select
            value={setting.setting_value}
            onChange={(e) =>
              handleValueChange(setting.setting_name, e.target.value)
            }
            className="w-full p-2 border border-slate-200 rounded-xl bg-white"
          >
            <option value="pending">รออนุมัติ (Pending)</option>
            <option value="approved">อนุมัติอัตโนมัติ (Approved)</option>
          </select>
        );
      default: // text, number, password
        return (
          <Input
            type={setting.type === "password" ? "text" : setting.type}
            value={setting.setting_value}
            onChange={(e) =>
              handleValueChange(setting.setting_name, e.target.value)
            }
            className="rounded-xl"
          />
        );
    }
  };

  const tabs = [
    { id: "general", label: "ทั่วไป", icon: Monitor },
    { id: "images", label: "รูปภาพ", icon: ImageIcon },
    { id: "theme", label: "ธีมสี", icon: Palette },
    { id: "booking", label: "การจอง", icon: CalendarClock },
    { id: "telegram", label: "Telegram", icon: MessageSquare }, // Added Icon
    { id: "notification", label: "แจ้งเตือน", icon: Bell },
    { id: "popup", label: "Popup", icon: Monitor }, // Reusing Icon
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-tu-pink/10 p-2 rounded-xl text-tu-pink">
              <Settings size={32} />
            </span>
            ตั้งค่าระบบ
          </h1>
          <p className="text-slate-500 mt-1 ml-14">
            จัดการการตั้งค่าต่างๆ ของเว็บไซต์
          </p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="rounded-full bg-tu-pink hover:bg-tu-pink/90 px-8 shadow-lg shadow-tu-pink/20"
        >
          <Save className="mr-2 h-4 w-4" /> บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white rounded-3xl shadow-sm border border-slate-100 p-4 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all font-medium text-sm ${
                activeTab === tab.id
                  ? "bg-tu-pink text-white shadow-md shadow-tu-pink/20"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
          <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 capitalize flex items-center gap-2">
            {tabs.find((t) => t.id === activeTab)?.label} Settings
          </h2>

          <div className="space-y-6">
            {getGroupSettings(activeTab).map((setting) => (
              <div
                key={setting.setting_name}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0"
              >
                <div className="md:col-span-4">
                  <Label className="text-base text-slate-700 font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {setting.description}
                  </p>
                </div>
                <div className="md:col-span-8">{renderInput(setting)}</div>
              </div>
            ))}

            {getGroupSettings(activeTab).length === 0 && (
              <div className="text-center py-20 text-slate-400">
                ไม่มีการตั้งค่าในหมวดหมู่นี้
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
