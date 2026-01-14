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

// PATCH /api/bookings/:id/status
func (h *BookingHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	// รับค่า status จาก Body เช่น { "status": "approved" }
	var input struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// ตรวจสอบว่า status ถูกต้องไหม
	if input.Status != "approved" && input.Status != "rejected" && input.Status != "pending" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid status"})
	}

	// ดึง User ID ของคนกด (Admin) จาก Token
	// (ใน Workshop นี้เราสมมติว่า Middleware แปะ user_id มาให้ หรือเราจะใช้จาก Claims ก็ได้)
	// เพื่อความง่ายตอนนี้เราจะ Hardcode หรือดึงจาก Token ถ้าทำ Middleware แล้ว
	// สมมติ admin_id = 1 ไปก่อนสำหรับการทดสอบ
	adminID := uint(1)

	if err := h.service.UpdateBookingStatus(uint(id), input.Status, adminID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Status updated successfully"})
}
