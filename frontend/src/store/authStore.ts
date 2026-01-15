import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  user_id: number;
  username: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
  initialize: () => void; // ฟังก์ชันสำหรับโหลด Token จาก LocalStorage ตอนเข้าเว็บใหม่
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (token: string) => {
    try {
      // แกะข้อมูลจาก Token (ที่ Go Backend ส่งมา)
      const decoded = jwtDecode<User>(token);
      
      // บันทึกลง LocalStorage และ State
      localStorage.setItem('token', token);
      set({ token, user: decoded, isAuthenticated: true, isInitialized: true });
    } catch (error) {
      console.error('Invalid token', error);
      localStorage.removeItem('token');
      set({ isInitialized: true });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
    // Optional: Redirect ไปหน้า Login หรือหน้าแรก
    window.location.href = '/login'; 
  },

  initialize: () => {
    // โค้ดส่วนนี้จะรันตอนโหลดหน้าเว็บ เพื่อเช็คว่ามี Login ค้างไว้ไหม
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<User>(token);
          // เช็คว่า Token หมดอายุหรือยัง (exp เป็น Unix timestamp)
          if (decoded.exp * 1000 < Date.now()) {
             localStorage.removeItem('token'); // หมดอายุแล้ว ลบทิ้ง
             set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
          } else {
             set({ token, user: decoded, isAuthenticated: true, isInitialized: true });
          }
        } catch {
          localStorage.removeItem('token');
          set({ isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    } else {
        set({ isInitialized: true });
    }
  }
}));