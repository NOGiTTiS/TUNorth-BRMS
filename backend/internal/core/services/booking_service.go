package services

import (
	"errors"
	"time"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"
)

type bookingService struct {
	repo ports.BookingRepository
}

func NewBookingService(repo ports.BookingRepository) ports.BookingService {
	return &bookingService{repo: repo}
}

func (s *bookingService) CreateBooking(booking *domain.Booking) error {
	// 1. Validation พื้นฐาน
	if booking.RoomID == 0 {
		return errors.New("room_id is required")
	}
	if booking.StartTime.After(booking.EndTime) || booking.StartTime.Equal(booking.EndTime) {
		return errors.New("start time must be before end time")
	}

	// 2. Conflict Check (ป้องกันจองซ้ำ)
	count, err := s.repo.CountOverlapping(booking.RoomID, booking.StartTime, booking.EndTime)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("room is not available at this time")
	}

	// 3. กำหนดสถานะเริ่มต้น
	booking.Status = "pending" // หรือ active เลยก็ได้ถ้าไม่ต้องรออนุมัติ
	
	// 4. บันทึก
	return s.repo.Create(booking)
}

func (s *bookingService) GetAllBookings() ([]domain.Booking, error) {
	return s.repo.GetAll()
}

// GetBookingsByRange รับ string มาแปลงเป็น time ก่อนส่งให้ repo
func (s *bookingService) GetBookingsByRange(startStr, endStr string) ([]domain.Booking, error) {
	// FullCalendar ส่งมา format ISO8601 (2026-01-01T00:00:00Z)
	layout := time.RFC3339 
	
	start, err := time.Parse(layout, startStr)
	if err != nil {
		// ถ้า parse ไม่ได้ ลอง format ง่ายๆ (เผื่อส่งมาแค่ YYYY-MM-DD)
		start, err = time.Parse("2006-01-02", startStr)
		if err != nil {
			return nil, errors.New("invalid start date format")
		}
	}

	end, err := time.Parse(layout, endStr)
	if err != nil {
		end, err = time.Parse("2006-01-02", endStr)
		if err != nil {
			return nil, errors.New("invalid end date format")
		}
	}

	return s.repo.GetByDateRange(start, end)
}

func (s *bookingService) GetBookingByID(id uint) (*domain.Booking, error) {
	return s.repo.GetByID(id)
}

func (s *bookingService) UpdateBookingStatus(id uint, status string, approverID uint) error {
	booking, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	booking.Status = status
	booking.ApproverID = &approverID // บันทึกคนอนุมัติ
	return s.repo.Update(booking)
}