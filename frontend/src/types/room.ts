export interface Room {
  id: number;
  room_name: string;
  description: string;
  capacity: number;
  image_path: string;
  color: string;
  status: 'active' | 'maintenance';
}