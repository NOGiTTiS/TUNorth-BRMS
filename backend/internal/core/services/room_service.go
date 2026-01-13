package services

import (
	"errors"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"
)

type roomService struct {
	repo ports.RoomRepository
}

// NewRoomService รับ Repository เข้ามาเพื่อใช้งานต่อ
func NewRoomService(repo ports.RoomRepository) ports.RoomService {
	return &roomService{repo: repo}
}

func (s *roomService) CreateRoom(room *domain.Room) error {
	// ตัวอย่าง Validation: ถ้าไม่ได้กรอกชื่อห้องมา ให้แจ้ง Error
	if room.RoomName == "" {
		return errors.New("room name is required")
	}
	
	// ถ้าผ่าน ก็ส่งต่อให้ Repo บันทึก
	return s.repo.Create(room)
}

func (s *roomService) GetAllRooms() ([]domain.Room, error) {
	return s.repo.GetAll()
}

func (s *roomService) GetRoomByID(id uint) (*domain.Room, error) {
	return s.repo.GetByID(id)
}

func (s *roomService) UpdateRoom(id uint, input *domain.Room) error {
	// 1. หาข้อมูลเก่าก่อนว่ามีไหม
	existingRoom, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("room not found")
	}

	// 2. อัปเดตข้อมูลเฉพาะส่วนที่มีการแก้ไข
	existingRoom.RoomName = input.RoomName
	existingRoom.Description = input.Description
	existingRoom.Capacity = input.Capacity
	existingRoom.Color = input.Color
	existingRoom.Status = input.Status
	// (ถ้ามีรูปภาพ image_path ก็อัปเดตตรงนี้)
	
	// 3. บันทึกลง DB
	return s.repo.Update(existingRoom)
}

func (s *roomService) DeleteRoom(id uint) error {
	return s.repo.Delete(id)
}