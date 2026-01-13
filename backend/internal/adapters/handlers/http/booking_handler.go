package http

import (
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"

	"github.com/gofiber/fiber/v2"
)

type BookingHandler struct {
	service ports.BookingService
}

func NewBookingHandler(service ports.BookingService) *BookingHandler {
	return &BookingHandler{service: service}
}

// [GET] /api/bookings?start=...&end=...
func (h *BookingHandler) GetBookings(c *fiber.Ctx) error {
	start := c.Query("start")
	end := c.Query("end")

	if start != "" && end != "" {
		// กรณีปฏิทินดึงข้อมูล
		bookings, err := h.service.GetBookingsByRange(start, end)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(bookings)
	}

	// กรณีดึงทั้งหมด (Admin List)
	bookings, err := h.service.GetAllBookings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

// [POST] /api/bookings
func (h *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	var booking domain.Booking
	if err := c.BodyParser(&booking); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// เนื่องจากเรายังไม่ได้ทำ Login แบบเต็มรูปแบบ ตอนนี้ให้ Hardcode UserID ไปก่อนได้
	// หรือถ้าส่งมาใน JSON ก็ใช้ได้เลย
	// booking.UserID = 1 

	if err := h.service.CreateBooking(&booking); err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(booking)
}