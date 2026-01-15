import { Room } from './room';

export interface Booking {
  id: number;
  start_time: string;
  end_time: string;
  subject: string;
  status: string; // pending, approved, rejected, cancelled
  
  // ข้อมูลเพิ่มเติมที่ต้องใช้แสดงใน Modal
  department?: string;
  phone?: string;
  attendees?: number;
  note?: string;
  resource_text?: string; 
  layout_image?: string;
  
  // Relations
  room_id: number;
  room?: Room;
  user?: {
      full_name: string;
  };
}