export interface User {
  id: number;
  username: string;
  full_name: string;
  department: string;
  role: string;
  email: string;
  tel: string;
  password?: string; // Optional สำหรับตอนส่ง update
}