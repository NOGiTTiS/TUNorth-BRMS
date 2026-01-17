"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  Database,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/config";

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
  const searchParams = useSearchParams();
  const { token, isAuthenticated, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const togglePasswordVisibility = (name: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Sync activeTab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Derived state to group settings
  const getGroupSettings = (group: string) => {
    const settingPriority: Record<string, number> = {
      // Theme
      theme_color: 1,
      theme_color_secondary: 2,
      bg_color_start: 3,
      bg_color_end: 4,
      // Images
      site_logo: 1,
      favicon: 2,
      // General
      site_name: 1,
      site_description: 2,
      copyright_text: 3,
      institute_name: 4,
      // Storage (Cloudinary)
      cloudinary_cloud_name: 1,
      cloudinary_api_key: 2,
      cloudinary_api_secret: 3,
    };

    return settings
      .filter((s) => s.group === group)
      .sort((a, b) => {
        const p1 = settingPriority[a.setting_name] || 99;
        const p2 = settingPriority[b.setting_name] || 99;
        return p1 - p2;
      });
  };

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
      const res = await fetch(`${API_URL}/api/settings`, {
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
      const res = await fetch(`${API_URL}/api/settings/upload`, {
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

      const res = await fetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
        // Refetch settings to update local state without reload
        await fetchSettings();
        // Force router refresh to update server components if any (like layout)
        router.refresh();
      } else {
        toast.error("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isInitialized)
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
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                type="color"
                value={setting.setting_value}
                onChange={(e) =>
                  handleValueChange(setting.setting_name, e.target.value)
                }
                className="h-12 w-20 rounded-xl cursor-pointer border border-gray-200 p-1 bg-white shadow-sm transition-all hover:border-tu-pink focus:ring-2 focus:ring-tu-pink outline-none"
              />
            </div>
            <Input
              value={setting.setting_value}
              onChange={(e) =>
                handleValueChange(setting.setting_name, e.target.value)
              }
              className="w-full h-12 font-mono text-sm uppercase"
            />
          </div>
        );
      case "image":
        return (
          <div className="space-y-4 p-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="flex items-center gap-6">
              {setting.setting_value ? (
                <div className="relative w-24 h-24 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src={setting.setting_value}
                    alt={setting.label}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center p-2 shrink-0">
                  No Image
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(
                          setting.setting_name,
                          e.target.files[0]
                        );
                      }
                    }}
                    className="hidden" // Syle custom file button if needed, or stick to simple
                    id={`file-${setting.setting_name}`}
                  />
                  <label
                    htmlFor={`file-${setting.setting_name}`}
                    className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-full hover:bg-slate-900 cursor-pointer transition-colors shadow-lg shadow-slate-900/20"
                  >
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    No file chosen
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Recommended: PNG/SVG transparent
                </p>
              </div>
            </div>
          </div>
        );
      case "select":
        return (
          <Select
            value={setting.setting_value}
            onValueChange={(value) =>
              handleValueChange(setting.setting_name, value)
            }
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">รออนุมัติ (Pending)</SelectItem>
              <SelectItem value="approved">
                อนุมัติอัตโนมัติ (Approved)
              </SelectItem>
            </SelectContent>
          </Select>
        );
      case "password":
        return (
          <div className="relative">
            <Input
              type={
                visiblePasswords[setting.setting_name] ? "text" : "password"
              }
              value={setting.setting_value}
              onChange={(e) =>
                handleValueChange(setting.setting_name, e.target.value)
              }
              className="w-full h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(setting.setting_name)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {visiblePasswords[setting.setting_name] ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        );
      default: // text, number
        return (
          <Input
            type={setting.type}
            value={setting.setting_value}
            onChange={(e) =>
              handleValueChange(setting.setting_name, e.target.value)
            }
            className="w-full h-12"
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
    { id: "storage", label: "Storage", icon: Database },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without reloading
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* ... header ... h1 etc */}
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
          className="px-8 shadow-md"
        >
          <Save className="mr-2 h-4 w-4" /> บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <Card className="w-full md:w-64 p-4 shrink-0 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
        </Card>

        {/* Content Area */}
        <Card className="flex-1 w-full min-h-[500px]">
          <CardContent className="p-8">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
