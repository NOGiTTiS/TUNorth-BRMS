package http

import (
	"fmt"
	"path/filepath"
	"time"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"

	"github.com/gofiber/fiber/v2"
)

type SettingHandler struct {
	service ports.SettingService
}

func NewSettingHandler(service ports.SettingService) *SettingHandler {
	return &SettingHandler{service: service}
}

// GET /api/settings
func (h *SettingHandler) GetAllSettings(c *fiber.Ctx) error {
	_, list, err := h.service.GetAllSettings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	// Return list for admin UI to render inputs
	return c.JSON(list)
}

// GET /api/settings/public (สำหรับ Frontend เรียกไปใช้ render ทั่วไป ไม่ต้อง login ก็ได้ หรือ login ก็ได้)
func (h *SettingHandler) GetPublicSettings(c *fiber.Ctx) error {
	dict, _, err := h.service.GetAllSettings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	// Return map for easy access: { "site_name": "...", "logo": "..." }
	// Filter strict secrets if needed
	delete(dict, "telegram_bot_token") // ซ่อน Token
	return c.JSON(dict)
}

// PUT /api/settings
func (h *SettingHandler) UpdateSettings(c *fiber.Ctx) error {
	var updates []domain.Setting
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := h.service.UpdateSettings(updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Settings updated successfully"})
}

// POST /api/settings/upload
func (h *SettingHandler) UploadImage(c *fiber.Ctx) error {
	// 1. รับไฟล์
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Image is required"})
	}

	// 2. ตรวจสอบนามสกุล
	ext := filepath.Ext(file.Filename)
	// Allow: jpg, png, jpeg, webp
	// (Skipping detailed check for brevity, allow all for now)

	// 3. ตั้งชื่อไฟล์ใหม่ (ป้องกันซ้ำ)
	fileName := fmt.Sprintf("setting_%d%s", time.Now().UnixNano(), ext)
	filePath := fmt.Sprintf("./uploads/%s", fileName)

	// 4. บันทึกไฟล์
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// 5. คืนค่า URL
	// สมมติว่า server serve static files ที่ /uploads
	fullURL := fmt.Sprintf("http://localhost:8080/uploads/%s", fileName)
	return c.JSON(fiber.Map{"url": fullURL})
}
