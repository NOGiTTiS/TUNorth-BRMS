package http

import (
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service ports.AuthService
}

func NewAuthHandler(service ports.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// POST /api/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	// 1. สร้าง Struct สำหรับรับข้อมูลการสมัครโดยเฉพาะ (เพื่อให้รับ Password ได้)
	type RegisterRequest struct {
		Username   string `json:"username"`
		Password   string `json:"password"` // ตรงนี้ไม่มี - แล้ว รับค่าได้ปกติ
		FullName   string `json:"full_name"`
		Department string `json:"department"`
		Role       string `json:"role"`
		Email      string `json:"email"`
		Tel        string `json:"tel"`
	}

	var req RegisterRequest
	
	// 2. แปลง JSON เข้า Struct ใหม่นี้
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// 3. ย้ายข้อมูลจาก Request ไปใส่ใน domain.User
	user := domain.User{
		Username:   req.Username,
		Password:   req.Password, // ส่งรหัสผ่านไปให้ Service Hash ต่อ
		FullName:   req.FullName,
		Department: req.Department,
		Role:       req.Role,
		Email:      req.Email,
		Tel:        req.Tel,
	}

	// 4. ส่งให้ Service ทำงานตามปกติ
	if err := h.service.Register(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}

// POST /api/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	token, err := h.service.Login(input.Username, input.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}