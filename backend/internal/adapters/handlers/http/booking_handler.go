package http

import (
	"fmt"
	"time"
	"strconv"
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
// ในฟังก์ชัน GetBookings
func (h *BookingHandler) GetBookings(c *fiber.Ctx) error {
	start := c.Query("start")
	end := c.Query("end")
	userIdStr := c.Query("user_id") // รับค่ามาเป็น string ก่อน

	// 1. กรณีดึงข้อมูลปฏิทิน (กรองตามวันที่ start/end)
	if start != "" && end != "" {
		bookings, err := h.service.GetBookingsByRange(start, end)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(bookings)
	}

	// 2. ดึงข้อมูลทั้งหมดมาก่อน (เพื่อเตรียมกรอง)
	bookings, err := h.service.GetAllBookings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// 3. กรณีดูประวัติส่วนตัว (กรองตาม User ID)
	if userIdStr != "" {
		// แปลง user_id จาก string เป็น int
		targetID, err := strconv.Atoi(userIdStr)
		if err != nil {
			// ถ้าส่งมาไม่ใช่ตัวเลข ให้แจ้ง error กลับไป
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user_id format"})
		}

		// สร้าง slice ใหม่เพื่อเก็บเฉพาะของ User คนนั้น
		var myBookings []domain.Booking
		for _, b := range bookings {
			if int(b.UserID) == targetID {
				myBookings = append(myBookings, b)
			}
		}
		return c.JSON(myBookings)
	}

	// 4. กรณี Admin หรือไม่ส่งอะไรมาเลย -> คืนค่าทั้งหมด
	return c.JSON(bookings)
}

// POST /api/bookings (รองรับ File Upload)
func (h *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	// 1. รับค่าจาก Form Data (ไม่ใช่ JSON แล้ว)
	// เราต้องแปลง string เป็น type ที่ถูกต้องเอง
	roomID, _ := strconv.Atoi(c.FormValue("room_id"))
	attendees, _ := strconv.Atoi(c.FormValue("attendees"))
	
	// แปลงเวลา (Time string -> Time object)
	layout := "2006-01-02T15:04:05.000Z" // Format ISO8601
	startTime, _ := time.Parse(layout, c.FormValue("start_time"))
	endTime, _ := time.Parse(layout, c.FormValue("end_time"))

	// สร้าง Object Booking
	booking := domain.Booking{
		// UserID จะรับจาก Form หรือ Token ก็ได้ (ในที่นี้รับจาก Form เพื่อความง่ายตาม Code เดิม)
		UserID:      uint(1), // Default ไว้ก่อน หรือแปลง c.FormValue("user_id")
		RoomID:      uint(roomID),
		Subject:     c.FormValue("subject"),
		Department:  c.FormValue("department"),
		Phone:       c.FormValue("phone"),
		Attendees:   attendees,
		StartTime:   startTime,
		EndTime:     endTime,
		Note:        c.FormValue("note"),
		Status:      "pending",
	}
	
	// แก้ UserID ให้ถูกต้อง (ถ้าส่งมา)
	if uid, err := strconv.Atoi(c.FormValue("user_id")); err == nil {
		booking.UserID = uint(uid)
	}

	// 2. จัดการไฟล์อัปโหลด (Layout Image)
	file, err := c.FormFile("layout_image")
	if err == nil {
		// ถ้ามีการส่งไฟล์มา
		// ตั้งชื่อไฟล์ใหม่กันซ้ำ (เช่น booking_timestamp.jpg)
		filename := fmt.Sprintf("booking_%d_%s", time.Now().Unix(), file.Filename)
		path := fmt.Sprintf("./uploads/%s", filename)

		// บันทึกลงเครื่อง
		if err := c.SaveFile(file, path); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
		}

		// บันทึก Path ลง DB (เพื่อให้ Frontend เรียกใช้ได้)
		booking.LayoutImage = "/uploads/" + filename
	}

	// 3. เรียก Service บันทึกข้อมูล
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
